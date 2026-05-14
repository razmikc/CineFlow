import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AssetsService } from '../../../core/services/assets.service';
import {
  AudioEditorBridgeService,
  AudioEditorRequest,
} from '../../../core/services/audio-editor-bridge.service';
import { Asset } from '../../../core/models/contract.model';

interface Mark {
  startSec: number;
  endSec: number;
}

@Component({
  selector: 'app-audio-editor-tool',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      <a routerLink="/tools" class="btn ghost sm" style="margin-bottom: 0.5rem">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5l-5 5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to tools
      </a>
      <h1>Audio editor</h1>
      <p class="muted" style="margin-top: 0.4rem; max-width: 64ch">
        Listen, trim, stretch or shorten any audio file — music, narration, sound effects.
        Edits land back on the scene layer they came from.
      </p>
    </header>

    @if (editContext(); as ctx) {
      <div class="edit-context">
        <div>
          <div class="eyebrow">Editing in context</div>
          <strong style="font-size: 0.92rem">{{ ctx.contextLabel || 'External audio' }}</strong>
          <div class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">
            Click <strong>Apply &amp; return</strong> to swap the edited audio back into the scene.
          </div>
        </div>
        <button class="btn ghost sm" type="button" (click)="cancelEditContext()">Cancel &amp; go back</button>
      </div>
    }

    @if (!sourceUri()) {
      <div class="dropzone-row">
        <button class="dropzone" type="button" (click)="triggerUpload()">
          <div style="font-size: 1.8rem">🎵</div>
          <strong>Upload audio</strong>
          <span class="muted" style="font-size: 0.78rem">MP3 · WAV · M4A — single file</span>
        </button>
        <button class="dropzone" type="button" (click)="openAssetPicker()">
          <div style="font-size: 1.8rem">🗂</div>
          <strong>Pick from asset library</strong>
          <span class="muted" style="font-size: 0.78rem">Music · voice · audio</span>
        </button>
      </div>
      <input #fileInput type="file" accept="audio/*" hidden (change)="onSourceFile($event)" />
    } @else {
      <input #fileInput type="file" accept="audio/*" hidden (change)="onSourceFile($event)" />
      <div class="layout">
        <section class="card panel">
          <div class="row" style="justify-content: space-between; align-items: flex-start; gap: 0.6rem; flex-wrap: wrap">
            <div>
              <div class="eyebrow">Source</div>
              <strong style="font-size: 0.95rem">{{ sourceName() }}</strong>
              <div class="muted" style="font-size: 0.78rem">
                {{ formatTime(duration()) }} · {{ sourceTypeLabel() }}
              </div>
            </div>
            <div class="row" style="gap: 0.4rem">
              <button class="btn ghost sm" type="button" (click)="triggerUpload()">Replace</button>
              <button class="btn ghost sm" type="button" (click)="openAssetPicker()">From library</button>
              <button class="btn ghost sm" type="button" (click)="clearSource()">Remove</button>
            </div>
          </div>

          <audio
            #audioEl
            [src]="sourceUri()"
            preload="metadata"
            style="display: none"
            (loadedmetadata)="onAudioLoaded($event)"
            (timeupdate)="onTimeUpdate($event)"
            (play)="playing.set(true)"
            (pause)="playing.set(false)"
            (ended)="playing.set(false)"
          ></audio>

          <div class="eyebrow" style="margin-top: 1rem">Timeline</div>

          <div class="transport">
            <button class="transport-btn play-toggle" type="button" (click)="togglePlay()" [title]="playing() ? 'Pause' : 'Play'">
              @if (playing()) {
                <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><rect x="5" y="4" width="4" height="12" rx="1"/><rect x="11" y="4" width="4" height="12" rx="1"/></svg>
              } @else {
                <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M6 4l11 6-11 6z"/></svg>
              }
            </button>
            <button class="transport-btn" type="button" (click)="stopPlay()" title="Stop &amp; jump to in">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><rect x="5" y="5" width="10" height="10" rx="1"/></svg>
            </button>
            <button class="transport-btn wide" type="button" (click)="playTrimmed()" title="Play selection only">
              <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M6 4l11 6-11 6z"/></svg>
              <span>Play selection</span>
            </button>
            <div class="transport-readout">
              <span class="mono">{{ formatTime(currentTime()) }}</span>
              <span class="muted">/</span>
              <span class="muted mono">{{ formatTime(duration()) }}</span>
            </div>
            <button class="btn ghost sm" type="button" style="margin-left: auto" (click)="resetTrim()">Reset selection</button>
          </div>

          <p class="muted" style="font-size: 0.74rem; margin-top: 0.4rem">
            Drag the band to slide the selection · drag the side handles to resize · click the track outside the band to seek.
          </p>

          <div class="trim-wrap">
            <div class="trim-track" #trimTrack (click)="onTrackClick($event)">
              <div
                class="trim-band"
                [style.left.%]="(trimStart() / Math.max(1, duration())) * 100"
                [style.width.%]="((trimEnd() - trimStart()) / Math.max(1, duration())) * 100"
                (pointerdown)="onTrimPointerDown($event, 'move')"
              >
                <span class="trim-handle left" (pointerdown)="onTrimPointerDown($event, 'in')"></span>
                <span class="trim-handle right" (pointerdown)="onTrimPointerDown($event, 'out')"></span>
                <span class="trim-band-label">{{ formatTime(trimEnd() - trimStart()) }}</span>
              </div>
              <div class="trim-cursor"
                [style.left.%]="(currentTime() / Math.max(1, duration())) * 100"
              ></div>
            </div>
            <div class="row" style="justify-content: space-between; font-size: 0.78rem; margin-top: 0.4rem">
              <span><span class="muted">In</span> <span class="mono">{{ formatTime(trimStart()) }}</span></span>
              <span><span class="muted">Selected</span> <span class="mono">{{ formatTime(trimEnd() - trimStart()) }}</span></span>
              <span><span class="muted">Out</span> <span class="mono">{{ formatTime(trimEnd()) }}</span></span>
            </div>
          </div>
        </section>

        <section class="card panel">
          <div class="eyebrow">Playback &amp; processing</div>

          <label class="field" style="margin-top: 0.6rem">Speed</label>
          <div class="chip-grid compact">
            @for (sp of speeds; track sp) {
              <button class="opt-chip sm" type="button" [class.active]="speed() === sp" (click)="speed.set(sp)">{{ sp }}×</button>
            }
          </div>

          <label class="check-row" style="margin-top: 1rem">
            <input type="checkbox" [ngModel]="fadeIn()" (ngModelChange)="fadeIn.set($event)" />
            <div>
              <div class="check-title">Fade in (first second)</div>
              <div class="muted" style="font-size: 0.74rem">Ramp volume from 0 to full at the in-point</div>
            </div>
          </label>
          <label class="check-row" style="margin-top: 0.4rem">
            <input type="checkbox" [ngModel]="fadeOut()" (ngModelChange)="fadeOut.set($event)" />
            <div>
              <div class="check-title">Fade out (last second)</div>
              <div class="muted" style="font-size: 0.74rem">Ramp volume to 0 at the out-point</div>
            </div>
          </label>
          <label class="check-row" style="margin-top: 0.4rem">
            <input type="checkbox" [ngModel]="normalize()" (ngModelChange)="normalize.set($event)" />
            <div>
              <div class="check-title">Normalize volume</div>
              <div class="muted" style="font-size: 0.74rem">Boost loudness to -14 LUFS reference</div>
            </div>
          </label>

          <label class="field" style="margin-top: 1rem">Output length target</label>
          <div class="row" style="gap: 0.4rem; flex-wrap: wrap">
            <button class="opt-chip sm" type="button" [class.active]="lengthMode() === 'as_is'" (click)="lengthMode.set('as_is')">Use selection</button>
            <button class="opt-chip sm" type="button" [class.active]="lengthMode() === 'stretch'" (click)="lengthMode.set('stretch')">Stretch to target</button>
            <button class="opt-chip sm" type="button" [class.active]="lengthMode() === 'loop'" (click)="lengthMode.set('loop')">Loop to target</button>
          </div>
          @if (lengthMode() !== 'as_is') {
            <label class="field" style="margin-top: 0.4rem">Target duration (sec)</label>
            <input type="number" min="1" max="600" step="1" [ngModel]="targetDuration()" (ngModelChange)="targetDuration.set(+$event)"/>
          }

          <div class="summary">
            <div class="eyebrow">Output</div>
            <div class="row" style="justify-content: space-between; font-size: 0.86rem; margin-top: 0.3rem">
              <span class="muted">Final duration</span>
              <span class="mono"><strong>{{ formatTime(outputDuration()) }}</strong></span>
            </div>
            <div class="row" style="justify-content: space-between; font-size: 0.82rem">
              <span class="muted">Speed</span>
              <span class="mono">{{ speed() }}×</span>
            </div>
            <div class="muted" style="font-size: 0.76rem; margin-top: 0.3rem">{{ summaryLine() }}</div>
          </div>

          <div class="row" style="gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap">
            @if (editContext()) {
              <button class="btn primary sm" type="button" (click)="applyAndReturn()">Apply &amp; return</button>
            }
            <button class="btn sm" type="button" (click)="saveToAssets()" [disabled]="saved()">
              @if (saved()) { ✓ Saved to library } @else { Save to library }
            </button>
          </div>
        </section>
      </div>
    }

    @if (pickerOpen()) {
      <div class="modal-backdrop" (click)="closePicker()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="row" style="justify-content: space-between; margin-bottom: 0.6rem">
            <strong style="font-family: var(--font-display); font-size: 1.05rem">Pick audio asset</strong>
            <button class="iconbtn" type="button" (click)="closePicker()">×</button>
          </div>
          @if (audioAssets().length === 0) {
            <div class="muted" style="padding: 1rem 0; text-align: center">No audio assets in your library yet.</div>
          } @else {
            <div class="picker-list">
              @for (a of audioAssets(); track a.id) {
                <button class="picker-item" type="button" (click)="useAsset(a)">
                  <span style="font-size: 1.4rem">{{ iconFor(a.type) }}</span>
                  <div style="flex: 1; min-width: 0; text-align: left">
                    <div style="font-size: 0.88rem; font-weight: 600">{{ a.name }}</div>
                    <div class="muted" style="font-size: 0.72rem">{{ a.type }} · {{ a.provider || 'manual' }} · {{ a.durationSec ? a.durationSec + 's' : '—' }}</div>
                  </div>
                </button>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host { display: block; }
      .edit-context {
        margin-top: 0.8rem;
        padding: 0.7rem 0.9rem;
        border-radius: 12px;
        border: 1px solid rgba(34, 211, 238, 0.5);
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.10), rgba(139, 92, 246, 0.06));
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .dropzone-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 1rem;
      }
      @media (max-width: 720px) { .dropzone-row { grid-template-columns: 1fr; } }
      .dropzone {
        width: 100%;
        height: 260px;
        background: rgba(255, 255, 255, 0.02);
        border: 1.5px dashed var(--border-strong);
        border-radius: 14px;
        color: var(--text-2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        cursor: pointer;
      }
      .dropzone:hover { background: rgba(34, 211, 238, 0.06); border-color: var(--neon-cyan); }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
        gap: 1rem;
        margin-top: 1rem;
        align-items: start;
      }
      @media (max-width: 1080px) { .layout { grid-template-columns: 1fr; } }
      .panel { padding: 1.1rem; }

      .transport {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
        padding: 0.5rem 0.6rem;
        background: rgba(255, 255, 255, 0.025);
        border: 1px solid var(--border);
        border-radius: 10px;
      }
      .transport-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        width: 36px;
        height: 36px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text-1);
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
      }
      .transport-btn:hover { background: rgba(34, 211, 238, 0.12); border-color: var(--neon-cyan); }
      .transport-btn.wide {
        width: auto;
        padding: 0 0.7rem;
        font-size: 0.82rem;
      }
      .transport-btn.play-toggle {
        background: var(--grad-primary);
        border-color: transparent;
        color: white;
        box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
      }
      .transport-btn.play-toggle:hover { filter: brightness(1.08); }
      .transport-readout {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0 0.5rem;
        font-size: 0.85rem;
      }

      .trim-wrap { margin-top: 0.5rem; }
      .trim-track {
        position: relative;
        height: 84px;
        background:
          repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px),
          rgba(0, 0, 0, 0.4);
        border: 1px solid var(--border);
        border-radius: 10px;
        overflow: hidden;
        touch-action: none;
        cursor: pointer;
      }
      .trim-band {
        position: absolute;
        top: 0; bottom: 0;
        background: linear-gradient(180deg, rgba(34, 211, 238, 0.32), rgba(139, 92, 246, 0.22));
        border-left: 2px solid var(--neon-cyan);
        border-right: 2px solid var(--neon-violet);
        cursor: grab;
        touch-action: none;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
      }
      .trim-band:active { cursor: grabbing; }
      .trim-band-label {
        font-family: var(--font-mono);
        font-size: 0.74rem;
        color: var(--text-1);
        background: rgba(5, 6, 19, 0.6);
        padding: 0.15rem 0.45rem;
        border-radius: 999px;
        pointer-events: none;
        user-select: none;
      }
      .trim-handle {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: ew-resize;
        touch-action: none;
      }
      .trim-handle::before {
        content: '';
        width: 4px;
        height: 60%;
        background: rgba(255, 255, 255, 0.85);
        border-radius: 2px;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
      }
      .trim-handle.left  { left: -7px; }
      .trim-handle.right { right: -7px; }
      .trim-cursor {
        position: absolute;
        top: -2px; bottom: -2px;
        width: 2px;
        background: white;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
        pointer-events: none;
      }

      .chip-grid.compact {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
        gap: 0.35rem;
      }
      .opt-chip {
        padding: 0.4rem 0.6rem;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.025);
        color: var(--text-1);
        font-size: 0.78rem;
        cursor: pointer;
        text-align: center;
      }
      .opt-chip.active {
        border-color: var(--neon-violet);
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(34, 211, 238, 0.08));
      }

      .summary {
        margin-top: 1.2rem;
        padding: 0.75rem 0.95rem;
        border: 1px solid var(--border-strong);
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(34, 211, 238, 0.04));
      }

      .modal-backdrop {
        position: fixed; inset: 0;
        background: rgba(5, 6, 19, 0.78);
        backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        z-index: 10; padding: 1rem;
      }
      .modal {
        max-width: 540px; width: 100%;
        max-height: 80vh; overflow: auto;
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 1rem 1.1rem;
      }
      .picker-list {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .picker-item {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 0.6rem 0.75rem;
        cursor: pointer;
      }
      .picker-item:hover { border-color: var(--neon-violet); }
    `,
  ],
})
export class AudioEditorToolComponent implements AfterViewInit {
  private readonly assetsSrv = inject(AssetsService);
  private readonly bridge = inject(AudioEditorBridgeService);
  private readonly router = inject(Router);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly audioEl = viewChild<ElementRef<HTMLAudioElement>>('audioEl');
  private readonly trimTrack = viewChild<ElementRef<HTMLDivElement>>('trimTrack');

  /* Drag state for the trim region */
  private trimDragMode: 'move' | 'in' | 'out' | null = null;
  private trimDragStart = { clientX: 0, trimStart: 0, trimEnd: 0, trackWidth: 1, trackLeft: 0 };

  protected readonly Math = Math;

  protected readonly sourceUri = signal<string | null>(null);
  protected readonly sourceName = signal<string>('');
  protected readonly sourceType = signal<string>('audio');
  protected readonly duration = signal(0);
  protected readonly currentTime = signal(0);
  protected readonly playing = signal(false);
  /** When true, the timeupdate handler will auto-pause once playback
   *  crosses the trim out-point (used by "Play selection"). */
  private playUntilOut = false;

  protected readonly trimStart = signal(0);
  protected readonly trimEnd = signal(0);
  protected readonly speed = signal(1);
  protected readonly fadeIn = signal(false);
  protected readonly fadeOut = signal(false);
  protected readonly normalize = signal(false);
  protected readonly lengthMode = signal<'as_is' | 'stretch' | 'loop'>('as_is');
  protected readonly targetDuration = signal(30);
  protected readonly pickerOpen = signal(false);
  protected readonly saved = signal(false);

  protected readonly editContext = signal<AudioEditorRequest | null>(null);
  protected readonly speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  protected readonly audioAssets = computed<Asset[]>(() =>
    this.assetsSrv.assets().filter((a) =>
      a.type === 'music' || a.type === 'voice' || a.type === 'audio',
    ),
  );

  protected readonly outputDuration = computed(() => {
    const selection = Math.max(0, this.trimEnd() - this.trimStart());
    if (this.lengthMode() === 'stretch' || this.lengthMode() === 'loop') {
      return Math.max(1, this.targetDuration());
    }
    return Math.max(0, selection / this.speed());
  });

  protected readonly summaryLine = computed(() => {
    const parts: string[] = [];
    if (this.fadeIn()) parts.push('fade-in');
    if (this.fadeOut()) parts.push('fade-out');
    if (this.normalize()) parts.push('normalized');
    if (this.lengthMode() === 'stretch') parts.push(`stretched to ${this.targetDuration()}s`);
    else if (this.lengthMode() === 'loop') parts.push(`looped to ${this.targetDuration()}s`);
    if (parts.length === 0) return 'No additional processing.';
    return parts.join(' · ');
  });

  constructor() {
    const req = this.bridge.consume();
    if (req) {
      this.editContext.set(req);
      this.loadSource(req.sourceUri, req.sourceName ?? 'External audio', 'audio', req.durationSec);
    }

    // Keep audio playbackRate in sync with the speed signal
    effect(() => {
      const el = this.audioEl()?.nativeElement;
      const sp = this.speed();
      if (el) el.playbackRate = sp;
    });
  }

  ngAfterViewInit() { /* no-op */ }

  protected triggerUpload() { this.fileInput()?.nativeElement.click(); }

  protected onSourceFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;
      this.loadSource(result, file.name, file.type || 'audio');
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  private loadSource(uri: string, name: string, type: string, knownDuration?: number) {
    this.sourceUri.set(uri);
    this.sourceName.set(name);
    this.sourceType.set(type);
    this.duration.set(knownDuration ?? 0);
    this.trimStart.set(0);
    this.trimEnd.set(knownDuration ?? 0);
    this.currentTime.set(0);
    this.saved.set(false);
  }

  protected clearSource() {
    this.sourceUri.set(null);
    this.sourceName.set('');
    this.duration.set(0);
    this.trimStart.set(0);
    this.trimEnd.set(0);
  }

  protected onAudioLoaded(e: Event) {
    const el = e.target as HTMLAudioElement;
    const d = isFinite(el.duration) ? el.duration : 0;
    this.duration.set(d);
    if (this.trimEnd() === 0 || this.trimEnd() > d) this.trimEnd.set(d);
    el.playbackRate = this.speed();
  }

  protected onTimeUpdate(e: Event) {
    const el = e.target as HTMLAudioElement;
    this.currentTime.set(el.currentTime);
    // Auto-stop when crossing the out-point during a "Play selection" pass.
    if (this.playUntilOut && el.currentTime >= this.trimEnd() && !el.paused) {
      el.pause();
      el.currentTime = this.trimEnd();
      this.playUntilOut = false;
    }
  }

  protected togglePlay() {
    const el = this.audioEl()?.nativeElement;
    if (!el) return;
    this.playUntilOut = false;
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }

  protected stopPlay() {
    const el = this.audioEl()?.nativeElement;
    if (!el) return;
    this.playUntilOut = false;
    el.pause();
    el.currentTime = this.trimStart();
  }

  /** Click on the track outside the band → seek the playhead there. */
  protected onTrackClick(e: MouseEvent) {
    // Ignore clicks on the band/handles (they have their own handlers).
    if (e.target !== this.trimTrack()?.nativeElement) return;
    const track = this.trimTrack()!.nativeElement;
    const rect = track.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const sec = Math.max(0, Math.min(this.duration(), ratio * this.duration()));
    const el = this.audioEl()?.nativeElement;
    if (el) el.currentTime = sec;
    this.currentTime.set(sec);
  }

  protected resetTrim() {
    this.trimStart.set(0);
    this.trimEnd.set(this.duration());
  }

  /* ----------------- Direct manipulation of the trim region ----------------- */

  protected onTrimPointerDown(e: PointerEvent, mode: 'move' | 'in' | 'out') {
    if (this.duration() <= 0) return;
    e.preventDefault();
    e.stopPropagation();
    const track = this.trimTrack()?.nativeElement;
    if (!track) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const rect = track.getBoundingClientRect();
    this.trimDragMode = mode;
    this.trimDragStart = {
      clientX: e.clientX,
      trimStart: this.trimStart(),
      trimEnd: this.trimEnd(),
      trackWidth: rect.width,
      trackLeft: rect.left,
    };
    window.addEventListener('pointermove', this.onTrimPointerMove);
    window.addEventListener('pointerup', this.onTrimPointerUp);
  }

  private readonly onTrimPointerMove = (e: PointerEvent) => {
    if (!this.trimDragMode) return;
    const dxPx = e.clientX - this.trimDragStart.clientX;
    const dur = this.duration();
    const secsPerPx = dur / Math.max(1, this.trimDragStart.trackWidth);
    const dxSec = dxPx * secsPerPx;
    const minSelection = 0.1;

    if (this.trimDragMode === 'move') {
      const width = this.trimDragStart.trimEnd - this.trimDragStart.trimStart;
      let newStart = this.trimDragStart.trimStart + dxSec;
      newStart = Math.max(0, Math.min(dur - width, newStart));
      this.trimStart.set(newStart);
      this.trimEnd.set(newStart + width);
      return;
    }
    if (this.trimDragMode === 'in') {
      let newStart = this.trimDragStart.trimStart + dxSec;
      newStart = Math.max(0, Math.min(this.trimEnd() - minSelection, newStart));
      this.trimStart.set(newStart);
      return;
    }
    if (this.trimDragMode === 'out') {
      let newEnd = this.trimDragStart.trimEnd + dxSec;
      newEnd = Math.min(dur, Math.max(this.trimStart() + minSelection, newEnd));
      this.trimEnd.set(newEnd);
    }
  };

  private readonly onTrimPointerUp = (_e: PointerEvent) => {
    this.trimDragMode = null;
    window.removeEventListener('pointermove', this.onTrimPointerMove);
    window.removeEventListener('pointerup', this.onTrimPointerUp);
  };

  protected playTrimmed() {
    const el = this.audioEl()?.nativeElement;
    if (!el) return;
    el.currentTime = this.trimStart();
    this.playUntilOut = true;
    el.play().catch(() => {});
  }

  protected sourceTypeLabel(): string {
    const t = this.sourceType();
    if (t.startsWith('audio/')) return t.replace('audio/', '').toUpperCase();
    if (t === 'music' || t === 'voice' || t === 'audio') return t;
    return 'audio';
  }

  protected formatTime(sec: number): string {
    if (!isFinite(sec) || sec < 0) return '0:00';
    const total = Math.floor(sec);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  protected iconFor(t: string): string {
    if (t === 'music') return '🎵';
    if (t === 'voice') return '🎙';
    return '🔊';
  }

  protected openAssetPicker() { this.pickerOpen.set(true); }
  protected closePicker() { this.pickerOpen.set(false); }

  protected useAsset(a: Asset) {
    this.loadSource(a.uri, a.name, a.type, a.durationSec);
    this.closePicker();
  }

  protected saveToAssets() {
    if (!this.sourceUri()) return;
    const name = this.editedName();
    this.assetsSrv
      .generate({
        type: 'audio',
        name,
        prompt: `(audio edit) ${this.summaryLine()}; selection ${this.formatTime(this.trimStart())}–${this.formatTime(this.trimEnd())}`,
        provider: 'audio-editor',
        model: 'mock-edit',
      })
      .subscribe(() => {
        this.saved.set(true);
      });
  }

  protected applyAndReturn() {
    const ctx = this.editContext();
    if (!ctx || !this.sourceUri()) return;
    if (!this.saved()) this.saveToAssets();
    ctx.onApply(this.sourceUri()!, this.outputDuration());
    this.editContext.set(null);
    this.router.navigateByUrl(ctx.returnTo);
  }

  protected cancelEditContext() {
    const ctx = this.editContext();
    if (!ctx) return;
    this.editContext.set(null);
    this.router.navigateByUrl(ctx.returnTo);
  }

  private editedName(): string {
    const base = this.sourceName().replace(/\.[a-z0-9]+$/i, '');
    return `${base || 'audio'}-edited-${Date.now().toString().slice(-4)}.mp3`;
  }
}
