import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VideoEditorService } from '../../../core/services/video-editor.service';
import {
  AIOp,
  EditorAsset,
  TimelineClip,
  Track,
  TrackKind,
} from '../../../core/models/video-editor.model';

type GestureMode = 'drag' | 'resize-left' | 'resize-right';

interface ActiveGesture {
  clipId: string;
  mode: GestureMode;
  startX: number;
  startY: number;
  originalStartSec: number;
  originalDurationSec: number;
  originalSourceDurationSec: number;
  originalTrackId: string;
  modifierShift: boolean;
}

const MIN_CLIP_DURATION = 0.4;
const SNAP_STEP_SEC = 0.25;
const TRACK_GAP_PX = 6;

@Component({
  selector: 'app-video-editor',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./video-editor.component.scss'],
  template: `
    <div class="editor-page">
      <header class="editor-header">
        <div>
          <a class="back" routerLink="/tools">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m12 5-5 5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back to tools
          </a>
          <h1>Video editor</h1>
          <p class="muted">
            Multi-track, AI-aware editor. Drag clips, resize them — the AI
            stretches or shortens the underlying video. Remove or replace
            objects with a prompt. Backend stub today, real renders later.
          </p>
        </div>
        <div class="row">
          <button class="btn ghost sm" (click)="resetTimeline()">↺ Reset demo</button>
          <button class="btn primary sm" (click)="save()">💾 Save</button>
        </div>
      </header>

      <div class="editor-top">
        <section class="preview-pane">
          <div class="preview-frame" #previewFrame>
            @if (previewClip(); as pc) {
              @if (pc.sourceUri) {
                <video
                  #previewVideo
                  class="preview-video"
                  [src]="pc.sourceUri"
                  preload="metadata"
                  playsinline
                  muted
                ></video>
              } @else {
                <div class="preview-fallback" [style.background]="pc.accentColor || ''"></div>
              }
              @if (pc.status === 'ai_processing') {
                <div class="preview-ai-badge">
                  <span class="loader"></span> AI processing — {{ pc.name }}
                </div>
              }
            } @else {
              <div class="preview-empty">
                <div class="empty-art">🎬</div>
                <p class="muted">Drag a clip from the asset bin to start.</p>
              </div>
            }
            <div class="preview-time">{{ formatTime(playheadSec()) }} / {{ formatTime(timeline().durationSec) }}</div>
          </div>

          <div class="transport-bar">
            <button class="iconbtn" (click)="togglePlay()" [title]="playing() ? 'Pause' : 'Play'">
              {{ playing() ? '⏸' : '▶' }}
            </button>
            <button class="iconbtn" (click)="seek(0)" title="Jump to start">⏮</button>
            <input
              type="range"
              class="scrub"
              [min]="0"
              [max]="timeline().durationSec"
              [step]="0.05"
              [ngModel]="playheadSec()"
              (ngModelChange)="seek(+$event)"
            />
            <div class="zoom-block">
              <span class="muted" style="font-size: 0.72rem">Zoom</span>
              <input
                type="range"
                class="zoom"
                [min]="20"
                [max]="220"
                [step]="5"
                [ngModel]="pxPerSec()"
                (ngModelChange)="pxPerSec.set(+$event)"
              />
              <span class="mono" style="font-size: 0.72rem">{{ pxPerSec() }}px/s</span>
            </div>
          </div>
        </section>

        <aside class="side-panel">
          <div class="tabs">
            <button class="tab" [class.active]="sideTab() === 'assets'" (click)="sideTab.set('assets')">Assets</button>
            <button
              class="tab"
              [class.active]="sideTab() === 'ai'"
              (click)="sideTab.set('ai')"
              [disabled]="!selectedClipId()"
            >
              AI ops
            </button>
          </div>

          @if (sideTab() === 'assets') {
            <div class="asset-filter">
              @for (k of trackKinds; track k) {
                <button class="chip" [class.active]="assetFilter() === k" (click)="assetFilter.set(k)">
                  {{ trackKindLabel(k) }}
                </button>
              }
              <button class="chip" [class.active]="assetFilter() === 'all'" (click)="assetFilter.set('all')">All</button>
            </div>
            <div class="asset-list">
              @for (a of filteredAssets(); track a.id) {
                <div class="asset-card" [style.background]="a.accentColor || ''">
                  <div class="asset-meta">
                    <strong>{{ a.name }}</strong>
                    <span class="chip muted">{{ trackKindLabel(a.kind) }} · {{ a.durationSec }}s</span>
                  </div>
                  <button class="btn sm" (click)="quickAdd(a)" [disabled]="!firstTrackOf(a.kind)">
                    + Add
                  </button>
                </div>
              }
            </div>
            <p class="muted" style="font-size: 0.74rem; margin-top: 0.6rem">
              <strong>Tip:</strong> drag a clip on the timeline horizontally to move it,
              drag its edges to resize. Resizing past the source length triggers an AI extend.
            </p>
          } @else {
            @if (selectedClip(); as c) {
              <div class="ai-form">
                <div class="ai-clip-head">
                  <strong>{{ c.name }}</strong>
                  <span class="chip muted">{{ trackKindLabel(c.kind) }}</span>
                  <span class="chip" [class]="statusTone(c.status)">{{ c.status }}</span>
                </div>

                <label class="ai-field">
                  <span class="field-label inline">Target duration (seconds)</span>
                  <div class="row">
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      [ngModel]="aiDuration()"
                      (ngModelChange)="aiDuration.set(+$event)"
                    />
                    <button class="btn sm" (click)="aiExtend(c)" [disabled]="aiDuration() <= c.durationSec">
                      ↗ Extend with AI
                    </button>
                    <button class="btn sm" (click)="aiShorten(c)" [disabled]="aiDuration() >= c.durationSec">
                      ↙ Shorten with AI
                    </button>
                  </div>
                </label>

                @if (c.kind === 'video') {
                  <label class="ai-field">
                    <span class="field-label inline">Remove object</span>
                    <div class="row">
                      <input
                        type="text"
                        placeholder="e.g. coffee cup on the desk"
                        [ngModel]="removeObjectText()"
                        (ngModelChange)="removeObjectText.set($event)"
                      />
                      <button class="btn sm" (click)="aiRemove(c)" [disabled]="!removeObjectText().trim()">
                        Remove
                      </button>
                    </div>
                  </label>

                  <label class="ai-field">
                    <span class="field-label inline">Replace object</span>
                    <div class="row">
                      <input
                        type="text"
                        placeholder="target — e.g. red car"
                        [ngModel]="replaceTargetText()"
                        (ngModelChange)="replaceTargetText.set($event)"
                      />
                    </div>
                    <div class="row" style="margin-top: 0.3rem">
                      <input
                        type="text"
                        placeholder="replacement — e.g. blue bicycle"
                        [ngModel]="replaceWithText()"
                        (ngModelChange)="replaceWithText.set($event)"
                      />
                      <button
                        class="btn sm"
                        (click)="aiReplace(c)"
                        [disabled]="!replaceTargetText().trim() || !replaceWithText().trim()"
                      >
                        Replace
                      </button>
                    </div>
                  </label>
                }

                @if (c.aiOps.length > 0) {
                  <div class="ai-history">
                    <div class="field-label">History</div>
                    @for (op of c.aiOps; track op.id) {
                      <div class="ai-history-row">
                        <span class="chip" [class]="opTone(op.status)">{{ op.status }}</span>
                        <span style="font-size: 0.82rem">{{ describeOp(op) }}</span>
                      </div>
                    }
                  </div>
                }
              </div>
            } @else {
              <p class="muted">Select a clip on the timeline to use AI ops.</p>
            }
          }
        </aside>
      </div>

      <section class="timeline-wrap">
        <div class="timeline-toolbar">
          <strong style="font-family: var(--font-display); font-size: 0.84rem">Timeline</strong>
          <div class="row" style="gap: 0.3rem">
            <button class="btn ghost sm" (click)="addTrack('audio')">+ Audio track</button>
            <button class="btn ghost sm" (click)="addTrack('sfx')">+ SFX track</button>
          </div>
        </div>

        <div class="timeline" #timelineEl>
          <div class="track-labels">
            <div class="ruler-pad"></div>
            @for (tr of timeline().tracks; track tr.id) {
              <div class="track-label" [style.height.px]="tr.heightPx" [attr.data-kind]="tr.kind">
                <div class="row" style="gap: 0.3rem; align-items: center">
                  <strong style="font-size: 0.78rem">{{ tr.label }}</strong>
                  <span class="chip muted">{{ trackKindLabel(tr.kind) }}</span>
                </div>
                <div class="row" style="gap: 0.2rem">
                  <button class="iconbtn sm" [title]="tr.muted ? 'Unmute' : 'Mute'" (click)="toggleMute(tr.id)">
                    {{ tr.muted ? '🔇' : '🔊' }}
                  </button>
                  <button class="iconbtn sm" [title]="tr.locked ? 'Unlock' : 'Lock'" (click)="toggleLock(tr.id)">
                    {{ tr.locked ? '🔒' : '🔓' }}
                  </button>
                  @if (tr.kind !== 'video') {
                    <button class="iconbtn sm danger" title="Delete track" (click)="removeTrack(tr.id)">×</button>
                  }
                </div>
              </div>
            }
          </div>

          <div class="track-area" #trackArea (click)="onAreaClick($event)">
            <div class="ruler" [style.width.px]="timelineWidthPx()">
              @for (m of rulerMarks(); track m.sec) {
                <div class="ruler-tick" [style.left.px]="m.x">
                  <span>{{ formatTime(m.sec) }}</span>
                </div>
              }
            </div>

            @for (tr of timeline().tracks; track tr.id) {
              <div
                class="track-row"
                [style.height.px]="tr.heightPx"
                [attr.data-track-id]="tr.id"
                [attr.data-kind]="tr.kind"
                (dragover)="onAssetDragOver($event)"
                (drop)="onAssetDrop($event, tr)"
              >
                @for (c of tr.clips; track c.id) {
                  <div
                    class="clip"
                    [class.selected]="selectedClipId() === c.id"
                    [attr.data-kind]="c.kind"
                    [attr.data-status]="c.status"
                    [style.left.px]="c.startSec * pxPerSec()"
                    [style.width.px]="c.durationSec * pxPerSec()"
                    [style.background]="c.accentColor || ''"
                    (pointerdown)="startDrag($event, c)"
                    (click)="selectClip(c, $event)"
                  >
                    <div class="resize-handle left" (pointerdown)="startResize($event, c, 'resize-left')"></div>
                    <div class="clip-body">
                      <div class="clip-title">{{ c.name }}</div>
                      <div class="clip-sub">
                        {{ c.durationSec.toFixed(1) }}s
                        @if (c.durationSec > c.sourceDurationSec) {
                          · <span class="chip cyan">AI ext.</span>
                        }
                      </div>
                      @if (c.status === 'ai_processing') {
                        <span class="clip-ai"><span class="loader"></span></span>
                      }
                    </div>
                    <div class="resize-handle right" (pointerdown)="startResize($event, c, 'resize-right')"></div>
                  </div>
                }
                @if (tr.clips.length === 0) {
                  <div class="track-empty">Drag a {{ trackKindLabel(tr.kind) }} clip here</div>
                }
              </div>
            }

            <div class="playhead" [style.left.px]="playheadSec() * pxPerSec()"></div>
          </div>
        </div>
      </section>

      <!-- Asset bin items are draggable too -->
      <div style="display:none">
        @for (a of editor.assets(); track a.id) {
          <span draggable="true" (dragstart)="onAssetDragStart($event, a)" [attr.data-asset-id]="a.id">{{ a.name }}</span>
        }
      </div>
    </div>
  `,
})
export class VideoEditorComponent {
  protected readonly editor = inject(VideoEditorService);

