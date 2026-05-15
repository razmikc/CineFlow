/**
 * Prompt-enhancer keyword catalogs. Mirrored from the reference prompt-editor
 * HTML so the picker chips in the One-shot Image and One-shot Video tools
 * stay in sync with the original design.
 *
 * Two top-level catalogs (`image`, `video`); each is a flat list of sections,
 * every section has an emoji + hint + chip list.
 */

export interface KeywordSection {
  key: string;
  emoji: string;
  hint: string;
  chips: string[];
}

export type PromptMode = 'image' | 'video' | 'audio';

export const IMAGE_KEYWORD_SECTIONS: KeywordSection[] = [
  {
    key: 'Subject',
    emoji: '👤',
    hint: 'main thing in the image',
    chips: ['portrait', 'character', 'creature', 'still life', 'figure', 'animal', 'vehicle', 'building', 'object', 'crowd'],
  },
  {
    key: 'Environment',
    emoji: '🌍',
    hint: 'where it is, the setting',
    chips: ['forest', 'desert', 'mountain', 'beach', 'city street', 'interior', 'underwater', 'space', 'meadow', 'cave', 'rooftop', 'garden'],
  },
  {
    key: 'Background',
    emoji: '🪟',
    hint: "what's behind the subject",
    chips: ['blurred', 'out of focus', 'solid color', 'gradient', 'bokeh', 'negative space', 'minimal', 'complex scene', 'clean', 'abstract pattern'],
  },
  {
    key: 'Composition',
    emoji: '🎯',
    hint: 'framing, arrangement, rule of thirds',
    chips: ['rule of thirds', 'centered', 'close-up', 'wide shot', 'medium shot', 'symmetrical', 'asymmetric', 'leading lines', 'overhead', 'from behind', 'side profile', 'low perspective'],
  },
  {
    key: 'Style',
    emoji: '🎨',
    hint: 'art style or aesthetic',
    chips: ['cinematic', 'photorealistic', 'impressionist', 'art nouveau', 'baroque', 'minimalist', 'brutalist', 'retro', 'vaporwave', 'watercolor', 'oil painting', 'pixel art'],
  },
  {
    key: 'Medium',
    emoji: '🖼️',
    hint: 'oil paint, 3d render, photo, ink…',
    chips: ['oil painting', 'watercolor', 'acrylic', 'pencil sketch', 'ink drawing', 'digital art', '3d render', 'photograph', 'charcoal', 'gouache', 'vector', 'collage'],
  },
  {
    key: 'Camera',
    emoji: '📷',
    hint: 'lens, angle, framing',
    chips: ['35mm', '50mm', '85mm', 'wide angle', 'macro', 'telephoto', 'dutch angle', 'low angle', 'top down', 'dolly zoom', 'bokeh', 'f/1.4'],
  },
  {
    key: 'Lighting',
    emoji: '💡',
    hint: 'mood and direction of light',
    chips: ['golden hour', 'blue hour', 'overcast', 'rim light', 'backlit', 'soft box', 'volumetric', 'chiaroscuro', 'neon', 'candlelight', 'moonlit', 'rembrandt'],
  },
  {
    key: 'Color',
    emoji: '🌈',
    hint: 'palette, dominant hues',
    chips: ['warm palette', 'cool palette', 'monochrome', 'muted', 'vibrant', 'pastel', 'high contrast', 'desaturated', 'complementary', 'analogous', 'sepia', 'black and white'],
  },
  {
    key: 'Mood',
    emoji: '💗',
    hint: 'feeling and atmosphere',
    chips: ['serene', 'melancholic', 'dramatic', 'dreamy', 'tense', 'playful', 'solemn', 'ethereal', 'gritty', 'romantic', 'eerie', 'epic'],
  },
  {
    key: 'Time of Day',
    emoji: '🌅',
    hint: 'morning, golden hour, midnight…',
    chips: ['dawn', 'sunrise', 'morning', 'midday', 'afternoon', 'golden hour', 'sunset', 'dusk', 'twilight', 'night', 'midnight'],
  },
  {
    key: 'Weather',
    emoji: '🌦️',
    hint: 'sunny, rain, fog, snow…',
    chips: ['sunny', 'cloudy', 'overcast', 'foggy', 'misty', 'rainy', 'stormy', 'snowy', 'windy', 'clear sky', 'hazy'],
  },
  {
    key: 'Era',
    emoji: '🕰️',
    hint: 'time period or decade',
    chips: ['medieval', 'renaissance', 'victorian', '1920s', '1950s', '1970s', '1980s', 'art deco', 'futuristic', 'ancient', 'modern', 'prehistoric'],
  },
  {
    key: 'Pose',
    emoji: '🚶',
    hint: 'body posture or stance',
    chips: ['standing', 'sitting', 'walking', 'running', 'jumping', 'crouching', 'reclining', 'dynamic', 'contrapposto', 'heroic', 'candid', 'profile'],
  },
  {
    key: 'Outfit',
    emoji: '👗',
    hint: 'clothing and accessories',
    chips: ['casual', 'formal', 'vintage', 'futuristic', 'traditional', 'streetwear', 'elegant', 'rugged', 'military', 'bohemian', 'minimalist', 'ornate'],
  },
  {
    key: 'Expression',
    emoji: '😊',
    hint: 'facial expression',
    chips: ['smiling', 'laughing', 'serious', 'contemplative', 'surprised', 'melancholic', 'confident', 'peaceful', 'intense', 'curious', 'neutral', 'joyful'],
  },
  {
    key: 'Details',
    emoji: '✦',
    hint: 'fine specifics',
    chips: ['intricate', 'minimalist', 'ornate', 'weathered', 'pristine', 'textured', 'smooth', 'rough', 'delicate', 'elaborate', 'subtle', 'refined'],
  },
  {
    key: 'Format',
    emoji: '📐',
    hint: 'aspect ratio',
    chips: ['square 1:1', 'landscape 16:9', 'vertical 9:16', 'portrait 4:5', 'cinematic 21:9', 'wide 2:1'],
  },
  {
    key: 'Quality',
    emoji: '✨',
    hint: 'render quality modifiers',
    chips: ['8k', 'hyperreal', 'sharp focus', 'highly detailed', 'masterpiece', 'award-winning', 'trending on artstation', 'depth of field'],
  },
  {
    key: 'Negative',
    emoji: '⊘',
    hint: 'what to avoid',
    chips: ['blurry', 'low quality', 'watermark', 'text', 'extra fingers', 'deformed', 'jpeg artifacts', 'oversaturated', 'cartoon (if photo)', 'duplicate'],
  },
];

