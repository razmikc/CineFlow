import { Injectable, signal } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import {
  AIOp,
  AIOpKind,
  EditorAsset,
  TimelineClip,
  Timeline,
  Track,
  TrackKind,
} from '../models/video-editor.model';
import { SAMPLE_VIDEO_POOL } from './sample-videos';

const SEED_TIMELINE_ID = 'tl-mock-001';
const STORAGE_KEY = 'cineflow.video-editor.timeline';

/**
 * Mock client for the future video-editor backend.
 *
 * <pre>
 *   {@literal @}RestController
 *   {@literal @}RequestMapping("/api/v1/editor/timelines")
 *   public class VideoEditorController {
 *     {@literal @}GetMapping("/{id}")            Timeline get(...);
 *     {@literal @}PutMapping("/{id}")            Timeline save(...);
 *     {@literal @}PostMapping("/{id}/clips")     TimelineClip addClip(...);
 *     {@literal @}DeleteMapping("/{id}/clips/{clipId}") void removeClip(...);
 *     {@literal @}PatchMapping("/{id}/clips/{clipId}")  TimelineClip updateClip(...);
 *     {@literal @}PostMapping("/{id}/clips/{clipId}/ai/extend")          AIOp extend(...);
 *     {@literal @}PostMapping("/{id}/clips/{clipId}/ai/shorten")         AIOp shorten(...);
 *     {@literal @}PostMapping("/{id}/clips/{clipId}/ai/remove-object")   AIOp removeObject(...);
 *     {@literal @}PostMapping("/{id}/clips/{clipId}/ai/replace-object")  AIOp replaceObject(...);
 *   }
 * </pre>
 */
@Injectable({ providedIn: 'root' })
export class VideoEditorService {
  /** Reactive timeline state — components read via signal(). */
  readonly timeline = signal<Timeline>(this.loadOrSeed());

  /** Static asset bin — would be a server query in real life. */
  readonly assets = signal<EditorAsset[]>(this.seedAssets());

  constructor() {
    // Persist the sanitized state so any localStorage migration sticks
    // (e.g. "Video 1 / Video 2" rewrites to a single "Video").
    this.persist();
  }

  /** GET /api/v1/editor/timelines/{id} */
  load(): Observable<Timeline> {
    return of(this.timeline()).pipe(delay(120));
  }

  /** PUT /api/v1/editor/timelines/{id} */
  save(): Observable<Timeline> {
    this.persist();
    return of(this.timeline()).pipe(delay(120));
  }

