import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { CreativeContract, ProjectGoal } from '../models/contract.model';
import { MOCK_PROJECTS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly _projects = signal<CreativeContract[]>(structuredClone(MOCK_PROJECTS));

  readonly projects = this._projects.asReadonly();
  readonly stats = computed(() => {
    const list = this._projects();
    return {
      total: list.length,
      inProgress: list.filter((p) => p.status === 'in_progress').length,
      drafts: list.filter((p) => p.status === 'draft').length,
      review: list.filter((p) => p.status === 'review').length,
      completed: list.filter((p) => p.status === 'completed').length,
      totalScenes: list.reduce((sum, p) => sum + p.scenes.length, 0),
    };
  });

  list(): Observable<CreativeContract[]> {
    return of(this._projects()).pipe(delay(180));
  }

  get(id: string): Observable<CreativeContract | undefined> {
    return of(this._projects().find((p) => p.id === id)).pipe(delay(120));
  }

  create(input: { title: string; goal: ProjectGoal; description: string }): Observable<CreativeContract> {
    const now = new Date().toISOString();
    const newProject: CreativeContract = {
      id: `video-${String(this._projects().length + 1).padStart(3, '0')}`,
      title: input.title,
      goal: input.goal,
      description: input.description,
      output: { aspectRatio: '16:9', resolution: '1080p', fps: 24, targetDurationSec: 60, language: 'en' },
      orchestration: {
        mode: 'scene_by_scene',
        approvalPolicy: 'approve_each_scene',
        costPolicy: { estimateBeforeGenerate: true, maxCreditsPerScene: 100 },
        versioning: { keepSceneVersions: true, keepPromptVersions: true },
      },
      models: {
        script: { provider: 'anthropic', model: 'Claude Opus 4.7' },
        image: { provider: 'midjourney', model: 'Midjourney v7' },
        video: { provider: 'google', model: 'Veo 3' },
        voice: { provider: 'elevenlabs', model: 'Eleven Multilingual v3' },
        music: { provider: 'suno', model: 'Suno v5' },
      },
      creativeDirection: {
        genre: '',
        mood: [],
        styleReference: { source: 'preset', value: '' },
        colorPalette: ['#0A3055', '#0097F6'],
        fonts: { title: 'Inter', subtitle: 'Inter' },
        negativeRules: [],
        realismLevel: 0.7,
        references: [],
        lighting: '',
        era: '',
      },
      characters: [],
      scenes: [],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };
    this._projects.update((list) => [newProject, ...list]);
    return of(newProject).pipe(delay(220));
  }

  update(id: string, patch: Partial<CreativeContract>): Observable<CreativeContract | undefined> {
    let updated: CreativeContract | undefined;
    this._projects.update((list) =>
      list.map((p) => {
        if (p.id !== id) return p;
        updated = { ...p, ...patch, updatedAt: new Date().toISOString() };
        return updated;
      }),
    );
    return of(updated).pipe(delay(120));
  }

  remove(id: string): Observable<void> {
    this._projects.update((list) => list.filter((p) => p.id !== id));
    return of(undefined).pipe(delay(120));
  }

  startFinalRender(id: string): Observable<CreativeContract | undefined> {
    const finalVideo = {
      status: 'rendering' as const,
      progress: 0,
      jobId: `render-${Date.now()}`,
    };
    this.update(id, { finalVideo, status: 'review' as const });
    let progress = 0;
    const tick = setInterval(() => {
      progress = Math.min(100, progress + Math.random() * 12 + 3);
      const current = this._projects().find((p) => p.id === id);
      if (!current) {
        clearInterval(tick);
        return;
      }
      const done = progress >= 100;
      this.update(id, {
        finalVideo: {
          ...current.finalVideo!,
          progress,
          status: done ? 'completed' : 'rendering',
          uri: done
            ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            : current.finalVideo?.uri,
          thumbnailUri: done
            ? current.scenes[0]?.thumbnailUrl ?? current.thumbnailUrl
            : current.finalVideo?.thumbnailUri,
          durationSec: done
            ? current.scenes.reduce((sum, s) => sum + s.durationSec, 0)
            : current.finalVideo?.durationSec,
          renderedAt: done ? new Date().toISOString() : current.finalVideo?.renderedAt,
        },
        status: done ? ('completed' as const) : ('review' as const),
      });
      if (done) clearInterval(tick);
    }, 500);
    return of(this._projects().find((p) => p.id === id)).pipe(delay(80));
  }

  resetFinalRender(id: string): Observable<CreativeContract | undefined> {
    this.update(id, { finalVideo: { status: 'not_started', progress: 0 } });
    return of(this._projects().find((p) => p.id === id)).pipe(delay(60));
  }
}
