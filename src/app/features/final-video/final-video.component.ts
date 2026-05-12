import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectsService } from '../../core/services/projects.service';
import { AssetsService } from '../../core/services/assets.service';
import { JobsService } from '../../core/services/jobs.service';
import { sampleVideoFor } from '../../core/services/sample-videos';
import { Scene, Transition, TransitionType } from '../../core/models/contract.model';

interface TransitionMeta {
  id: TransitionType;
  label: string;
  description: string;
  defaultDurationMs: number;
}

const TRANSITION_CATALOG: TransitionMeta[] = [
  { id: 'cut', label: 'Cut', description: 'Instant switch, no animation.', defaultDurationMs: 0 },
  { id: 'fade', label: 'Fade (black)', description: 'A fades to black, B fades in.', defaultDurationMs: 600 },
  { id: 'fade_white', label: 'Fade (white)', description: 'Fade through white — bright reveal.', defaultDurationMs: 600 },
  { id: 'dissolve', label: 'Dissolve', description: 'B cross-fades over A.', defaultDurationMs: 500 },
  { id: 'wipe_left', label: 'Wipe ←', description: 'B wipes in from the right.', defaultDurationMs: 500 },
  { id: 'wipe_right', label: 'Wipe →', description: 'B wipes in from the left.', defaultDurationMs: 500 },
  { id: 'wipe_up', label: 'Wipe ↑', description: 'B wipes in from the bottom.', defaultDurationMs: 500 },
  { id: 'wipe_down', label: 'Wipe ↓', description: 'B wipes in from the top.', defaultDurationMs: 500 },
  { id: 'slide_left', label: 'Slide ←', description: 'B slides over A from the right.', defaultDurationMs: 550 },
  { id: 'slide_right', label: 'Slide →', description: 'B slides over A from the left.', defaultDurationMs: 550 },
  { id: 'push_left', label: 'Push ←', description: 'A and B shift together, A exits left.', defaultDurationMs: 600 },
  { id: 'push_right', label: 'Push →', description: 'A and B shift together, A exits right.', defaultDurationMs: 600 },
  { id: 'zoom_in', label: 'Zoom in', description: 'B zooms up from center.', defaultDurationMs: 600 },
  { id: 'zoom_out', label: 'Zoom out', description: 'A blows out as B emerges.', defaultDurationMs: 700 },
  { id: 'iris_in', label: 'Iris in', description: 'Circular reveal opening.', defaultDurationMs: 700 },
  { id: 'iris_out', label: 'Iris out', description: 'Circular close.', defaultDurationMs: 700 },
  { id: 'blur', label: 'Blur', description: 'A blurs out, B blurs in.', defaultDurationMs: 600 },
  { id: 'glitch', label: 'Glitch', description: 'Digital glitch reveal.', defaultDurationMs: 450 },
  { id: 'whip_pan', label: 'Whip pan', description: 'Fast horizontal pan with motion blur.', defaultDurationMs: 420 },
  { id: 'dip_to_black', label: 'Dip to black', description: 'Both ends touch black.', defaultDurationMs: 900 },
  { id: 'dip_to_white', label: 'Dip to white', description: 'Both ends touch white.', defaultDurationMs: 900 },
  { id: 'dip_to_color', label: 'Dip to color', description: 'Dip through your brand color.', defaultDurationMs: 900 },
  { id: 'venetian_blinds', label: 'Venetian blinds', description: 'Horizontal slats reveal B.', defaultDurationMs: 700 },
  { id: 'clock_wipe', label: 'Clock wipe', description: 'Rotational sweep.', defaultDurationMs: 800 },
  { id: 'page_curl', label: 'Page curl', description: 'Page peels in with perspective.', defaultDurationMs: 800 },
  { id: 'morph', label: 'Morph', description: 'Blur + scale + rotate blend.', defaultDurationMs: 700 },
  { id: 'light_leak', label: 'Light leak', description: 'Warm film-leak burst masks the cut.', defaultDurationMs: 700 },
];