  /** POST /api/v1/editor/timelines/{id}/clips */
  addClip(trackId: string, asset: EditorAsset, startSec: number): Observable<TimelineClip> {
    const clip: TimelineClip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      trackId,
      kind: asset.kind,
      name: asset.name,
      startSec: Math.max(0, startSec),
      durationSec: asset.durationSec,
      sourceDurationSec: asset.durationSec,
      sourceInSec: 0,
      sourceUri: asset.sourceUri,
      thumbnailUrl: asset.thumbnailUrl,
      accentColor: asset.accentColor,
      aiOps: [],
      status: 'ready',
    };
    this.mutate((t) => ({
      ...t,
      tracks: t.tracks.map((tr) =>
        tr.id === trackId ? { ...tr, clips: [...tr.clips, clip] } : tr,
      ),
    }));
    return of(clip).pipe(delay(100));
  }

  /** DELETE /api/v1/editor/timelines/{id}/clips/{clipId} */
  removeClip(clipId: string): Observable<void> {
    this.mutate((t) => ({
      ...t,
      tracks: t.tracks.map((tr) => ({ ...tr, clips: tr.clips.filter((c) => c.id !== clipId) })),
    }));
    return of(void 0).pipe(delay(60));
  }

  /** PATCH /api/v1/editor/timelines/{id}/clips/{clipId} */
  updateClip(clipId: string, patch: Partial<TimelineClip>): Observable<TimelineClip | undefined> {
    let updated: TimelineClip | undefined;
    this.mutate((t) => ({
      ...t,
      tracks: t.tracks.map((tr) => ({
        ...tr,
        clips: tr.clips.map((c) => {
          if (c.id !== clipId) return c;
          updated = { ...c, ...patch };
          return updated;
        }),
      })),
    }));
    return of(updated).pipe(delay(40));
  }

  /** Move clip to a different track (preserving startSec). */
  moveClipToTrack(clipId: string, newTrackId: string): Observable<TimelineClip | undefined> {
    let moved: TimelineClip | undefined;
    this.mutate((t) => {
      const sourceTrack = t.tracks.find((tr) => tr.clips.some((c) => c.id === clipId));
      const targetTrack = t.tracks.find((tr) => tr.id === newTrackId);
      if (!sourceTrack || !targetTrack || sourceTrack.id === targetTrack.id) return t;
      if (sourceTrack.kind !== targetTrack.kind) return t;
      const clip = sourceTrack.clips.find((c) => c.id === clipId)!;
      moved = { ...clip, trackId: newTrackId };
      return {
        ...t,
        tracks: t.tracks.map((tr) => {
          if (tr.id === sourceTrack.id) return { ...tr, clips: tr.clips.filter((c) => c.id !== clipId) };
          if (tr.id === targetTrack.id) return { ...tr, clips: [...tr.clips, moved!] };
          return tr;
        }),
      };
    });
    return of(moved).pipe(delay(40));
  }

  /**
   * POST /api/v1/editor/timelines/{id}/clips/{clipId}/ai/extend
   * Generate a longer cut by `deltaSec`.
   */
  aiExtend(clipId: string, targetDurationSec: number): Observable<AIOp> {
    const clip = this.findClip(clipId);
    if (!clip) return of(this.failOp('extend', 'clip not found'));
    const op = this.queueOp(clipId, {
      kind: 'extend',
      durationDeltaSec: targetDurationSec - clip.durationSec,
    });
    this.simulateAiCompletion(clipId, op, () => {
      this.updateClipSync(clipId, {
        durationSec: targetDurationSec,
        sourceDurationSec: Math.max(clip.sourceDurationSec, targetDurationSec),
      });
    });
    return of(op).pipe(delay(80));
  }

  /** POST /api/v1/editor/timelines/{id}/clips/{clipId}/ai/shorten */
  aiShorten(clipId: string, targetDurationSec: number): Observable<AIOp> {
    const clip = this.findClip(clipId);
    if (!clip) return of(this.failOp('shorten', 'clip not found'));
    const op = this.queueOp(clipId, {
      kind: 'shorten',
      durationDeltaSec: targetDurationSec - clip.durationSec,
    });
    this.simulateAiCompletion(clipId, op, () => {
      this.updateClipSync(clipId, { durationSec: Math.max(0.5, targetDurationSec) });
    });
    return of(op).pipe(delay(80));
  }

  /** POST /api/v1/editor/timelines/{id}/clips/{clipId}/ai/remove-object */
  aiRemoveObject(clipId: string, targetObject: string): Observable<AIOp> {
    const op = this.queueOp(clipId, { kind: 'remove_object', targetObject });
    this.simulateAiCompletion(clipId, op);
    return of(op).pipe(delay(80));
  }

  /** POST /api/v1/editor/timelines/{id}/clips/{clipId}/ai/replace-object */
  aiReplaceObject(clipId: string, targetObject: string, replacementPrompt: string): Observable<AIOp> {
    const op = this.queueOp(clipId, {
      kind: 'replace_object',
      targetObject,
      replacementPrompt,
    });
    this.simulateAiCompletion(clipId, op);
    return of(op).pipe(delay(80));
  }

  /**
   * POST /api/v1/editor/timelines/{id}/tracks
   * Editor convention: exactly one video track is allowed — extra video
   * tracks are silently rejected (returns the existing video track).
   */
  addTrack(kind: TrackKind): Observable<Track> {
    const sameKindCount = this.timeline().tracks.filter((t) => t.kind === kind).length;
    if (kind === 'video' && sameKindCount >= 1) {
      const existing = this.timeline().tracks.find((t) => t.kind === 'video')!;
      return of(existing).pipe(delay(40));
    }
    const id = `tr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const track: Track = {
      id,
      kind,
      label: this.defaultTrackLabel(kind, sameKindCount + 1),
      heightPx: kind === 'video' ? 64 : 48,
      muted: false,
      locked: false,
      clips: [],
    };
    this.mutate((t) => ({ ...t, tracks: [...t.tracks, track] }));
    return of(track).pipe(delay(40));
  }

  /** DELETE /api/v1/editor/timelines/{id}/tracks/{trackId} */
  removeTrack(trackId: string): Observable<void> {
    this.mutate((t) => ({ ...t, tracks: t.tracks.filter((tr) => tr.id !== trackId) }));
    return of(void 0).pipe(delay(40));
  }

  toggleMute(trackId: string) {
    this.mutate((t) => ({
      ...t,
      tracks: t.tracks.map((tr) => (tr.id === trackId ? { ...tr, muted: !tr.muted } : tr)),
    }));
  }

  toggleLock(trackId: string) {
    this.mutate((t) => ({
      ...t,
      tracks: t.tracks.map((tr) => (tr.id === trackId ? { ...tr, locked: !tr.locked } : tr)),
    }));
  }

  resetToSeed() {
    const fresh = this.seedTimeline();
    this.timeline.set(fresh);
    this.persist();
  }

  // ---------- internals ----------

  private findClip(clipId: string): TimelineClip | undefined {
    for (const tr of this.timeline().tracks) {
      const found = tr.clips.find((c) => c.id === clipId);
      if (found) return found;
    }
    return undefined;
  }

  private queueOp(clipId: string, partial: Pick<AIOp, 'kind'> & Partial<AIOp>): AIOp {
    const op: AIOp = {
      id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      jobId: `job-${Date.now()}`,
      status: 'processing',
      createdAt: new Date().toISOString(),
      ...partial,
    };
    this.mutate((t) => ({
      ...t,
      tracks: t.tracks.map((tr) => ({
        ...tr,
        clips: tr.clips.map((c) =>
          c.id === clipId
            ? { ...c, aiOps: [...c.aiOps, op], status: 'ai_processing' }
            : c,
        ),
      })),
    }));
    return op;
  }

  private simulateAiCompletion(clipId: string, op: AIOp, mutator?: () => void) {
    const delayMs = 900 + Math.random() * 1100;
    setTimeout(() => {
      mutator?.();
      this.mutate((t) => ({
        ...t,
        tracks: t.tracks.map((tr) => ({
          ...tr,
          clips: tr.clips.map((c) => {
            if (c.id !== clipId) return c;
            const aiOps = c.aiOps.map((o) =>
              o.id === op.id
                ? { ...o, status: 'completed' as const, completedAt: new Date().toISOString() }
                : o,
            );
            const stillPending = aiOps.some(
              (o) => o.status === 'pending' || o.status === 'processing',
            );
            return {
              ...c,
              aiOps,
              status: stillPending ? 'ai_processing' : 'ready',
            };
          }),
        })),
      }));
    }, delayMs);
  }

  private failOp(kind: AIOpKind, message: string): AIOp {
    return {
      id: `op-${Date.now()}-fail`,
      kind,
      status: 'failed',
      createdAt: new Date().toISOString(),
      message,
    };
  }

  private updateClipSync(clipId: string, patch: Partial<TimelineClip>) {
    this.mutate((t) => ({
      ...t,
      tracks: t.tracks.map((tr) => ({
        ...tr,
        clips: tr.clips.map((c) => (c.id === clipId ? { ...c, ...patch } : c)),
      })),
    }));
  }

  private mutate(reducer: (t: Timeline) => Timeline) {
    const next = reducer(this.timeline());
    this.timeline.set({ ...next, durationSec: this.calcDuration(next) });
    this.persist();
  }

  private calcDuration(t: Timeline): number {
    let max = 0;
    for (const tr of t.tracks) {
      for (const c of tr.clips) {
        max = Math.max(max, c.startSec + c.durationSec);
      }
    }
    return Math.max(10, max);
  }

  private persist() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.timeline()));
    } catch {
      /* quota / private mode — ignore */
    }
  }

  private loadOrSeed(): Timeline {
    if (typeof localStorage === 'undefined') return this.seedTimeline();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return this.sanitize(JSON.parse(raw) as Timeline);
    } catch {
      /* corrupt blob — fall through */
    }
    return this.seedTimeline();
  }

  /**
   * Bring a persisted timeline up to the current invariants:
   *   1. Exactly one video track — extras merge their clips into the first.
   *   2. The single video track is always labelled "Video".
   */
  private sanitize(t: Timeline): Timeline {
    if (!t || !Array.isArray(t.tracks)) return this.seedTimeline();
    const videoTracks = t.tracks.filter((tr) => tr.kind === 'video');
    if (videoTracks.length === 0) return t;
    const [primary, ...extras] = videoTracks;
    const mergedClips = [
      ...primary.clips,
      ...extras.flatMap((tr) => tr.clips.map((c) => ({ ...c, trackId: primary.id }))),
    ];
    const tracks = t.tracks
      .filter((tr) => tr.kind !== 'video' || tr.id === primary.id)
      .map((tr) => (tr.id === primary.id ? { ...tr, label: 'Video', clips: mergedClips } : tr));
    return { ...t, tracks };
  }

  private defaultTrackLabel(kind: TrackKind, index: number): string {
    switch (kind) {
      case 'video':
        // Only one video track is ever allowed — never number it.
        return 'Video';
      case 'audio':
        return `Audio ${index}`;
      case 'sfx':
        return `SFX ${index}`;
    }
  }

  private seedTimeline(): Timeline {
    const tracks: Track[] = [
      { id: 'tr-v1', kind: 'video', label: 'Video', heightPx: 64, muted: false, locked: false, clips: [] },
      { id: 'tr-a1', kind: 'audio', label: 'Music',   heightPx: 48, muted: false, locked: false, clips: [] },
      { id: 'tr-s1', kind: 'sfx',   label: 'SFX',     heightPx: 44, muted: false, locked: false, clips: [] },
    ];
    return {
      id: SEED_TIMELINE_ID,
      projectName: 'Untitled edit',
      fps: 30,
      durationSec: 30,
      tracks,
    };
  }

  private seedAssets(): EditorAsset[] {
    return [
      {
        id: 'asset-vid-1',
        name: 'Big Buck Bunny',
        kind: 'video',
        durationSec: 10,
        sourceUri: SAMPLE_VIDEO_POOL[0],
        accentColor: 'linear-gradient(135deg,#5b2bff,#22d3ee)',
      },
      {
        id: 'asset-vid-2',
        name: 'Sintel',
        kind: 'video',
        durationSec: 10,
        sourceUri: SAMPLE_VIDEO_POOL[1],
        accentColor: 'linear-gradient(135deg,#ff4dad,#fbbf24)',
      },
      {
        id: 'asset-vid-3',
        name: 'Jellyfish',
        kind: 'video',
        durationSec: 10,
        sourceUri: SAMPLE_VIDEO_POOL[2],
        accentColor: 'linear-gradient(135deg,#06d6a0,#22d3ee)',
      },
      {
        id: 'asset-aud-1',
        name: 'Drive · 110 BPM',
        kind: 'audio',
        durationSec: 18,
        accentColor: 'linear-gradient(135deg,#fbbf24,#ff4dad)',
      },
      {
        id: 'asset-aud-2',
        name: 'Ambient pad',
        kind: 'audio',
        durationSec: 24,
        accentColor: 'linear-gradient(135deg,#22d3ee,#5b2bff)',
      },
      {
        id: 'asset-sfx-1',
        name: 'Whoosh',
        kind: 'sfx',
        durationSec: 1.2,
        accentColor: 'linear-gradient(135deg,#ff4dad,#5b2bff)',
      },
      {
        id: 'asset-sfx-2',
        name: 'Impact',
        kind: 'sfx',
        durationSec: 0.8,
        accentColor: 'linear-gradient(135deg,#fbbf24,#ff4dad)',
      },
      {
        id: 'asset-sfx-3',
        name: 'Riser',
        kind: 'sfx',
        durationSec: 2,
        accentColor: 'linear-gradient(135deg,#5b2bff,#fbbf24)',
      },
    ];
  }
}
