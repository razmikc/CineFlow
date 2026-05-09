import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Scene, SceneObject, SceneVersion } from '../models/contract.model';
import { ProjectsService } from './projects.service';
import { MOCK_VERSIONS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class ScenesService {
  constructor(private readonly projects: ProjectsService) {}

  list(projectId: string): Observable<Scene[]> {
    const project = this.projects.projects().find((p) => p.id === projectId);
    return of(project?.scenes ?? []).pipe(delay(120));
  }

  get(projectId: string, sceneId: string): Observable<Scene | undefined> {
    const project = this.projects.projects().find((p) => p.id === projectId);
    return of(project?.scenes.find((s) => s.id === sceneId)).pipe(delay(120));
  }

  versions(sceneId: string): Observable<SceneVersion[]> {
    return of(MOCK_VERSIONS.filter((v) => v.sceneId === sceneId)).pipe(delay(120));
  }

  updateScene(projectId: string, scene: Scene): Observable<Scene> {
    const project = this.projects.projects().find((p) => p.id === projectId);
    if (project) {
      const updatedScenes = project.scenes.map((s) => (s.id === scene.id ? scene : s));
      this.projects.update(projectId, { scenes: updatedScenes });
    }
    return of(scene).pipe(delay(80));
  }

  updateObject(projectId: string, sceneId: string, object: SceneObject): Observable<Scene | undefined> {
    const project = this.projects.projects().find((p) => p.id === projectId);
    if (!project) return of(undefined);
    const scenes = project.scenes.map((s) => {
      if (s.id !== sceneId) return s;
      return {
        ...s,
        objects: s.objects.map((o) => (o.id === object.id ? object : o)),
      };
    });
    this.projects.update(projectId, { scenes });
    return of(scenes.find((s) => s.id === sceneId)).pipe(delay(80));
  }

  removeObject(projectId: string, sceneId: string, objectId: string): Observable<void> {
    const project = this.projects.projects().find((p) => p.id === projectId);
    if (!project) return of(undefined);
    const scenes = project.scenes.map((s) =>
      s.id === sceneId ? { ...s, objects: s.objects.filter((o) => o.id !== objectId) } : s,
    );
    this.projects.update(projectId, { scenes });
    return of(undefined).pipe(delay(60));
  }

  approve(projectId: string, sceneId: string): Observable<Scene | undefined> {
    const project = this.projects.projects().find((p) => p.id === projectId);
    if (!project) return of(undefined);
    const scenes = project.scenes.map((s) =>
      s.id === sceneId ? { ...s, review: { ...s.review, status: 'approved' as const } } : s,
    );
    this.projects.update(projectId, { scenes });
    return of(scenes.find((s) => s.id === sceneId)).pipe(delay(120));
  }

  remove(projectId: string, sceneId: string): Observable<Scene[]> {
    const project = this.projects.projects().find((p) => p.id === projectId);
    if (!project) return of([]);
    const scenes = project.scenes
      .filter((s) => s.id !== sceneId)
      .map((s, i) => ({ ...s, index: i }));
    this.projects.update(projectId, { scenes });
    return of(scenes).pipe(delay(80));
  }

  duplicate(projectId: string, sceneId: string): Observable<Scene | undefined> {
    const project = this.projects.projects().find((p) => p.id === projectId);
    if (!project) return of(undefined);
    const original = project.scenes.find((s) => s.id === sceneId);
    if (!original) return of(undefined);
    const copy: Scene = structuredClone(original);
    copy.id = `scene-${Date.now()}`;
    copy.title = `${original.title} (copy)`;
    copy.review = { status: 'draft', lockedAssets: [] };
    copy.objects = copy.objects.map((o) => ({ ...o, id: `${o.id}-copy-${Date.now()}` }));
    const idx = project.scenes.findIndex((s) => s.id === sceneId);
    const scenes = [...project.scenes];
    scenes.splice(idx + 1, 0, copy);
    const reIndexed = scenes.map((s, i) => ({ ...s, index: i }));
    this.projects.update(projectId, { scenes: reIndexed });
    return of(reIndexed.find((s) => s.id === copy.id)).pipe(delay(100));
  }

  move(projectId: string, sceneId: string, direction: -1 | 1): Observable<Scene[]> {
    const project = this.projects.projects().find((p) => p.id === projectId);
    if (!project) return of([]);
    const scenes = [...project.scenes];
    const idx = scenes.findIndex((s) => s.id === sceneId);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= scenes.length) return of(scenes);
    [scenes[idx], scenes[target]] = [scenes[target], scenes[idx]];
    const reIndexed = scenes.map((s, i) => ({ ...s, index: i }));
    this.projects.update(projectId, { scenes: reIndexed });
    return of(reIndexed).pipe(delay(60));
  }

  duplicateObject(projectId: string, sceneId: string, objectId: string): Observable<Scene | undefined> {
    const project = this.projects.projects().find((p) => p.id === projectId);
    if (!project) return of(undefined);
    const scenes = project.scenes.map((s) => {
      if (s.id !== sceneId) return s;
      const idx = s.objects.findIndex((o) => o.id === objectId);
      if (idx < 0) return s;
      const original = s.objects[idx];
      const copy: SceneObject = {
        ...original,
        id: `${original.id}-copy-${Date.now()}`,
        name: `${original.name} (copy)`,
        locked: false,
      };
      const objects = [...s.objects];
      objects.splice(idx + 1, 0, copy);
      return { ...s, objects };
    });
    this.projects.update(projectId, { scenes });
    return of(scenes.find((s) => s.id === sceneId)).pipe(delay(80));
  }
}