export const VIDEO_KEYWORD_SECTIONS: KeywordSection[] = [
  {
    key: 'Subject',
    emoji: '👤',
    hint: 'main thing in the shot',
    chips: ['person', 'character', 'crowd', 'animal', 'vehicle', 'product', 'landscape', 'abstract'],
  },
  {
    key: 'Environment',
    emoji: '🌍',
    hint: 'where it is, the setting',
    chips: ['forest', 'desert', 'mountain', 'beach', 'city street', 'interior', 'rooftop', 'underwater', 'studio', 'warehouse', 'field'],
  },
  {
    key: 'Composition',
    emoji: '🎯',
    hint: 'framing, perspective, rule of thirds',
    chips: ['close-up', 'medium shot', 'wide shot', 'extreme close-up', 'over the shoulder', 'two-shot', 'establishing shot', 'vertical-safe framing'],
  },
  {
    key: 'Style',
    emoji: '🎨',
    hint: 'visual style or genre',
    chips: ['cinematic', 'documentary', 'commercial', 'music video', 'social-ready', 'vlog', 'film noir', 'anime', 'vaporwave', 'retro film'],
  },
  {
    key: 'Camera',
    emoji: '📷',
    hint: 'lens choice, angle',
    chips: ['35mm', '50mm', '85mm', 'wide angle', 'anamorphic', 'macro', 'dutch angle', 'low angle', 'overhead', 'POV'],
  },
  {
    key: 'Lighting',
    emoji: '💡',
    hint: 'direction and mood of light',
    chips: ['golden hour', 'blue hour', 'overcast', 'rim light', 'backlit', 'soft box', 'volumetric', 'neon', 'practical lights', 'natural'],
  },
  {
    key: 'Color',
    emoji: '🌈',
    hint: 'palette, color grade',
    chips: ['warm palette', 'cool palette', 'teal and orange', 'desaturated', 'vibrant', 'monochrome', 'high contrast', 'pastel', 'filmic grade'],
  },
  {
    key: 'Mood',
    emoji: '💗',
    hint: 'feeling and atmosphere',
    chips: ['serene', 'dramatic', 'energetic', 'playful', 'tense', 'dreamy', 'epic', 'melancholic', 'romantic', 'intense'],
  },
  {
    key: 'Time of Day',
    emoji: '🌅',
    hint: 'morning, golden hour, night…',
    chips: ['dawn', 'morning', 'midday', 'afternoon', 'golden hour', 'sunset', 'dusk', 'night', 'midnight'],
  },
  {
    key: 'Weather',
    emoji: '🌦️',
    hint: 'sunny, rain, fog, snow…',
    chips: ['sunny', 'cloudy', 'foggy', 'misty', 'rainy', 'stormy', 'snowy', 'windy', 'hazy'],
  },
  {
    key: 'Pose',
    emoji: '🚶',
    hint: 'starting pose / body language',
    chips: ['standing', 'sitting', 'walking', 'running', 'crouching', 'dynamic', 'candid', 'heroic', 'profile'],
  },
  {
    key: 'Outfit',
    emoji: '👗',
    hint: 'clothing and accessories',
    chips: ['casual', 'formal', 'vintage', 'streetwear', 'futuristic', 'traditional', 'rugged', 'elegant'],
  },
  {
    key: 'Expression',
    emoji: '😊',
    hint: 'facial expression',
    chips: ['smiling', 'laughing', 'serious', 'surprised', 'contemplative', 'intense', 'peaceful', 'curious'],
  },
  {
    key: 'Subject Motion',
    emoji: '🏃',
    hint: 'what the subject does',
    chips: ['walking', 'running', 'dancing', 'gesturing', 'talking', 'looking around', 'reaching', 'turning', 'jumping', 'falling', 'sitting down', 'standing up', 'riding'],
  },
  {
    key: 'Camera Motion',
    emoji: '🎥',
    hint: 'how the camera moves',
    chips: ['static', 'dolly in', 'dolly out', 'pan left', 'pan right', 'tilt up', 'tilt down', 'orbit left', 'orbit right', 'tracking shot', 'handheld', 'aerial drone', 'push in', 'pull out', 'crane up', 'whip pan'],
  },
  {
    key: 'Duration',
    emoji: '⏱️',
    hint: 'shot length',
    chips: ['2 seconds', '4 seconds', '6 seconds', '8 seconds', '10 seconds'],
  },
  {
    key: 'Format',
    emoji: '📐',
    hint: 'aspect ratio (vertical for shorts)',
    chips: ['square 1:1', 'landscape 16:9', 'vertical 9:16', 'portrait 4:5', 'cinematic 21:9', 'wide 2:1'],
  },
  {
    key: 'Quality',
    emoji: '✨',
    hint: 'render quality modifiers',
    chips: ['4k', '24fps', '30fps', '60fps', 'photoreal', 'sharp focus', 'filmic', 'high detail', 'smooth motion'],
  },
  {
    key: 'Negative',
    emoji: '⊘',
    hint: 'what to avoid',
    chips: ['blurry', 'low quality', 'warped faces', 'jittery', 'text artifacts', 'flickering', 'choppy motion', 'watermark', 'extra limbs'],
  },
];

