import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { CameraAngle, CharacterImage, CharacterProfile } from '../models/contract.model';

const PORTRAIT_POOL = [
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900',
  'https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=900',
  'https://images.unsplash.com/photo-1502767089025-6572583495b4?w=900',
  'https://images.unsplash.com/photo-1546961342-1a2eebd99e1b?w=900',
  'https://images.unsplash.com/photo-1492288991661-058aa541ff43?w=900',
  'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=900',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=900',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=900',
];

export const CAMERA_ANGLE_PRESETS: { id: CameraAngle; label: string }[] = [
  { id: 'front', label: 'Front' },
  { id: 'three_quarter_left', label: '3/4 left' },
  { id: 'three_quarter_right', label: '3/4 right' },
  { id: 'profile_left', label: 'Profile left' },
  { id: 'profile_right', label: 'Profile right' },
  { id: 'back', label: 'Back' },
  { id: 'low_angle', label: 'Low angle' },
  { id: 'high_angle', label: 'High angle' },
];

export interface GenerateImageRequest {
  characterId: string;
  prompt: string;
  provider: string;
  model: string;
  multiAngle: boolean;
  angles?: CameraAngle[];
}

const SEED_CHARACTERS: CharacterProfile[] = [
  {
    id: 'char-1',
    name: 'Maya Reyes',
    role: 'Protagonist',
    age: 'Late 20s',
    gender: 'Female',
    description:
      'A weathered war journalist returning to her hometown after a decade abroad. Sharp eyes, restless hands, always carries a film camera.',
    personality: 'Cynical but compassionate, dry humor, calm under pressure.',
    wardrobe: 'Olive trench coat, denim, leather satchel, scuffed combat boots.',
    tags: ['drama', 'journalist', 'protagonist'],
    images: [
      {
        id: 'cimg-1',
        characterId: 'char-1',
        uri: PORTRAIT_POOL[0],
        thumbnail: PORTRAIT_POOL[0],
        prompt: 'Maya Reyes, weathered war journalist, olive trench coat, cinematic 35mm',
        provider: 'midjourney',
        model: 'Midjourney v7',
        cameraAngle: 'front',
        status: 'ready',
        createdAt: new Date(Date.now() - 86400_000 * 4).toISOString(),
      },
      {
        id: 'cimg-2',
        characterId: 'char-1',
        uri: PORTRAIT_POOL[1],
        thumbnail: PORTRAIT_POOL[1],
        prompt: 'Maya Reyes, three-quarter portrait, cinematic 35mm',
        provider: 'midjourney',
        model: 'Midjourney v7',
        cameraAngle: 'three_quarter_left',
        status: 'ready',
        createdAt: new Date(Date.now() - 86400_000 * 4).toISOString(),
      },
    ],
    primaryImageId: 'cimg-1',
    createdAt: new Date(Date.now() - 86400_000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 86400_000 * 4).toISOString(),
  },
  {
    id: 'char-2',
    name: 'Kai Ito',
    role: 'Antagonist',
    age: '40s',
    gender: 'Male',
    description: 'A brilliant tech founder whose memory implants quietly rewrite his own past.',
    personality: 'Charismatic, measured, dangerously self-assured.',
    wardrobe: 'Slate turtleneck, tailored coat, minimalist watch.',
    tags: ['sci-fi', 'villain'],
    images: [
      {
        id: 'cimg-3',
        characterId: 'char-2',
        uri: PORTRAIT_POOL[2],
        thumbnail: PORTRAIT_POOL[2],
        prompt: 'Kai Ito, tech founder, slate turtleneck, moody studio lighting',
        provider: 'leonardo',
        model: 'Phoenix',
        cameraAngle: 'front',
        status: 'ready',
        createdAt: new Date(Date.now() - 86400_000 * 2).toISOString(),
      },
    ],
    primaryImageId: 'cimg-3',
    createdAt: new Date(Date.now() - 86400_000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400_000 * 2).toISOString(),
  },
];

@Injectable({ providedIn: 'root' })
export class CharactersService {
  private readonly _characters = signal<CharacterProfile[]>(structuredClone(SEED_CHARACTERS));
  readonly characters = this._characters.asReadonly();
  readonly count = computed(() => this._characters().length);

  list(): Observable<CharacterProfile[]> {
    return of(this._characters()).pipe(delay(140));
  }

