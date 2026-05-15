import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProjectsService } from '../../core/services/projects.service';
import { CreativeContract } from '../../core/models/contract.model';

@Component({
  selector: 'app-drafts',
  imports: [RouterLink, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./drafts.component.scss'],
  template: `
    <header class="drafts-header">
      <div>
        <div class="eyebrow">Workspace</div>
        <h1>Drafts</h1>
        <p class="muted">
          Projects you saved but haven't finished. Hit <strong>Continue</strong> to
          pick up right where you left off.
        </p>
      </div>
      <div class="row" style="gap: 0.5rem">
        <div class="chip cyan">{{ drafts().length }} drafts</div>
        <a class="btn primary sm" routerLink="/projects/new">+ New project</a>
      </div>
    </header>

    @if (drafts().length === 0) {
      <div class="empty-state card">
        <div class="empty-art">📝</div>
        <strong>Nothing saved yet</strong>
        <p class="muted">
          Tap <em>Save draft</em> anywhere while you're working — projects you
          haven't finished land here.
        </p>
        <a class="btn primary" routerLink="/projects/new">Start a new project</a>
      </div>
    } @else {
      <section class="drafts-grid">
        @for (p of drafts(); track p.id) {
          <article class="draft-card">
            <div class="draft-thumb" [style.background-image]="thumbBg(p)">
              @if (!p.thumbnailUrl) { <span class="draft-icon">🎬</span> }
              <span class="draft-stage">{{ stageLabel(p) }}</span>
            </div>
            <div class="draft-body">
              <div class="row" style="justify-content: space-between; gap: 0.4rem">
                <strong class="draft-title">{{ p.title || 'Untitled draft' }}</strong>
                <span class="chip muted">{{ p.output.aspectRatio }}</span>
              </div>
              <div class="muted" style="font-size: 0.78rem; margin-top: 2px">
                Last saved {{ p.updatedAt | date: 'medium' }} · {{ p.scenes.length }} scenes
              </div>
              @if (p.description) {
                <p class="draft-desc">{{ p.description }}</p>
              }
              <div class="row" style="gap: 0.4rem; margin-top: 0.6rem">
                <button class="btn primary sm" (click)="resume(p)">Continue →</button>
                <a class="btn ghost sm" [routerLink]="['/projects', p.id]">Open wizard</a>
                <button class="btn ghost sm danger" (click)="discard(p)">🗑 Discard</button>
              </div>
            </div>
          </article>
        }
      </section>
    }
  `,
})
export class DraftsComponent {
  private readonly projects = inject(ProjectsService);
  private readonly router = inject(Router);

  protected readonly drafts = computed<CreativeContract[]>(() =>
    this.projects
      .projects()
      .filter((p) => p.status === 'draft')
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  );

  protected resume(p: CreativeContract) {
    const target = p.lastEditedRoute || `/projects/${p.id}`;
    this.router.navigateByUrl(target);
  }

  protected discard(p: CreativeContract) {
    if (!confirm(`Delete draft "${p.title || p.id}"? This cannot be undone.`)) return;
    this.projects.remove(p.id).subscribe();
  }

  protected thumbBg(p: CreativeContract): string {
    return p.thumbnailUrl ? `url(${p.thumbnailUrl})` : '';
  }

  protected stageLabel(p: CreativeContract): string {
    const r = p.lastEditedRoute ?? '';
    if (r.includes('/scenes/')) return 'Scene workspace';
    if (r.endsWith('/moodboard')) return 'Moodboard';
    if (p.lastEditedStep) return `Wizard · ${p.lastEditedStep}`;
    return 'Wizard';
  }
}
