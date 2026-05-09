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
}