export const AUDIO_KEYWORD_SECTIONS: KeywordSection[] = [
  {
    key: 'Genre',
    emoji: '🎼',
    hint: 'lo-fi, indie folk, house, orchestral…',
    chips: ['lo-fi', 'hip-hop', 'indie folk', 'synthwave', 'ambient', 'jazz', 'classical', 'electronic', 'rock', 'pop', 'drum and bass', 'trap', 'house', 'techno', 'country', 'blues', 'R&B', 'reggae', 'metal', 'acoustic', 'orchestral', 'cinematic'],
  },
  {
    key: 'Mood',
    emoji: '💗',
    hint: 'feeling and emotional tone',
    chips: ['dreamy', 'melancholic', 'uplifting', 'driving', 'haunting', 'peaceful', 'energetic', 'dark', 'romantic', 'nostalgic', 'tense', 'epic', 'playful', 'contemplative', 'urgent', 'hopeful'],
  },
  {
    key: 'Tempo',
    emoji: '⏱️',
    hint: 'BPM and pacing',
    chips: ['slow 60bpm', 'mellow 75bpm', 'medium 90bpm', 'upbeat 110bpm', 'dance 128bpm', 'fast 140bpm', "drum'n'bass 170bpm"],
  },
  {
    key: 'Key',
    emoji: '🎹',
    hint: 'musical key',
    chips: ['C major', 'A minor', 'D major', 'G major', 'E minor', 'F major', 'B minor', 'D minor', 'C minor', 'modal'],
  },
  {
    key: 'Instruments',
    emoji: '🎸',
    hint: 'sounds and instrumentation',
    chips: ['piano', 'acoustic guitar', 'electric guitar', 'bass guitar', 'synth pad', '808 drums', 'drum kit', 'strings', 'brass', 'vinyl crackle', 'hi-hats', 'sub bass', 'organ', 'flute', 'choir', 'sitar', 'marimba', 'claps', 'snares', 'kick drum'],
  },
  {
    key: 'Vocals',
    emoji: '🎤',
    hint: 'voice type or instrumental',
    chips: ['female vocals', 'male vocals', 'choir', 'instrumental (no vocals)', 'spoken word', 'vocoder', 'autotune', 'harmonies', 'whisper', 'rap', 'falsetto', 'vocal chops'],
  },
  {
    key: 'Structure',
    emoji: '📑',
    hint: 'arrangement (intro, verse, chorus…)',
    chips: ['Intro', 'Verse', 'Chorus', 'Pre-Chorus', 'Bridge', 'Drop', 'Build-up', 'Break', 'Instrumental', 'Outro', 'Climax'],
  },
  {
    key: 'Production',
    emoji: '🎚️',
    hint: 'mixing/mastering character',
    chips: ['lo-fi', 'polished', 'vintage', 'modern', 'clean', 'distorted', 'reverb-heavy', 'dry', 'vinyl-warm', 'analog', 'compressed', 'spacious', 'punchy', 'wide stereo'],
  },
  {
    key: 'Lyrics',
    emoji: '✍️',
    hint: 'lyric content or theme',
    chips: ['love', 'heartbreak', 'nostalgia', 'rebellion', 'journey', 'nature', 'city life', 'introspection', 'celebration', 'loss'],
  },
  {
    key: 'References',
    emoji: '🎯',
    hint: 'in the style of…',
    chips: ['Hans Zimmer', 'Bon Iver', 'Daft Punk', 'Phoebe Bridgers', 'Tycho', 'Boards of Canada', 'Burial', 'Nujabes', 'Ennio Morricone', 'Beach House'],
  },
  {
    key: 'Format',
    emoji: '⏳',
    hint: 'duration / length',
    chips: ['30 seconds', '1 minute', '2 minutes', '3 minutes', 'full song', 'loop'],
  },
  {
    key: 'Negative',
    emoji: '⊘',
    hint: 'what to avoid',
    chips: ['harsh', 'dissonant', 'low quality', 'badly mixed', 'distorted (if not desired)', 'clipping', 'muddy', 'unbalanced'],
  },
];

