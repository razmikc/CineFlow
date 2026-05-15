import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectsService } from '../../core/services/projects.service';
import { ContractExportService } from '../../core/services/contract-export.service';
import { CreativeContract } from '../../core/models/contract.model';

type ContractFormat = 'yaml' | 'json';

@Component({
  selector: 'app-videos',
  imports: [RouterLink, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./videos.component.scss'],
  template: `
    <header class="vid-header">
      <div>
        <div class="eyebrow">Workspace</div>
        <h1>My videos</h1>
        <p class="muted">
          Every video you've finished. Click a card to play it back and see
          the exact plan that made it.
        </p>
      </div>
      <div class="chip cyan">{{ videos().length }} videos</div>
    </header>

    @if (videos().length === 0) {
      <div class="empty-state card">
        <div class="empty-art">🎬</div>
        <strong>No videos yet</strong>
        <p class="muted">
          When you finish a project and hit <em>Make my video</em>, it shows up here.
        </p>
        <a class="btn primary" routerLink="/dashboard">Pick a project to finish</a>
      </div>
    } @else {
      <div class="vid-split">
        <section class="vid-grid">
          @for (p of videos(); track p.id) {
            <button
              class="vid-card"
              type="button"
              [class.selected]="selectedId() === p.id"
              (click)="select(p.id)"
            >
              <div class="vid-thumb" [style.background-image]="thumbBg(p)">
                @if (!p.finalVideo?.thumbnailUri && !p.thumbnailUrl) {
                  <span class="vid-icon">🎬</span>
                }
                <span class="vid-duration">{{ p.finalVideo?.durationSec ?? totalDuration(p) }}s</span>
              </div>
              <div class="vid-body">
                <div class="row" style="justify-content: space-between; gap: 0.4rem">
                  <strong class="vid-title">{{ p.title }}</strong>
                  <span class="chip muted">{{ p.output.aspectRatio }}</span>
                </div>
                <div class="muted" style="font-size: 0.78rem; margin-top: 2px">
                  Rendered {{ (p.finalVideo?.renderedAt ?? p.updatedAt) | date: 'mediumDate' }}
                  · {{ p.scenes.length }} scenes
                </div>
                <div class="row" style="gap: 0.3rem; margin-top: 0.5rem">
                  <span class="chip cyan">{{ p.models.video.model }}</span>
                  <span class="chip muted">{{ p.output.resolution }}</span>
                </div>
              </div>
            </button>
          }
        </section>

        <aside class="vid-detail card">
          @if (selected(); as p) {
            <header class="vid-detail-head">
              <div>
                <strong style="font-family: var(--font-display); font-size: 1.05rem">{{ p.title }}</strong>
                <div class="muted" style="font-size: 0.78rem; margin-top: 2px">
                  {{ p.scenes.length }} scenes · {{ totalDuration(p) }}s ·
                  rendered {{ (p.finalVideo?.renderedAt ?? p.updatedAt) | date: 'medium' }}
                </div>
              </div>
              <div class="row" style="gap: 0.4rem; flex-wrap: wrap">
                <a class="btn ghost sm" [routerLink]="['/projects', p.id, 'final']">Open final-video page →</a>
                <a class="btn ghost sm" routerLink="/jobs">View generation jobs</a>
              </div>
            </header>

            <div class="player-frame">
              @if (p.finalVideo?.uri) {
                <video
                  controls
                  preload="metadata"
                  class="player-video"
                  [src]="p.finalVideo!.uri"
                  [poster]="p.finalVideo!.thumbnailUri || p.thumbnailUrl || ''"
                ></video>
              } @else {
                <div class="player-fallback">
                  <span style="font-size: 2rem">🎬</span>
                  <p class="muted">No render URI on file yet.</p>
                </div>
              }
            </div>

            <div class="row" style="justify-content: space-between; align-items: center; margin-top: 0.6rem">
              <div class="format-toggle">
                <button class="btn sm" [class.primary]="format() === 'yaml'" (click)="format.set('yaml')">YAML</button>
                <button class="btn sm" [class.primary]="format() === 'json'" (click)="format.set('json')">JSON</button>
              </div>
              <div class="row" style="gap: 0.4rem">
                <button class="btn ghost sm" (click)="copyContract()">📋 Copy</button>
                <button class="btn ghost sm" (click)="downloadContract()">⬇ Download contract</button>
                @if (p.finalVideo?.uri) {
                  <a class="btn primary sm" [href]="p.finalVideo!.uri" download>⬇ MP4</a>
                }
              </div>
            </div>

            <pre class="contract-block">{{ contractText() }}</pre>

            <div class="stats-row">
              <div><span class="muted">Genre</span><strong>{{ p.creativeDirection.genre || '—' }}</strong></div>
              <div><span class="muted">Era</span><strong>{{ p.creativeDirection.era || '—' }}</strong></div>
              <div><span class="muted">FPS</span><strong>{{ p.output.fps }}</strong></div>
              <div>
                <span class="muted">Credits</span>
                <strong>{{ totalCredits(p) | number: '1.0-0' }}</strong>
              </div>
            </div>
          } @else {
            <div class="detail-empty">
              <span style="font-size: 1.8rem">←</span>
              <p class="muted">Pick a video on the left to see its player and contract here.</p>
            </div>
          }
        </aside>
      </div>
    }
  `,
})
export class VideosComponent {
  private readonly projects = inject(ProjectsService);
  private readonly exportSvc = inject(ContractExportService);

  protected readonly format = signal<ContractFormat>('yaml');
  protected readonly selectedId = signal<string | null>(null);

  protected readonly videos = computed<CreativeContract[]>(() =>
    this.projects
      .projects()
      .filter((p) => p.finalVideo?.status === 'completed')
      .sort((a, b) => {
        const ar = a.finalVideo?.renderedAt ?? a.updatedAt;
        const br = b.finalVideo?.renderedAt ?? b.updatedAt;
        return br.localeCompare(ar);
      }),
  );

  protected readonly selected = computed<CreativeContract | undefined>(() => {
    const id = this.selectedId();
    const list = this.videos();
    return list.find((p) => p.id === id) ?? list[0];
  });

  protected readonly contractText = computed(() => {
    const p = this.selected();
    if (!p) return '';
    return this.format() === 'yaml' ? this.exportSvc.toYaml(p) : this.exportSvc.toJson(p);
  });

  protected select(id: string) {
    this.selectedId.set(id);
  }

  protected thumbBg(p: CreativeContract): string {
    const uri = p.finalVideo?.thumbnailUri || p.thumbnailUrl;
    return uri ? `url(${uri})` : '';
  }

  protected totalDuration(p: CreativeContract): number {
    if (p.finalVideo?.durationSec) return p.finalVideo.durationSec;
    return p.scenes.reduce((sum, s) => sum + s.durationSec, 0);
  }

  protected totalCredits(p: CreativeContract): number {
    return p.scenes.reduce((sum, s) => sum + (s.costEstimate ?? 0), 0);
  }

  protected copyContract() {
    navigator.clipboard?.writeText(this.contractText());
  }

  protected downloadContract() {
    const p = this.selected();
    if (!p) return;
    const blob = new Blob([this.contractText()], {
      type: this.format() === 'yaml' ? 'text/yaml' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.id}.${this.format()}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
