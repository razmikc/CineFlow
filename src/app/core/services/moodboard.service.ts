import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of, switchMap } from 'rxjs';
import {
  CreativeContract,
  CreativeDirection,
  MoodboardReference,
  MoodboardReferenceSource,
} from '../models/contract.model';
import { ProjectsService } from './projects.service';

/**
 * Suggestion returned by the LLM/orchestrator for the project moodboard.
 * Mirrors the response body of:
 *   POST /api/v1/projects/{projectId}/moodboard/suggest
 */
export interface MoodboardSuggestion {
  references: MoodboardReference[];
  colorPalette: string[];
  fonts: { title: string; subtitle: string };
  mood: string[];
  lighting: string;
  era: string;
  rationale: string;
}

const MOODBOARD_POOL = [
  'https://images.unsplash.com/photo-1493804714600-6edb1cd93080?w=900',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=900',
  'https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=900',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900',
  'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=900',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=900',
  'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=900',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=900',
  'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=900',
];

const TAG_POOL = [
  'lighting',
  'palette',
  'wardrobe',
  'set design',
  'composition',
  'texture',
  'mood',
  'era',
  'character ref',
];

/**
 * MoodboardService — Angular signal-friendly facade over the project moodboard.
 *
 * Maps 1:1 to a future Spring REST controller. Each method documents the
 * intended endpoint, HTTP verb, request, and response so the client surface
 * stays stable once the mock implementation is swapped for {@code HttpClient}.
 *
 * Java equivalent (sketch):
 * <pre>
 *   {@literal @}RestController
 *   {@literal @}RequestMapping("/api/v1/projects/{projectId}/moodboard")
 *   public class MoodboardController {
 *     {@literal @}PostMapping("/suggest")     MoodboardSuggestion suggest(...);
 *     {@literal @}PutMapping("")              CreativeDirection update(...);
 *     {@literal @}PostMapping("/references")  MoodboardReference addReference(...);
 *     {@literal @}DeleteMapping("/references/{refId}") void removeReference(...);
 *     {@literal @}PatchMapping("/references/{refId}/lock") MoodboardReference toggleLock(...);
 *   }
 * </pre>
 */
@Injectable({ providedIn: 'root' })
export class MoodboardService {
  private readonly projects = inject(ProjectsService);

  /**
   * POST /api/v1/projects/{projectId}/moodboard/suggest
   * Request:  { regenerateLocked?: boolean }
   * Response: MoodboardSuggestion
   *
   * Uses the project's goal, description, genre and mood to derive a fresh
   * moodboard. Locked references are preserved when {@code regenerateLocked}
   * is false (the default).
   */
  suggest(projectId: string, opts: { regenerateLocked?: boolean } = {}): Observable<MoodboardSuggestion> {
    return this.projects.get(projectId).pipe(
      delay(700),
      map((project) => {
        if (!project) {
          throw new Error(`Project ${projectId} not found`);
        }
        return this.buildSuggestion(project, opts.regenerateLocked ?? false);
      }),
    );
  }

  /**
   * Apply a moodboard suggestion to the project's CreativeDirection.
   * PUT /api/v1/projects/{projectId}/moodboard
   * Request body: CreativeDirection
   */
  apply(projectId: string, suggestion: MoodboardSuggestion): Observable<CreativeDirection | undefined> {
    return this.projects.get(projectId).pipe(
      switchMap((project) => {
        if (!project) return of(undefined);
        const next: CreativeDirection = {
          ...project.creativeDirection,
          references: this.mergeReferences(project.creativeDirection.references, suggestion.references),
          colorPalette: project.creativeDirection.colorPalette.length > 0
            ? project.creativeDirection.colorPalette
            : suggestion.colorPalette,
          fonts:
            project.creativeDirection.fonts.title === 'Inter' &&
            project.creativeDirection.fonts.subtitle === 'Inter'
              ? suggestion.fonts
              : project.creativeDirection.fonts,
          mood: project.creativeDirection.mood.length > 0 ? project.creativeDirection.mood : suggestion.mood,
          lighting: project.creativeDirection.lighting || suggestion.lighting,
          era: project.creativeDirection.era || suggestion.era,
        };
        return this.update(projectId, next);
      }),
    );
  }

  /**
   * PUT /api/v1/projects/{projectId}/moodboard
   * Request body: CreativeDirection (entire object replaces existing)
   */
  update(projectId: string, direction: CreativeDirection): Observable<CreativeDirection | undefined> {
    return this.projects
      .update(projectId, { creativeDirection: direction })
      .pipe(map((p) => p?.creativeDirection));
  }

  /**
   * POST /api/v1/projects/{projectId}/moodboard/references
   * Request body: { uri, thumbnail?, tag, prompt?, source }
   * Response: MoodboardReference (with server-assigned id + createdAt)
   */
  addReference(
    projectId: string,
    input: {
      uri: string;
      thumbnail?: string;
      tag: string;
      prompt?: string;
      source: MoodboardReferenceSource;
    },
  ): Observable<MoodboardReference | undefined> {
    return this.projects.get(projectId).pipe(
      switchMap((project) => {
        if (!project) return of(undefined);
        const reference: MoodboardReference = {
          id: `mb-${Date.now()}`,
          uri: input.uri,
          thumbnail: input.thumbnail ?? input.uri,
          tag: input.tag,
          prompt: input.prompt,
          source: input.source,
          locked: false,
          createdAt: new Date().toISOString(),
        };
        const direction: CreativeDirection = {
          ...project.creativeDirection,
          references: [reference, ...project.creativeDirection.references],
        };
        return this.update(projectId, direction).pipe(
          delay(180),
          map(() => reference),
        );
      }),
    );
  }