  protected readonly trackKinds: TrackKind[] = ['video', 'audio', 'sfx'];
  protected readonly timeline = this.editor.timeline;

  protected readonly selectedClipId = signal<string | null>(null);
  protected readonly sideTab = signal<'assets' | 'ai'>('assets');
  protected readonly assetFilter = signal<TrackKind | 'all'>('all');

  protected readonly pxPerSec = signal(80);
  protected readonly playheadSec = signal(0);
  protected readonly playing = signal(false);

  protected readonly aiDuration = signal(6);
  protected readonly removeObjectText = signal('');
  protected readonly replaceTargetText = signal('');
  protected readonly replaceWithText = signal('');

  private gesture: ActiveGesture | null = null;
  private animFrame: number | null = null;
  private lastTickMs = 0;
  private dragAssetId: string | null = null;

  protected readonly previewVideo = viewChild<ElementRef<HTMLVideoElement>>('previewVideo');
  protected readonly trackArea = viewChild<ElementRef<HTMLDivElement>>('trackArea');

  protected readonly filteredAssets = computed(() => {
    const f = this.assetFilter();
    const all = this.editor.assets();
    return f === 'all' ? all : all.filter((a) => a.kind === f);
  });

  protected readonly selectedClip = computed<TimelineClip | undefined>(() => {
    const id = this.selectedClipId();
    if (!id) return undefined;
    for (const tr of this.timeline().tracks) {
      const c = tr.clips.find((x) => x.id === id);
      if (c) return c;
    }
    return undefined;
  });

