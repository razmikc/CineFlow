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
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AssetsService } from '../../../core/services/assets.service';
import { ModelsService } from '../../../core/services/models.service';
import {
  EligibilityResult,
  ImageEligibilityService,
} from '../../../core/services/image-eligibility.service';
import {
  EditorRequest,
  ImageEditorBridgeService,
} from '../../../core/services/image-editor-bridge.service';
import { AiModel, Asset } from '../../../core/models/contract.model';

type Mode = 'expand' | 'erase' | 'replace' | 'upscale';
type ReplaceVariant = 'prompt' | 'image';
type UpscaleFactor = 2 | 4 | 8;
type HandleKind = 'move' | 'tl' | 't' | 'tr' | 'r' | 'br' | 'b' | 'bl' | 'l';
type AspectKey = '1:1' | '16:9' | '9:16' | '4:5' | '2.39:1' | '4:3' | 'free';

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
  selector: 'app-image-editor-tool',
  imports: [FormsModule, RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      <a routerLink="/tools" class="btn ghost sm" style="margin-bottom: 0.5rem">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5l-5 5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to tools
      </a>
      <h1>Image editor</h1>
      <p class="muted" style="margin-top: 0.4rem; max-width: 64ch">
        One canvas, three modes. Expand the frame, erase an object, or replace it with a prompt or
        reference image — chain edits without re-uploading.
      </p>
    </header>

    @if (editContext(); as ctx) {
      <div class="edit-context">
        <div>
          <div class="eyebrow">Editing in context</div>
          <strong style="font-size: 0.92rem">{{ ctx.contextLabel || 'External image' }}</strong>
          <div class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">
            When you click <strong>Apply &amp; return</strong> on a result below, it will replace the original image and bring you back.
          </div>
        </div>
        <button class="btn ghost sm" type="button" (click)="cancelEditContext()">Cancel &amp; go back</button>
      </div>
    }

    @if (!sourceUri()) {
      <button class="dropzone" type="button" (click)="triggerUpload()">
        <div style="font-size: 1.8rem">🖼️</div>
        <strong>Upload an image to edit</strong>
        <span class="muted" style="font-size: 0.78rem">Any aspect — you'll pick a mode next</span>
      </button>
      <input #fileInput type="file" accept="image/*" hidden (change)="onSourceFile($event)" />
    } @else {
      <div class="mode-bar">
        <button class="mode-tab" type="button" [class.active]="mode() === 'expand'" (click)="setMode('expand')">
          <strong>📐 Expand</strong>
          <span class="muted">Resize canvas, AI fills empty area</span>
        </button>
        <button class="mode-tab" type="button" [class.active]="mode() === 'erase'" (click)="setMode('erase')">
          <strong>🩹 Erase</strong>
          <span class="muted">Brush an object, content-aware clean</span>
        </button>
        <button class="mode-tab" type="button" [class.active]="mode() === 'replace'" (click)="setMode('replace')">
          <strong>✨ Replace</strong>
          <span class="muted">Brush + prompt or reference image</span>
        </button>
        <button class="mode-tab" type="button" [class.active]="mode() === 'upscale'" (click)="setMode('upscale')">
          <strong>🔼 Upscale</strong>
          <span class="muted">2× · 4× · 8× super-resolution</span>
        </button>
      </div>

      <div class="layout">
        <section class="card panel canvas-panel">
          <div class="row" style="justify-content: space-between; align-items: flex-start; gap: 0.6rem; flex-wrap: wrap">
            <div>
              <div class="eyebrow">Canvas</div>
              <p class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">
                @switch (mode()) {
                  @case ('expand')  { Drag the image to reposition. Drag a handle to resize. Empty area = AI fill. }
                  @case ('erase')   { Brush over anything you want gone. Eraser-tool undoes mask strokes. }
                  @case ('replace') { Brush the area to replace, then describe what should appear (or attach a reference). }
                  @case ('upscale') { Pick a scale factor — AI super-resolves the whole image. Optional face / detail enhance. }
                }
              </p>
            </div>
            <div class="row" style="gap: 0.4rem; flex-wrap: wrap">
              @if (mode() === 'expand') {
                <button class="btn ghost sm" type="button" (click)="fitInCanvas()">Fit</button>
                <button class="btn ghost sm" type="button" (click)="fillCanvas()">Fill</button>
                <button class="btn ghost sm" type="button" (click)="centerImage()">Center</button>
              }
              @if (mode() !== 'expand' && mode() !== 'upscale') {
                <div class="brush-controls">
                  <button class="iconbtn" type="button" [class.active]="brushTool() === 'brush'" (click)="brushTool.set('brush')" title="Brush">
                    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3l3 3-9 9-3 1 1-3 8-10z" stroke-linejoin="round"/></svg>
                  </button>
                  <button class="iconbtn" type="button" [class.active]="brushTool() === 'eraser'" (click)="brushTool.set('eraser')" title="Mask eraser">
                    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 13 6-6 5 5-6 6H6l-2-2v-3z" stroke-linejoin="round"/></svg>
                  </button>
                  <span class="muted" style="font-size: 0.72rem">Size</span>
                  <input type="range" min="6" max="80" step="2" [ngModel]="brushSize()" (ngModelChange)="brushSize.set(+$event)" />
                  <span class="mono" style="font-size: 0.72rem; width: 24px; text-align: right">{{ brushSize() }}</span>
                  <button class="btn ghost sm" type="button" (click)="clearMask()" [disabled]="!hasMask()">Clear mask</button>
                </div>
              }
              <button class="btn ghost sm" type="button" (click)="triggerUpload()">Replace image</button>
            </div>
          </div>

          @if (mode() === 'upscale') {
            <div class="brush-stage">
              <img class="brush-img" [src]="sourceUri()" alt="Source" />
              <div class="upscale-badge">
                <strong>{{ sourceWidth() }} × {{ sourceHeight() }}</strong>
                <span>→</span>
                <strong>{{ sourceWidth() * upscaleFactor() }} × {{ sourceHeight() * upscaleFactor() }}</strong>
                <span class="chip cyan">{{ upscaleFactor() }}×</span>
              </div>
            </div>
          } @else if (mode() === 'expand') {
            <div class="canvas-stage" #stage [style.aspect-ratio]="stageAspect()">
              <div class="canvas-grid"></div>
              <div
                class="canvas-image"
                [style.background-image]="'url(' + sourceUri() + ')'"
                [style.left.%]="imageLeftPct()"
                [style.top.%]="imageTopPct()"
                [style.width.%]="imageWidthPct()"
                [style.height.%]="imageHeightPct()"
                (pointerdown)="onExpandPointerDown($event, 'move')"
              >
                <span class="handle tl" (pointerdown)="onExpandPointerDown($event, 'tl')"></span>
                <span class="handle t"  (pointerdown)="onExpandPointerDown($event, 't')"></span>
                <span class="handle tr" (pointerdown)="onExpandPointerDown($event, 'tr')"></span>
                <span class="handle r"  (pointerdown)="onExpandPointerDown($event, 'r')"></span>
                <span class="handle br" (pointerdown)="onExpandPointerDown($event, 'br')"></span>
                <span class="handle b"  (pointerdown)="onExpandPointerDown($event, 'b')"></span>
                <span class="handle bl" (pointerdown)="onExpandPointerDown($event, 'bl')"></span>
                <span class="handle l"  (pointerdown)="onExpandPointerDown($event, 'l')"></span>
              </div>
              <div class="canvas-outline"></div>
            </div>
            <div class="muted" style="font-size: 0.78rem; margin-top: 0.4rem">{{ readout() }}</div>
          } @else {
            <div class="brush-stage" #brushStage>
              <img class="brush-img" #brushImg [src]="sourceUri()" alt="Source" (load)="onBrushImageLoaded()" />
              <canvas
                #maskCanvas
                class="mask-canvas"
                (pointerdown)="onBrushPointerDown($event)"
                (pointermove)="onBrushPointerMove($event)"
                (pointerup)="onBrushPointerUp($event)"
                (pointerleave)="onBrushPointerUp($event)"
              ></canvas>
            </div>
          }

          @if (sourceEligibility(); as e) {
            <div class="elig" [class]="'verdict-' + e.verdict">
              <strong style="font-size: 0.82rem">{{ verdictLabel(e.verdict) }}</strong>
              <div class="muted" style="font-size: 0.76rem; margin-top: 0.2rem">{{ e.summary }}</div>
            </div>
          }

          <input #fileInput type="file" accept="image/*" hidden (change)="onSourceFile($event)" />
        </section>

        <section class="card panel">
          <!-- Mode-specific controls -->
          @if (mode() === 'expand') {
            <div class="eyebrow">Target aspect</div>
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
            <label class="field" style="margin-top: 1rem">
              Fill prompt <span class="muted" style="font-size: 0.72rem">(optional)</span>
            </label>
            <textarea
              rows="3"
              [ngModel]="prompt()"
              (ngModelChange)="prompt.set($event)"
              placeholder="What should appear in the new area? e.g. continue the sunset, extend forest left"
            ></textarea>
          }

          @if (mode() === 'erase') {
            <div class="eyebrow">Erase mode</div>
            <p class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">
              Paint over what you want gone. The model reconstructs the masked area from surrounding context — no prompt needed.
            </p>
          }

          @if (mode() === 'upscale') {
            <div class="eyebrow">Scale factor</div>
            <div class="chip-grid compact" style="margin-top: 0.4rem">
              @for (f of upscaleFactors; track f) {
                <button
                  type="button"
                  class="opt-chip sm"
                  [class.active]="upscaleFactor() === f"
                  (click)="upscaleFactor.set(f)"
                >{{ f }}×</button>
              }
            </div>
            <p class="muted" style="font-size: 0.78rem; margin-top: 0.4rem">
              Target: <span class="mono">{{ sourceWidth() * upscaleFactor() }} × {{ sourceHeight() * upscaleFactor() }}</span>
              ({{ targetMegapixels() | number: '1.1-1' }} MP)
            </p>
            <label class="check-row" style="margin-top: 0.6rem">
              <input
                type="checkbox"
                [ngModel]="enhanceFaces()"
                (ngModelChange)="enhanceFaces.set($event)"
              />
              <div>
                <div class="check-title">Enhance faces</div>
                <div class="muted" style="font-size: 0.76rem">GFPGAN-style face restoration pass.</div>
              </div>
            </label>
            <label class="check-row" style="margin-top: 0.4rem">
              <input
                type="checkbox"
                [ngModel]="enhanceDetail()"
                (ngModelChange)="enhanceDetail.set($event)"
              />
              <div>
                <div class="check-title">Sharpen detail</div>
                <div class="muted" style="font-size: 0.76rem">Extra detail-restore pass — slower, higher fidelity.</div>
              </div>
            </label>
          }

          @if (mode() === 'replace') {
            <div class="eyebrow">Replace with</div>
            <div class="row" style="gap: 0.4rem; margin-top: 0.4rem">
              <button class="tab" type="button" [class.active]="replaceVariant() === 'prompt'" (click)="replaceVariant.set('prompt')">Prompt</button>
              <button class="tab" type="button" [class.active]="replaceVariant() === 'image'" (click)="replaceVariant.set('image')">Reference image</button>
            </div>

            @if (replaceVariant() === 'prompt') {
              <label class="field" style="margin-top: 0.8rem">Replacement prompt</label>
              <textarea
                rows="3"
                [ngModel]="prompt()"
                (ngModelChange)="prompt.set($event)"
                placeholder="e.g. a wooden park bench with matching shadow and lighting"
              ></textarea>
            } @else {
              <div class="eyebrow" style="margin-top: 0.8rem">Reference</div>
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
              }
              <input #refInput type="file" accept="image/*" hidden (change)="onRefFile($event)" />

              <label class="field" style="margin-top: 0.7rem">Composition hints <span class="muted" style="font-size: 0.72rem">(optional)</span></label>
              <input
                [ngModel]="prompt()"
                (ngModelChange)="prompt.set($event)"
                placeholder="e.g. blend lighting, soft edges, match shadow direction"
              />
            }
          }

          <div class="eyebrow" style="margin-top: 1rem">Model</div>
          <select [ngModel]="modelId()" (ngModelChange)="modelId.set($event)" style="margin-top: 0.4rem">
            @for (m of availableModels(); track m.id) {
              <option [value]="m.id">{{ m.provider }} · {{ m.name }} — {{ m.speed }} · {{ m.costPerUnit }}/{{ m.unit }}</option>
            }
          </select>
          @if (selectedModel(); as m) {
            <p class="muted" style="font-size: 0.78rem; margin-top: 0.35rem">{{ m.description }}</p>
          }

          @if (mode() !== 'upscale') {
            <div class="eyebrow" style="margin-top: 1rem">Variations</div>
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
          }

          <button
            class="btn primary"
            style="margin-top: 1rem; width: 100%"
            (click)="generate()"
            [disabled]="!canGenerate() || running()"
          >
            @if (running()) { Rendering… }
            @else if (mode() === 'upscale') { {{ generateLabel() }} }
            @else { {{ generateLabel() }} ({{ count() }}) }
          </button>

          @if (blockedReason(); as r) {
            <div class="muted" style="font-size: 0.78rem; text-align: center; margin-top: 0.4rem">{{ r }}</div>
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
                  @if (editContext()) {
                    <button class="btn primary sm" type="button" (click)="applyAndReturn(r)" [disabled]="r.status !== 'ready'">Apply &amp; return</button>
                  }
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
    }

    @if (assetPickerOpen()) {
      <div class="modal-backdrop" (click)="closeAssetPicker()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="row" style="justify-content: space-between; margin-bottom: 0.6rem">
            <strong style="font-family: var(--font-display); font-size: 1.05rem">Pick replacement reference</strong>
            <button class="iconbtn" type="button" (click)="closeAssetPicker()">×</button>
          </div>
          @if (imageAssets().length === 0) {
            <div class="muted" style="padding: 1rem 0; text-align: center">No image assets in your library yet.</div>
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

      .upscale-badge {
        position: absolute;
        bottom: 10px;
        left: 10px;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(0, 0, 0, 0.65);
        border: 1px solid rgba(34, 211, 238, 0.5);
        color: white;
        padding: 0.35rem 0.7rem;
        border-radius: 999px;
        font-family: var(--font-mono, monospace);
        font-size: 0.74rem;
      }

      .edit-context {
        margin-top: 0.8rem;
        padding: 0.7rem 0.9rem;
        border-radius: 12px;
        border: 1px solid rgba(34, 211, 238, 0.5);
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.10), rgba(139, 92, 246, 0.06));
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .dropzone {
        margin-top: 1rem;
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

      .mode-bar {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        margin-top: 1rem;
      }
      @media (max-width: 720px) { .mode-bar { grid-template-columns: 1fr; } }
      .mode-tab {
        text-align: left;
        padding: 0.7rem 0.85rem;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.025);
        color: var(--text-1);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }
      .mode-tab strong { font-size: 0.92rem; }
      .mode-tab .muted { font-size: 0.74rem; }
      .mode-tab:hover { border-color: var(--border-strong); }
      .mode-tab.active {
        border-color: var(--neon-violet);
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(34, 211, 238, 0.08));
        box-shadow: 0 4px 22px rgba(139, 92, 246, 0.18);
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
        gap: 1rem;
        margin-top: 1rem;
        align-items: start;
      }
      @media (max-width: 1080px) { .layout { grid-template-columns: 1fr; } }
      .panel { padding: 1.1rem; }
      .canvas-panel { min-height: 480px; }

      .brush-controls {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.55rem;
        background: rgba(255, 255, 255, 0.025);
        border: 1px solid var(--border);
        border-radius: 999px;
      }
      .brush-controls input[type='range'] { width: 100px; }
      .brush-controls .iconbtn.active {
        background: var(--grad-primary);
        color: white;
        border-color: transparent;
      }

      /* Expand-mode canvas */
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
      .handle.tl { top: -6px; left: -6px; cursor: nwse-resize; }
      .handle.tr { top: -6px; right: -6px; cursor: nesw-resize; }
      .handle.bl { bottom: -6px; left: -6px; cursor: nesw-resize; }
      .handle.br { bottom: -6px; right: -6px; cursor: nwse-resize; }
      .handle.t  { top: -6px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
      .handle.b  { bottom: -6px; left: 50%; transform: translateX(-50%); cursor: ns-resize; }
      .handle.l  { left: -6px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }
      .handle.r  { right: -6px; top: 50%; transform: translateY(-50%); cursor: ew-resize; }

      /* Brush-mode canvas */
      .brush-stage {
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
      .brush-img {
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
      .result-tile { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
      .result-thumb {
        position: relative;
        aspect-ratio: 1 / 1;
        background-size: cover;
        background-position: center;
        background-color: rgba(255, 255, 255, 0.05);
      }
      .result-overlay {
        position: absolute; inset: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 0.4rem;
        background: rgba(5, 6, 19, 0.65);
        color: var(--text-2);
        font-size: 0.8rem;
      }
      .result-actions {
        display: flex; gap: 0.4rem;
        padding: 0.55rem 0.7rem;
      }
      .result-actions .btn { flex: 1; }

      .modal-backdrop {
        position: fixed; inset: 0;
        background: rgba(5, 6, 19, 0.78);
        backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        z-index: 10; padding: 1rem;
      }
      .modal {
        max-width: 720px; width: 100%;
        max-height: 80vh; overflow: auto;
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
        text-align: left; padding: 0;
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 10px;
        overflow: hidden;
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
        width: 8px; height: 8px;
        border: 1.5px solid rgba(255, 255, 255, 0.2);
        border-top-color: var(--neon-cyan);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-right: 0.25rem;
        vertical-align: -1px;
      }
      .loader {
        width: 18px; height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-top-color: var(--neon-cyan);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `,
  ],
})
export class ImageEditorToolComponent implements AfterViewInit {
  private readonly modelsSrv = inject(ModelsService);
  private readonly assetsSrv = inject(AssetsService);
  private readonly eligibilitySrv = inject(ImageEligibilityService);
  private readonly bridge = inject(ImageEditorBridgeService);
  private readonly router = inject(Router);

  /** Set when the editor was opened from a flow surface via the bridge —
   *  enables the "Apply & return" action that hands the result back. */
  protected readonly editContext = signal<EditorRequest | null>(null);

  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly refInput = viewChild<ElementRef<HTMLInputElement>>('refInput');
  private readonly stage = viewChild<ElementRef<HTMLDivElement>>('stage');
  private readonly brushImg = viewChild<ElementRef<HTMLImageElement>>('brushImg');
  private readonly maskCanvas = viewChild<ElementRef<HTMLCanvasElement>>('maskCanvas');

  protected readonly aspects = ASPECTS;

  /* Source */
  protected readonly sourceUri = signal<string | null>(null);
  protected readonly sourceName = signal<string | null>(null);
  protected readonly sourceWidth = signal(0);
  protected readonly sourceHeight = signal(0);
  protected readonly sourceEligibility = signal<EligibilityResult | null>(null);

  /* Mode */
  protected readonly mode = signal<Mode>('expand');
  protected readonly replaceVariant = signal<ReplaceVariant>('prompt');

  /* Expand state */
  protected readonly aspect = signal<AspectKey>('16:9');
  protected readonly freeWidth = signal(1024);
  protected readonly freeHeight = signal(1024);
  protected readonly imageLeftPct = signal(20);
  protected readonly imageTopPct = signal(20);
  protected readonly imageWidthPct = signal(60);

  /* Brush state (erase + replace) */
  protected readonly brushTool = signal<'brush' | 'eraser'>('brush');
  protected readonly brushSize = signal(28);
  protected readonly hasMask = signal(false);
  private painting = false;
  private lastBrushPoint: { x: number; y: number } | null = null;

  /* Replace state */
  protected readonly replaceRef = signal<ReplaceReference | null>(null);

  /* Upscale state */
  protected readonly upscaleFactors: UpscaleFactor[] = [2, 4, 8];
  protected readonly upscaleFactor = signal<UpscaleFactor>(2);
  protected readonly enhanceFaces = signal(false);
  protected readonly enhanceDetail = signal(true);
  protected readonly targetMegapixels = computed(
    () => (this.sourceWidth() * this.upscaleFactor() * this.sourceHeight() * this.upscaleFactor()) / 1_000_000,
  );

  /* Shared */
  protected readonly prompt = signal('');
  protected readonly modelId = signal('');
  protected readonly count = signal(2);
  protected readonly results = signal<ResultImage[]>([]);
  protected readonly running = signal(false);
  protected readonly assetPickerOpen = signal(false);

  /* Drag state for expand */
  private dragMode: HandleKind | null = null;
  private dragStart = { x: 0, y: 0, leftPct: 0, topPct: 0, widthPct: 0, heightPct: 0 };
  private stageRect = { width: 1, height: 1, left: 0, top: 0 };

  /* ----------------------------- Derived state ----------------------------- */

  protected readonly availableModels = computed<AiModel[]>(() => {
    const all = this.modelsSrv.models();
    if (this.mode() === 'upscale') {
      return all.filter((m) => m.capability === 'upscale');
    }
    if (this.mode() === 'erase') {
      const primary = all.filter((m) => m.capability === 'remove_object');
      const secondary = all.filter((m) => m.capability === 'inpaint');
      return [...primary, ...secondary];
    }
    // Expand + Replace prefer inpaint
    const primary = all.filter((m) => m.capability === 'inpaint');
    const secondary = all.filter((m) => m.capability === 'remove_object');
    return [...primary, ...secondary];
  });

  protected readonly selectedModel = computed(() =>
    this.availableModels().find((m) => m.id === this.modelId()),
  );

  protected readonly imageAssets = computed<Asset[]>(() =>
    this.assetsSrv.assets().filter((a) => a.type === 'image'),
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

  private readonly canvasRatio = computed(() => {
    if (this.aspect() === 'free') return this.freeWidth() / Math.max(1, this.freeHeight());
    return ASPECTS.find((a) => a.key === this.aspect())?.ratio ?? 1;
  });
  private readonly imageRatio = computed(() => {
    const w = this.sourceWidth() || 1;
    const h = this.sourceHeight() || 1;
    return w / h;
  });

  protected readonly imageHeightPct = computed(() =>
    this.imageWidthPct() * (this.canvasRatio() / this.imageRatio()),
  );

  protected readonly hasFillArea = computed(() => {
    const l = this.imageLeftPct();
    const t = this.imageTopPct();
    const w = this.imageWidthPct();
    const h = this.imageHeightPct();
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
    if (!this.modelId()) return false;
    if (this.sourceEligibility()?.verdict === 'blocked') return false;

    if (this.mode() === 'upscale') {
      return this.sourceWidth() > 0 && this.sourceHeight() > 0;
    }
    if (this.mode() === 'expand') {
      return this.hasFillArea();
    }
    // Brush modes
    if (!this.hasMask()) return false;
    if (this.mode() === 'replace') {
      if (this.replaceVariant() === 'prompt') return this.prompt().trim().length > 0;
      const r = this.replaceRef();
      return !!r && r.eligibility?.verdict !== 'blocked';
    }
    return true; // erase
  });

  protected readonly blockedReason = computed<string | null>(() => {
    if (this.canGenerate()) return null;
    if (!this.sourceUri()) return 'Upload an image to begin.';
    if (this.sourceEligibility()?.verdict === 'blocked') return 'Source image failed eligibility check.';
    if (this.mode() === 'upscale') {
      if (this.sourceWidth() <= 0) return 'Loading image dimensions…';
      return null;
    }
    if (this.mode() === 'expand') {
      if (!this.hasFillArea()) return 'Image fully covers the canvas — nothing to fill. Shrink it or change aspect.';
      return null;
    }
    if (!this.hasMask()) return 'Paint a mask over the area to ' + (this.mode() === 'erase' ? 'erase' : 'replace') + '.';
    if (this.mode() === 'replace') {
      if (this.replaceVariant() === 'prompt' && !this.prompt().trim()) return 'Describe what should replace the masked area.';
      const r = this.replaceRef();
      if (!r) return 'Attach a reference image (or switch to prompt mode).';
      if (r.eligibility?.verdict === 'blocked') return 'Reference image failed eligibility check.';
    }
    return null;
  });

  protected readonly generateLabel = computed(() => {
    if (this.mode() === 'expand') return 'Expand image';
    if (this.mode() === 'erase') return 'Erase masked area';
    if (this.mode() === 'upscale') return `Upscale ${this.upscaleFactor()}×`;
    return 'Replace masked area';
  });

  constructor() {
    effect(() => {
      const first = this.availableModels()[0];
      if (first && !this.availableModels().some((m) => m.id === this.modelId())) {
        this.modelId.set(first.id);
      }
    });

    // Pre-load source if we arrived via the bridge.
    const req = this.bridge.consume();
    if (req) {
      this.editContext.set(req);
      this.loadSourceFromUri(req.sourceUri, req.contextLabel ?? 'edit handoff');
    }
  }

  private loadSourceFromUri(uri: string, name: string) {
    this.sourceUri.set(uri);
    this.sourceName.set(name);
    this.sourceEligibility.set(null);
    this.clearMask();
    const img = new Image();
    img.onload = () => {
      this.sourceWidth.set(img.naturalWidth);
      this.sourceHeight.set(img.naturalHeight);
      this.fitInCanvas();
    };
    img.src = uri;
    this.eligibilitySrv.check({ fileName: name, uri }).subscribe((e) => {
      this.sourceEligibility.set(e);
    });
  }

  ngAfterViewInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.resizeMaskCanvas());
    }
  }

  /* ----------------------------- Source upload ----------------------------- */

  protected triggerUpload() { this.fileInput()?.nativeElement.click(); }
  protected triggerRefUpload() { this.refInput()?.nativeElement.click(); }

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
      this.clearMask();
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

  protected onRefFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;
      const ref: ReplaceReference = { uri: result, name: file.name, source: 'upload', eligibility: null };
      this.replaceRef.set(ref);
      this.eligibilitySrv.check({ fileName: file.name, uri: result }).subscribe((e) => {
        this.replaceRef.update((r) => (r ? { ...r, eligibility: e } : r));
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  protected setMode(m: Mode) {
    this.mode.set(m);
  }

  protected setAspect(a: AspectKey) {
    this.aspect.set(a);
    this.centerImage();
  }

  /* ----------------------------- Expand: presets + drag ----------------------------- */

  protected fitInCanvas() {
    if (!this.sourceUri()) return;
    const cR = this.canvasRatio();
    const iR = this.imageRatio();
    const widthIfTall = 80 * (iR / cR);
    const targetWidth = Math.min(80, widthIfTall);
    this.imageWidthPct.set(targetWidth);
    this.centerImage();
  }

  protected fillCanvas() {
    if (!this.sourceUri()) return;
    const cR = this.canvasRatio();
    const iR = this.imageRatio();
    const widthFor100Height = 100 * (iR / cR);
    this.imageWidthPct.set(Math.max(100, widthFor100Height));
    this.centerImage();
  }

  protected centerImage() {
    this.imageLeftPct.set((100 - this.imageWidthPct()) / 2);
    this.imageTopPct.set((100 - this.imageHeightPct()) / 2);
  }

  protected onExpandPointerDown(e: PointerEvent, mode: HandleKind) {
    e.preventDefault();
    e.stopPropagation();
    const stage = this.stage()?.nativeElement;
    if (!stage) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const rect = stage.getBoundingClientRect();
    this.stageRect = { width: rect.width, height: rect.height, left: rect.left, top: rect.top };
    this.dragMode = mode;
    this.dragStart = {
      x: e.clientX, y: e.clientY,
      leftPct: this.imageLeftPct(),
      topPct: this.imageTopPct(),
      widthPct: this.imageWidthPct(),
      heightPct: this.imageHeightPct(),
    };
    window.addEventListener('pointermove', this.onExpandPointerMove);
    window.addEventListener('pointerup', this.onExpandPointerUp);
  }

  private readonly onExpandPointerMove = (e: PointerEvent) => {
    if (!this.dragMode) return;
    const dxPct = ((e.clientX - this.dragStart.x) / this.stageRect.width) * 100;
    const dyPct = ((e.clientY - this.dragStart.y) / this.stageRect.height) * 100;
    const cR = this.canvasRatio();
    const iR = this.imageRatio();
    const wToH = cR / iR;

    if (this.dragMode === 'move') {
      this.imageLeftPct.set(this.dragStart.leftPct + dxPct);
      this.imageTopPct.set(this.dragStart.topPct + dyPct);
      return;
    }

    let widthDelta = 0;
    switch (this.dragMode) {
      case 'br': widthDelta = dxPct; break;
      case 'r':  widthDelta = dxPct; break;
      case 'tr': widthDelta = dxPct; break;
      case 'bl': widthDelta = -dxPct; break;
      case 'l':  widthDelta = -dxPct; break;
      case 'tl': widthDelta = -dxPct; break;
      case 'b':  widthDelta = dyPct / wToH; break;
      case 't':  widthDelta = -dyPct / wToH; break;
    }
    const newWidth = Math.max(8, this.dragStart.widthPct + widthDelta);
    const newHeight = newWidth * wToH;
    const wDelta = newWidth - this.dragStart.widthPct;
    const hDelta = newHeight - this.dragStart.heightPct;

    let newLeft = this.dragStart.leftPct;
    let newTop = this.dragStart.topPct;
    if (this.dragMode === 'tl') { newLeft -= wDelta; newTop -= hDelta; }
    else if (this.dragMode === 'tr') { newTop -= hDelta; }
    else if (this.dragMode === 'bl') { newLeft -= wDelta; }
    else if (this.dragMode === 'l')  { newLeft -= wDelta; newTop -= hDelta / 2; }
    else if (this.dragMode === 'r')  { newTop -= hDelta / 2; }
    else if (this.dragMode === 't')  { newLeft -= wDelta / 2; newTop -= hDelta; }
    else if (this.dragMode === 'b')  { newLeft -= wDelta / 2; }

    this.imageWidthPct.set(newWidth);
    this.imageLeftPct.set(newLeft);
    this.imageTopPct.set(newTop);
  };

  private readonly onExpandPointerUp = (_e: PointerEvent) => {
    this.dragMode = null;
    window.removeEventListener('pointermove', this.onExpandPointerMove);
    window.removeEventListener('pointerup', this.onExpandPointerUp);
  };

  /* ----------------------------- Brush: mask painting ----------------------------- */

  protected onBrushImageLoaded() {
    this.resizeMaskCanvas();
  }

  private resizeMaskCanvas() {
    const img = this.brushImg()?.nativeElement;
    const canvas = this.maskCanvas()?.nativeElement;
    if (!img || !canvas) return;
    const rect = img.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const old = canvas.width > 0 ? this.snapshotCanvas() : null;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx && old) ctx.putImageData(old, 0, 0);
  }

  private snapshotCanvas(): ImageData | null {
    const canvas = this.maskCanvas()?.nativeElement;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  protected onBrushPointerDown(e: PointerEvent) {
    if (!this.sourceUri()) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    this.painting = true;
    this.lastBrushPoint = this.toBrushCoords(e);
    this.paintDot(this.lastBrushPoint);
  }

  protected onBrushPointerMove(e: PointerEvent) {
    if (!this.painting || !this.lastBrushPoint) return;
    const p = this.toBrushCoords(e);
    this.paintLine(this.lastBrushPoint, p);
    this.lastBrushPoint = p;
  }

  protected onBrushPointerUp(e: PointerEvent) {
    if (!this.painting) return;
    this.painting = false;
    this.lastBrushPoint = null;
    this.updateHasMask();
    if (e.pointerId !== undefined && (e.target as Element).hasPointerCapture?.(e.pointerId)) {
      (e.target as Element).releasePointerCapture(e.pointerId);
    }
  }

  private toBrushCoords(e: PointerEvent): { x: number; y: number } {
    const canvas = this.maskCanvas()!.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  }

  private paintDot(p: { x: number; y: number }) {
    const canvas = this.maskCanvas()?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const r = (this.brushSize() / 2) * dpr;
    ctx.globalCompositeOperation = this.brushTool() === 'eraser' ? 'destination-out' : 'source-over';
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
    ctx.globalCompositeOperation = this.brushTool() === 'eraser' ? 'destination-out' : 'source-over';
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

  /* ----------------------------- Replace reference picker ----------------------------- */

  protected openAssetPicker() { this.assetPickerOpen.set(true); }
  protected closeAssetPicker() { this.assetPickerOpen.set(false); }

  protected useAssetAsRef(asset: Asset) {
    const ref: ReplaceReference = { uri: asset.uri, name: asset.name, source: 'asset', eligibility: null };
    this.replaceRef.set(ref);
    this.eligibilitySrv.check({ fileName: asset.name, uri: asset.uri }).subscribe((e) => {
      this.replaceRef.update((r) => (r ? { ...r, eligibility: e } : r));
    });
    this.assetPickerOpen.set(false);
  }

  protected clearReplaceRef() { this.replaceRef.set(null); }

  /* ----------------------------- Generation + save ----------------------------- */

  protected verdictLabel(v: EligibilityResult['verdict']) {
    return { allowed: 'Allowed ✓', warning: 'Warning', blocked: 'Blocked' }[v];
  }
  protected verdictTone(v: EligibilityResult['verdict']) {
    return { allowed: 'green', warning: 'amber', blocked: 'rose' }[v];
  }

  protected clearResults() { this.results.set([]); }

  protected generate() {
    if (!this.canGenerate()) return;
    const n = this.count();
    const now = Date.now();
    const src = this.sourceUri();
    const ref = this.replaceRef();
    const isUpscale = this.mode() === 'upscale';
    const variants = isUpscale ? 1 : n;
    const queued: ResultImage[] = Array.from({ length: variants }, (_, i) => {
      // Mock results: keep first variation visually similar to source so the
      // user gets a sense of edit continuity; vary the rest.
      const fallback = FILL_SAMPLES[(now + i) % FILL_SAMPLES.length];
      const seedUri = isUpscale
        ? src ?? fallback
        : this.mode() === 'replace' && this.replaceVariant() === 'image' && ref
          ? (i % 2 === 0 ? src ?? fallback : ref.uri)
          : i === 0 && src
            ? src
            : fallback;
      return { id: `${now}-${i}`, uri: seedUri, status: 'queued', saved: false };
    });
    this.results.set(queued);
    this.running.set(true);

    const totalMs = isUpscale ? 1800 + this.upscaleFactor() * 350 : 1100;
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
      }, totalMs + i * 240);
    });
  }

  protected saveToAssets(r: ResultImage) {
    if (r.saved || r.status !== 'ready') return;
    const model = this.selectedModel();
    const tag = this.modeTag();
    this.assetsSrv
      .generate({
        type: 'image',
        name: `${tag}-${r.id.slice(-6)}.png`,
        prompt: `(${tag}) ${this.prompt().trim()}`.trim(),
        provider: model?.provider ?? 'unknown',
        model: model?.name ?? 'image-editor',
      })
      .subscribe(() => {
        this.results.update((list) =>
          list.map((x) => (x.id === r.id ? { ...x, saved: true } : x)),
        );
      });
  }

  /** Save to library AND hand the new URI back to the originating flow surface,
   *  then navigate back to where the user came from. Only available when the
   *  editor was opened via the bridge. */
  protected applyAndReturn(r: ResultImage) {
    if (r.status !== 'ready') return;
    const ctx = this.editContext();
    if (!ctx) return;
    if (!r.saved) this.saveToAssets(r);
    ctx.onApply(r.uri);
    this.editContext.set(null);
    this.router.navigateByUrl(ctx.returnTo);
  }

  protected cancelEditContext() {
    const ctx = this.editContext();
    if (!ctx) return;
    this.editContext.set(null);
    this.router.navigateByUrl(ctx.returnTo);
  }

  protected useAsSource(r: ResultImage) {
    if (r.status !== 'ready') return;
    this.sourceUri.set(r.uri);
    this.clearMask();
    this.results.set([]);
    const img = new Image();
    img.onload = () => {
      this.sourceWidth.set(img.naturalWidth);
      this.sourceHeight.set(img.naturalHeight);
      this.fitInCanvas();
    };
    img.src = r.uri;
  }

  private modeTag(): string {
    if (this.mode() === 'expand') {
      const aspectLabel = this.aspect() === 'free' ? `${this.freeWidth()}x${this.freeHeight()}` : this.aspect();
      return `expanded-${aspectLabel}`;
    }
    if (this.mode() === 'erase') return 'erased';
    if (this.mode() === 'upscale') {
      const enhance = [
        this.enhanceFaces() ? 'faces' : '',
        this.enhanceDetail() ? 'detail' : '',
      ].filter(Boolean).join('+');
      return enhance ? `upscaled-${this.upscaleFactor()}x-${enhance}` : `upscaled-${this.upscaleFactor()}x`;
    }
    return this.replaceVariant() === 'prompt' ? 'replaced-prompt' : 'replaced-ref';
  }
}
