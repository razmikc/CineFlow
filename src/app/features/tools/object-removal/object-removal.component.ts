import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
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

type Mode = 'clean' | 'replace_prompt' | 'replace_image';

interface ReplaceReference {
  uri: string;
  name: string;
  source: 'upload' | 'asset';
  eligibility: EligibilityResult | null;
}

interface ResultImage {
  id: string;
  uri: string;
  status: 'queued' | 'rendering' | 'ready';
  saved: boolean;
}

const FILL_SAMPLES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900',
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=900',
];

@Component({
  selector: 'app-object-removal-tool',
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
      <h1>Object removal & replace</h1>
      <p class="muted" style="margin-top: 0.4rem; max-width: 64ch">
        Brush over anything you want gone, then either <strong>clean</strong> it out (content-aware fill)
        or <strong>replace</strong> it with what a text prompt describes — or with another reference image.
      </p>
    </header>

    <div class="layout">
      <section class="card panel canvas-panel">
        <div class="eyebrow">1 · Source image</div>
        @if (!sourceUri()) {
          <button class="dropzone" type="button" (click)="triggerSourceUpload()">
            <div style="font-size: 1.8rem">🖌</div>
            <strong>Upload an image to edit</strong>
            <span class="muted" style="font-size: 0.78rem">Brush the area you want to remove or replace</span>
          </button>
        } @else {
          <div class="canvas-wrap" #canvasWrap>
            <img class="src-img" #srcImg [src]="sourceUri()" alt="Source" (load)="onSourceLoaded()" />
            <canvas
              #maskCanvas
              class="mask-canvas"
              [class.painting]="painting()"
              (pointerdown)="onPointerDown($event)"
              (pointermove)="onPointerMove($event)"
              (pointerup)="onPointerUp($event)"
              (pointerleave)="onPointerUp($event)"
            ></canvas>
          </div>

          <div class="toolbar">
            <div class="toolbar-group">
              <button class="iconbtn" type="button" [class.active]="tool() === 'brush'" (click)="tool.set('brush')" title="Brush">
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3l3 3-9 9-3 1 1-3 8-10z" stroke-linejoin="round"/></svg>
              </button>
              <button class="iconbtn" type="button" [class.active]="tool() === 'eraser'" (click)="tool.set('eraser')" title="Eraser">
                <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 13 6-6 5 5-6 6H6l-2-2v-3z" stroke-linejoin="round"/></svg>
              </button>
            </div>
            <div class="toolbar-group">
              <span class="muted" style="font-size: 0.72rem">Size</span>
              <input
                type="range"
                min="6"
                max="80"
                step="2"
                [ngModel]="brushSize()"
                (ngModelChange)="brushSize.set(+$event)"
              />
              <span class="mono" style="font-size: 0.72rem; width: 24px; text-align: right">{{ brushSize() }}</span>
            </div>
            <div class="toolbar-group">
              <button class="btn ghost sm" type="button" (click)="clearMask()" [disabled]="!hasMask()">Clear mask</button>
              <button class="btn ghost sm" type="button" (click)="replaceSource()">Replace image</button>
            </div>
          </div>
        }
        <input #fileInput type="file" accept="image/*" hidden (change)="onSourceFile($event)" />

        @if (sourceEligibility(); as e) {
          <div class="elig" [class]="'verdict-' + e.verdict">
            <strong style="font-size: 0.82rem">{{ verdictLabel(e.verdict) }}</strong>
            <div class="muted" style="font-size: 0.76rem; margin-top: 0.2rem">{{ e.summary }}</div>
          </div>
        }
      </section>

      <section class="card panel">
        <div class="eyebrow">2 · What to do with the masked area</div>
        <div class="row" style="gap: 0.4rem; flex-wrap: wrap; margin-top: 0.4rem">
          <button class="tab" type="button" [class.active]="mode() === 'clean'" (click)="setMode('clean')">Clean (just remove)</button>
          <button class="tab" type="button" [class.active]="mode() === 'replace_prompt'" (click)="setMode('replace_prompt')">Replace by prompt</button>
          <button class="tab" type="button" [class.active]="mode() === 'replace_image'" (click)="setMode('replace_image')">Replace by image</button>
        </div>

        @if (mode() === 'replace_prompt') {
          <label class="field" style="margin-top: 1rem">Replacement prompt</label>
          <textarea
            rows="3"
            [ngModel]="prompt()"
            (ngModelChange)="prompt.set($event)"
            placeholder="e.g. a wooden park bench, matching lighting and shadow"
          ></textarea>
        }

        @if (mode() === 'replace_image') {
          <div class="eyebrow" style="margin-top: 1rem">Replacement reference</div>
          <p class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">
            The model will composite this image into the masked area, matching lighting and perspective.
          </p>
          @if (replaceRef(); as r) {
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
              <button class="ref-remove iconbtn" type="button" (click)="clearReplaceRef()" title="Remove">×</button>
            </div>
          } @else {
            <div class="row" style="gap: 0.4rem; margin-top: 0.5rem">
              <button class="btn sm" type="button" (click)="triggerRefUpload()">Upload image</button>
              <button class="btn sm" type="button" (click)="openAssetPicker()">From assets</button>
            </div>
            <input #refInput type="file" accept="image/*" hidden (change)="onRefFile($event)" />
          }

          <label class="field" style="margin-top: 0.7rem">Composition hints <span class="muted" style="font-size: 0.72rem">(optional)</span></label>
          <input
            [ngModel]="prompt()"
            (ngModelChange)="prompt.set($event)"
            placeholder="e.g. blend lighting, match shadows on left, soft edges"
          />
        }

        <div class="eyebrow" style="margin-top: 1rem">3 · Model</div>
        <select [ngModel]="modelId()" (ngModelChange)="modelId.set($event)" style="margin-top: 0.4rem">
          @for (m of availableModels(); track m.id) {
            <option [value]="m.id">{{ m.provider }} · {{ m.name }} — {{ m.speed }} · {{ m.costPerUnit }}/{{ m.unit }}</option>
          }
        </select>
        @if (selectedModel(); as m) {
          <p class="muted" style="font-size: 0.78rem; margin-top: 0.35rem">{{ m.description }}</p>
        }

        <div class="eyebrow" style="margin-top: 1rem">4 · Variations</div>
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

        <button
          class="btn primary"
          style="margin-top: 1rem; width: 100%"
          (click)="generate()"
          [disabled]="!canGenerate() || running()"
        >
          @if (running()) { Rendering {{ count() }}… }
          @else { {{ mode() === 'clean' ? 'Erase masked area' : 'Replace masked area' }} ({{ count() }}) }
        </button>

        @if (!sourceUri()) {
          <div class="muted" style="font-size: 0.78rem; text-align: center; margin-top: 0.4rem">Upload an image to begin.</div>
        } @else if (!hasMask()) {
          <div class="muted" style="font-size: 0.78rem; text-align: center; margin-top: 0.4rem">Paint over the area to remove or replace.</div>
        }
      </section>
    </div>

    @if (results().length > 0) {
      <section style="margin-top: 1.4rem">
        <div class="row" style="justify-content: space-between; margin-bottom: 0.6rem">
          <div>
            <div class="eyebrow">Output</div>
            <h2 style="margin-top: 0.3rem; font-size: 1.15rem">Results</h2>
          </div>
          <button class="btn ghost sm" type="button" (click)="clearResults()">Clear</button>
        </div>
        <div class="results-grid">
          @for (r of results(); track r.id) {
            <div class="result-tile card">
              <div class="result-thumb" [style.background-image]="'url(' + r.uri + ')'">
                @if (r.status !== 'ready') {
                  <div class="result-overlay"><span class="loader"></span><span>{{ r.status }}</span></div>
                }
              </div>
              <div class="result-actions">
                <button class="btn sm" type="button" (click)="saveToAssets(r)" [disabled]="r.saved || r.status !== 'ready'">
                  @if (r.saved) { ✓ In library } @else { Save to library }
                </button>
                <button class="iconbtn" type="button" (click)="useAsSource(r)" [disabled]="r.status !== 'ready'" title="Use as source for next edit">↻</button>
              </div>
            </div>
          }
        </div>
      </section>
    }

    @if (assetPickerOpen()) {
      <div class="modal-backdrop" (click)="closeAssetPicker()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="row" style="justify-content: space-between; margin-bottom: 0.6rem">
            <strong style="font-family: var(--font-display); font-size: 1.05rem">Pick replacement reference</strong>
            <button class="iconbtn" type="button" (click)="closeAssetPicker()">×</button>
          </div>
          @if (imageAssets().length === 0) {
            <div class="muted" style="padding: 1rem 0; text-align: center">
              No image assets in your library yet.
            </div>
          } @else {
            <div class="picker-grid">
              @for (a of imageAssets(); track a.id) {
                <button class="picker-item" type="button" (click)="useAssetAsRef(a)">
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
        grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
        gap: 1rem;
        margin-top: 1.2rem;
        align-items: start;
      }
      @media (max-width: 1080px) { .layout { grid-template-columns: 1fr; } }
      .panel { padding: 1.1rem; }
      .canvas-panel { min-height: 480px; }

      .dropzone {
        margin-top: 0.7rem;
        width: 100%;
        height: 360px;
        background: rgba(255, 255, 255, 0.02);
        border: 1.5px dashed var(--border-strong);
        border-radius: 14px;
        color: var(--text-2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        cursor: pointer;
      }
      .dropzone:hover { background: rgba(139, 92, 246, 0.06); border-color: var(--neon-violet); }

      .canvas-wrap {
        position: relative;
        margin-top: 0.7rem;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid var(--border);
        border-radius: 14px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .src-img {
        display: block;
        max-width: 100%;
        max-height: 60vh;
        height: auto;
        width: auto;
        user-select: none;
        pointer-events: none;
      }
      .mask-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        cursor: crosshair;
        touch-action: none;
      }
      .mask-canvas.painting { cursor: cell; }

      .toolbar {
        display: flex;
        gap: 0.8rem;
        flex-wrap: wrap;
        align-items: center;
        margin-top: 0.7rem;
        padding: 0.55rem 0.7rem;
        background: rgba(255, 255, 255, 0.025);
        border: 1px solid var(--border);
        border-radius: 10px;
      }
      .toolbar-group {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
      .toolbar .iconbtn.active {
        background: var(--grad-primary);
        color: white;
        border-color: transparent;
      }
      .toolbar input[type='range'] { width: 130px; }

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

      .ref-tile {
        position: relative;
        margin-top: 0.6rem;
        border: 1px solid var(--border);
        border-radius: 10px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.025);
        display: grid;
        grid-template-columns: 120px 1fr;
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
        padding: 0.55rem 0.7rem;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        justify-content: center;
      }
      .ref-name {
        font-size: 0.82rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ref-remove {
        position: absolute;
        top: 0.4rem;
        right: 0.4rem;
        background: rgba(5, 6, 19, 0.8);
        backdrop-filter: blur(6px);
      }

      .elig {
        margin-top: 0.7rem;
        padding: 0.55rem 0.7rem;
        border-radius: 10px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.03);
      }
      .elig.verdict-blocked { border-color: rgba(251, 113, 133, 0.5); background: rgba(251, 113, 133, 0.08); }
      .elig.verdict-warning { border-color: rgba(251, 191, 36, 0.45); background: rgba(251, 191, 36, 0.08); }
      .elig.verdict-allowed { border-color: rgba(52, 211, 153, 0.45); background: rgba(52, 211, 153, 0.08); }

      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 0.7rem;
      }
      .result-tile { padding: 0; overflow: hidden; }
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
        padding: 0.55rem 0.7rem;
      }
      .result-actions .btn { flex: 1; }

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
export class ObjectRemovalToolComponent implements AfterViewInit {
  private readonly modelsSrv = inject(ModelsService);
  private readonly assetsSrv = inject(AssetsService);
  private readonly eligibilitySrv = inject(ImageEligibilityService);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly refInput = viewChild<ElementRef<HTMLInputElement>>('refInput');
  private readonly canvasWrap = viewChild<ElementRef<HTMLDivElement>>('canvasWrap');
  private readonly srcImg = viewChild<ElementRef<HTMLImageElement>>('srcImg');
  private readonly maskCanvas = viewChild<ElementRef<HTMLCanvasElement>>('maskCanvas');

  protected readonly sourceUri = signal<string | null>(null);
  protected readonly sourceName = signal<string | null>(null);
  protected readonly sourceEligibility = signal<EligibilityResult | null>(null);
  protected readonly mode = signal<Mode>('clean');
  protected readonly prompt = signal('');
  protected readonly modelId = signal('');
  protected readonly count = signal(2);
  protected readonly tool = signal<'brush' | 'eraser'>('brush');
  protected readonly brushSize = signal(28);
  protected readonly painting = signal(false);
  protected readonly hasMask = signal(false);
  protected readonly replaceRef = signal<ReplaceReference | null>(null);
  protected readonly results = signal<ResultImage[]>([]);
  protected readonly running = signal(false);
  protected readonly assetPickerOpen = signal(false);

  private lastPoint: { x: number; y: number } | null = null;

  protected readonly availableModels = computed<AiModel[]>(() => {
    const all = this.modelsSrv.models();
    const preferred = this.mode() === 'clean' ? 'remove_object' : 'inpaint';
    const primary = all.filter((m) => m.capability === preferred);
    const secondary = all.filter((m) =>
      preferred === 'remove_object' ? m.capability === 'inpaint' : m.capability === 'remove_object',
    );
    return [...primary, ...secondary];
  });

  protected readonly selectedModel = computed<AiModel | undefined>(() =>
    this.availableModels().find((m) => m.id === this.modelId()),
  );

  protected readonly imageAssets = computed<Asset[]>(() =>
    this.assetsSrv.assets().filter((a) => a.type === 'image'),
  );

  protected readonly canGenerate = computed(() => {
    if (this.running()) return false;
    if (!this.sourceUri() || !this.hasMask()) return false;
    if (this.sourceEligibility()?.verdict === 'blocked') return false;
    if (!this.modelId()) return false;
    if (this.mode() === 'replace_prompt' && !this.prompt().trim()) return false;
    if (this.mode() === 'replace_image') {
      const r = this.replaceRef();
      if (!r || r.eligibility?.verdict === 'blocked') return false;
    }
    return true;
  });

  constructor() {
    effect(() => {
      // Auto-pick the first available model whenever the mode changes
      const first = this.availableModels()[0];
      if (first && !this.availableModels().some((m) => m.id === this.modelId())) {
        this.modelId.set(first.id);
      }
    });
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }

  protected triggerSourceUpload() { this.fileInput()?.nativeElement.click(); }
  protected triggerRefUpload() { this.refInput()?.nativeElement.click(); }
  protected replaceSource() { this.triggerSourceUpload(); }

  protected onSourceFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;
      this.sourceUri.set(result);
      this.sourceName.set(file.name);
      this.sourceEligibility.set(null);
      this.hasMask.set(false);
      this.eligibilitySrv.check({ fileName: file.name, uri: result }).subscribe((e) => {
        this.sourceEligibility.set(e);
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  protected onRefFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;
      const ref: ReplaceReference = {
        uri: result,
        name: file.name,
        source: 'upload',
        eligibility: null,
      };
      this.replaceRef.set(ref);
      this.eligibilitySrv.check({ fileName: file.name, uri: result }).subscribe((e) => {
        this.replaceRef.update((r) => (r ? { ...r, eligibility: e } : r));
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  protected onSourceLoaded() {
    this.resizeCanvas();
  }

  private resizeCanvas() {
    const img = this.srcImg()?.nativeElement;
    const canvas = this.maskCanvas()?.nativeElement;
    if (!img || !canvas) return;
    const rect = img.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const oldImage = canvas.width > 0 ? this.snapshotCanvas() : null;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx && oldImage) ctx.putImageData(oldImage, 0, 0);
  }

  private snapshotCanvas(): ImageData | null {
    const canvas = this.maskCanvas()?.nativeElement;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  protected onPointerDown(e: PointerEvent) {
    if (!this.sourceUri()) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    this.painting.set(true);
    this.lastPoint = this.toCanvasCoords(e);
    this.paintDot(this.lastPoint);
  }

  protected onPointerMove(e: PointerEvent) {
    if (!this.painting() || !this.lastPoint) return;
    const p = this.toCanvasCoords(e);
    this.paintLine(this.lastPoint, p);
    this.lastPoint = p;
  }

  protected onPointerUp(e: PointerEvent) {
    if (!this.painting()) return;
    this.painting.set(false);
    this.lastPoint = null;
    this.updateHasMask();
    if (e.pointerId !== undefined && (e.target as Element).hasPointerCapture?.(e.pointerId)) {
      (e.target as Element).releasePointerCapture(e.pointerId);
    }
  }

  private toCanvasCoords(e: PointerEvent): { x: number; y: number } {
    const canvas = this.maskCanvas()!.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  private paintDot(p: { x: number; y: number }) {
    const canvas = this.maskCanvas()?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const r = (this.brushSize() / 2) * dpr;
    ctx.globalCompositeOperation = this.tool() === 'eraser' ? 'destination-out' : 'source-over';
    ctx.fillStyle = 'rgba(236, 72, 153, 0.55)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  private paintLine(a: { x: number; y: number }, b: { x: number; y: number }) {
    const canvas = this.maskCanvas()?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.globalCompositeOperation = this.tool() === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.55)';
    ctx.lineWidth = this.brushSize() * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  private updateHasMask() {
    const canvas = this.maskCanvas()?.nativeElement;
    if (!canvas) { this.hasMask.set(false); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) { this.hasMask.set(false); return; }
    // Cheap heuristic: sample a scaled-down version of the alpha channel.
    const w = 32, h = 32;
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const offCtx = off.getContext('2d');
    if (!offCtx) { this.hasMask.set(false); return; }
    offCtx.drawImage(canvas, 0, 0, w, h);
    const data = offCtx.getImageData(0, 0, w, h).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 8) { this.hasMask.set(true); return; }
    }
    this.hasMask.set(false);
  }

  protected clearMask() {
    const canvas = this.maskCanvas()?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.hasMask.set(false);
  }

  protected setMode(m: Mode) {
    this.mode.set(m);
    if (m !== 'replace_image') this.clearReplaceRef();
  }

  protected clearReplaceRef() { this.replaceRef.set(null); }

  protected openAssetPicker() { this.assetPickerOpen.set(true); }
  protected closeAssetPicker() { this.assetPickerOpen.set(false); }

  protected useAssetAsRef(asset: Asset) {
    const ref: ReplaceReference = {
      uri: asset.uri,
      name: asset.name,
      source: 'asset',
      eligibility: null,
    };
    this.replaceRef.set(ref);
    this.eligibilitySrv.check({ fileName: asset.name, uri: asset.uri }).subscribe((e) => {
      this.replaceRef.update((r) => (r ? { ...r, eligibility: e } : r));
    });
    this.assetPickerOpen.set(false);
  }

  protected verdictLabel(v: EligibilityResult['verdict']) {
    return { allowed: 'OK', warning: 'Warn', blocked: 'Blocked' }[v];
  }
  protected verdictTone(v: EligibilityResult['verdict']) {
    return { allowed: 'green', warning: 'amber', blocked: 'rose' }[v];
  }

  protected clearResults() { this.results.set([]); }

  protected generate() {
    if (!this.canGenerate()) return;
    const n = this.count();
    const now = Date.now();
    const queued: ResultImage[] = Array.from({ length: n }, (_, i) => ({
      id: `${now}-${i}`,
      uri: this.mode() === 'replace_image' && this.replaceRef()
        ? this.replaceRef()!.uri
        : FILL_SAMPLES[(now + i) % FILL_SAMPLES.length],
      status: 'queued',
      saved: false,
    }));
    // Use the source image as the visual fallback so the result looks like an edit of it
    const src = this.sourceUri();
    if (src) queued.forEach((q, i) => (q.uri = i === 0 ? src : q.uri));
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

  protected saveToAssets(r: ResultImage) {
    if (r.saved || r.status !== 'ready') return;
    const model = this.selectedModel();
    const promptText = this.mode() === 'clean'
      ? '(object removal — masked area cleaned)'
      : this.mode() === 'replace_prompt'
        ? `(replace) ${this.prompt().trim()}`
        : '(replace with reference image)';
    this.assetsSrv
      .generate({
        type: 'image',
        name: `edited-${r.id.slice(-6)}.png`,
        prompt: promptText,
        provider: model?.provider ?? 'unknown',
        model: model?.name ?? 'object-removal-tool',
      })
      .subscribe(() => {
        this.results.update((list) =>
          list.map((x) => (x.id === r.id ? { ...x, saved: true } : x)),
        );
      });
  }

  protected useAsSource(r: ResultImage) {
    if (r.status !== 'ready') return;
    this.sourceUri.set(r.uri);
    this.sourceName.set(`edited-${r.id.slice(-6)}.png`);
    this.clearMask();
    this.results.set([]);
  }
}