  protected readonly timelineWidthPx = computed(() =>
    Math.max(1200, (this.timeline().durationSec + 4) * this.pxPerSec()),
  );

  protected readonly rulerMarks = computed(() => {
    const dur = Math.ceil(this.timeline().durationSec) + 4;
    const px = this.pxPerSec();
    const step = px < 50 ? 5 : px < 100 ? 2 : 1;
    const marks: { sec: number; x: number }[] = [];
    for (let s = 0; s <= dur; s += step) {
      marks.push({ sec: s, x: s * px });
    }
    return marks;
  });

  protected readonly previewClip = computed<TimelineClip | undefined>(() => {
    const t = this.playheadSec();
    const videoTracks = this.timeline().tracks.filter((tr) => tr.kind === 'video' && !tr.muted);
    for (const tr of videoTracks) {
      const clip = tr.clips.find((c) => t >= c.startSec && t < c.startSec + c.durationSec);
      if (clip) return clip;
    }
    return undefined;
  });

  constructor() {
    effect(() => {
      const t = this.playheadSec();
      const clip = this.previewClip();
      const video = this.previewVideo()?.nativeElement;
      if (!video || !clip) return;
      const localT = Math.max(0, t - clip.startSec + clip.sourceInSec);
      if (Math.abs(video.currentTime - localT) > 0.15) {
        try {
          video.currentTime = localT;
        } catch {
          /* ignore — metadata may not be loaded yet */
        }
      }
    });

    effect(() => {
      if (this.playing()) this.startTicker();
      else this.stopTicker();
    });

    effect(() => {
      const c = this.selectedClip();
      if (c) this.aiDuration.set(c.durationSec);
    });
  }

