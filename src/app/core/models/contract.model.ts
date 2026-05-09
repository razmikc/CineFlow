export type ProjectGoal =
  | 'ad'
  | 'music_video'
  | 'children_story'
  | 'cinematic_trailer'
  | 'explainer'
  | 'product_demo'
  | 'youtube_short'
  | 'educational'
  | 'documentary';

export type OrchestrationMode = 'scene_by_scene' | 'full_auto' | 'hybrid';
export type ApprovalPolicy = 'approve_each_scene' | 'approve_at_end' | 'auto';
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '21:9';
export type Resolution = '720p' | '1080p' | '2k' | '4k';
export type SceneStatus =
  | 'draft'
  | 'prepared'
  | 'waiting_for_user'
  | 'generating'
  | 'failed'
  | 'completed'
  | 'approved';

export type AssetType = 'image' | 'video' | 'audio' | 'voice' | 'music' | 'font' | 'logo';
export type AssetSource = 'generated' | 'uploaded' | 'library' | 'ai_pending';

export type ObjectMode = 'generate' | 'asset' | 'manual';

export interface ModelChoice {
  provider: string;
  model: string;
  version?: string;
}

export interface ModelsConfig {
  script: ModelChoice;
  image: ModelChoice;
  video: ModelChoice;
  voice: ModelChoice;
  music: ModelChoice;
}

export interface ProjectOutput {
  aspectRatio: AspectRatio;
  resolution: Resolution;
  fps: number;
  targetDurationSec: number;
  language: string;
}

export interface CostPolicy {
  estimateBeforeGenerate: boolean;
  maxCreditsPerScene: number;
}

export interface VersioningPolicy {
  keepSceneVersions: boolean;
  keepPromptVersions: boolean;
}

export interface OrchestrationConfig {
  mode: OrchestrationMode;
  approvalPolicy: ApprovalPolicy;
  costPolicy: CostPolicy;
  versioning: VersioningPolicy;
}

export interface StyleReference {
  source: 'url' | 'preset' | 'uploaded-image' | 'manual';
  value: string;
}

export interface FontSystem {
  title: string;
  subtitle: string;
  body?: string;
}

export interface CreativeDirection {
  genre: string;
  mood: string[];
  styleReference: StyleReference;
  colorPalette: string[];
  fonts: FontSystem;
  negativeRules: string[];
  realismLevel: number; // 0..1
}

export interface CharacterVoice {
  mode: ObjectMode;
  provider: string;
  voiceId?: string;
  accent: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  referenceImages: string[];
  wardrobe: string;
  voice: CharacterVoice;
  emotionProfile: string;
  movementStyle: string;
  continuityLock: boolean;
}

export interface CameraConfig {
  shotType: string;
  movement: string;
  lens: string;
}

export interface SceneCharacterUsage {
  ref: string;
  emotion: string;
  action: string;
}

export interface SceneObject {
  id: string;
  type: 'character' | 'prop' | 'background' | 'effect' | 'subtitle' | 'music' | 'sfx' | 'voice';
  name: string;
  description?: string;
  prompt?: string;
  assetId?: string;
  status: 'pending' | 'ready' | 'generating' | 'failed' | 'locked';
  locked: boolean;
  metadata?: Record<string, unknown>;
}

export interface SceneAudio {
  backgroundMusic: {
    mode: ObjectMode;
    genre: string;
    tempo: string;
    assetId?: string;
  };
  soundEffects: string[];
}

export interface Subtitles {
  enabled: boolean;
  style: string;
}

export interface Transition {
  type: 'cut' | 'fade' | 'dissolve' | 'wipe' | 'zoom' | 'morph';
  durationMs: number;
}

export interface Continuity {
  usePreviousFinalFrame: boolean;
  exportFinalFrameForNextScene: boolean;
}

export interface SceneNarration {
  text: string;
  voiceRef: string;
}

export interface SceneBackground {
  mode: ObjectMode;
  description: string;
  assetId?: string;
}

export interface SceneReview {
  status: SceneStatus;
  lockedAssets: string[];
  comments?: string[];
}

export interface Scene {
  id: string;
  index: number;
  title: string;
  objective: string;
  durationSec: number;
  generationMode: 'prepare_then_generate' | 'auto';
  background: SceneBackground;
  camera: CameraConfig;
  characters: SceneCharacterUsage[];
  objects: SceneObject[];
  narration: SceneNarration;
  audio: SceneAudio;
  subtitles: Subtitles;
  transitionOut: Transition;
  continuity: Continuity;
  review: SceneReview;
  costEstimate?: number;
  thumbnailUrl?: string;
}

export interface Asset {
  id: string;
  projectId?: string;
  type: AssetType;
  name: string;
  source: AssetSource;
  uri: string;
  thumbnail?: string;
  provider?: string;
  model?: string;
  prompt?: string;
  durationSec?: number;
  tags: string[];
  createdAt: string;
}

export interface CreativeContract {
  id: string;
  title: string;
  goal: ProjectGoal;
  description: string;
  output: ProjectOutput;
  orchestration: OrchestrationConfig;
  models: ModelsConfig;
  creativeDirection: CreativeDirection;
  characters: Character[];
  scenes: Scene[];
  status: 'draft' | 'in_progress' | 'review' | 'completed';
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
}

export interface GenerationJob {
  id: string;
  projectId: string;
  sceneId?: string;
  objectId?: string;
  provider: string;
  model: string;
  status: 'queued' | 'running' | 'failed' | 'completed';
  costEstimate: number;
  costActual?: number;
  startedAt?: string;
  completedAt?: string;
  outputAssetIds: string[];
  error?: string;
  progress: number;
}

export interface SceneVersion {
  id: string;
  sceneId: string;
  versionNumber: number;
  thumbnailUri: string;
  userComment: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  cost: number;
  createdAt: string;
}

export interface AiModel {
  id: string;
  provider: string;
  name: string;
  version: string;
  capability:
    | 'text_to_video'
    | 'image_to_video'
    | 'text_to_image'
    | 'voice_clone'
    | 'audio_generation'
    | 'subtitles'
    | 'upscale'
    | 'interpolate'
    | 'inpaint'
    | 'remove_object'
    | 'script_generation'
    | 'music_generation';
  costPerUnit: number;
  unit: string;
  speed: 'fast' | 'balanced' | 'high_quality';
  maxDuration?: number;
  supportsStartEndFrame?: boolean;
  supportsCharacterReference?: boolean;
  description: string;
}