@Component({
  selector: 'app-final-video',
  imports: [RouterLink, DatePipe, DecimalPipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (project(); as p) {
      <div class="final">
        <header class="final-header">
          <div>
            <a class="back" [routerLink]="['/projects', p.id]">← Back to {{ p.title }}</a>
            <h1 style="margin-top: 6px">Final video assembly</h1>
            <p class="muted" style="margin-top: 4px">
              Stitch every approved scene into one continuous render. Each scene's audio, subtitles, and
              transitions are merged in order.
            </p>
          </div>
          <div class="row" style="gap: 0.5rem; flex-wrap: wrap">
            <span class="chip" [class]="readinessTone()">{{ readinessLabel() }}</span>
            <span class="chip muted">{{ totalDuration() }}s total</span>
            <span class="chip cyan">~{{ totalCredits() }} credits</span>
          </div>
        </header>

        <section class="card storyboard">
          <div class="row" style="justify-content: space-between; margin-bottom: 0.6rem">
            <div class="section-title" style="margin: 0">Storyboard timeline</div>
            <span class="muted" style="font-size: 0.78rem">
              {{ approvedCount() }} / {{ p.scenes.length }} approved
            </span>
          </div>

          @if (p.scenes.length === 0) {
            <div class="empty">
              <div style="font-size: 1.6rem">🎬</div>
              <div style="font-family: var(--font-display); font-weight: 600">No scenes yet</div>
              <p class="muted">Add scenes in the wizard to start assembling.</p>
              <a class="btn primary sm" [routerLink]="['/projects', p.id]">Open wizard</a>
            </div>
          } @else {
            <div class="timeline-strip">
              @for (s of p.scenes; track s.id; let last = $last) {
                <a class="timeline-card" [class]="'tone-' + statusTone(s.review.status)"
                  [routerLink]="['/projects', p.id, 'scenes', s.id]">
                  <div class="tl-thumb"
                    [style.background-image]="thumbFor(s) ? 'url(' + thumbFor(s) + ')' : ''">
                    <span class="tl-num">{{ s.index + 1 }}</span>
                    <span class="tl-status" [class]="statusTone(s.review.status)">●</span>
                  </div>
                  <div class="tl-body">
                    <strong style="font-size: 0.86rem">{{ s.title }}</strong>
                    <div class="muted" style="font-size: 0.74rem">{{ s.objective || '—' }}</div>
                    <div class="row" style="gap: 0.3rem; margin-top: 4px; flex-wrap: wrap">
                      <span class="chip muted sm-chip">{{ s.durationSec }}s</span>
                      <span class="chip sm-chip" [class]="statusTone(s.review.status)">{{ s.review.status }}</span>
                    </div>
                  </div>
                </a>
                @if (!last) {
                  <button
                    type="button"
                    class="transition-arrow clickable"
                    [title]="transitionLabel(s.transitionOut.type) + ' · ' + s.transitionOut.durationMs + 'ms — click to change'"
                    (click)="openTransitionPicker(s.id)">
                    <span class="arrow-line"></span>
                    <span class="arrow-label">{{ transitionLabel(s.transitionOut.type) }}</span>
                  </button>
                }
              }
            </div>
          }
        </section>

        <section class="render-grid">
          <div class="card render-card">
            <div class="row" style="justify-content: space-between; margin-bottom: 0.6rem">
              <div class="section-title" style="margin: 0">Final render</div>
              @if (p.finalVideo?.status === 'completed') {
                <span class="chip green">ready</span>
              } @else if (p.finalVideo?.status === 'rendering') {
                <span class="chip amber">rendering</span>
              } @else {
                <span class="chip muted">not started</span>
              }
            </div>

            <div class="render-stage" [class.ready]="p.finalVideo?.status === 'completed'">
              @if (p.finalVideo?.status === 'completed' && p.finalVideo?.uri) {
                <video controls preload="metadata" [src]="p.finalVideo!.uri"
                  [poster]="p.finalVideo!.thumbnailUri || ''" class="render-video"></video>
              } @else if (p.finalVideo?.status === 'rendering') {
                <div class="render-progress">
                  <div class="loader-large"></div>
                  <strong>Rendering scene {{ currentRenderingScene() }} / {{ p.scenes.length }}…</strong>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="p.finalVideo!.progress"></div>
                  </div>
                  <span class="mono" style="font-size: 0.85rem">
                    {{ p.finalVideo!.progress | number: '1.0-0' }}%
                  </span>
                </div>
              } @else {
                <div class="render-empty">
                  <div style="font-size: 2.4rem">🎞</div>
                  <strong>Ready to assemble</strong>
                  <p class="muted" style="font-size: 0.85rem; max-width: 320px; text-align: center">
                    {{ canRender() ? 'Approve all scenes and press Generate to stitch your final cut.'
                        : 'Approve every scene first — generate is locked while ' + missingApprovals() + ' scene(s) are unapproved.' }}
                  </p>
                </div>
              }
            </div>

            <div class="row render-actions">
              <button class="btn cool"
                [disabled]="!canRender() || p.finalVideo?.status === 'rendering'"
                (click)="generateFinal()">
                @if (p.finalVideo?.status === 'rendering') { ⏳ Rendering… }
                @else if (p.finalVideo?.status === 'completed') { ↻ Regenerate final video }
                @else { 🚀 Generate final video }
              </button>
              @if (p.finalVideo?.status === 'completed' && p.finalVideo?.uri) {
                <a class="btn primary" [href]="p.finalVideo!.uri" download>⬇ Download MP4</a>
                <button class="btn sm" (click)="resetFinal()">Reset</button>
              }
            </div>

            @if (p.finalVideo?.status === 'completed' && p.finalVideo?.renderedAt) {
              <div class="muted" style="font-size: 0.78rem; margin-top: 0.6rem">
                Rendered {{ p.finalVideo!.renderedAt | date: 'medium' }} ·
                {{ p.finalVideo!.durationSec }}s ·
                {{ p.output.aspectRatio }} {{ p.output.resolution }} &#64; {{ p.output.fps }}fps
              </div>
            }
          </div>

          <aside class="card flex-col">
            <div class="section-title" style="margin: 0 0 0.4rem">Pre-flight checks</div>
            @for (c of preflightChecks(); track c.label) {
              <div class="quality" [class]="c.tone">
                <span class="dot"></span>
                <span>{{ c.label }}</span>
                <span class="spacer"></span>
                <span class="mono" style="font-size: 0.78rem">{{ c.value }}</span>
              </div>
            }
            <div class="divider"></div>
            <div class="section-title" style="margin: 0 0 0.4rem">Output</div>
            <div class="kv"><span class="muted">Aspect</span><span>{{ p.output.aspectRatio }}</span></div>
            <div class="kv"><span class="muted">Resolution</span><span>{{ p.output.resolution }}</span></div>
            <div class="kv"><span class="muted">FPS</span><span>{{ p.output.fps }}</span></div>
            <div class="kv"><span class="muted">Language</span><span>{{ p.output.language }}</span></div>
            <div class="kv"><span class="muted">Total length</span><span>{{ totalDuration() }}s</span></div>
            <div class="kv"><span class="muted">Video model</span><span>{{ p.models.video.model }}</span></div>
          </aside>
        </section>

        @if (pickerOpenForSceneId(); as sceneId) {
          <div class="modal-backdrop" (click)="closeTransitionPicker()">
            <div class="modal" (click)="$event.stopPropagation()">
              <div class="row" style="justify-content: space-between; align-items: flex-start">
                <div>
                  <div class="eyebrow">Transition · scene {{ pickerSceneIndex() + 1 }} → {{ pickerSceneIndex() + 2 }}</div>
                  <h3 style="margin-top: 4px">{{ transitionLabel(draft().type) }}</h3>
                  <p class="muted" style="font-size: 0.82rem; margin-top: 2px">{{ transitionDescription(draft().type) }}</p>
                </div>
                <button class="iconbtn" type="button" (click)="closeTransitionPicker()">×</button>
              </div>

              <div [class]="previewClass()"
                [style.--tx-duration.ms]="draft().durationMs"
                [style.--tx-dip-color]="draft().dipColor || '#000000'">
                @if (useRealVideo()) {
                  <video #videoA class="tx-panel a tx-video"
                    [src]="previewVideoA()"
                    autoplay muted loop playsinline preload="auto"></video>
                  <video #videoB class="tx-panel b tx-video"
                    [src]="previewVideoB()"
                    autoplay muted loop playsinline preload="auto"></video>
                } @else {
                  <div class="tx-panel a">A</div>
                  <div class="tx-panel b">B</div>
                }
                <div class="tx-overlay"></div>
              </div>

              <div class="tx-meta">
                <button class="btn primary sm" type="button" (click)="replayPreview()">▶ Play preview</button>
                <button class="btn cool sm" type="button" (click)="playMerged()" [disabled]="merging()">
                  @if (merging()) { <span class="loader"></span> Merging… }
                  @else { 🎞 Play merged }
                </button>
                <label class="check-line" style="margin: 0">
                  <input type="checkbox" [ngModel]="useRealVideo()" (ngModelChange)="toggleRealVideo($event)"/>
                  <span>Use sample videos</span>
                </label>
                <div style="flex: 1; min-width: 220px">
                  <label class="field">Duration {{ draft().durationMs }}ms</label>
                  <input type="range" min="0" max="1500" step="20"
                    [ngModel]="draft().durationMs"
                    (ngModelChange)="updateDraft({ durationMs: +$event })"
                    class="slider"/>
                </div>
                @if (draft().type === 'dip_to_color') {
                  <div>
                    <label class="field">Dip color</label>
                    <input type="color"
                      [ngModel]="draft().dipColor || '#000000'"
                      (ngModelChange)="updateDraft({ dipColor: $event })"/>
                  </div>
                }
                <span class="spacer"></span>
                <button class="btn ghost sm" type="button" (click)="closeTransitionPicker()">Cancel</button>
                <button class="btn cool" type="button" (click)="saveTransition()">Save transition</button>
              </div>

              @if (useRealVideo()) {
                <div class="muted" style="font-size: 0.78rem">
                  Scene {{ pickerSceneIndex() + 1 }}: <span class="mono">{{ shortName(previewVideoA()) }}</span>
                  · Scene {{ pickerSceneIndex() + 2 }}: <span class="mono">{{ shortName(previewVideoB()) }}</span>
                </div>
              }

              <div class="tx-grid">
                @for (t of catalog; track t.id) {
                  <button class="tx-card" type="button"
                    [class.selected]="draft().type === t.id"
                    (click)="pickTransition(t)">
                    <div class="tx-thumb"
                      [class]="'tx-anim-' + t.id"
                      [style.--tx-duration.ms]="t.defaultDurationMs || 300"
                      [style.--tx-dip-color]="t.id === 'dip_to_color' ? (draft().dipColor || '#0A3055') : '#000'">
                      <div class="tx-panel a">A</div>
                      <div class="tx-panel b">B</div>
                      <div class="tx-overlay"></div>
                    </div>
                    <div class="tx-card-meta">
                      <div class="tx-card-name">{{ t.label }}</div>
                      <div class="tx-card-desc">{{ t.description }}</div>
                    </div>
                  </button>
                }
              </div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="loading">
        <span class="loader"></span>
        <span style="margin-left: 0.6rem">Loading project…</span>
      </div>
    }
  `,
  styleUrls: [
    './final-video.component.scss',
    './transitions.scss',
    './transition-thumbs.scss',
    './transition-keyframes.scss',
  ],
})
export class FinalVideoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsSvc = inject(ProjectsService);
  protected readonly assets = inject(AssetsService);
  protected readonly jobs = inject(JobsService);

  protected readonly project = computed(() =>
    this.projectsSvc.projects().find((p) => p.id === this.routeProjectId()),
  );
  private readonly routeProjectId = signal<string | null>(null);

  protected readonly approvedCount = computed(() => {
    const p = this.project();
    return p ? p.scenes.filter((s) => s.review.status === 'approved').length : 0;
  });

  protected readonly canRender = computed(() => {
    const p = this.project();
    return !!p && p.scenes.length > 0 && p.scenes.every((s) => s.review.status === 'approved');
  });

  protected readonly totalDuration = computed(() => {
    const p = this.project();
    return p ? p.scenes.reduce((sum, s) => sum + s.durationSec, 0) : 0;
  });

  protected readonly totalCredits = computed(() => {
    const p = this.project();
    return p ? p.scenes.reduce((sum, s) => sum + (s.costEstimate ?? 0), 0) : 0;
  });

  protected readonly currentRenderingScene = computed(() => {
    const p = this.project();
    if (!p?.finalVideo) return 0;
    return Math.min(
      p.scenes.length,
      Math.max(1, Math.ceil((p.finalVideo.progress / 100) * p.scenes.length)),
    );
  });

  protected readonly preflightChecks = computed(() => {
    const p = this.project();
    if (!p) return [];
    const allApproved = this.canRender();
    const hasCharacters = p.characters.length > 0;
    const hasMusic = p.scenes.some((s) => s.audio.backgroundMusic.genre);
    const hasNarration = p.scenes.some((s) => s.narration.text);
    const hasNegative = p.creativeDirection.negativeRules.length > 0;
    return [
      {
        label: 'All scenes approved',
        value: `${this.approvedCount()} / ${p.scenes.length}`,
        tone: allApproved ? 'green' : 'amber',
      },
      {
        label: 'Continuity locks',
        value: hasCharacters ? `${p.characters.filter((c) => c.continuityLock).length} / ${p.characters.length}` : 'no chars',
        tone: hasCharacters ? 'green' : 'muted',
      },
      { label: 'Background music', value: hasMusic ? 'Set' : 'Skipped', tone: 'green' },
      { label: 'Narration', value: hasNarration ? 'Set' : 'Skipped', tone: 'green' },
      { label: 'Safety rules', value: hasNegative ? `${p.creativeDirection.negativeRules.length}` : 'None', tone: 'green' },
    ];
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.routeProjectId.set(params.get('id'));
    });
  }

  protected statusTone(status: string) {
    return { draft: 'muted', prepared: 'cyan', generating: 'amber', completed: 'green', approved: 'green', failed: 'rose', waiting_for_user: 'amber' }[status] ?? 'muted';
  }
  protected readinessTone() {
    const p = this.project();
    if (!p) return 'muted';
    if (p.finalVideo?.status === 'completed') return 'green';
    return this.canRender() ? 'cyan' : 'amber';
  }
  protected readinessLabel() {
    const p = this.project();
    if (!p) return 'loading';
    if (p.finalVideo?.status === 'completed') return 'final ready';
    return this.canRender() ? 'ready to render' : 'awaiting approvals';
  }
  protected missingApprovals() {
    const p = this.project();
    return p ? p.scenes.length - this.approvedCount() : 0;
  }
  protected thumbFor(s: Scene): string {
    if (s.thumbnailUrl) return s.thumbnailUrl;
    if (s.startFrame?.assetId) {
      const a = this.assets.get(s.startFrame.assetId);
      if (a) return a.thumbnail || a.uri;
    }
    if (s.background.assetId) {
      const a = this.assets.get(s.background.assetId);
      if (a) return a.thumbnail || a.uri;
    }
    return '';
  }

  protected generateFinal() {
    const p = this.project();
    if (!p || !this.canRender()) return;
    this.projectsSvc.startFinalRender(p.id).subscribe();
    this.jobs.enqueue({
      projectId: p.id,
      provider: p.models.video.provider,
      model: p.models.video.model,
      costEstimate: this.totalCredits(),
      outputAssetIds: [],
    }).subscribe();
  }

  protected resetFinal() {
    const p = this.project();
    if (!p) return;
    this.projectsSvc.resetFinalRender(p.id).subscribe();
  }

  /* ============ Transition picker ============ */
  protected readonly catalog = TRANSITION_CATALOG;
  protected readonly pickerOpenForSceneId = signal<string | null>(null);
  protected readonly draft = signal<Transition>({ type: 'fade', durationMs: 500 });
  protected readonly playing = signal(true);
  protected readonly useRealVideo = signal(true);
  protected readonly merging = signal(false);

  private readonly videoA = viewChild<ElementRef<HTMLVideoElement>>('videoA');
  private readonly videoB = viewChild<ElementRef<HTMLVideoElement>>('videoB');

  protected readonly previewClass = computed(() => {
    const parts = ['tx-preview'];
    if (this.useRealVideo()) parts.push('use-video');
    if (this.playing()) parts.push('tx-anim-' + this.draft().type);
    return parts.join(' ');
  });

  protected readonly previewVideoA = computed(() => {
    const i = this.pickerSceneIndex();
    return sampleVideoFor(i);
  });
  protected readonly previewVideoB = computed(() => {
    const i = this.pickerSceneIndex();
    return sampleVideoFor(i + 1);
  });

  protected shortName(uri: string): string {
    const parts = uri.split('/');
    return parts[parts.length - 1] || uri;
  }

  protected toggleRealVideo(on: boolean) {
    this.useRealVideo.set(on);
    this.replayPreview();
  }

  protected playMerged() {
    if (this.merging()) return;
    this.useRealVideo.set(true);
    this.merging.set(true);
    this.replayPreview();
    setTimeout(() => this.merging.set(false), this.draft().durationMs + 1200);
  }

  private rewindVideos() {
    const a = this.videoA()?.nativeElement;
    const b = this.videoB()?.nativeElement;
    [a, b].forEach((v) => {
      if (!v) return;
      try {
        v.currentTime = 0;
        const pr = v.play();
        if (pr && typeof pr.catch === 'function') pr.catch(() => undefined);
      } catch {
        /* ignore */
      }
    });
  }

  protected readonly pickerSceneIndex = computed(() => {
    const id = this.pickerOpenForSceneId();
    const p = this.project();
    if (!id || !p) return 0;
    return p.scenes.findIndex((s) => s.id === id);
  });

  protected transitionLabel(type: TransitionType): string {
    return this.catalog.find((t) => t.id === type)?.label ?? type;
  }
  protected transitionDescription(type: TransitionType): string {
    return this.catalog.find((t) => t.id === type)?.description ?? '';
  }

  protected openTransitionPicker(sceneId: string) {
    const p = this.project();
    if (!p) return;
    const scene = p.scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    this.draft.set({ ...scene.transitionOut });
    this.pickerOpenForSceneId.set(sceneId);
    this.replayPreview();
  }

  protected closeTransitionPicker() {
    this.pickerOpenForSceneId.set(null);
  }

  protected pickTransition(meta: TransitionMeta) {
    const current = this.draft();
    this.draft.set({
      type: meta.id,
      durationMs: meta.defaultDurationMs || current.durationMs,
      dipColor: current.dipColor,
    });
    this.replayPreview();
  }

  protected updateDraft(patch: Partial<Transition>) {
    this.draft.update((d) => ({ ...d, ...patch }));
    this.replayPreview();
  }

  protected replayPreview() {
    this.playing.set(false);
    setTimeout(() => {
      this.playing.set(true);
      this.rewindVideos();
    }, 40);
  }

  protected saveTransition() {
    const sceneId = this.pickerOpenForSceneId();
    const p = this.project();
    if (!sceneId || !p) return;
    const scenes = p.scenes.map((s) =>
      s.id === sceneId ? { ...s, transitionOut: this.draft() } : s,
    );
    this.projectsSvc.update(p.id, { scenes }).subscribe();
    this.closeTransitionPicker();
  }
}