  /**
   * DELETE /api/v1/projects/{projectId}/moodboard/references/{referenceId}
   */
  removeReference(projectId: string, referenceId: string): Observable<void> {
    return this.projects.get(projectId).pipe(
      switchMap((project) => {
        if (!project) return of(undefined);
        const direction: CreativeDirection = {
          ...project.creativeDirection,
          references: project.creativeDirection.references.filter((r) => r.id !== referenceId),
        };
        return this.update(projectId, direction);
      }),
      map(() => undefined),
    );
  }

  /**
   * PATCH /api/v1/projects/{projectId}/moodboard/references/{referenceId}/lock
   * Request body: { locked: boolean }
   */
  toggleLock(projectId: string, referenceId: string): Observable<MoodboardReference | undefined> {
    return this.projects.get(projectId).pipe(
      switchMap((project) => {
        if (!project) return of(undefined);
        const references = project.creativeDirection.references.map((r) =>
          r.id === referenceId ? { ...r, locked: !r.locked } : r,
        );
        const direction: CreativeDirection = { ...project.creativeDirection, references };
        return this.update(projectId, direction).pipe(
          map(() => references.find((r) => r.id === referenceId)),
        );
      }),
    );
  }

  private mergeReferences(
    existing: MoodboardReference[],
    incoming: MoodboardReference[],
  ): MoodboardReference[] {
    const keep = existing.filter((r) => r.locked);
    const keepUris = new Set(keep.map((r) => r.uri));
    const fresh = incoming.filter((r) => !keepUris.has(r.uri));
    return [...keep, ...fresh];
  }

  private buildSuggestion(project: CreativeContract, regenerateLocked: boolean): MoodboardSuggestion {
    const direction = project.creativeDirection;
    const lockedExisting = regenerateLocked ? [] : direction.references.filter((r) => r.locked);
    const lockedUris = new Set(lockedExisting.map((r) => r.uri));
    const refsNeeded = Math.max(6, 8 - lockedExisting.length);
    const pool = MOODBOARD_POOL.filter((u) => !lockedUris.has(u));
    const newRefs: MoodboardReference[] = pool.slice(0, refsNeeded).map((uri, i) => ({
      id: `mb-${Date.now()}-${i}`,
      uri,
      thumbnail: uri,
      tag: TAG_POOL[i % TAG_POOL.length],
      prompt: this.derivePrompt(project, TAG_POOL[i % TAG_POOL.length]),
      source: 'ai_generated',
      locked: false,
      createdAt: new Date().toISOString(),
    }));

    return {
      references: [...lockedExisting, ...newRefs],
      colorPalette: this.derivePalette(direction),
      fonts: this.deriveFonts(project),
      mood: direction.mood.length > 0 ? direction.mood : this.deriveMood(project),
      lighting: this.deriveLighting(project),
      era: this.deriveEra(project),
      rationale: this.deriveRationale(project),
    };
  }

  private derivePrompt(project: CreativeContract, tag: string): string {
    const direction = project.creativeDirection;
    const bits = [direction.genre || project.goal, direction.mood.join(', '), tag].filter(Boolean);
    return bits.join(' — ');
  }

  private derivePalette(direction: CreativeDirection): string[] {
    if (direction.colorPalette.length >= 4) return direction.colorPalette;
    return ['#0A1535', '#5B2BFF', '#FF4DAD', '#FFD166', '#06D6A0'];
  }

  private deriveFonts(project: CreativeContract): { title: string; subtitle: string } {
    switch (project.goal) {
      case 'cinematic_trailer':
        return { title: 'Space Grotesk', subtitle: 'Inter' };
      case 'music_video':
        return { title: 'Orbitron', subtitle: 'Rajdhani' };
      case 'children_story':
        return { title: 'Poppins', subtitle: 'Quicksand' };
      case 'documentary':
        return { title: 'Playfair Display', subtitle: 'Inter' };
      default:
        return { title: 'Inter', subtitle: 'Inter' };
    }
  }

  private deriveMood(project: CreativeContract): string[] {
    switch (project.goal) {
      case 'cinematic_trailer':
        return ['epic', 'cinematic', 'tense'];
      case 'music_video':
        return ['neon', 'energetic', 'dreamlike'];
      case 'children_story':
        return ['warm', 'whimsical', 'bright'];
      case 'documentary':
        return ['observational', 'grounded', 'reflective'];
      default:
        return ['cinematic', 'atmospheric'];
    }
  }

  private deriveLighting(project: CreativeContract): string {
    switch (project.goal) {
      case 'cinematic_trailer':
        return 'low-key cinematic, hard rim, golden hour bursts';
      case 'music_video':
        return 'neon practicals, hard shadows, color gels';
      case 'children_story':
        return 'soft daylight, gentle warm fill';
      default:
        return 'naturalistic, motivated sources';
    }
  }

  private deriveEra(project: CreativeContract): string {
    return project.creativeDirection.era || 'present day';
  }

  private deriveRationale(project: CreativeContract): string {
    return `Based on the ${project.goal.replace('_', ' ')} goal and mood "${(project.creativeDirection.mood[0] ?? 'cinematic')}".`;
  }
}