export function keywordSectionsFor(mode: PromptMode): KeywordSection[] {
  switch (mode) {
    case 'image': return IMAGE_KEYWORD_SECTIONS;
    case 'video': return VIDEO_KEYWORD_SECTIONS;
    case 'audio': return AUDIO_KEYWORD_SECTIONS;
  }
}

/** A ready-made starter prompt the user can drop in and edit. */
export interface PromptTemplate {
  name: string;
  desc: string;
  /** Plain-text body, "Section: …" per line so each line is editable. */
  prompt: string;
}

export const IMAGE_TEMPLATES: PromptTemplate[] = [
  {
    name: 'Cinematic Portrait',
    desc: 'shallow DOF, dramatic light, anamorphic',
    prompt: `Subject: A weathered fisherman, 60s, deep wrinkles, contemplative expression
Environment: Standing on a misty harbor at dawn, wooden boats behind
Style: cinematic, photorealistic, shot on Arri Alexa, 50mm anamorphic
Lighting: Soft warm rim light from low sun, moody
Quality: 4k, sharp focus, rich shadow detail
Negative: blurry, cartoon, extra fingers`,
  },
  {
    name: 'Photoreal Product',
    desc: 'studio, soft box, white sweep',
    prompt: `Subject: A matte black ceramic mug, steam rising
Environment: White seamless sweep, soft shadow
Style: commercial photography, minimalist, 85mm macro
Lighting: Two soft boxes at 45°, gentle reflector
Details: perfect surface texture, no fingerprints
Quality: 8k, hyperreal, studio quality
Negative: props, busy background, logos`,
  },
  {
    name: 'Anime Key Visual',
    desc: 'studio ghibli / makoto shinkai vibe',
    prompt: `Subject: A young girl in a blue summer uniform, looking at the sky
Environment: Tokyo rooftop at golden hour, distant skyline
Style: in the style of Makoto Shinkai, anime, painterly, vibrant
Lighting: warm golden sunset, lens flare, soft volumetric rays
Mood: nostalgic, hopeful
Negative: 3d, realistic, blurry`,
  },
  {
    name: 'Concept Art Landscape',
    desc: 'matte painting, fantasy',
    prompt: `Subject: A floating crystal city, impossibly tall spires
Environment: Above sea of clouds at dusk, distant mountains
Style: matte painting, epic fantasy, concept art
Lighting: magenta and cyan rim lights, atmospheric haze
Quality: highly detailed, 4k, artstation trending`,
  },
  {
    name: 'Character Sheet',
    desc: 'consistent character details',
    prompt: `Subject: A woman in her early 30s, shoulder-length dark brown hair, green eyes, quiet confidence
Outfit: Olive trench coat, tan boots, dark jeans
Style: illustration, clean lines, neutral palette
Quality: turnaround sheet, three angles, consistent face`,
  },
];

