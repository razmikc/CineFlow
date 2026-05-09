import { Injectable, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { GenerationJob } from '../models/contract.model';
import { MOCK_JOBS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class JobsService {
  private readonly _jobs = signal<GenerationJob[]>(structuredClone(MOCK_JOBS));
  readonly jobs = this._jobs.asReadonly();

  list(projectId?: string): Observable<GenerationJob[]> {
    const list = projectId
      ? this._jobs().filter((j) => j.projectId === projectId)
      : this._jobs();
    return of(list).pipe(delay(120));
  }

  enqueue(input: Omit<GenerationJob, 'id' | 'status' | 'progress'>): Observable<GenerationJob> {
    const newJob: GenerationJob = {
      ...input,
      id: `job-${String(this._jobs().length + 1).padStart(3, '0')}`,
      status: 'queued',
      progress: 0,
    };
    this._jobs.update((list) => [newJob, ...list]);

    // simulate progress
    let progress = 0;
    const tick = setInterval(() => {
      progress = Math.min(100, progress + Math.random() * 18);
      this._jobs.update((list) =>
        list.map((j) =>
          j.id === newJob.id
            ? {
                ...j,
                progress,
                status: progress >= 100 ? 'completed' : 'running',
                completedAt: progress >= 100 ? new Date().toISOString() : j.completedAt,
              }
            : j,
        ),
      );
      if (progress >= 100) clearInterval(tick);
    }, 800);

    return of(newJob).pipe(delay(160));
  }
}