  // ---------- transport ----------

  protected togglePlay() {
    this.playing.update((v) => !v);
  }

  protected seek(sec: number) {
    this.playheadSec.set(Math.max(0, Math.min(sec, this.timeline().durationSec)));
  }

  private startTicker() {
    if (this.animFrame !== null) return;
    this.lastTickMs = performance.now();
    const tick = (now: number) => {
      const dt = (now - this.lastTickMs) / 1000;
      this.lastTickMs = now;
      const next = this.playheadSec() + dt;
      if (next >= this.timeline().durationSec) {
        this.playheadSec.set(this.timeline().durationSec);
        this.playing.set(false);
        return;
      }
      this.playheadSec.set(next);
      this.animFrame = requestAnimationFrame(tick);
    };
    this.animFrame = requestAnimationFrame(tick);
  }

  private stopTicker() {
    if (this.animFrame !== null) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  // ---------- selection ----------

  protected selectClip(c: TimelineClip, ev: MouseEvent) {
    ev.stopPropagation();
    this.selectedClipId.set(c.id);
    this.sideTab.set('ai');
  }

  protected onAreaClick(ev: MouseEvent) {
    const area = this.trackArea()?.nativeElement;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const x = ev.clientX - rect.left + area.scrollLeft;
    this.seek(x / this.pxPerSec());
    if ((ev.target as HTMLElement).classList.contains('ruler-tick')) return;
    if (!(ev.target as HTMLElement).closest('.clip')) {
      this.selectedClipId.set(null);
    }
  }

  // ---------- gestures (drag + resize) ----------

  protected startDrag(ev: PointerEvent, c: TimelineClip) {
    if ((ev.target as HTMLElement).classList.contains('resize-handle')) return;
    const tr = this.findTrack(c.trackId);
    if (!tr || tr.locked) return;
    this.beginGesture(ev, c, 'drag');
  }

  protected startResize(ev: PointerEvent, c: TimelineClip, mode: GestureMode) {
    ev.stopPropagation();
    const tr = this.findTrack(c.trackId);
    if (!tr || tr.locked) return;
    this.beginGesture(ev, c, mode);
  }

  private beginGesture(ev: PointerEvent, c: TimelineClip, mode: GestureMode) {
    ev.preventDefault();
    (ev.target as HTMLElement).setPointerCapture(ev.pointerId);
    this.selectedClipId.set(c.id);
    this.gesture = {
      clipId: c.id,
      mode,
      startX: ev.clientX,
      startY: ev.clientY,
      originalStartSec: c.startSec,
      originalDurationSec: c.durationSec,
      originalSourceDurationSec: c.sourceDurationSec,
      originalTrackId: c.trackId,
      modifierShift: ev.shiftKey,
    };
  }

  @HostListener('window:pointermove', ['$event'])
  onPointerMove(ev: PointerEvent) {
    const g = this.gesture;
    if (!g) return;
    const dxSec = (ev.clientX - g.startX) / this.pxPerSec();
    if (g.mode === 'drag') {
      const next = this.snap(Math.max(0, g.originalStartSec + dxSec), ev.shiftKey);
      this.editor.updateClip(g.clipId, { startSec: next }).subscribe();
      this.maybeCrossTrack(ev);
    } else if (g.mode === 'resize-right') {
      const next = this.snap(Math.max(MIN_CLIP_DURATION, g.originalDurationSec + dxSec), ev.shiftKey);
      this.editor.updateClip(g.clipId, { durationSec: next }).subscribe();
    } else if (g.mode === 'resize-left') {
      const proposedStart = Math.max(0, g.originalStartSec + dxSec);
      const maxStart = g.originalStartSec + g.originalDurationSec - MIN_CLIP_DURATION;
      const start = this.snap(Math.min(proposedStart, maxStart), ev.shiftKey);
      const duration = Math.max(
        MIN_CLIP_DURATION,
        g.originalDurationSec - (start - g.originalStartSec),
      );
      this.editor
        .updateClip(g.clipId, { startSec: start, durationSec: duration })
        .subscribe();
    }
  }

  @HostListener('window:pointerup', ['$event'])
  onPointerUp(ev: PointerEvent) {
    const g = this.gesture;
    if (!g) return;
    this.gesture = null;
    const clip = this.findClip(g.clipId);
    if (!clip) return;
    // If the user grew the clip past its source duration, dispatch an AI extend.
    if (clip.durationSec > clip.sourceDurationSec + 0.05 && clip.kind !== 'sfx') {
      this.editor.aiExtend(clip.id, clip.durationSec).subscribe();
    }
  }

  private maybeCrossTrack(ev: PointerEvent) {
    const g = this.gesture;
    if (!g || g.mode !== 'drag') return;
    const rowEl = (ev.target as HTMLElement | null)?.closest?.('.track-row') as HTMLElement | null
      ?? this.rowAt(ev.clientY);
    if (!rowEl) return;
    const newTrackId = rowEl.getAttribute('data-track-id');
    if (!newTrackId || newTrackId === g.originalTrackId) return;
    const target = this.findTrack(newTrackId);
    const source = this.findTrack(g.originalTrackId);
    if (!target || !source || target.kind !== source.kind || target.locked) return;
    this.editor.moveClipToTrack(g.clipId, newTrackId).subscribe();
    g.originalTrackId = newTrackId;
  }

  private rowAt(clientY: number): HTMLElement | null {
    const area = this.trackArea()?.nativeElement;
    if (!area) return null;
    const rows = Array.from(area.querySelectorAll<HTMLElement>('.track-row'));
    return rows.find((r) => {
      const rect = r.getBoundingClientRect();
      return clientY >= rect.top && clientY <= rect.bottom;
    }) ?? null;
  }

  private snap(sec: number, free: boolean): number {
    if (free) return Math.max(0, sec);
    return Math.max(0, Math.round(sec / SNAP_STEP_SEC) * SNAP_STEP_SEC);
  }

  private findTrack(id: string): Track | undefined {
    return this.timeline().tracks.find((tr) => tr.id === id);
  }

  private findClip(id: string): TimelineClip | undefined {
    for (const tr of this.timeline().tracks) {
      const c = tr.clips.find((x) => x.id === id);
      if (c) return c;
    }
    return undefined;
  }

  // ---------- asset add / drag ----------

  protected onAssetDragStart(ev: DragEvent, a: EditorAsset) {
    if (!ev.dataTransfer) return;
    this.dragAssetId = a.id;
    ev.dataTransfer.effectAllowed = 'copy';
    ev.dataTransfer.setData('text/plain', a.id);
  }

  protected onAssetDragOver(ev: DragEvent) {
    if (this.dragAssetId) {
      ev.preventDefault();
      if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'copy';
    }
  }

  protected onAssetDrop(ev: DragEvent, tr: Track) {
    ev.preventDefault();
    const id = this.dragAssetId ?? ev.dataTransfer?.getData('text/plain');
    this.dragAssetId = null;
    if (!id) return;
    const asset = this.editor.assets().find((a) => a.id === id);
    if (!asset || asset.kind !== tr.kind) return;
    const area = this.trackArea()?.nativeElement;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const startSec = this.snap((ev.clientX - rect.left + area.scrollLeft) / this.pxPerSec(), false);
    this.editor.addClip(tr.id, asset, startSec).subscribe();
  }

  protected quickAdd(a: EditorAsset) {
    const tr = this.firstTrackOf(a.kind);
    if (!tr) return;
    const startSec = this.snap(this.tailOf(tr), false);
    this.editor.addClip(tr.id, a, startSec).subscribe((clip) => {
      this.selectedClipId.set(clip.id);
      this.sideTab.set('ai');
    });
  }

  protected firstTrackOf(kind: TrackKind): Track | undefined {
    return this.timeline().tracks.find((t) => t.kind === kind);
  }

  private tailOf(tr: Track): number {
    return tr.clips.reduce((max, c) => Math.max(max, c.startSec + c.durationSec), 0);
  }

  // ---------- AI ops ----------

  protected aiExtend(c: TimelineClip) {
    this.editor.aiExtend(c.id, this.aiDuration()).subscribe();
  }

  protected aiShorten(c: TimelineClip) {
    this.editor.aiShorten(c.id, this.aiDuration()).subscribe();
  }

  protected aiRemove(c: TimelineClip) {
    const text = this.removeObjectText().trim();
    if (!text) return;
    this.editor.aiRemoveObject(c.id, text).subscribe(() => this.removeObjectText.set(''));
  }

  protected aiReplace(c: TimelineClip) {
    const target = this.replaceTargetText().trim();
    const replacement = this.replaceWithText().trim();
    if (!target || !replacement) return;
    this.editor.aiReplaceObject(c.id, target, replacement).subscribe(() => {
      this.replaceTargetText.set('');
      this.replaceWithText.set('');
    });
  }

  // ---------- tracks ----------

  protected addTrack(kind: TrackKind) {
    this.editor.addTrack(kind).subscribe();
  }

  protected removeTrack(id: string) {
    this.editor.removeTrack(id).subscribe(() => {
      if (this.selectedClip()?.trackId === id) this.selectedClipId.set(null);
    });
  }

  protected toggleMute(id: string) {
    this.editor.toggleMute(id);
  }

  protected toggleLock(id: string) {
    this.editor.toggleLock(id);
  }

  protected resetTimeline() {
    this.editor.resetToSeed();
    this.selectedClipId.set(null);
    this.playheadSec.set(0);
  }

  protected save() {
    this.editor.save().subscribe();
  }

  // ---------- formatting ----------

  protected trackKindLabel(k: TrackKind): string {
    return { video: 'Video', audio: 'Audio', sfx: 'SFX' }[k];
  }

  protected statusTone(s: string): string {
    return {
      idle: 'muted',
      ai_queued: 'amber',
      ai_processing: 'amber',
      ready: 'green',
      failed: 'rose',
    }[s] ?? 'muted';
  }

  protected opTone(s: string): string {
    return {
      pending: 'amber',
      processing: 'amber',
      completed: 'green',
      failed: 'rose',
    }[s] ?? 'muted';
  }

  protected describeOp(op: AIOp): string {
    switch (op.kind) {
      case 'extend':
        return `Extend by ${op.durationDeltaSec?.toFixed(1)}s`;
      case 'shorten':
        return `Shorten by ${Math.abs(op.durationDeltaSec ?? 0).toFixed(1)}s`;
      case 'remove_object':
        return `Remove "${op.targetObject}"`;
      case 'replace_object':
        return `Replace "${op.targetObject}" → "${op.replacementPrompt}"`;
      case 'inpaint':
        return `Inpaint: ${op.prompt ?? ''}`;
    }
  }

  protected formatTime(sec: number): string {
    const s = Math.max(0, sec);
    const mm = Math.floor(s / 60);
    const ss = (s % 60).toFixed(s < 10 ? 1 : 0);
    return `${mm}:${ss.padStart(s < 10 ? 4 : 2, '0')}`;
  }
}