export const VIDEO_TEMPLATES: PromptTemplate[] = [
  {
    name: 'Cinematic Shot',
    desc: 'magic hour, slow dolly, anamorphic',
    prompt: `Subject: A red vintage car on an empty desert road
Environment: Salt flats at magic hour, distant heat haze
Camera Motion: Slow dolly-in from behind, then orbit right
Subject Motion: Driving slowly forward
Style: cinematic, commercial, anamorphic lens flare
Lighting: warm low sun, long shadows
Duration: 8 seconds
Format: landscape 16:9
Quality: 4k, 24fps, photoreal, filmic`,
  },
  {
    name: 'Vertical Short-form',
    desc: 'hook-first, 9:16, fast cut',
    prompt: `Subject: A young chef plating a colorful dish
Composition: centered, hands and dish prominent, vertical-safe framing
Camera Motion: quick zoom-in on the final garnish
Subject Motion: Placing herbs and finishing with a flourish
Style: commercial, vibrant, social-ready
Lighting: bright overhead, no harsh shadows
Duration: 4 seconds
Format: vertical 9:16
Quality: 4k, 30fps, sharp focus`,
  },
  {
    name: 'Product B-roll',
    desc: 'studio, slow rotation, clean',
    prompt: `Subject: A luxury watch, polished steel, glass face catching light
Environment: black studio backdrop, soft rim light
Camera Motion: slow orbit around the subject
Subject Motion: watch hands ticking subtly
Style: luxury commercial, minimalist
Lighting: two soft boxes plus rim light
Duration: 6 seconds
Format: landscape 16:9
Quality: 4k, 24fps, hyperreal, sharp
Negative: logos, fingerprints, busy background`,
  },
  {
    name: 'Documentary Interview',
    desc: 'talking head, shallow DOF, soft window light',
    prompt: `Subject: A middle-aged scientist, thoughtful, mid-conversation
Environment: cluttered office, blurred bookshelves behind
Composition: medium close-up, slight off-center
Camera Motion: static, almost imperceptible drift
Subject Motion: speaking, occasional hand gestures
Style: documentary, natural
Lighting: soft window light from camera-left
Duration: 10 seconds
Format: landscape 16:9
Quality: 4k, 24fps, shallow depth of field`,
  },
];

