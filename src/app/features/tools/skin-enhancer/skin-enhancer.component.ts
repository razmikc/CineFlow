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
import {
  ImageEligibilityService,
  EligibilityResult,
} from '../../../core/services/image-eligibility.service';

type VariantStyle = 'natural' | 'studio' | 'cinematic';

interface FaceVariant {
  id: string;
  style: VariantStyle;
  label: string;
  description: string;
  uri: string;
  status: 'rendering' | 'ready';
}

const VARIANT_STYLES: { style: VariantStyle; label: string; description: string; sample: string }[] = [
  {
    style: 'natural',
    label: 'Natural',
    description: 'Subtle skin smoothing, blemish cleanup, true-to-life tones.',
    sample: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900',
  },
  {
    style: 'studio',
    label: 'Studio',
    description: 'Editorial polish — softer texture, balanced highlights, neutral white-balance.',
    sample: 'https://images.unsplash.com/photo-1502767089025-6572583495b4?w=900',
  },
  {
    style: 'cinematic',
    label: 'Cinematic',
    description: 'Film-grade contrast, warmer mid-tones, dramatic rim light.',
    sample: 'https://images.unsplash.com/photo-1546961342-1a2eebd99e1b?w=900',
  },
];

@Component({
  selector: 'app-skin-enhancer-tool',
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
      <h1>Skin & face enhancer</h1>
      <p class="muted" style="margin-top: 0.4rem; max-width: 60ch">
        Upload a portrait and we'll produce three refined variants — pick the one that
        best fits your scene. The selected variant can be saved or sent back to a character.
      </p>
    </header>

    <div class="layout">
      <section class="card panel">
        <div class="eyebrow">1 · Source portrait</div>
        @if (sourceUri()) {
          <div class="source-preview" [style.background-image]="'url(' + sourceUri() + ')'"></div>
          <div class="row" style="gap: 0.5rem; margin-top: 0.6rem">
            <button class="btn sm" type="button" (click)="triggerUpload()">Replace</button>
            <button class="btn ghost sm" type="button" (click)="clearSource()">Remove</button>
          </div>
        } @else {
          <button class="dropzone" (click)="triggerUpload()" type="button">
            <div style="font-size: 1.8rem">👤</div>
            <strong>Upload a portrait</strong>
            <span class="muted" style="font-size: 0.78rem">Face should be clearly visible</span>
          </button>
        }
        <input #fileInput type="file" accept="image/*" hidden (change)="onFileSelected($event)" />

        @if (eligibility(); as e) {
          <div class="elig" [class]="'verdict-' + e.verdict">
            <strong style="font-size: 0.82rem">{{ verdictLabel(e.verdict) }}</strong>
            <div class="muted" style="font-size: 0.76rem; margin-top: 0.2rem">{{ e.summary }}</div>
          </div>
        }

        <div class="eyebrow" style="margin-top: 1rem">2 · Strength</div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          [ngModel]="strength()"
          (ngModelChange)="strength.set(+$event)"
          style="width: 100%; margin-top: 0.4rem"
        />
        <div class="row" style="justify-content: space-between; font-size: 0.78rem; color: var(--text-3)">
          <span>Subtle</span>
          <span class="mono">{{ strength() }}%</span>
          <span>Strong</span>
        </div>

        <label class="check-row" style="margin-top: 0.8rem">
          <input type="checkbox" [ngModel]="preserveIdentity()" (ngModelChange)="preserveIdentity.set($event)" />
          <div>
            <div class="check-title">Preserve identity</div>
            <div class="muted" style="font-size: 0.76rem">Lock facial structure so refinements don't drift.</div>
          </div>
        </label>

        <button
          class="btn primary"
          style="margin-top: 0.9rem; width: 100%"
          (click)="enhance()"
          [disabled]="!sourceUri() || running()"
        >
          @if (running()) { Producing 3 variants… } @else { Generate 3 face options }
        </button>
      </section>

      <section class="card panel">
        <div class="row" style="justify-content: space-between; align-items: flex-start">
          <div>
            <div class="eyebrow">3 · Choose a face</div>
            <p class="muted" style="margin-top: 0.3rem; font-size: 0.82rem">
              {{ variants().length === 0 ? 'Generate variants to compare.' : 'Tap a card to select.' }}
            </p>
          </div>
          @if (selectedId(); as sid) {
            <button class="btn primary sm" type="button" (click)="apply(sid)">Use this face</button>
          }
        </div>

        @if (variants().length === 0) {
          <div class="empty">
            <div style="font-size: 1.6rem">✨</div>
            <div style="font-family: var(--font-display); font-weight: 600">No variants yet</div>
            <p class="muted">Upload a portrait and click Generate to see three refined options here.</p>
          </div>
        } @else {
          <div class="variant-grid">
            @for (v of variants(); track v.id) {
              <button
                type="button"
                class="variant-card"
                [class.active]="v.id === selectedId()"
                (click)="select(v.id)"
              >
                <div class="variant-thumb" [style.background-image]="'url(' + v.uri + ')'">
                  @if (v.status === 'rendering') {
                    <div class="result-overlay"><span class="loader"></span><span>rendering</span></div>
                  }
                </div>
                <div class="variant-meta">
                  <strong>{{ v.label }}</strong>
                  <p class="muted">{{ v.description }}</p>
                </div>
                @if (v.id === selectedId()) {
                  <div class="check-badge">✓</div>
                }
              </button>
            }
          </div>
        }

        @if (applied()) {
          <div class="applied">
            <strong style="font-size: 0.85rem">Variant applied</strong>
            <div class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">
              {{ applied()?.label }} was selected and is ready to save back to your library or character.
            </div>
          </div>
        }
      </section>
    </div>
  `,
  styles: [
    `
      :host { display: block; }
      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
        gap: 1rem;
        margin-top: 1.2rem;
      }
      @media (max-width: 980px) { .layout { grid-template-columns: 1fr; } }
      .panel { padding: 1.1rem; }
      .source-preview {
        height: 280px;
        margin-top: 0.6rem;
        border-radius: 14px;
        background-position: center;
        background-size: cover;
        background-color: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border);
      }
      .dropzone {
        width: 100%;
        height: 220px;
        margin-top: 0.6rem;
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
      .variant-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.7rem;
        margin-top: 0.7rem;
      }
      @media (max-width: 820px) { .variant-grid { grid-template-columns: 1fr; } }
      .variant-card {
        position: relative;
        padding: 0;
        border: 1.5px solid var(--border);
        background: rgba(255, 255, 255, 0.03);
        border-radius: 14px;
        overflow: hidden;
        text-align: left;
        color: var(--text-1);
        cursor: pointer;
        transition: transform 0.18s, border-color 0.18s;
      }
      .variant-card:hover { transform: translateY(-2px); border-color: var(--border-strong); }
      .variant-card.active { border-color: var(--neon-cyan); box-shadow: 0 0 0 1px var(--neon-cyan); }
      .variant-thumb {
        width: 100%;
        aspect-ratio: 1 / 1.1;
        background-position: center;
        background-size: cover;
        background-color: rgba(255, 255, 255, 0.04);
        position: relative;
      }
      .variant-meta { padding: 0.65rem 0.75rem 0.8rem; }
      .variant-meta strong { font-size: 0.92rem; }
      .variant-meta p { font-size: 0.78rem; margin: 0.25rem 0 0; line-height: 1.4; }
      .check-badge {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: var(--neon-cyan);
        color: var(--bg-0);
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.85rem;
      }
      .empty {
        text-align: center;
        padding: 2rem 1rem;
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
      .applied {
        margin-top: 0.9rem;
        padding: 0.7rem 0.85rem;
        border-radius: 10px;
        border: 1px solid rgba(52, 211, 153, 0.5);
        background: rgba(52, 211, 153, 0.08);
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
        font-size: 0.78rem;
      }
      .loader {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.18);
        border-top-color: var(--neon-cyan);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `,
  ],
})
export class SkinEnhancerToolComponent {
  private readonly eligibilitySrv = inject(ImageEligibilityService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly sourceUri = signal<string | null>(null);
  protected readonly sourceName = signal<string | null>(null);
  protected readonly strength = signal(60);
  protected readonly preserveIdentity = signal(true);
  protected readonly running = signal(false);
  protected readonly variants = signal<FaceVariant[]>([]);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly eligibility = signal<EligibilityResult | null>(null);
  protected readonly applied = signal<FaceVariant | null>(null);

  protected readonly selected = computed(() =>
    this.variants().find((v) => v.id === this.selectedId()) ?? null,
  );

  protected triggerUpload() { this.fileInput()?.nativeElement.click(); }

  protected onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;
      this.sourceUri.set(result);
      this.sourceName.set(file.name);
      this.variants.set([]);
      this.selectedId.set(null);
      this.applied.set(null);
      this.eligibility.set(null);
      this.eligibilitySrv.check({ fileName: file.name, uri: result }).subscribe((r) => {
        this.eligibility.set(r);
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  protected clearSource() {
    this.sourceUri.set(null);
    this.sourceName.set(null);
    this.variants.set([]);
    this.selectedId.set(null);
    this.eligibility.set(null);
    this.applied.set(null);
  }

  protected select(id: string) {
    this.selectedId.set(id);
    this.applied.set(null);
  }

  protected verdictLabel(v: EligibilityResult['verdict']) {
    return { allowed: 'Allowed ✓', warning: 'Allowed with warnings', blocked: 'Blocked' }[v];
  }

  protected apply(id: string) {
    const v = this.variants().find((x) => x.id === id);
    if (v) this.applied.set(v);
  }

  protected enhance() {
    if (!this.sourceUri()) return;
    const now = Date.now();
    const queued: FaceVariant[] = VARIANT_STYLES.map((s, i) => ({
      id: `${now}-${i}`,
      style: s.style,
      label: s.label,
      description: s.description,
      uri: s.sample,
      status: 'rendering',
    }));
    this.variants.set(queued);
    this.selectedId.set(null);
    this.applied.set(null);
    this.running.set(true);

    queued.forEach((v, i) => {
      setTimeout(() => {
        this.variants.update((list) =>
          list.map((x) => (x.id === v.id ? { ...x, status: 'ready' } : x)),
        );
        if (i === queued.length - 1) this.running.set(false);
      }, 900 + i * 280);
    });
  }
}
