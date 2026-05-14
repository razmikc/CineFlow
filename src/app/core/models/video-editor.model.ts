/**
 * Types backing the multi-track AI-aware video editor.
 *
 * Mirrors a future Spring REST contract — every collection here maps to a
 * persisted entity that the backend owns. Frontend uses a mock service today
 * so the UI can ship before the orchestrator does.
 */

export type TrackKind = 'video' | 'audio' | 'sfx';

export type ClipStatus =
  | 'idle'
  | 'ai_queued'
  | 'ai_processing'
  | 'ready'
  | 'failed';

export type AIOpKind =
  | 'extend'
  | 'shorten'
  | 'remove_object'
  | 'replace_object'
  | 'inpaint';

export type AIOpStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AIOp {
  id: string;
  kind: AIOpKind;
  status: AIOpStatus;
  /** Free-form prompt — used by remove/replace/inpaint. */
  prompt?: string;
  /** Optional: name of the object to remove or replace. */
  targetObject?: string;
  /** Optional: prompt describing the replacement object. */
  replacementPrompt?: string;
  /** Optional: requested duration delta in seconds (extend = +, shorten = -). */
  durationDeltaSec?: number;
  /** Server-assigned job id once dispatched. */
  jobId?: string;
  createdAt: string;
  completedAt?: string;
  /** Optional textual result / error message. */
  message?: string;
}

export interface TimelineClip {
  id: string;
  trackId: string;
  kind: TrackKind;
  /** Display name. */
  name: string;
  /** Position on the timeline, in seconds, from the start. */
  startSec: number;
  /** Rendered duration on the timeline — may differ from source. */
  durationSec: number;
  /** Original source duration (the underlying asset). */
  sourceDurationSec: number;
  /** Trim into the source (defaults to 0). */
  sourceInSec: number;
  /** URL to play (videos / audio). May be a stand-in for now. */
  sourceUri?: string;
  /** Optional thumbnail / poster URL. */
  thumbnailUrl?: string;
  /** Background color when there's no thumbnail. */
  accentColor?: string;
  /** AI ops applied or in-flight against this clip. */
  aiOps: AIOp[];
  /** Surface status — derived from latest AI op or 'idle'. */
  status: ClipStatus;
}

export interface Track {
  id: string;
  kind: TrackKind;
  label: string;
  /** UI: track row height in px. */
  heightPx: number;
  /** UI: whether the track is muted in preview. */
  muted: boolean;
  /** UI: locked tracks don't accept drags / resizes. */
  locked: boolean;
  clips: TimelineClip[];
}

export interface Timeline {
  id: string;
  projectName: string;
  fps: number;
  /** End of the project — derived from the rightmost clip end. */
  durationSec: number;
  tracks: Track[];
}

/** Asset bin entry the user can drag into the timeline. */
export interface EditorAsset {
  id: string;
  name: string;
  kind: TrackKind;
  durationSec: number;
  sourceUri?: string;
  thumbnailUrl?: string;
  accentColor?: string;
}
