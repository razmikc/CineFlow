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

export type MoodboardReferenceSource = 'ai_generated' | 'asset_library' | 'uploaded' | 'url';

export interface MoodboardReference {
  id: string;
  uri: string;
  thumbnail?: string;
  tag: string;
  prompt?: string;
  source: MoodboardReferenceSource;
  locked: boolean;
  createdAt: string;
}

export interface CreativeDirection {
  genre: string;
  mood: string[];
  styleReference: StyleReference;
  colorPalette: string[];
  fonts: FontSystem;
  negativeRules: string[];
  realismLevel: number; // 0..1
  references: MoodboardReference[];
  lighting: string;
  era: string;
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

export interface SceneKeyframe {
  mode: ObjectMode;
  description: string;
  assetId?: string;
  locked?: boolean;
  prompt?: string;
}

export interface FinalVideo {
  status: 'not_started' | 'queued' | 'rendering' | 'completed' | 'failed';
  progress: number;
  uri?: string;
  thumbnailUri?: string;
  durationSec?: number;
  renderedAt?: string;
  jobId?: string;
}

export interface StoryboardPanel {
  keyframeUri?: string;
  thumbnailUri?: string;
  action: string;
  beat: string;
  prompt?: string;
  provider?: string;
  model?: string;
  locked: boolean;
  regeneratedAt?: string;
  notes?: string;
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
  startFrame?: SceneKeyframe;
  endFrame?: SceneKeyframe;
  promptOverride?: string;
  storyboardPanel?: StoryboardPanel;
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

/* ===========================================================
 * Goal-specific configs — populated only when CreativeContract.goal
 * matches the relevant value. Other goals leave these undefined.
 * =========================================================== */

export type ShortCaptionStyle = 'bold' | 'karaoke' | 'animated' | 'minimal';
export type ShortEmojiDensity = 'none' | 'sparse' | 'medium' | 'heavy';
export type ShortCtaAction =
  | 'subscribe'
  | 'follow'
  | 'like'
  | 'comment'
  | 'visit_link'
  | 'custom';
export type ShortAudioSource = 'trending' | 'generated' | 'upload';

export interface ShortAudioChoice {
  source: ShortAudioSource;
  trackId?: string;
  title?: string;
  artist?: string;
  bpm?: number;
  beatDropMs?: number;
  durationSec?: number;
  trendScore?: number; // 0..100
  provider?: string;
  model?: string;
}

export interface ShortCta {
  copy: string;
  action: ShortCtaAction;
  loopBack: boolean;
  pinnedComment?: string;
  endCardPrompt?: string;
}

export interface ShortBeat {
  id: string;
  index: number;
  label: 'hook' | 'setup' | 'payoff' | 'cta' | string;
  durationSec: number;
  onScreenText: string;
  sceneId?: string;
}

export interface ShortVideoConfig {
  niche: string;
  hook: string;
  payoff: string;
  targetRetentionPct: number; // 0..100
  trendingAngle: string;
  audio: ShortAudioChoice;
  captionStyle: ShortCaptionStyle;
  textOverlayColor: string;
  emojiDensity: ShortEmojiDensity;
  beats: ShortBeat[];
  cta: ShortCta;
}

export type AdPlatform =
  | 'meta'
  | 'youtube'
  | 'tiktok'
  | 'snap'
  | 'pinterest'
  | 'ooh'
  | 'ott'
  | 'tv';
export type AdPlacement =
  | 'feed'
  | 'reels'
  | 'stories'
  | 'in_stream_skippable'
  | 'in_stream_non_skippable'
  | 'bumper'
  | 'cover'
  | 'native';
export type AdVoiceTone =
  | 'premium'
  | 'casual'
  | 'edgy'
  | 'friendly'
  | 'authoritative';
export type AdIndustry =
  | 'general'
  | 'health'
  | 'alcohol'
  | 'finance'
  | 'auto'
  | 'food'
  | 'fashion'
  | 'tech'
  | 'gaming'
  | 'travel'
  | 'kids';
export type AdBeatType = 'hook' | 'problem' | 'solution' | 'proof' | 'cta';
export type AdVariantAxis = 'hook' | 'cta' | 'visual';
export type AdCtaAction =
  | 'shop'
  | 'learn_more'
  | 'sign_up'
  | 'download'
  | 'call'
  | 'custom';

export interface AdBrand {
  name: string;
  tagline: string;
  logoAssetId?: string;
  voiceTone: AdVoiceTone;
  primaryColor: string;
  secondaryColor: string;
  guidelinesUrl?: string;
}

export interface AdProductOffer {
  productName: string;
  usp: string;
  primaryBenefit: string;
  supportingBenefits: string[];
  pricePoint?: string;
  promoCode?: string;
  urgency?: string;
}

export interface AdAudience {
  ageMin: number;
  ageMax: number;
  gender: 'all' | 'male' | 'female' | 'non_binary';
  regions: string[];
  interests: string[];
  psychographics: string;
}

export interface AdPlacementConfig {
  platforms: AdPlatform[];
  placements: AdPlacement[];
  lengthSec: number; // 6 | 15 | 30 | 60
}

export interface AdCompliance {
  industry: AdIndustry;
  disclaimers: string[];
  restrictedTerms: string[];
  brandSafeOnly: boolean;
}

export interface AdBeatEntry {
  id: string;
  type: AdBeatType;
  copy: string;
  durationSec: number;
  sceneId?: string;
}

export interface AdVariant {
  id: string;
  label: string;
  variesOn: AdVariantAxis;
  hookOverride?: string;
  ctaOverride?: string;
  visualNote?: string;
}

export interface AdCta {
  copy: string;
  action: AdCtaAction;
  targetUrl?: string;
}

export interface AdConfig {
  brand: AdBrand;
  product: AdProductOffer;
  audience: AdAudience;
  placement: AdPlacementConfig;
  compliance: AdCompliance;
  structure: AdBeatEntry[];
  variants: AdVariant[];
  primaryCta: AdCta;
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
  finalVideo?: FinalVideo;
  shortConfig?: ShortVideoConfig;
  adConfig?: AdConfig;
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

export type CameraAngle =
  | 'front'
  | 'three_quarter_left'
  | 'three_quarter_right'
  | 'profile_left'
  | 'profile_right'
  | 'back'
  | 'low_angle'
  | 'high_angle'
  | 'close_up';

export interface CharacterImage {
  id: string;
  characterId: string;
  uri: string;
  thumbnail?: string;
  prompt: string;
  provider: string;
  model: string;
  cameraAngle?: CameraAngle;
  status: 'generating' | 'ready' | 'failed';
  createdAt: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  role?: string;
  age?: string;
  gender?: string;
  description: string;
  personality?: string;
  wardrobe?: string;
  tags: string[];
  images: CharacterImage[];
  primaryImageId?: string;
  createdAt: string;
  updatedAt: string;
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
