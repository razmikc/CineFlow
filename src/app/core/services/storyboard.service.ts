import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of, switchMap } from 'rxjs';
import { Scene, StoryboardPanel } from '../models/contract.model';
import { ProjectsService } from './projects.service';

const STORYBOARD_POOL = [
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900',
  'https://images.unsplash.com/photo-1474049202442-3a35bb09c5a8?w=900',
  'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=900',
  'https://images.unsplash.com/photo-1496715976403-7e36dc43f17b?w=900',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900',
];

const BEATS = [
  'Establish location and mood',
  'Introduce the hero in their world',
  'Inciting incident — the call to action',
  'Rising tension — the world shifts',
  'Mid-point reversal',
  'Crisis at the lowest point',
  'Decisive choice',
  'Resolution and new equilibrium',
];

/**
 * Suggested storyboard returned by the orchestrator.
 * Mirrors response of:
 *   POST /api/v1/projects/{projectId}/storyboard/suggest
 */
export interface StoryboardSuggestion {
  panels: { sceneId: string; panel: StoryboardPanel }[];
  rationale: string;
}

/**
 * StoryboardService — Angular facade over per-scene storyboard panels.
 *
 * Each method maps to a future Spring REST endpoint:
 * <pre>
 *   POST   /api/v1/projects/{projectId}/storyboard/suggest
 *   PUT    /api/v1/projects/{projectId}/scenes/{sceneId}/storyboard
 *   POST   /api/v1/projects/{projectId}/scenes/{sceneId}/storyboard/regenerate
 *   PATCH  /api/v1/projects/{projectId}/scenes/{sceneId}/storyboard/lock
 *   DELETE /api/v1/projects/{projectId}/scenes/{sceneId}/storyboard
 * </pre>
 */
@Injectable({ providedIn: 'root' })
export class StoryboardService {
  private readonly projects = inject(ProjectsService);

  /**
   * POST /api/v1/projects/{projectId}/storyboard/suggest
   * Request:  { regenerateLocked?: boolean, provider?: string, model?: string }
   * Response: StoryboardSuggestion
   *
   * Generates a storyboard panel for every scene in the project. Existing
   * locked panels are preserved unless {@code regenerateLocked} is true.
   */
  suggest(
    projectId: string,
    opts: { regenerateLocked?: boolean; provider?: string; model?: string } = {},
  ): Observable<StoryboardSuggestion> {
    return this.projects.get(projectId).pipe(
      delay(900),
      map((project) => {
        if (!project) throw new Error(`Project ${projectId} not found`);
        const provider = opts.provider ?? project.models.image.provider;
        const model = opts.model ?? project.models.image.model;
        const panels = project.scenes.map((scene, i) => ({
          sceneId: scene.id,
          panel:
            scene.storyboardPanel && scene.storyboardPanel.locked && !opts.regenerateLocked
              ? scene.storyboardPanel
              : this.buildPanel(scene, i, provider, model),
        }));
        return {
          panels,
          rationale: `Suggested ${panels.length} panels using ${provider}/${model}.`,
        };
      }),
    );
  }

  /**
   * Apply the entire suggestion to the project — writes the panel of every
   * scene atomically. Equivalent to:
   *   PUT /api/v1/projects/{projectId}/storyboard
   * with body {@code { panels: [{ sceneId, panel }, ...] }}.
   */
  applySuggestion(projectId: string, suggestion: StoryboardSuggestion): Observable<Scene[] | undefined> {
    return this.projects.get(projectId).pipe(
      switchMap((project) => {
        if (!project) return of(undefined);
        const byScene = new Map(suggestion.panels.map((p) => [p.sceneId, p.panel]));
        const scenes = project.scenes.map((s) =>
          byScene.has(s.id) ? { ...s, storyboardPanel: byScene.get(s.id) } : s,
        );
        return this.projects.update(projectId, { scenes }).pipe(map((p) => p?.scenes));
      }),
    );
  }

  /**
   * PUT /api/v1/projects/{projectId}/scenes/{sceneId}/storyboard
   * Request body: StoryboardPanel
   */
  updatePanel(
    projectId: string,
    sceneId: string,
    panel: StoryboardPanel,
  ): Observable<StoryboardPanel | undefined> {
    return this.patchScenePanel(projectId, sceneId, () => panel);
  }

  /**
   * POST /api/v1/projects/{projectId}/scenes/{sceneId}/storyboard/regenerate
   * Request:  { provider?: string, model?: string }
   * Response: StoryboardPanel
   */
  regeneratePanel(
    projectId: string,
    sceneId: string,
    opts: { provider?: string; model?: string } = {},
  ): Observable<StoryboardPanel | undefined> {
    return this.projects.get(projectId).pipe(
      delay(700),
      switchMap((project) => {
        if (!project) return of(undefined);
        const scene = project.scenes.find((s) => s.id === sceneId);
        if (!scene) return of(undefined);
        const provider = opts.provider ?? project.models.image.provider;
        const model = opts.model ?? project.models.image.model;
        const next = this.buildPanel(scene, scene.index, provider, model);
        return this.patchScenePanel(projectId, sceneId, () => next);
      }),
    );
  }

  /**
   * PATCH /api/v1/projects/{projectId}/scenes/{sceneId}/storyboard/lock
   * Request body: { locked: boolean }
   */
  toggleLock(projectId: string, sceneId: string): Observable<StoryboardPanel | undefined> {
    return this.patchScenePanel(projectId, sceneId, (current) => {
      if (!current) return current;
      return { ...current, locked: !current.locked };
    });
  }

  /**
   * DELETE /api/v1/projects/{projectId}/scenes/{sceneId}/storyboard
   */
  clearPanel(projectId: string, sceneId: string): Observable<void> {
    return this.patchScenePanel(projectId, sceneId, () => undefined).pipe(map(() => undefined));
  }

  private patchScenePanel(
    projectId: string,
    sceneId: string,
    update: (current: StoryboardPanel | undefined) => StoryboardPanel | undefined,
  ): Observable<StoryboardPanel | undefined> {
    return this.projects.get(projectId).pipe(
      switchMap((project) => {
        if (!project) return of(undefined);
        let nextPanel: StoryboardPanel | undefined;
        const scenes = project.scenes.map((s) => {
          if (s.id !== sceneId) return s;
          nextPanel = update(s.storyboardPanel);
          return { ...s, storyboardPanel: nextPanel };
        });
        return this.projects.update(projectId, { scenes }).pipe(
          delay(120),
          map(() => nextPanel),
        );
      }),
    );
  }

  private buildPanel(scene: Scene, sceneIndex: number, provider: string, model: string): StoryboardPanel {
    const poolIdx = sceneIndex % STORYBOARD_POOL.length;
    const beat = BEATS[sceneIndex % BEATS.length];
    const action =
      scene.objective ||
      `${scene.camera.shotType} of the action; ${scene.camera.movement} camera move on ${scene.camera.lens}.`;
    return {
      keyframeUri: STORYBOARD_POOL[poolIdx],
      thumbnailUri: STORYBOARD_POOL[poolIdx],
      action,
      beat,
      prompt: `${scene.title} — ${beat}. ${action}`,
      provider,
      model,
      locked: scene.storyboardPanel?.locked ?? false,
      regeneratedAt: new Date().toISOString(),
      notes: scene.storyboardPanel?.notes,
    };
  }
}
