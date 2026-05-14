/**
 * Curated cinematic direction options — every entry here is a cue that
 * AI video models (Sora, Veo, Runway, Kling, Luma, Pika) demonstrably
 * respond to in the generated image/video. Style-only tags that don't
 * change pixels (specific camera bodies, lens model names, exact f-stops,
 * frame rate, aspect ratio) are intentionally excluded — fps and aspect
 * ratio belong on Output parameters; cameras/lens-models are aesthetic
 * tags whose effect is already captured by lens character + film stock.
 */

export interface OptionItem {
  value: string;
  hint?: string;
}

export interface OptionGroup {
  group: string;
  items: OptionItem[];
}

/* ------------------------- Lens type (broad — strong signal) ------------------------- */
/** Broad lens categories the models map to perspective + framing.
 *  Specific focal-length numbers (35mm vs 50mm) are weakly differentiated
 *  by current models, so we collapse them into these buckets. */
export const LENS_TYPES: { value: NonNullable<import('../models/contract.model').Cinematography['lensType']>; label: string; hint: string }[] = [
  { value: 'ultra_wide', label: 'Ultra-wide', hint: '14–18mm — distortion, exaggerated depth' },
  { value: 'wide', label: 'Wide', hint: '24–28mm — environmental, immersive' },
  { value: 'standard', label: 'Standard', hint: '35–50mm — natural perspective' },
  { value: 'portrait', label: 'Portrait', hint: '85mm — flattering, compressed' },
  { value: 'telephoto', label: 'Telephoto', hint: '135–400mm — compressed, distant' },
  { value: 'macro', label: 'Macro', hint: 'Extreme close-up, tiny details' },
];

/* ------------------------- Depth of field (strong) ------------------------- */
export const DEPTH_OF_FIELD: { value: string; label: string }[] = [
  { value: 'shallow', label: 'Shallow depth of field' },
  { value: 'moderate', label: 'Moderate depth of field' },
  { value: 'deep', label: 'Deep focus' },
  { value: 'rack_focus', label: 'Rack focus' },
  { value: 'bokeh', label: 'Creamy bokeh' },
];

/* ------------------------- Lens character (visible artefacts only) ------------------------- */
/** Only entries that produce a recognisable visual signature.
 *  Specific lens model names (Cooke S4, Zeiss Master Prime, Helios) are
 *  removed — they're collector tags, not visual differentiators. */
export const LENS_CHARACTERISTICS: OptionItem[] = [
  { value: 'anamorphic flare', hint: 'Horizontal streaky highlights — strong signal' },
  { value: 'anamorphic squeeze', hint: 'Oval bokeh, widescreen feel' },
  { value: 'lens flare', hint: 'Sun / light bloom across the frame' },
  { value: 'fisheye distortion', hint: 'Curved horizon, exaggerated edges' },
  { value: 'tilt-shift miniature', hint: 'Toy-world look with selective blur' },
  { value: 'chromatic aberration', hint: 'Colour fringing on high-contrast edges' },
  { value: 'vignetting', hint: 'Darker corners — classic film look' },
  { value: 'soft focus', hint: 'Dreamy diffusion' },
  { value: 'pro-mist glow', hint: 'Highlight bloom around bright sources' },
];

/* ------------------------- Shot types (strong) ------------------------- */
export const SHOT_TYPES: OptionItem[] = [
  { value: 'extreme close-up' },
  { value: 'close-up' },
  { value: 'medium close-up' },
  { value: 'medium shot' },
  { value: 'wide shot' },
  { value: 'extreme wide shot' },
  { value: 'establishing shot' },
  { value: 'over-the-shoulder' },
  { value: 'point-of-view' },
];

/* ------------------------- Camera angles (strong) ------------------------- */
export const CAMERA_ANGLES: OptionItem[] = [
  { value: 'eye level' },
  { value: 'high angle' },
  { value: 'low angle' },
  { value: "bird's eye view" },
  { value: 'dutch angle', hint: 'Canted, tense' },
  { value: 'overhead shot' },
  { value: 'profile shot' },
];

/* ------------------------- Camera movements (strong) ------------------------- */
export const CAMERA_MOVEMENTS: OptionItem[] = [
  { value: 'static' },
  { value: 'pan' },
  { value: 'tilt' },
  { value: 'dolly in' },
  { value: 'dolly out' },
  { value: 'dolly zoom', hint: 'Vertigo effect' },
  { value: 'tracking shot' },
  { value: 'crane shot' },
  { value: 'steadicam' },
  { value: 'handheld' },
  { value: 'whip pan' },
  { value: 'drone shot' },
  { value: 'orbit shot' },
];

