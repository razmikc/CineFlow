import {
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
import { AiModel } from '../../../core/models/contract.model';

type AspectKey = '1:1' | '16:9' | '9:16' | '4:5' | '2.39:1' | '4:3' | 'free';
type HandleKind = 'move' | 'tl' | 't' | 'tr' | 'r' | 'br' | 'b' | 'bl' | 'l';

interface ResultImage {
  id: string;
  uri: string;
  status: 'queued' | 'rendering' | 'ready';
  saved: boolean;
}

const ASPECTS: { key: AspectKey; label: string; ratio: number | null }[] = [
  { key: '1:1', label: '1:1', ratio: 1 },
  { key: '16:9', label: '16:9', ratio: 16 / 9 },
  { key: '9:16', label: '9:16', ratio: 9 / 16 },
  { key: '4:5', label: '4:5', ratio: 4 / 5 },
  { key: '2.39:1', label: '2.39:1', ratio: 2.39 },
  { key: '4:3', label: '4:3', ratio: 4 / 3 },
  { key: 'free', label: 'Free', ratio: null },
];

const FILL_SAMPLES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200',
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200',
];

@Component({
  selector: 'app-image-expand-tool',
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
      <h1>Image expand</h1>
      <p class="muted" style="margin-top: 0.4rem; max-width: 66ch">
        Resize the canvas — anchor the existing image where you want it and let the AI generate the
        rest. Works in both directions: shrink your image inside a bigger canvas, or extend the canvas
        beyond the original frame.
      </p>
    </header>

    <div class="layout">
      <section class="card panel canvas-panel">
        <div class="eyebrow">1 · Source image</div>
        @if (!sourceUri()) {
          <button class="dropzone" type="button" (click)="triggerUpload()">
            <div style="font-size: 1.8rem">📐</div>
            <strong>Upload an image to expand</strong>
            <span class="muted" style="font-size: 0.78rem">Any aspect — you'll set the target canvas next</span>
          </button>
        } @else {
          <div class="canvas-stage" #stage [style.aspect-ratio]="stageAspect()">
            <div class="canvas-grid"></div>
            <div
              class="canvas-image"
              [style.background-image]="'url(' + sourceUri() + ')'"
              [style.left.%]="imageLeftPct()"
              [style.top.%]="imageTopPct()"
              [style.width.%]="imageWidthPct()"
              [style.height.%]="imageHeightPct()"
              (pointerdown)="onPointerDown($event, 'move')"
            >
              <span class="handle tl" (pointerdown)="onPointerDown($event, 'tl')"></span>
              <span class="handle t"  (pointerdown)="onPointerDown($event, 't')"></span>
              <span class="handle tr" (pointerdown)="onPointerDown($event, 'tr')"></span>
              <span class="handle r"  (pointerdown)="onPointerDown($event, 'r')"></span>
              <span class="handle br" (pointerdown)="onPointerDown($event, 'br')"></span>
              <span class="handle b"  (pointerdown)="onPointerDown($event, 'b')"></span>
              <span class="handle bl" (pointerdown)="onPointerDown($event, 'bl')"></span>
              <span class="handle l"  (pointerdown)="onPointerDown($event, 'l')"></span>
            </div>
            <div class="canvas-outline"></div>
          </div>

          <div class="toolbar">
            <button class="btn ghost sm" type="button" (click)="fitInCanvas()">Fit</button>
            <button class="btn ghost sm" type="button" (click)="fillCanvas()">Fill</button>
            <button class="btn ghost sm" type="button" (click)="centerImage()">Center</button>
            <button class="btn ghost sm" type="button" (click)="triggerUpload()">Replace image</button>
            <span class="muted" style="font-size: 0.78rem; margin-left: auto">
              {{ readout() }}
            </span>
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
        <div class="eyebrow">2 · Target canvas aspect</div>
        <div class="chip-grid compact" style="margin-top: 0.4rem">
          @for (a of aspects; track a.key) {
            <button
              type="button"
              class="opt-chip sm"
              [class.active]="aspect() === a.key"
              (click)="setAspect(a.key)"
            >{{ a.label }}</button>
          }
        </div>

        @if (aspect() === 'free') {
          <div class="grid-2" style="margin-top: 0.6rem">
            <label class="field">
              Width <span class="muted" style="font-size: 0.72rem">px</span>
              <input type="number" min="64" max="4096" step="16" [ngModel]="freeWidth()" (ngModelChange)="freeWidth.set(+$event)"/>
            </label>
            <label class="field">
              Height <span class="muted" style="font-size: 0.72rem">px</span>
              <input type="number" min="64" max="4096" step="16" [ngModel]="freeHeight()" (ngModelChange)="freeHeight.set(+$event)"/>
            </label>
          </div>
        }

        <div class="eyebrow" style="margin-top: 1rem">3 · Position & size</div>
        <p class="muted" style="font-size: 0.76rem; margin-top: 0.2rem">
          Drag the image inside the canvas to reposition. Drag the corner or edge handles to resize.
          Empty space around the image is what the AI will fill.
        </p>

        <label class="field" style="margin-top: 1rem">4 · Fill prompt <span class="muted" style="font-size: 0.72rem">(optional)</span></label>
        <textarea
          rows="3"
          [ngModel]="prompt()"
          (ngModelChange)="prompt.set($event)"
          placeholder="What should appear in the new area? e.g. continue the sunset sky, extend the forest to the left"
        ></textarea>

        <div class="eyebrow" style="margin-top: 1rem">5 · Model</div>
        <select [ngModel]="modelId()" (ngModelChange)="modelId.set($event)" style="margin-top: 0.4rem">
          @for (m of availableModels(); track m.id) {
            <option [value]="m.id">{{ m.provider }} · {{ m.name }} — {{ m.speed }} · {{ m.costPerUnit }}/{{ m.unit }}</option>
          }
        </select>
        @if (selectedModel(); as m) {
          <p class="muted" style="font-size: 0.78rem; margin-top: 0.35rem">{{ m.description }}</p>
        }

        <div class="eyebrow" style="margin-top: 1rem">6 · Variations</div>
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
          <span>1</span><span class="mono">{{ count() }}</span><span>4</span>
        </div>

        <button
          class="btn primary"
          style="margin-top: 1rem; width: 100%"
          (click)="generate()"
          [disabled]="!canGenerate() || running()"
        >
          @if (running()) { Generating {{ count() }} expansion{{ count() === 1 ? '' : 's' }}… }
          @else { Expand image ({{ count() }}) }
        </button>

        @if (!sourceUri()) {
          <div class="muted" style="font-size: 0.78rem; text-align: center; margin-top: 0.4rem">Upload an image to begin.</div>
        } @else if (!hasFillArea()) {
          <div class="muted" style="font-size: 0.78rem; text-align: center; margin-top: 0.4rem">
            The image fully covers the canvas — there's nothing to fill. Shrink it or pick a different aspect.
          </div>
        }
      </section>
    </div>

    @if (results().length > 0) {
      <section style="margin-top: 1.4rem">
        <div class="row" style="justify-content: space-between; margin-bottom: 0.6rem">
          <div>
            <div class="eyebrow">Output</div>
            <h2 style="margin-top: 0.3rem; font-size: 1.15rem">Expanded results</h2>
          </div>
          <button class="btn ghost sm" type="button" (click)="clearResults()">Clear</button>
        </div>
        <div class="results-grid" [style.aspect-ratio]="stageAspect()">
          @for (r of results(); track r.id) {
            <div class="result-tile card" [style.aspect-ratio]="stageAspect()">
              <div class="result-thumb" [style.background-image]="'url(' + r.uri + ')'">
                @if (r.status !== 'ready') {
                  <div class="result-overlay"><span class="loader"></span><span>{{ r.status }}</span></div>
                }
              </div>
              <div class="result-actions">
                <button class="btn sm" type="button" (click)="saveToAssets(r)" [disabled]="r.saved || r.status !== 'ready'">
                  @if (r.saved) { ✓ In library } @else { Save to library }
                </button>
                <button class="iconbtn" type="button" (click)="useAsSource(r)" [disabled]="r.status !== 'ready'" title="Use as source for next expand">↻</button>
              </div>
            </div>
          }
        </div>
      </section>
    }
  `,
  styles: [
    `
      :host { display: block; }
      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
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
      .dropzone:hover { background: rgba(34, 211, 238, 0.06); border-color: var(--neon-cyan); }

      .canvas-stage {
        position: relative;
        margin-top: 0.7rem;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid var(--border);
        border-radius: 14px;
        overflow: hidden;
        max-height: 60vh;
        width: 100%;
      }
      .canvas-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(45deg, rgba(255,255,255,0.045) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(255,255,255,0.045) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.045) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.045) 75%);
        background-size: 18px 18px;
        background-position: 0 0, 0 9px, 9px -9px, -9px 0;
      }
      .canvas-image {
        position: absolute;
        background-size: cover;
        background-position: center;
        border: 1.5px solid var(--neon-cyan);
        box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.25), 0 6px 24px rgba(0, 0, 0, 0.45);
        max-width: none;
        cursor: move;
        touch-action: none;
        user-select: none;
      }
      .canvas-outline {
        position: absolute;
        inset: 0;
        border: 1.5px dashed rgba(255, 255, 255, 0.18);
        border-radius: 12px;
        pointer-events: none;
      }
      /* 8 handles around the image — corners + edge midpoints */
      .handle {
        position: absolute;
        width: 12px;
        height: 12px;
        background: var(--neon-cyan);
        border: 1.5px solid rgba(5, 6, 19, 0.85);
        border-radius: 2px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
        touch-action: none;
      }
      .handle.tl { top: -6px;  left: -6px;  cursor: nwse-resize; }
      .handle.tr { top: -6px;  right: -6px; cursor: nesw-resize; }
      .handle.bl { bottom: -6px; left: -6px;  cursor: nesw-resize; }
      .handle.br { bottom: -6px; right: -6px; cursor: nwse-resize; }
      .handle.t  { top: -6px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
      .handle.b  { bottom: -6px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
      .handle.l  { left: -6px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }
      .handle.r  { right: -6px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }

      .toolbar {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
        align-items: center;
        margin-top: 0.7rem;
        padding: 0.55rem 0.7rem;
        background: rgba(255, 255, 255, 0.025);
        border: 1px solid var(--border);
        border-radius: 10px;
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
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 0.7rem;
        aspect-ratio: unset !important;
      }
      .result-tile { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
      .result-thumb {
        position: relative;
        flex: 1;
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
export class ImageExpandToolComponent {
  private readonly modelsSrv = inject(ModelsService);
  private readonly assetsSrv = inject(AssetsService);
  private readonly eligibilitySrv = inject(ImageEligibilityService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly stage = viewChild<ElementRef<HTMLDivElement>>('stage');

  protected readonly aspects = ASPECTS;

  protected readonly sourceUri = signal<string | null>(null);
  protected readonly sourceName = signal<string | null>(null);
  protected readonly sourceWidth = signal(0);
  protected readonly sourceHeight = signal(0);
  protected readonly sourceEligibility = signal<EligibilityResult | null>(null);

  protected readonly aspect = signal<AspectKey>('16:9');
  protected readonly freeWidth = signal(1024);
  protected readonly freeHeight = signal(1024);

  // Direct-manipulation rect — all percentages of the canvas stage.
  protected readonly imageLeftPct = signal(20);
  protected readonly imageTopPct = signal(20);
  protected readonly imageWidthPct = signal(60);

  protected readonly prompt = signal('');
  protected readonly modelId = signal('');
  protected readonly count = signal(2);
  protected readonly results = signal<ResultImage[]>([]);
  protected readonly running = signal(false);

  // Drag state — not signals; mutated during pointer events
  private dragMode: HandleKind | null = null;
  private dragStart = { x: 0, y: 0, leftPct: 0, topPct: 0, widthPct: 0, heightPct: 0 };
  private stageRect = { width: 1, height: 1, left: 0, top: 0 };

  protected readonly availableModels = computed<AiModel[]>(() => {
    const all = this.modelsSrv.models();
    const primary = all.filter((m) => m.capability === 'inpaint');
    const secondary = all.filter((m) => m.capability === 'remove_object');
    return [...primary, ...secondary];
  });
  protected readonly selectedModel = computed(() =>
    this.availableModels().find((m) => m.id === this.modelId()),
  );

  protected readonly stageAspect = computed(() => {
    if (this.aspect() === 'free') {
      const w = Math.max(1, this.freeWidth());
      const h = Math.max(1, this.freeHeight());
      return `${w} / ${h}`;
    }
    const found = ASPECTS.find((a) => a.key === this.aspect());
    if (!found?.ratio) return '1 / 1';
    return `${found.ratio} / 1`;
  });

  protected readonly sourceAspectRatio = computed(() => {
    const w = this.sourceWidth();
    const h = this.sourceHeight();
    if (!w || !h) return '1 / 1';
    return `${w} / ${h}`;
  });

  private readonly canvasRatio = computed(() => {
    if (this.aspect() === 'free') return this.freeWidth() / Math.max(1, this.freeHeight());
    return ASPECTS.find((a) => a.key === this.aspect())?.ratio ?? 1;
  });
  private readonly imageRatio = computed(() => {
    const w = this.sourceWidth() || 1;
    const h = this.sourceHeight() || 1;
    return w / h;
  });

  /** Height % derived from width % so the image keeps its aspect ratio
   *  inside the canvas (whose own aspect can differ). */
  protected readonly imageHeightPct = computed(() => {
    return this.imageWidthPct() * (this.canvasRatio() / this.imageRatio());
  });

  protected readonly hasFillArea = computed(() => {
    const l = this.imageLeftPct();
    const t = this.imageTopPct();
    const w = this.imageWidthPct();
    const h = this.imageHeightPct();
    // True if any part of the canvas isn't covered (image leaves a gap on any edge)
    return l > 0.5 || t > 0.5 || l + w < 99.5 || t + h < 99.5;
  });

  protected readonly readout = computed(() => {
    const w = this.imageWidthPct().toFixed(0);
    const h = this.imageHeightPct().toFixed(0);
    return `image ${w}% × ${h}% of canvas`;
  });

  protected readonly canGenerate = computed(() => {
    if (this.running()) return false;
    if (!this.sourceUri()) return false;
    if (!this.hasFillArea()) return false;
    if (!this.modelId()) return false;
    if (this.sourceEligibility()?.verdict === 'blocked') return false;
    return true;
  });

  constructor() {
    effect(() => {
      const first = this.availableModels()[0];
      if (first && !this.availableModels().some((m) => m.id === this.modelId())) {
        this.modelId.set(first.id);
      }
    });
  }

  protected triggerUpload() { this.fileInput()?.nativeElement.click(); }

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
      // Capture intrinsic dimensions, then auto-fit inside the canvas.
      const img = new Image();
      img.onload = () => {
        this.sourceWidth.set(img.naturalWidth);
        this.sourceHeight.set(img.naturalHeight);
        this.fitInCanvas();
      };
      img.src = result;
      this.eligibilitySrv.check({ fileName: file.name, uri: result }).subscribe((e) => {
        this.sourceEligibility.set(e);
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  protected setAspect(a: AspectKey) {
    this.aspect.set(a);
    // After aspect change, the image's heightPct shifts (canvasRatio changed).
    // Re-center it so it doesn't fall off the edge.
    this.centerImage();
  }

  /** Place the image fully inside the canvas at ~80% of the smaller axis,
   *  centered. Called on first image load and after aspect changes. */
  protected fitInCanvas() {
    if (!this.sourceUri()) return;
    const cR = this.canvasRatio();
    const iR = this.imageRatio();
    // Largest width % such that the height % stays <= 80
    const widthIfTall = 80 * (iR / cR);
    const targetWidth = Math.min(80, widthIfTall);
    this.imageWidthPct.set(targetWidth);
    this.centerImage();
  }

  /** Stretch the image until it covers the canvas on both axes (may overflow
   *  one axis — that's the "crop" case). Centered. */
  protected fillCanvas() {
    if (!this.sourceUri()) return;
    const cR = this.canvasRatio();
    const iR = this.imageRatio();
    // Smallest width % such that height % >= 100 OR width % >= 100
    const widthFor100Height = 100 * (iR / cR);
    const targetWidth = Math.max(100, widthFor100Height);
    this.imageWidthPct.set(targetWidth);
    this.centerImage();
  }

  protected centerImage() {
    this.imageLeftPct.set((100 - this.imageWidthPct()) / 2);
    this.imageTopPct.set((100 - this.imageHeightPct()) / 2);
  }

  /* ---------------------- Drag-to-move / drag-to-resize ---------------------- */

  protected onPointerDown(e: PointerEvent, mode: HandleKind) {
    e.preventDefault();
    e.stopPropagation();
    const stage = this.stage()?.nativeElement;
    if (!stage) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const rect = stage.getBoundingClientRect();
    this.stageRect = { width: rect.width, height: rect.height, left: rect.left, top: rect.top };
    this.dragMode = mode;
    this.dragStart = {
      x: e.clientX,
      y: e.clientY,
      leftPct: this.imageLeftPct(),
      topPct: this.imageTopPct(),
      widthPct: this.imageWidthPct(),
      heightPct: this.imageHeightPct(),
    };
    window.addEventListener('pointermove', this.onWindowPointerMove);
    window.addEventListener('pointerup', this.onWindowPointerUp);
  }

  private readonly onWindowPointerMove = (e: PointerEvent) => {
    if (!this.dragMode) return;
    const dxPct = ((e.clientX - this.dragStart.x) / this.stageRect.width) * 100;
    const dyPct = ((e.clientY - this.dragStart.y) / this.stageRect.height) * 100;
    const cR = this.canvasRatio();
    const iR = this.imageRatio();
    // ratio that converts a width% delta to the resulting height% delta
    const wToH = cR / iR;

    if (this.dragMode === 'move') {
      this.imageLeftPct.set(this.dragStart.leftPct + dxPct);
      this.imageTopPct.set(this.dragStart.topPct + dyPct);
      return;
    }

    // Resize: pick a width-delta based on which handle (so all 8 reduce to the
    // same math). Edges drive only one axis but we keep aspect, so a vertical
    // edge drag converts to width via the aspect ratio.
    let widthDelta = 0;
    switch (this.dragMode) {
      case 'br': widthDelta = dxPct; break;
      case 'r':  widthDelta = dxPct; break;
      case 'tr': widthDelta = dxPct; break;
      case 'bl': widthDelta = -dxPct; break;
      case 'l':  widthDelta = -dxPct; break;
      case 'tl': widthDelta = -dxPct; break;
      case 'b':  widthDelta = dyPct / wToH; break; // dy → dh; dh → dw via wToH
      case 't':  widthDelta = -dyPct / wToH; break;
    }
    const newWidth = Math.max(8, this.dragStart.widthPct + widthDelta);
    const newHeight = newWidth * wToH;
    const wDelta = newWidth - this.dragStart.widthPct;
    const hDelta = newHeight - this.dragStart.heightPct;

    let newLeft = this.dragStart.leftPct;
    let newTop = this.dragStart.topPct;
    // Anchor the opposite corner/edge:
    if (this.dragMode === 'tl') { newLeft -= wDelta; newTop -= hDelta; }
    else if (this.dragMode === 'tr') { newTop -= hDelta; }
    else if (this.dragMode === 'bl') { newLeft -= wDelta; }
    else if (this.dragMode === 'l')  { newLeft -= wDelta; newTop -= hDelta / 2; }
    else if (this.dragMode === 'r')  { newTop -= hDelta / 2; }
    else if (this.dragMode === 't')  { newLeft -= wDelta / 2; newTop -= hDelta; }
    else if (this.dragMode === 'b')  { newLeft -= wDelta / 2; }
    // 'br' leaves the top-left in place, no adjustment needed.

    this.imageWidthPct.set(newWidth);
    this.imageLeftPct.set(newLeft);
    this.imageTopPct.set(newTop);
  };

  private readonly onWindowPointerUp = (_e: PointerEvent) => {
    this.dragMode = null;
    window.removeEventListener('pointermove', this.onWindowPointerMove);
    window.removeEventListener('pointerup', this.onWindowPointerUp);
  };

  protected verdictLabel(v: EligibilityResult['verdict']) {
    return { allowed: 'Allowed ✓', warning: 'Warning', blocked: 'Blocked' }[v];
  }

  protected clearResults() { this.results.set([]); }

  protected generate() {
    if (!this.canGenerate()) return;
    const n = this.count();
    const now = Date.now();
    const queued: ResultImage[] = Array.from({ length: n }, (_, i) => ({
      id: `${now}-${i}`,
      uri: FILL_SAMPLES[(now + i) % FILL_SAMPLES.length],
      status: 'queued',
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
      }, 1100 + i * 240);
    });
  }

  protected saveToAssets(r: ResultImage) {
    if (r.saved || r.status !== 'ready') return;
    const model = this.selectedModel();
    const aspectLabel = this.aspect() === 'free'
      ? `${this.freeWidth()}×${this.freeHeight()}`
      : this.aspect();
    this.assetsSrv
      .generate({
        type: 'image',
        name: `expanded-${r.id.slice(-6)}.png`,
        prompt: `(expand to ${aspectLabel}, image ${this.imageWidthPct().toFixed(0)}% × ${this.imageHeightPct().toFixed(0)}% at ${this.imageLeftPct().toFixed(0)},${this.imageTopPct().toFixed(0)}) ${this.prompt().trim()}`.trim(),
        provider: model?.provider ?? 'unknown',
        model: model?.name ?? 'image-expand-tool',
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
    const img = new Image();
    img.onload = () => {
      this.sourceWidth.set(img.naturalWidth);
      this.sourceHeight.set(img.naturalHeight);
      this.fitInCanvas();
    };
    img.src = r.uri;
    this.results.set([]);
  }
}
