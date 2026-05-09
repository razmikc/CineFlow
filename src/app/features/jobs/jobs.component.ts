import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { JobsService } from '../../core/services/jobs.service';

@Component({
  selector: 'app-jobs',
  imports: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      <h1>Generation jobs</h1>
      <p class="muted" style="margin-top: 0.4rem">Asynchronous tasks across providers. Live progress, costs, and outputs.</p>
    </header>

    <section class="stats">
      <div class="card stat">
        <div class="eyebrow">Running</div>
        <div class="stat-num">{{ runningCount() }}</div>
      </div>
      <div class="card stat">
        <div class="eyebrow">Completed</div>
        <div class="stat-num">{{ completedCount() }}</div>
      </div>
      <div class="card stat">
        <div class="eyebrow">Total spend</div>
        <div class="stat-num">\${{ totalSpend() | number: '1.2-2' }}</div>
      </div>
    </section>

    <section class="card jobs-table">
      <div class="row table-head">
        <div style="flex: 2">Job</div>
        <div style="flex: 1.5">Provider</div>
        <div style="flex: 2">Progress</div>
        <div style="flex: 0.8; text-align: right">Cost</div>
        <div style="flex: 1.3">Created</div>
      </div>
      @for (j of jobs.jobs(); track j.id) {
        <div class="row job-row">
          <div style="flex: 2; min-width: 0">
            <div class="row" style="gap: 0.4rem">
              <span class="status-pill" [class]="j.status">●</span>
              <strong style="font-size: 0.86rem">{{ j.id }}</strong>
            </div>
            <div class="muted" style="font-size: 0.76rem; margin-top: 2px">
              {{ j.sceneId }} · {{ j.objectId ?? 'scene-level' }}
            </div>
          </div>
          <div style="flex: 1.5">
            <div style="font-size: 0.86rem; font-weight: 600">{{ j.model }}</div>
            <div class="muted" style="font-size: 0.76rem">{{ j.provider }}</div>
          </div>
          <div style="flex: 2">
            <div class="progress-bar"><div class="progress-fill" [class]="j.status" [style.width.%]="j.progress"></div></div>
            <div class="row" style="justify-content: space-between; margin-top: 4px">
              <span class="mono" style="font-size: 0.72rem">{{ j.progress | number: '1.0-0' }}%</span>
              <span class="muted" style="font-size: 0.72rem">{{ j.status }}</span>
            </div>
          </div>
          <div style="flex: 0.8; text-align: right">
            <div class="mono" style="font-weight: 600">\${{ (j.costActual ?? j.costEstimate) | number: '1.2-2' }}</div>
            @if (j.costActual === undefined) { <div class="muted" style="font-size: 0.72rem">est</div> }
          </div>
          <div style="flex: 1.3">
            <div style="font-size: 0.78rem">{{ (j.startedAt ?? j.completedAt) | date: 'short' }}</div>
          </div>
        </div>
      }
    </section>
  `,
  styleUrl: './jobs.component.scss',
})
export class JobsComponent {
  protected readonly jobs = inject(JobsService);

  protected readonly runningCount = computed(() =>
    this.jobs.jobs().filter((j) => j.status === 'running' || j.status === 'queued').length,
  );
  protected readonly completedCount = computed(() => this.jobs.jobs().filter((j) => j.status === 'completed').length);
  protected readonly totalSpend = computed(() =>
    this.jobs.jobs().reduce((s, j) => s + (j.costActual ?? j.costEstimate), 0),
  );
}
