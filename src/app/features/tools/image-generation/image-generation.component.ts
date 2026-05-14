import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AssetsService } from '../../../core/services/assets.service';
import { ModelsService } from '../../../core/services/models.service';
import {
  EligibilityResult,
  ImageEligibilityService,
} from '../../../core/services/image-eligibility.service';
import { AiModel, Asset } from '../../../core/models/contract.model';

type Mode = 'prompt' | 'prompt_plus_refs' | 'refs_only';

interface ReferenceImage {
  id: string;
  uri: string;
  name: string;
  source: 'upload' | 'asset';
  eligibility: EligibilityResult | null;
}

interface GeneratedImage {
  id: string;
  uri: string;
  status: 'queued' | 'rendering' | 'ready';
  prompt: string;
  model: string;
  saved: boolean;
}

const ASPECT_RATIOS: { value: string; label: string }[] = [
  { value: '1:1', label: '1:1' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '4:5', label: '4:5' },
  { value: '3:2', label: '3:2' },
  { value: '2.39:1', label: '2.39:1' },
];

const SAMPLE_OUTPUTS = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900',
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=900',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=900',
  'https://images.unsplash.com/photo-1493804714600-6edb1cd93080?w=900',
  'https://images.unsplash.com/photo-1502767089025-6572583495b4?w=900',
  'https://images.unsplash.com/photo-1546961342-1a2eebd99e1b?w=900',
];