export const AUDIO_TEMPLATES: PromptTemplate[] = [
  {
    name: 'Lo-fi Hip-hop Beat',
    desc: 'mellow, vinyl-warm, instrumental',
    prompt: `Genre: lo-fi hip-hop
Mood: dreamy, nostalgic
Tempo: mellow 75bpm
Key: A minor
Instruments: piano, vinyl crackle, mellow drums, sub bass
Vocals: instrumental (no vocals)
Structure: Intro, Verse, Outro
Production: lo-fi, vinyl-warm, slightly compressed
Format: 2 minutes`,
  },
  {
    name: 'Cinematic Score',
    desc: 'epic build, orchestral, hans zimmer-style',
    prompt: `Genre: orchestral cinematic
Mood: epic, tense, building
Tempo: slow build, 80bpm rising to 120bpm
Instruments: strings, brass, percussion, choir
Structure: Intro, Build-up, Climax, Outro
Production: polished, spacious, dramatic dynamics
References: in the style of Hans Zimmer
Format: 3 minutes`,
  },
  {
    name: 'Indie Folk Ballad',
    desc: 'acoustic, female vocals, melancholic',
    prompt: `Genre: indie folk
Mood: melancholic, contemplative
Tempo: slow 70bpm
Key: D major
Instruments: acoustic guitar, gentle piano, soft strings
Vocals: female vocals, harmonies on chorus
Structure: Verse, Chorus, Verse, Chorus, Bridge, Chorus, Outro
Production: warm, intimate, dry`,
  },
  {
    name: 'Electronic Dance',
    desc: 'house, 128bpm, drop',
    prompt: `Genre: house
Mood: energetic, uplifting
Tempo: dance 128bpm
Instruments: synth pad, 808 drums, sub bass, claps, hi-hats
Vocals: vocal chops, female vocals
Structure: Intro, Build-up, Drop, Break, Drop, Outro
Production: polished, punchy, loud
Format: 3 minutes`,
  },
  {
    name: 'Ambient Soundscape',
    desc: 'atmospheric, drones, no rhythm',
    prompt: `Genre: ambient
Mood: peaceful, ethereal, contemplative
Tempo: no defined tempo, slowly evolving
Instruments: synth pad, gentle drones, distant piano, field recordings
Vocals: instrumental (no vocals)
Production: spacious, reverb-heavy, immersive
References: in the style of Brian Eno
Format: full song`,
  },
];

export function templatesFor(mode: PromptMode): PromptTemplate[] {
  switch (mode) {
    case 'image': return IMAGE_TEMPLATES;
    case 'video': return VIDEO_TEMPLATES;
    case 'audio': return AUDIO_TEMPLATES;
  }
}