/* ------------------------- Film stocks (visible signatures only) ------------------------- */
/** Kept only stocks with a distinctive look the models have learned. */
export const FILM_STOCKS: OptionItem[] = [
  { value: 'CineStill 800T', hint: 'Red halation around highlights — strongest signal' },
  { value: 'Kodak Portra 400', hint: 'Warm, flattering skin tones' },
  { value: 'Kodak Gold 200', hint: 'Nostalgic warm cast' },
  { value: 'Fujifilm Velvia 50', hint: 'Saturated, punchy landscapes' },
  { value: 'Tri-X 400 black & white', hint: 'Classic B&W documentary grain' },
  { value: 'Polaroid instant film', hint: 'Soft, washed, square framing' },
];

/* ------------------------- Color grading (strong) ------------------------- */
export const COLOR_GRADES: OptionItem[] = [
  { value: 'teal and orange', hint: 'Blockbuster look' },
  { value: 'bleach bypass', hint: 'Desaturated, gritty' },
  { value: 'warm tones' },
  { value: 'cool tones' },
  { value: 'desaturated' },
  { value: 'high contrast' },
  { value: 'low contrast' },
  { value: 'crushed blacks' },
  { value: 'sepia' },
  { value: 'monochrome black and white' },
  { value: 'pastel palette' },
  { value: 'neon palette' },
  { value: 'Technicolor' },
];

/* ------------------------- Grain / texture (strong) ------------------------- */
export const GRAIN_OPTIONS: OptionItem[] = [
  { value: '35mm film grain' },
  { value: '16mm film grain' },
  { value: 'Super 8 grain' },
  { value: 'clean digital' },
  { value: 'halation glow' },
  { value: 'light leaks' },
  { value: 'VHS aesthetic', hint: 'Scan lines, tracking artefacts' },
  { value: 'film scratches' },
];

/* ------------------------- Lighting setups (strong) ------------------------- */
export const LIGHTING_OPTIONS: OptionItem[] = [
  { value: 'high-key', hint: 'Bright, low contrast' },
  { value: 'low-key', hint: 'Dark, moody' },
  { value: 'rim light' },
  { value: 'backlight' },
  { value: 'silhouette' },
  { value: 'chiaroscuro' },
  { value: 'film noir lighting' },
  { value: 'practical lights' },
  { value: 'neon lights' },
  { value: 'candlelight' },
  { value: 'volumetric god rays' },
  { value: 'soft diffused light' },
  { value: 'hard directional light' },
  { value: 'natural light' },
];

/* ------------------------- Time of day (strong) ------------------------- */
export const TIME_OF_DAY: OptionItem[] = [
  { value: 'golden hour' },
  { value: 'blue hour' },
  { value: 'sunrise' },
  { value: 'sunset' },
  { value: 'twilight' },
  { value: 'harsh midday sun' },
  { value: 'overcast' },
  { value: 'moonlight' },
  { value: 'night' },
  { value: 'neon-lit night' },
];

/* ------------------------- Atmosphere & effects (strong — visible elements) ------------------------- */
export const ATMOSPHERE_OPTIONS: OptionItem[] = [
  { value: 'fog' },
  { value: 'mist' },
  { value: 'haze' },
  { value: 'smoke' },
  { value: 'rain' },
  { value: 'snow' },
  { value: 'dust particles' },
  { value: 'water reflections' },
  { value: 'heat shimmer' },
];

/* ------------------------- Style references (only well-recognised names) ------------------------- */
/** Models recognise the most-online cinematographers/directors/films best.
 *  Niche names (Tarkovsky, Kurosawa, Storaro, etc.) have weak signal in
 *  current video models — kept the strongest only. */
export const STYLE_REFERENCES: OptionGroup[] = [
  {
    group: 'Cinematographers',
    items: [
      { value: 'Roger Deakins', hint: 'Naturalistic, dramatic contrast' },
      { value: 'Emmanuel Lubezki', hint: 'Long-take natural-light realism' },
      { value: 'Hoyte van Hoytema', hint: 'Wide-format epic scale' },
      { value: 'Christopher Doyle', hint: 'Saturated, kinetic Hong Kong cinema' },
    ],
  },
  {
    group: 'Directors / visual styles',
    items: [
      { value: 'Wes Anderson', hint: 'Symmetrical, pastel, deadpan' },
      { value: 'Christopher Nolan', hint: 'IMAX scale, cool palette' },
      { value: 'Denis Villeneuve', hint: 'Minimalist, ambient, monumental' },
      { value: 'Stanley Kubrick', hint: 'Symmetrical, clinical' },
      { value: 'David Fincher', hint: 'Cold, desaturated, precise' },
      { value: 'Studio Ghibli', hint: 'Painterly, soft animation feel' },
    ],
  },
  {
    group: 'Film references',
    items: [
      { value: 'Blade Runner 2049', hint: 'Saturated neon, monumental' },
      { value: 'Drive (2011)', hint: 'Synth-noir, magenta/teal' },
      { value: 'The Grand Budapest Hotel', hint: 'Pastel symmetry' },
      { value: 'Dunkirk', hint: 'Cool, IMAX, atmospheric' },
      { value: 'In the Mood for Love', hint: 'Slow, saturated, intimate' },
    ],
  },
];
