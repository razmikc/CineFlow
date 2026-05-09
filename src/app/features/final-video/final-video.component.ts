import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProjectsService } from '../../core/services/projects.service';
import { AssetsService } from '../../core/services/assets.service';
import { JobsService } from '../../core/services/jobs.service';
import { CreativeContract, Scene } from '../../core/models/contract.model';

@Component({
  selector: 'app-final-video',
  imports: [RouterLink, DatePipe, DecimalPipe],
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
                  <div class="transition-arrow" [title]="s.transitionOut.type + ' · ' + s.transitionOut.durationMs + 'ms'">
                    <span class="arrow-line"></span>
                    <span class="arrow-label">{{ s.transitionOut.type }}</span>
                  </div>
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
                {{ p.output.aspectRatio }} {{ p.output.resolution }} @ {{ p.output.fps }}fps
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
      </div>
    } @else {
      <div class="loading">
        <span class="loader"></span>
        <span style="margin-left: 0.6rem">Loading project…</span>
      </div>
    }
  `,
  styleUrl: './final-video.component.scss',
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
}