  get(id: string): CharacterProfile | undefined {
    return this._characters().find((c) => c.id === id);
  }

  create(input: Partial<CharacterProfile> & { name: string }): CharacterProfile {
    const now = new Date().toISOString();
    const profile: CharacterProfile = {
      id: `char-${Date.now()}`,
      name: input.name,
      role: input.role ?? '',
      age: input.age ?? '',
      gender: input.gender ?? '',
      description: input.description ?? '',
      personality: input.personality ?? '',
      wardrobe: input.wardrobe ?? '',
      tags: input.tags ?? [],
      images: [],
      createdAt: now,
      updatedAt: now,
    };
    this._characters.update((list) => [profile, ...list]);
    return profile;
  }

  update(id: string, patch: Partial<CharacterProfile>): void {
    this._characters.update((list) =>
      list.map((c) =>
        c.id === id ? { ...c, ...patch, id: c.id, updatedAt: new Date().toISOString() } : c,
      ),
    );
  }

  remove(id: string): void {
    this._characters.update((list) => list.filter((c) => c.id !== id));
  }

  setPrimaryImage(characterId: string, imageId: string): void {
    this.update(characterId, { primaryImageId: imageId });
  }

  addImageFromSource(
    characterId: string,
    input: {
      uri: string;
      thumbnail?: string;
      prompt?: string;
      provider?: string;
      model?: string;
      cameraAngle?: CameraAngle;
    },
  ): CharacterImage | null {
    const c = this.get(characterId);
    if (!c) return null;
    const image: CharacterImage = {
      id: `cimg-${Date.now()}`,
      characterId,
      uri: input.uri,
      thumbnail: input.thumbnail ?? input.uri,
      prompt: input.prompt ?? '',
      provider: input.provider ?? 'manual',
      model: input.model ?? 'upload',
      cameraAngle: input.cameraAngle,
      status: 'ready',
      createdAt: new Date().toISOString(),
    };
    const images = [image, ...c.images];
    const primaryImageId = c.primaryImageId ?? image.id;
    this.update(characterId, { images, primaryImageId });
    return image;
  }

  removeImage(characterId: string, imageId: string): void {
    const c = this.get(characterId);
    if (!c) return;
    const images = c.images.filter((i) => i.id !== imageId);
    const primaryImageId = c.primaryImageId === imageId ? images[0]?.id : c.primaryImageId;
    this.update(characterId, { images, primaryImageId });
  }

  /** Patch an existing reference image — used by the image-editor bridge
   *  when the user edits an image and applies the result back here. */
  updateImage(characterId: string, imageId: string, patch: Partial<CharacterImage>): void {
    const c = this.get(characterId);
    if (!c) return;
    const images = c.images.map((i) => (i.id === imageId ? { ...i, ...patch, id: i.id } : i));
    this.update(characterId, { images });
  }

  generateImages(req: GenerateImageRequest): Observable<CharacterImage[]> {
    const angles: (CameraAngle | undefined)[] = req.multiAngle
      ? req.angles && req.angles.length > 0
        ? req.angles
        : CAMERA_ANGLE_PRESETS.slice(0, 4).map((a) => a.id)
      : [undefined];

    const now = Date.now();
    const created: CharacterImage[] = angles.map((angle, idx) => {
      const url = PORTRAIT_POOL[(now + idx) % PORTRAIT_POOL.length];
      return {
        id: `cimg-${now}-${idx}`,
        characterId: req.characterId,
        uri: url,
        thumbnail: url,
        prompt: angle ? `${req.prompt} — ${this.describeAngle(angle)}` : req.prompt,
        provider: req.provider,
        model: req.model,
        cameraAngle: angle,
        status: 'ready',
        createdAt: new Date().toISOString(),
      };
    });

    this._characters.update((list) =>
      list.map((c) => {
        if (c.id !== req.characterId) return c;
        const images = [...created, ...c.images];
        const primaryImageId = c.primaryImageId ?? created[0]?.id;
        return { ...c, images, primaryImageId, updatedAt: new Date().toISOString() };
      }),
    );

    return of(created).pipe(delay(900));
  }

  private describeAngle(angle: CameraAngle): string {
    const found = CAMERA_ANGLE_PRESETS.find((a) => a.id === angle);
    return found ? found.label.toLowerCase() : angle.replace(/_/g, ' ');
  }
}