@Component({
  selector: 'app-image-generation-tool',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      <a routerLink="/tools" class="btn ghost sm" style="margin-bottom: 0.5rem">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5l-5 5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to tools
      </a>
      <h1>Image generation</h1>
      <p class="muted" style="margin-top: 0.4rem; max-width: 64ch">
        Generate stills from a text prompt, reference images, or both. Pick the model that fits the look,
        add references from your asset library or local computer, and render up to 4 variations.
      </p>
    </header>

    <div class="layout">
      <section class="card panel">
        <div class="eyebrow">1 · Mode</div>
        <div class="row" style="gap: 0.4rem; flex-wrap: wrap; margin-top: 0.4rem">
          <button class="tab" type="button" [class.active]="mode() === 'prompt'" (click)="setMode('prompt')">From prompt</button>
          <button class="tab" type="button" [class.active]="mode() === 'prompt_plus_refs'" (click)="setMode('prompt_plus_refs')">Prompt + references</button>
          <button class="tab" type="button" [class.active]="mode() === 'refs_only'" (click)="setMode('refs_only')">References only</button>
        </div>

        @if (mode() !== 'prompt') {
          <div class="eyebrow" style="margin-top: 1rem">2 · Reference images</div>
          <p class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">
            Add up to {{ maxRefs }} images. Drop them from your computer or pick from the asset library.
          </p>

          <div class="ref-grid" style="margin-top: 0.6rem">
            @for (r of refs(); track r.id) {
              <div class="ref-tile" [class]="r.eligibility ? 'verdict-' + r.eligibility.verdict : ''">
                <div class="ref-thumb" [style.background-image]="'url(' + r.uri + ')'"></div>
                <div class="ref-meta">
                  <span class="ref-name">{{ r.name }}</span>
                  @if (r.eligibility; as e) {
                    <span class="chip" [class]="verdictTone(e.verdict)">{{ verdictLabel(e.verdict) }}</span>
                  } @else {
                    <span class="chip muted"><span class="loader-xs"></span> scanning</span>
                  }
                </div>
                <button class="ref-remove iconbtn" type="button" (click)="removeRef(r.id)" title="Remove">×</button>
              </div>
            }
            @if (refs().length < maxRefs) {
              <button class="ref-add" type="button" (click)="triggerUpload()">
                <div style="font-size: 1.4rem">+</div>
                <span>Upload</span>
              </button>
              <button class="ref-add" type="button" (click)="openAssetPicker()">
                <div style="font-size: 1.4rem">🗂</div>
                <span>From assets</span>
              </button>
            }
          </div>

          <input
            #fileInput
            type="file"
            accept="image/*"
            multiple
            hidden
            (change)="onFileSelected($event)"
          />

          @if (anyRefBlocked()) {
            <div class="warn-banner">
              <strong>⚠ One or more references failed eligibility.</strong>
              <div class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">
                Generation is blocked until you remove or replace flagged images.
              </div>
            </div>
          }
        }

        @if (mode() !== 'refs_only') {
          <div class="eyebrow" style="margin-top: 1rem">{{ mode() === 'prompt' ? '2' : '3' }} · Prompt</div>
          <textarea
            rows="4"
            [ngModel]="prompt()"
            (ngModelChange)="prompt.set($event)"
            placeholder="A neon-lit alley at night, cinematic 35mm, soft rim light, atmospheric haze"
          ></textarea>

          <label class="field" style="margin-top: 0.6rem">Negative prompt <span class="muted" style="font-size: 0.72rem">(optional)</span></label>
          <input
            [ngModel]="negativePrompt()"
            (ngModelChange)="negativePrompt.set($event)"
            placeholder="no text, no watermark, no distorted hands"
          />
        }

        <div class="eyebrow" style="margin-top: 1rem">{{ stepNumber('model') }} · Model</div>
        <select [ngModel]="modelId()" (ngModelChange)="modelId.set($event)" style="margin-top: 0.4rem">
          @for (m of imageModels(); track m.id) {
            <option [value]="m.id">{{ m.provider }} · {{ m.name }} — {{ m.speed }} · {{ m.costPerUnit }}/{{ m.unit }}</option>
          }
        </select>
        @if (selectedModel(); as m) {
          <p class="muted" style="font-size: 0.78rem; margin-top: 0.35rem">{{ m.description }}</p>
        }

        <div class="grid-2" style="margin-top: 1rem">
          <div>
            <div class="eyebrow">{{ stepNumber('aspect') }} · Aspect ratio</div>
            <div class="chip-grid compact" style="margin-top: 0.4rem">
              @for (a of aspectRatios; track a.value) {
                <button
                  type="button"
                  class="opt-chip sm"
                  [class.active]="aspectRatio() === a.value"
                  (click)="aspectRatio.set(a.value)"
                >{{ a.label }}</button>
              }
            </div>
          </div>
          <div>
            <div class="eyebrow">{{ stepNumber('count') }} · Variations</div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              [ngModel]="count()"
              (ngModelChange)="count.set(+$event)"
              style="width: 100%; margin-top: 0.4rem"
            />
            <div class="row" style="justify-content: space-between; font-size: 0.78rem; color: var(--text-3)">
              <span>1</span>
              <span class="mono">{{ count() }}</span>
              <span>4</span>
            </div>
          </div>
        </div>

        <button
          class="btn primary"
          style="margin-top: 1rem; width: 100%"
          (click)="generate()"
          [disabled]="!canGenerate() || running()"
        >
          @if (running()) { Rendering {{ count() }} image{{ count() === 1 ? '' : 's' }}… }
          @else { Generate {{ count() }} image{{ count() === 1 ? '' : 's' }} }
        </button>

        @if (estimatedCost(); as c) {
          <div class="muted" style="font-size: 0.78rem; text-align: center; margin-top: 0.4rem">
            Estimated cost: <span class="mono">{{ c }}</span>
          </div>
        }
      </section>

      <section class="card panel results-panel">
        <div class="row" style="justify-content: space-between; align-items: flex-start">
          <div>
            <div class="eyebrow">Output</div>
            <h2 style="margin-top: 0.3rem; font-size: 1.15rem">Generated images</h2>
          </div>
          @if (results().length > 0) {
            <button class="btn ghost sm" type="button" (click)="clearResults()">Clear</button>
          }
        </div>

        @if (results().length === 0) {
          <div class="empty">
            <div style="font-size: 1.6rem">🖼️</div>
            <div style="font-family: var(--font-display); font-weight: 600">No images yet</div>
            <p class="muted" style="font-size: 0.85rem">Configure the panel on the left and hit Generate.</p>
          </div>
        } @else {
          <div class="results-grid" [attr.data-count]="results().length">
            @for (r of results(); track r.id) {
              <div class="result-tile">
                <div class="result-thumb" [style.background-image]="'url(' + r.uri + ')'">
                  @if (r.status !== 'ready') {
                    <div class="result-overlay">
                      <span class="loader"></span>
                      <span>{{ r.status }}</span>
                    </div>
                  }
                </div>
                <div class="result-actions">
                  <button class="btn sm" type="button" (click)="saveToAssets(r)" [disabled]="r.saved || r.status !== 'ready'">
                    @if (r.saved) { ✓ In library } @else { Save to library }
                  </button>
                  <button class="iconbtn" type="button" (click)="useAsReference(r)" [disabled]="r.status !== 'ready'" title="Use as reference">↻</button>
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
            <strong style="font-family: var(--font-display); font-size: 1.05rem">Pick reference images</strong>
            <button class="iconbtn" type="button" (click)="closeAssetPicker()">×</button>
          </div>
          @if (imageAssets().length === 0) {
            <div class="muted" style="padding: 1rem 0; text-align: center">
              No image assets in your library yet. Upload from your computer or generate one first.
            </div>
          } @else {
            <div class="picker-grid">
              @for (a of imageAssets(); track a.id) {
                <button class="picker-item" type="button" (click)="addRefFromAsset(a)">
                  <div class="picker-thumb" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'"></div>
                  <div class="picker-name">{{ a.name }}</div>
                </button>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host { display: block; }
      .layout {
        display: grid;
        grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
        gap: 1rem;
        margin-top: 1.2rem;
      }
      @media (max-width: 1080px) { .layout { grid-template-columns: 1fr; } }
      .panel { padding: 1.1rem; }
      .results-panel { min-height: 480px; display: flex; flex-direction: column; }

      .tab {
        padding: 0.4rem 0.8rem;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.03);
        color: var(--text-2);
        cursor: pointer;
        font-size: 0.78rem;
      }
      .tab.active {
        background: var(--grad-primary);
        color: white;
        border-color: transparent;
        box-shadow: 0 4px 18px rgba(139, 92, 246, 0.3);
      }

      .ref-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        gap: 0.5rem;
      }
      .ref-tile {
        position: relative;
        border: 1px solid var(--border);
        border-radius: 10px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.025);
        display: flex;
        flex-direction: column;
      }
      .ref-tile.verdict-blocked { border-color: rgba(251, 113, 133, 0.55); }
      .ref-tile.verdict-warning { border-color: rgba(251, 191, 36, 0.5); }
      .ref-tile.verdict-allowed { border-color: rgba(52, 211, 153, 0.45); }
      .ref-thumb {
        aspect-ratio: 1 / 1;
        background-size: cover;
        background-position: center;
        background-color: rgba(255, 255, 255, 0.04);
      }
      .ref-meta {
        padding: 0.35rem 0.45rem;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      .ref-name {
        font-size: 0.72rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ref-remove {
        position: absolute;
        top: 0.35rem;
        right: 0.35rem;
        background: rgba(5, 6, 19, 0.8);
        backdrop-filter: blur(6px);
      }
      .ref-add {
        aspect-ratio: 1 / 1;
        border: 1.5px dashed var(--border-strong);
        border-radius: 10px;
        background: transparent;
        color: var(--text-2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.2rem;
        font-size: 0.74rem;
        cursor: pointer;
        transition: background 0.15s, border-color 0.15s;
      }
      .ref-add:hover { background: rgba(139, 92, 246, 0.06); border-color: var(--neon-violet); color: var(--text-1); }

      .warn-banner {
        margin-top: 0.7rem;
        padding: 0.55rem 0.7rem;
        border-radius: 8px;
        border: 1px solid rgba(251, 113, 133, 0.5);
        background: rgba(251, 113, 133, 0.08);
        font-size: 0.82rem;
      }

      .chip-grid.compact {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 0.35rem;
      }
      .opt-chip {
        padding: 0.4rem 0.6rem;
        border-radius: 8px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.025);
        color: var(--text-1);
        font-size: 0.78rem;
        cursor: pointer;
        text-align: center;
      }
      .opt-chip.active {
        border-color: var(--neon-violet);
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(34, 211, 238, 0.08));
      }

      .results-grid {
        display: grid;
        gap: 0.6rem;
        margin-top: 0.7rem;
        flex: 1;
      }
      .results-grid[data-count="1"] { grid-template-columns: 1fr; }
      .results-grid[data-count="2"] { grid-template-columns: repeat(2, 1fr); }
      .results-grid[data-count="3"] { grid-template-columns: repeat(3, 1fr); }
      .results-grid[data-count="4"] { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 720px) {
        .results-grid[data-count="2"],
        .results-grid[data-count="3"],
        .results-grid[data-count="4"] { grid-template-columns: 1fr; }
      }
      .result-tile {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        border: 1px solid var(--border);
        border-radius: 12px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.025);
      }
      .result-thumb {
        position: relative;
        aspect-ratio: 1 / 1;
        background-size: cover;
        background-position: center;
        background-color: rgba(255, 255, 255, 0.05);
      }
      .result-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        background: rgba(5, 6, 19, 0.65);
        color: var(--text-2);
        font-size: 0.8rem;
      }
      .result-actions {
        display: flex;
        gap: 0.4rem;
        padding: 0 0.55rem 0.55rem;
      }
      .result-actions .btn { flex: 1; }

      .empty {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 0.4rem;
        padding: 2rem 1rem;
        color: var(--text-2);
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(5, 6, 19, 0.78);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        padding: 1rem;
      }
      .modal {
        max-width: 720px;
        width: 100%;
        max-height: 80vh;
        overflow: auto;
        background: var(--bg-1);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 1rem 1.1rem;
      }
      .picker-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 0.55rem;
      }
      .picker-item {
        text-align: left;
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 10px;
        overflow: hidden;
        padding: 0;
        cursor: pointer;
        transition: border-color 0.15s;
      }
      .picker-item:hover { border-color: var(--neon-violet); }
      .picker-thumb {
        aspect-ratio: 1 / 1;
        background-size: cover;
        background-position: center;
        background-color: rgba(140, 160, 255, 0.1);
      }
      .picker-name {
        font-size: 0.76rem;
        padding: 0.4rem 0.55rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .chip.green { background: rgba(52, 211, 153, 0.15); color: var(--neon-green); }
      .chip.amber { background: rgba(251, 191, 36, 0.15); color: var(--neon-amber); }
      .chip.rose  { background: rgba(251, 113, 133, 0.15); color: var(--neon-rose); }
      .loader-xs {
        display: inline-block;
        width: 8px;
        height: 8px;
        border: 1.5px solid rgba(255, 255, 255, 0.2);
        border-top-color: var(--neon-cyan);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-right: 0.25rem;
        vertical-align: -1px;
      }
      .loader {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-top-color: var(--neon-cyan);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `,
  ],
})
export class ImageGenerationToolComponent {
  private readonly modelsSrv = inject(ModelsService);
  private readonly assetsSrv = inject(AssetsService);
  private readonly eligibilitySrv = inject(ImageEligibilityService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly maxRefs = 4;
  protected readonly aspectRatios = ASPECT_RATIOS;

  protected readonly mode = signal<Mode>('prompt');
  protected readonly prompt = signal('');
  protected readonly negativePrompt = signal('');
  protected readonly modelId = signal('');
  protected readonly aspectRatio = signal('1:1');
  protected readonly count = signal(2);
  protected readonly refs = signal<ReferenceImage[]>([]);
  protected readonly results = signal<GeneratedImage[]>([]);
  protected readonly running = signal(false);
  protected readonly assetPickerOpen = signal(false);

  protected readonly imageModels = computed<AiModel[]>(() =>
    this.modelsSrv.models().filter((m) => m.capability === 'text_to_image'),
  );

  protected readonly imageAssets = computed<Asset[]>(() =>
    this.assetsSrv.assets().filter((a) => a.type === 'image'),
  );

  protected readonly selectedModel = computed<AiModel | undefined>(() =>
    this.imageModels().find((m) => m.id === this.modelId()),
  );

  protected readonly estimatedCost = computed<string | null>(() => {
    const m = this.selectedModel();
    if (!m) return null;
    const total = m.costPerUnit * this.count();
    return `$${total.toFixed(2)} (${this.count()} × $${m.costPerUnit.toFixed(2)}/${m.unit})`;
  });

  protected readonly anyRefBlocked = computed(() =>
    this.refs().some((r) => r.eligibility?.verdict === 'blocked'),
  );

  protected readonly canGenerate = computed(() => {
    if (this.running()) return false;
    if (!this.modelId()) return false;
    if (this.anyRefBlocked()) return false;
    const m = this.mode();
    if (m === 'prompt') return this.prompt().trim().length > 0;
    if (m === 'prompt_plus_refs') return this.prompt().trim().length > 0 && this.refs().length > 0;
    return this.refs().length > 0; // refs_only
  });

  constructor() {
    const first = this.imageModels()[0];
    if (first) this.modelId.set(first.id);
  }

  protected setMode(m: Mode) {
    this.mode.set(m);
    if (m === 'prompt') this.refs.set([]);
  }

  protected stepNumber(field: 'model' | 'aspect' | 'count'): string {
    const base = this.mode() === 'prompt' ? 3 : this.mode() === 'refs_only' ? 3 : 4;
    const idx = { model: 0, aspect: 1, count: 2 }[field];
    return String(base + idx);
  }

  protected triggerUpload() { this.fileInput()?.nativeElement.click(); }

  protected onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    const slotsLeft = this.maxRefs - this.refs().length;
    files.slice(0, slotsLeft).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') return;
        const ref: ReferenceImage = {
          id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          uri: result,
          name: file.name,
          source: 'upload',
          eligibility: null,
        };
        this.refs.update((list) => [...list, ref]);
        this.eligibilitySrv.check({ fileName: file.name, uri: result }).subscribe((e) => {
          this.refs.update((list) =>
            list.map((r) => (r.id === ref.id ? { ...r, eligibility: e } : r)),
          );
        });
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  protected openAssetPicker() { this.assetPickerOpen.set(true); }
  protected closeAssetPicker() { this.assetPickerOpen.set(false); }

  protected addRefFromAsset(asset: Asset) {
    if (this.refs().length >= this.maxRefs) return;
    const ref: ReferenceImage = {
      id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      uri: asset.uri,
      name: asset.name,
      source: 'asset',
      eligibility: null,
    };
    this.refs.update((list) => [...list, ref]);
    this.eligibilitySrv.check({ fileName: asset.name, uri: asset.uri }).subscribe((e) => {
      this.refs.update((list) =>
        list.map((r) => (r.id === ref.id ? { ...r, eligibility: e } : r)),
      );
    });
    this.assetPickerOpen.set(false);
  }

  protected removeRef(id: string) {
    this.refs.update((list) => list.filter((r) => r.id !== id));
  }

  protected useAsReference(r: GeneratedImage) {
    if (this.refs().length >= this.maxRefs) return;
    const ref: ReferenceImage = {
      id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      uri: r.uri,
      name: `generated-${r.id.slice(-5)}.png`,
      source: 'asset',
      eligibility: null,
    };
    this.refs.update((list) => [...list, ref]);
    if (this.mode() === 'prompt') this.setMode('prompt_plus_refs');
  }

  protected verdictLabel(v: EligibilityResult['verdict']) {
    return { allowed: 'OK', warning: 'Warn', blocked: 'Blocked' }[v];
  }
  protected verdictTone(v: EligibilityResult['verdict']) {
    return { allowed: 'green', warning: 'amber', blocked: 'rose' }[v];
  }

  protected clearResults() {
    this.results.set([]);
  }

  protected generate() {
    if (!this.canGenerate()) return;
    const model = this.selectedModel();
    if (!model) return;
    const n = this.count();
    const now = Date.now();
    const seed = now;
    const queued: GeneratedImage[] = Array.from({ length: n }, (_, i) => ({
      id: `${now}-${i}`,
      uri: SAMPLE_OUTPUTS[(seed + i) % SAMPLE_OUTPUTS.length],
      status: 'queued',
      prompt: this.prompt().trim(),
      model: model.name,
      saved: false,
    }));
    this.results.set(queued);
    this.running.set(true);

    queued.forEach((item, i) => {
      setTimeout(() => {
        this.results.update((list) =>
          list.map((r) => (r.id === item.id ? { ...r, status: 'rendering' } : r)),
        );
      }, 200 + i * 140);
      setTimeout(() => {
        this.results.update((list) =>
          list.map((r) => (r.id === item.id ? { ...r, status: 'ready' } : r)),
        );
        if (i === queued.length - 1) this.running.set(false);
      }, 950 + i * 220);
    });
  }

  protected saveToAssets(r: GeneratedImage) {
    if (r.saved || r.status !== 'ready') return;
    const model = this.selectedModel();
    this.assetsSrv
      .generate({
        type: 'image',
        name: `generated-${r.id.slice(-6)}.png`,
        prompt: r.prompt || '(reference-based generation)',
        provider: model?.provider ?? 'unknown',
        model: model?.name ?? 'image-generation-tool',
      })
      .subscribe(() => {
        this.results.update((list) =>
          list.map((x) => (x.id === r.id ? { ...x, saved: true } : x)),
        );
      });
  }
}
