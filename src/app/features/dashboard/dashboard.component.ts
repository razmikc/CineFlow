import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ProjectsService } from '../../core/services/projects.service';
import { JobsService } from '../../core/services/jobs.service';
import { CreativeContract } from '../../core/models/contract.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="hero">
      <div class="hero-content">
        <div class="eyebrow">CineFlow · preview</div>
        <h1>Make the <span class="gradient-text">video</span> you imagined.</h1>
        <p class="hero-sub">
          Plan your video, scene by scene. Pick a look, pick your cast,
          review each shot before you make it. Built for creators who want
          AI to do the heavy lifting without losing the creative call.
        </p>
        <div class="row" style="gap: 0.75rem; margin-top: 1.4rem">
          <a class="btn primary lg" routerLink="/projects/new">
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4">
              <path d="M10 4v12M4 10h12" stroke-linecap="round"/>
            </svg>
            New project
          </a>
          <a class="btn lg" routerLink="/assets">Browse my media</a>
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        @for (orb of [1,2,3]; track orb) {
          <div class="orb" [class]="'orb-' + orb"></div>
        }
        <div class="lattice"></div>
      </div>
    </section>

    <section class="stats">
      @for (s of statCards(); track s.label) {
        <div class="card stat-card">
          <div class="eyebrow">{{ s.label }}</div>
          <div class="row" style="margin-top: 0.55rem; align-items: flex-end; gap: 0.6rem">
            <div class="stat-num">{{ s.value }}</div>
            <span class="chip" [class]="s.tone">{{ s.delta }}</span>
          </div>
          <div class="stat-bar"><div class="stat-fill" [style.width]="s.fill + '%'"></div></div>
        </div>
      }
    </section>

    <section class="section-row">
      <div>
        <div class="section-title">Projects in progress</div>
        <p class="muted" style="font-size: 0.85rem">Pick up where you left off.</p>
      </div>
      <a class="btn ghost sm" routerLink="/projects/new">+ New project</a>
    </section>

    <section class="projects-grid">
      <a class="card project-card add-card" routerLink="/projects/new">
        <div class="add-glow"></div>
        <div class="add-icon">
          <svg viewBox="0 0 20 20" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 4v12M4 10h12" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="add-title">Create new contract</div>
        <div class="muted" style="font-size: 0.82rem">Start a fresh AI video orchestration</div>
      </a>

      @for (p of projectsService.projects(); track p.id) {
        <a class="card project-card" [routerLink]="['/projects', p.id]">
          <div class="thumb" [style.background-image]="p.thumbnailUrl ? 'url(' + p.thumbnailUrl + ')' : ''">
            <div class="thumb-overlay">
              <span class="chip" [class]="statusTone(p.status)">{{ statusLabel(p.status) }}</span>
              <span class="chip muted">{{ p.output.aspectRatio }}</span>
            </div>
            <div class="play">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M8 5v14l11-7z"/></svg>
            </div>
          </div>
          <div class="project-body">
            <div class="row" style="justify-content: space-between; align-items: flex-start">
              <div style="min-width: 0">
                <div class="project-title">{{ p.title }}</div>
                <div class="muted" style="font-size: 0.78rem; margin-top: 4px">{{ goalLabel(p.goal) }}</div>
              </div>
              <span class="chip cyan">{{ p.scenes.length }} scenes</span>
            </div>
            <p class="project-desc">{{ p.description }}</p>
            <div class="palette">
              @for (c of p.creativeDirection.colorPalette; track c) {
                <span class="swatch" [style.background-color]="c"></span>
              }
              <div class="spacer"></div>
              <span class="muted" style="font-size: 0.74rem">{{ p.updatedAt | date: 'mediumDate' }}</span>
            </div>
            <div class="provider-row">
              <span class="provider-tag">{{ p.models.video.model }}</span>
              <span class="provider-tag">{{ p.models.image.model }}</span>
              <span class="provider-tag">{{ p.models.voice.provider }}</span>
            </div>
          </div>
        </a>
      }
    </section>

    <section class="row activity-row">
      <div class="card flex-col" style="flex: 2">
        <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
          <div class="section-title" style="margin: 0">Recent activity</div>
          <span class="chip cyan">{{ jobs.jobs().length }} jobs</span>
        </div>
        <div class="activity-list">
          @for (j of jobs.jobs().slice(0, 5); track j.id) {
            <div class="activity">
              <div class="job-icon" [class]="j.status">
                @if (j.status === 'running') {
                  <span class="loader"></span>
                } @else if (j.status === 'completed') {
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="m4 10 4 4 8-8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                } @else {
                  <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="6"/></svg>
                }
              </div>
              <div style="flex: 1; min-width: 0">
                <div class="row" style="gap: 0.4rem">
                  <strong>{{ j.model }}</strong>
                  <span class="muted" style="font-size: 0.78rem">· {{ j.provider }}</span>
                </div>
                <div class="muted" style="font-size: 0.78rem; margin-top: 2px">
                  {{ j.sceneId }} · {{ j.objectId ?? 'scene-level' }}
                </div>
              </div>
              <div style="text-align: right">
                <div class="row" style="gap: 0.3rem">
                  <div class="status-dot" [class]="j.status"></div>
                  <span class="mono" style="font-size: 0.8rem">{{ j.progress | number: '1.0-0' }}%</span>
                </div>
                <div class="muted" style="font-size: 0.74rem; margin-top: 2px">\${{ (j.costActual ?? j.costEstimate).toFixed(2) }}</div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="card flex-col" style="flex: 1">
        <div class="section-title" style="margin: 0 0 0.5rem">Quick actions</div>
        <div class="quick-actions">
          <a class="quick-action" routerLink="/projects/new">
            <span class="qa-icon" style="background: var(--grad-primary)">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="white" stroke-width="2.2"><path d="M3 10h14M10 3v14" stroke-linecap="round"/></svg>
            </span>
            <div>
              <div class="qa-title">New project</div>
              <div class="muted" style="font-size: 0.76rem">From contract or template</div>
            </div>
          </a>
          <a class="quick-action" routerLink="/assets">
            <span class="qa-icon" style="background: var(--grad-secondary)">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="white" stroke-width="2"><rect x="2.5" y="3" width="15" height="14" rx="2.5"/><circle cx="7.5" cy="8" r="1.5"/><path d="m3 14 4-4 4 4 3-3 3 3"/></svg>
            </span>
            <div>
              <div class="qa-title">Upload assets</div>
              <div class="muted" style="font-size: 0.76rem">Reference images, voices, music</div>
            </div>
          </a>
          <a class="quick-action" routerLink="/models">
            <span class="qa-icon" style="background: var(--grad-warm)">
              <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="white" stroke-width="2"><rect x="5" y="5" width="10" height="10" rx="1.5"/><path d="M8 5V3M12 5V3M8 17v-2M12 17v-2M5 8H3M5 12H3M17 8h-2M17 12h-2"/></svg>
            </span>
            <div>
              <div class="qa-title">Browse AI models</div>
              <div class="muted" style="font-size: 0.76rem">Compare providers & costs</div>
            </div>
          </a>
        </div>
      </div>
    </section>
  `,
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  protected readonly projectsService = inject(ProjectsService);
  protected readonly jobs = inject(JobsService);
  protected readonly router = inject(Router);

  protected readonly statCards = computed(() => {
    const s = this.projectsService.stats();
    return [
      { label: 'Active projects', value: s.inProgress + s.review, delta: '+2 this week', tone: 'green', fill: 78 },
      { label: 'Total scenes', value: s.totalScenes, delta: 'across all projects', tone: 'cyan', fill: 64 },
      { label: 'Drafts', value: s.drafts, delta: 'awaiting setup', tone: 'amber', fill: 42 },
      { label: 'Completed', value: s.completed, delta: 'shipped', tone: 'muted', fill: 18 },
    ];
  });

  protected statusTone(s: CreativeContract['status']) {
    return { draft: 'muted', in_progress: 'cyan', review: 'amber', completed: 'green' }[s];
  }
  protected statusLabel(s: CreativeContract['status']) {
    return { draft: 'Draft', in_progress: 'In progress', review: 'In review', completed: 'Completed' }[s];
  }
  protected goalLabel(g: CreativeContract['goal']) {
    const map: Record<string, string> = {
      ad: 'Advertisement',
      music_video: 'Music video',
      children_story: "Children's story",
      cinematic_trailer: 'Cinematic trailer',
      explainer: 'Explainer',
      product_demo: 'Product demo',
      youtube_short: 'YouTube short',
      educational: 'Educational',
      documentary: 'Documentary',
    };
    return map[g] ?? g;
  }
}
