import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CAMERA_ANGLE_PRESETS,
  CharactersService,
} from '../../core/services/characters.service';
import { ModelsService } from '../../core/services/models.service';
import { AssetsService } from '../../core/services/assets.service';
import {
  EligibilityResult,
  ImageEligibilityService,
} from '../../core/services/image-eligibility.service';
import { ImageEditorBridgeService } from '../../core/services/image-editor-bridge.service';
import {
  AiModel,
  Asset,
  CameraAngle,
  CharacterImage,
  CharacterProfile,
} from '../../core/models/contract.model';

@Component({
  selector: 'app-characters',
  imports: [FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (selected(); as character) {
      <header class="row top">
        <button class="btn ghost sm" (click)="closeDetail()">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5l-5 5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back to characters
        </button>
        <div class="spacer"></div>
        <button class="btn danger sm" (click)="deleteCharacter(character)">Delete</button>
      </header>

      @if (eligibilityNotice(); as notice) {
        <div class="elig-banner" [class]="'verdict-' + notice.verdict">
          <div class="row" style="justify-content: space-between; align-items: flex-start; gap: 0.8rem">
            <div>
              <strong style="font-size: 0.92rem">
                @if (notice.verdict === 'blocked') { Upload blocked }
                @else { Uploaded with warnings }
                · {{ notice.fileName }}
              </strong>
              <div class="muted" style="margin-top: 0.2rem; font-size: 0.82rem">{{ notice.summary }}</div>
              @if (notice.fails.length > 0) {
                <ul style="margin: 0.4rem 0 0; padding-left: 1.1rem; font-size: 0.8rem">
                  @for (f of notice.fails; track f) { <li>{{ f }}</li> }
                </ul>
              }
              @if (notice.warns.length > 0) {
                <ul style="margin: 0.4rem 0 0; padding-left: 1.1rem; font-size: 0.8rem; color: var(--text-2)">
                  @for (w of notice.warns; track w) { <li>{{ w }}</li> }
                </ul>
              }
            </div>
            <button class="iconbtn" (click)="dismissEligibilityNotice()" title="Dismiss">×</button>
          </div>
        </div>
      }

      <div class="detail-grid">
        <section class="card profile">
          <div class="row" style="justify-content: space-between; align-items: flex-start">
            <div>
              <div class="eyebrow">Character profile</div>
              <h2 style="margin-top: 0.3rem">{{ character.name || 'Untitled character' }}</h2>
            </div>
            <div class="hero-thumb" [style.background-image]="heroBackground(character)">
              @if (!character.primaryImageId) {
                <div class="hero-placeholder">No image yet</div>
              }
            </div>
          </div>

          <div class="grid-2" style="margin-top: 1rem">
            <label class="field">
              Name
              <input
                [ngModel]="character.name"
                (ngModelChange)="patch(character.id, { name: $event })"
                placeholder="e.g. Maya Reyes"
              />
            </label>
            <label class="field">
              Role
              <input
                [ngModel]="character.role"
                (ngModelChange)="patch(character.id, { role: $event })"
                placeholder="Protagonist, antagonist, supporting…"
              />
            </label>
            <label class="field">
              Age
              <input
                [ngModel]="character.age"
                (ngModelChange)="patch(character.id, { age: $event })"
                placeholder="Late 20s, 40s, child…"
              />
            </label>
            <label class="field">
              Gender / pronouns
              <input
                [ngModel]="character.gender"
                (ngModelChange)="patch(character.id, { gender: $event })"
                placeholder="Female, male, non-binary…"
              />
            </label>
          </div>

          <label class="field" style="margin-top: 0.6rem">
            Description
            <textarea
              rows="3"
              [ngModel]="character.description"
              (ngModelChange)="patch(character.id, { description: $event })"
              placeholder="Backstory, motivation, distinctive features"
            ></textarea>
          </label>

          <div class="grid-2" style="margin-top: 0.6rem">
            <label class="field">
              Personality
              <textarea
                rows="2"
                [ngModel]="character.personality"
                (ngModelChange)="patch(character.id, { personality: $event })"
                placeholder="Tone, mannerisms, default emotion"
              ></textarea>
            </label>
            <label class="field">
              Wardrobe
              <textarea
                rows="2"
                [ngModel]="character.wardrobe"
                (ngModelChange)="patch(character.id, { wardrobe: $event })"
                placeholder="Costume, signature items, materials"
              ></textarea>
            </label>
          </div>

          <label class="field" style="margin-top: 0.6rem">
            Tags <span class="muted" style="text-transform: none; font-size: 0.7rem">(comma separated)</span>
            <input
              [ngModel]="character.tags.join(', ')"
              (ngModelChange)="patchTags(character.id, $event)"
              placeholder="drama, villain, sci-fi"
            />
          </label>
        </section>

        <section class="card gen">
          <div class="row" style="justify-content: space-between; align-items: flex-start">
            <div>
              <div class="eyebrow">Image generation</div>
              <h3 style="margin-top: 0.3rem">Generate reference shots</h3>
              <p class="muted" style="margin-top: 0.3rem; font-size: 0.82rem">
                Pick an image model, describe the look, and optionally render the same character from multiple camera angles.
              </p>
            </div>
            <span class="chip cyan">{{ character.images.length }} image{{ character.images.length === 1 ? '' : 's' }}</span>
          </div>

          <label class="field" style="margin-top: 0.9rem">
            Image model
            <select [ngModel]="modelId()" (ngModelChange)="modelId.set($event)">
              @for (m of imageModels(); track m.id) {
                <option [value]="m.id">{{ m.provider }} · {{ m.name }} — {{ m.speed }} · {{ m.costPerUnit }}/{{ m.unit }}</option>
              }
            </select>
          </label>

          <label class="field" style="margin-top: 0.6rem">
            Prompt
            <textarea
              rows="3"
              [ngModel]="prompt()"
              (ngModelChange)="prompt.set($event)"
              [placeholder]="defaultPrompt(character)"
            ></textarea>
          </label>

          <label class="check-row">
            <input type="checkbox" [ngModel]="multiAngle()" (ngModelChange)="multiAngle.set($event)" />
            <div>
              <div class="check-title">Generate the same character from multiple camera angles</div>
              <div class="muted" style="font-size: 0.78rem">Produces one image per selected angle — useful as a turnaround reference sheet.</div>
            </div>
          </label>

          @if (multiAngle()) {
            <div class="angles">
              @for (a of cameraAngles; track a.id) {
                <button
                  type="button"
                  class="angle-chip"
                  [class.active]="isAngleSelected(a.id)"
                  (click)="toggleAngle(a.id)"
                >{{ a.label }}</button>
              }
            </div>
          }

          <div class="row" style="margin-top: 1rem; gap: 0.6rem">
            <button class="btn primary" (click)="generate(character)" [disabled]="generating() || !prompt().trim()">
              @if (generating()) { <span class="loader"></span> Generating… }
              @else { Generate {{ multiAngle() ? selectedAngles().length + ' angles' : 'image' }} }
            </button>
            <button class="btn ghost sm" (click)="prompt.set(defaultPrompt(character))" type="button">
              Use suggested prompt
            </button>
          </div>
        </section>

        <section class="card images">
          <div class="row gallery-head">
            <div>
              <div class="eyebrow">Reference images</div>
              <h3 style="margin-top: 0.3rem">Gallery</h3>
            </div>
            <div class="spacer"></div>
            <div class="row" style="gap: 0.4rem; flex-wrap: wrap">
              <button class="btn sm" type="button" (click)="triggerUpload()">
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 14V4M5.5 8.5 10 4l4.5 4.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 14v2.5h12V14" stroke-linecap="round"/></svg>
                Upload from computer
              </button>
              <button class="btn sm" type="button" (click)="openAssetPicker()">
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="3" width="15" height="14" rx="2.5"/><circle cx="7.5" cy="8" r="1.5"/><path d="m3 14 4-4 4 4 3-3 3 3"/></svg>
                From asset library
              </button>
            </div>
          </div>
          <input
            #fileInput
            type="file"
            accept="image/*"
            multiple
            hidden
            (change)="onFileSelected($event, character.id)"
          />

          @if (character.images.length === 0) {
            <div class="empty">
              <div style="font-size: 1.6rem">🎭</div>
              <div style="font-family: var(--font-display); font-weight: 600">No reference images yet</div>
              <p class="muted">Generate a new shot, upload one from your computer, or pick from the asset library.</p>
            </div>
          } @else {
            <div class="image-grid">
              @for (img of character.images; track img.id) {
                <div class="image-tile" [class.primary]="img.id === character.primaryImageId">
                  <div class="thumb" [style.background-image]="'url(' + img.uri + ')'" (click)="setPrimary(character.id, img.id)">
                    <button
                      class="edit-img-btn"
                      type="button"
                      title="Edit image"
                      (click)="$event.stopPropagation(); editImage(character.id, img)"
                    >
                      <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3l3 3-9 9-3 1 1-3 8-10z" stroke-linejoin="round"/></svg>
                    </button>
                  </div>
                  <div class="img-meta">
                    <div class="row" style="justify-content: space-between; align-items: flex-start; gap: 0.4rem">
                      <div class="img-prompt">{{ img.prompt }}</div>
                      <button class="iconbtn" title="Remove" (click)="removeImage(character.id, img.id)">×</button>
                    </div>
                    <div class="row" style="gap: 0.3rem; flex-wrap: wrap; margin-top: 0.35rem">
                      @if (img.cameraAngle) {
                        <span class="chip muted">{{ angleLabel(img.cameraAngle) }}</span>
                      }
                      <span class="chip muted">{{ img.provider }}</span>
                      @if (img.id === character.primaryImageId) {
                        <span class="chip">Primary</span>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </section>
      </div>

      @if (assetPickerOpen()) {
        <div class="modal-backdrop" (click)="closeAssetPicker()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="row" style="justify-content: space-between; margin-bottom: 0.6rem">
              <strong style="font-family: var(--font-display); font-size: 1.05rem">Pick image from asset library</strong>
              <button class="iconbtn" (click)="closeAssetPicker()">×</button>
            </div>
            @if (imageAssets().length === 0) {
              <div class="muted" style="padding: 1rem 0; text-align: center">
                No image assets in your library yet. Generate or upload one on the Asset library page.
              </div>
            } @else {
              <div class="picker-grid">
                @for (a of imageAssets(); track a.id) {
                  <button class="picker-item" (click)="useAsset(character.id, a)">
                    <div class="picker-thumb" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'"></div>
                    <div class="picker-name">{{ a.name }}</div>
                    <div class="muted" style="font-size: 0.7rem">{{ a.provider || 'manual' }}</div>
                  </button>
                }
              </div>
            }
          </div>
        </div>
      }
    } @else {
      <header class="row" style="justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem">
        <div>
          <h1>Characters</h1>
          <p class="muted" style="margin-top: 0.4rem">Build a roster of reusable characters with reference images and traits. Reuse them across scenes for continuity.</p>
        </div>
        <button class="btn primary" (click)="createCharacter()">+ New character</button>
      </header>

      <div class="row filters">
        <div class="search-box">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="9" r="6.5"/><path d="m14 14 4 4" stroke-linecap="round"/>
          </svg>
          <input placeholder="Search by name, role, or tag" [ngModel]="search()" (ngModelChange)="search.set($event)"/>
        </div>
        <span class="muted" style="font-size: 0.82rem">{{ filtered().length }} of {{ charactersSrv.count() }}</span>
      </div>

      @if (filtered().length === 0) {
        <div class="empty">
          <div style="font-size: 1.6rem">🎭</div>
          <div style="font-family: var(--font-display); font-weight: 600">No characters yet</div>
          <p class="muted">Create your first character to start generating reference shots.</p>
          <button class="btn primary sm" style="margin-top: 0.6rem" (click)="createCharacter()">+ New character</button>
        </div>
      } @else {
        <section class="grid">
          @for (c of filtered(); track c.id) {
            <button class="char-card card" (click)="open(c)">
              <div class="char-thumb" [style.background-image]="heroBackground(c)">
                @if (!c.primaryImageId) { <div class="hero-placeholder">No image</div> }
              </div>
              <div class="char-body">
                <div class="row" style="justify-content: space-between; align-items: flex-start">
                  <div>
                    <strong class="char-name">{{ c.name || 'Untitled character' }}</strong>
                    @if (c.role) { <div class="muted" style="font-size: 0.78rem">{{ c.role }}</div> }
                  </div>
                  <span class="chip cyan">{{ c.images.length }} img</span>
                </div>
                @if (c.description) {
                  <p class="char-desc">{{ c.description }}</p>
                }
                <div class="row" style="gap: 0.3rem; flex-wrap: wrap; margin-top: 0.45rem">
                  @for (t of c.tags; track t) {
                    <span class="tag">{{ t }}</span>
                  }
                </div>
                <div class="row" style="justify-content: space-between; padding-top: 0.5rem; border-top: 1px dashed var(--border); margin-top: 0.45rem">
                  <span class="muted" style="font-size: 0.72rem">Updated</span>
                  <span class="muted" style="font-size: 0.72rem">{{ c.updatedAt | date: 'shortDate' }}</span>
                </div>
              </div>
            </button>
          }
        </section>
      }
    }
  `,
  styleUrl: './characters.component.scss',
})
export class CharactersComponent {
  protected readonly charactersSrv = inject(CharactersService);
  private readonly modelsSrv = inject(ModelsService);
  private readonly assetsSrv = inject(AssetsService);
  private readonly eligibilitySrv = inject(ImageEligibilityService);
  private readonly editorBridge = inject(ImageEditorBridgeService);

  protected readonly eligibilityNotice = signal<{
    fileName: string;
    verdict: EligibilityResult['verdict'];
    summary: string;
    fails: string[];
    warns: string[];
  } | null>(null);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly cameraAngles = CAMERA_ANGLE_PRESETS;
  protected readonly search = signal('');
  protected readonly selectedId = signal<string | null>(null);

  protected readonly prompt = signal('');
  protected readonly multiAngle = signal(false);
  protected readonly selectedAngles = signal<CameraAngle[]>(
    CAMERA_ANGLE_PRESETS.slice(0, 4).map((a) => a.id),
  );
  protected readonly modelId = signal<string>('');
  protected readonly generating = signal(false);
  protected readonly assetPickerOpen = signal(false);

  protected readonly imageModels = computed<AiModel[]>(() =>
    this.modelsSrv.models().filter((m) => m.capability === 'text_to_image'),
  );

  protected readonly imageAssets = computed<Asset[]>(() =>
    this.assetsSrv.assets().filter((a) => a.type === 'image'),
  );

  protected readonly selected = computed<CharacterProfile | null>(() => {
    const id = this.selectedId();
    if (!id) return null;
    return this.charactersSrv.characters().find((c) => c.id === id) ?? null;
  });

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const list = this.charactersSrv.characters();
    if (!term) return list;
    return list.filter((c) =>
      `${c.name} ${c.role ?? ''} ${c.tags.join(' ')} ${c.description}`
        .toLowerCase()
        .includes(term),
    );
  });

  constructor() {
    const firstModel = this.imageModels()[0];
    if (firstModel) this.modelId.set(firstModel.id);
  }

  protected open(c: CharacterProfile) {
    this.selectedId.set(c.id);
    this.prompt.set('');
    this.multiAngle.set(false);
  }

  protected closeDetail() {
    this.selectedId.set(null);
  }

  protected createCharacter() {
    const created = this.charactersSrv.create({
      name: `New character ${this.charactersSrv.count() + 1}`,
      description: '',
      tags: [],
    });
    this.open(created);
  }

  protected deleteCharacter(c: CharacterProfile) {
    this.charactersSrv.remove(c.id);
    this.selectedId.set(null);
  }

  protected patch(id: string, patch: Partial<CharacterProfile>) {
    this.charactersSrv.update(id, patch);
  }

  protected patchTags(id: string, raw: string) {
    const tags = raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    this.charactersSrv.update(id, { tags });
  }

  protected setPrimary(characterId: string, imageId: string) {
    this.charactersSrv.setPrimaryImage(characterId, imageId);
  }

  protected removeImage(characterId: string, imageId: string) {
    this.charactersSrv.removeImage(characterId, imageId);
  }

  protected isAngleSelected(angle: CameraAngle) {
    return this.selectedAngles().includes(angle);
  }

  protected toggleAngle(angle: CameraAngle) {
    this.selectedAngles.update((list) =>
      list.includes(angle) ? list.filter((a) => a !== angle) : [...list, angle],
    );
  }

  protected angleLabel(angle: CameraAngle) {
    return CAMERA_ANGLE_PRESETS.find((a) => a.id === angle)?.label ?? angle;
  }

  protected heroBackground(c: CharacterProfile): string {
    const primary = c.images.find((i) => i.id === c.primaryImageId) ?? c.images[0];
    return primary ? `url(${primary.uri})` : '';
  }

  protected defaultPrompt(c: CharacterProfile): string {
    const bits = [
      c.name && `${c.name},`,
      c.age,
      c.gender,
      c.role && `(${c.role.toLowerCase()})`,
      c.description,
      c.wardrobe && `wearing ${c.wardrobe}`,
      'cinematic portrait, soft rim lighting, 35mm, photoreal',
    ].filter(Boolean);
    return bits.join(' ').replace(/\s+/g, ' ').trim() ||
      'cinematic portrait, soft rim lighting, 35mm, photoreal';
  }

  protected triggerUpload() {
    this.fileInput()?.nativeElement.click();
  }

  protected onFileSelected(event: Event, characterId: string) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') return;
        this.eligibilitySrv.check({ fileName: file.name, uri: result }).subscribe((verdict) => {
          if (verdict.verdict === 'blocked') {
            this.eligibilityNotice.set({
              fileName: file.name,
              verdict: verdict.verdict,
              summary: verdict.summary,
              fails: verdict.rules.filter((r) => r.severity === 'fail').map((r) => `${r.label} — ${r.detail}`),
              warns: verdict.rules.filter((r) => r.severity === 'warn').map((r) => `${r.label} — ${r.detail}`),
            });
            return;
          }
          if (verdict.verdict === 'warning') {
            this.eligibilityNotice.set({
              fileName: file.name,
              verdict: verdict.verdict,
              summary: verdict.summary,
              fails: [],
              warns: verdict.rules.filter((r) => r.severity === 'warn').map((r) => `${r.label} — ${r.detail}`),
            });
          }
          this.charactersSrv.addImageFromSource(characterId, {
            uri: result,
            prompt: file.name,
            provider: 'upload',
            model: 'local',
          });
        });
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  protected dismissEligibilityNotice() {
    this.eligibilityNotice.set(null);
  }

  protected editImage(characterId: string, img: CharacterImage) {
    const c = this.charactersSrv.get(characterId);
    const label = c ? `${c.name || 'Character'} — reference shot` : 'Character reference shot';
    this.editorBridge.open({
      sourceUri: img.uri,
      contextLabel: label,
      onApply: (newUri) => {
        this.charactersSrv.updateImage(characterId, img.id, { uri: newUri, thumbnail: newUri });
      },
    });
  }

  protected openAssetPicker() {
    this.assetPickerOpen.set(true);
  }

  protected closeAssetPicker() {
    this.assetPickerOpen.set(false);
  }

  protected useAsset(characterId: string, asset: Asset) {
    this.charactersSrv.addImageFromSource(characterId, {
      uri: asset.uri,
      thumbnail: asset.thumbnail,
      prompt: asset.prompt ?? asset.name,
      provider: asset.provider ?? asset.source,
      model: asset.model ?? 'library',
    });
    this.assetPickerOpen.set(false);
  }

  protected generate(c: CharacterProfile) {
    const model = this.imageModels().find((m) => m.id === this.modelId());
    if (!model || !this.prompt().trim()) return;
    this.generating.set(true);
    this.charactersSrv
      .generateImages({
        characterId: c.id,
        prompt: this.prompt().trim(),
        provider: model.provider,
        model: model.name,
        multiAngle: this.multiAngle(),
        angles: this.selectedAngles(),
      })
      .subscribe({
        next: () => this.generating.set(false),
        error: () => this.generating.set(false),
      });
  }
}
