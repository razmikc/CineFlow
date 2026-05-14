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

interface AnglePreset {
  id: string;
  label: string;
  description: string;
}

interface GeneratedAngle {
  id: string;
  angleId: string;
  label: string;
  uri: string;
  status: 'queued' | 'rendering' | 'ready';
}

const ANGLE_PRESETS: AnglePreset[] = [
  { id: 'front', label: 'Front', description: 'Straight-on, eye level' },
  { id: 'three_quarter_left', label: '3/4 Left', description: '45° from left' },
  { id: 'three_quarter_right', label: '3/4 Right', description: '45° from right' },
  { id: 'profile_left', label: 'Profile Left', description: '90° from left' },
  { id: 'profile_right', label: 'Profile Right', description: '90° from right' },
  { id: 'back', label: 'Back', description: 'Behind the subject' },
  { id: 'low_angle', label: 'Low angle', description: 'Looking up at subject' },
  { id: 'high_angle', label: 'High angle', description: 'Looking down at subject' },
  { id: 'dutch', label: 'Dutch tilt', description: 'Tilted horizon, dramatic' },
];

const FALLBACK_RESULTS = [
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900',
  'https://images.unsplash.com/photo-1503443207922-dff7d543fd0e?w=900',
  'https://images.unsplash.com/photo-1502767089025-6572583495b4?w=900',
  'https://images.unsplash.com/photo-1546961342-1a2eebd99e1b?w=900',
  'https://images.unsplash.com/photo-1492288991661-058aa541ff43?w=900',
  'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=900',
  'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=900',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900',
];

@Component({
  selector: 'app-camera-angles-tool',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="row" style="justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem">
      <div>
        <a routerLink="/tools" class="btn ghost sm" style="margin-bottom: 0.5rem">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5l-5 5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Back to tools
        </a>
        <h1>Camera angle generator</h1>
        <p class="muted" style="margin-top: 0.4rem; max-width: 60ch">
          Upload one image, then render the same subject from up to 9 camera angles. Pick angles manually
          or click <strong>9 angles by default</strong> to queue the full turnaround sheet.
        </p>
      </div>
    </header>

    <div class="layout">
      <section class="card panel">
        <div class="eyebrow">1 · Source image</div>
        <div class="source-wrap">
          @if (sourceUri()) {
            <div class="source-preview" [style.background-image]="'url(' + sourceUri() + ')'"></div>
          } @else {
            <button class="dropzone" (click)="triggerUpload()" type="button">
              <div style="font-size: 1.8rem">📷</div>
              <strong>Drop an image or click to upload</strong>
              <span class="muted" style="font-size: 0.78rem">JPG, PNG, WEBP — single image</span>
            </button>
          }
          <input
            #fileInput
            type="file"
            accept="image/*"
            hidden
            (change)="onFileSelected($event)"
          />
        </div>

        @if (sourceUri()) {
          <div class="row" style="gap: 0.5rem; margin-top: 0.7rem">
            <button class="btn sm" type="button" (click)="triggerUpload()">Replace image</button>
            <button class="btn ghost sm" type="button" (click)="clearSource()">Remove</button>
          </div>
        }

        @if (eligibility(); as e) {
          <div class="elig" [class]="'verdict-' + e.verdict">
            <div class="row" style="justify-content: space-between">
              <strong style="font-size: 0.85rem">{{ verdictLabel(e.verdict) }}</strong>
              <span class="muted" style="font-size: 0.75rem">Score {{ e.score }}/100</span>
            </div>
            <div class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">{{ e.summary }}</div>
          </div>
        }
      </section>

      <section class="card panel">
        <div class="row" style="justify-content: space-between; align-items: flex-start">
          <div>
            <div class="eyebrow">2 · Angles</div>
            <p class="muted" style="margin-top: 0.3rem; font-size: 0.82rem">
              {{ selectedCount() }} of {{ presets.length }} selected
            </p>
          </div>
          <div class="row" style="gap: 0.4rem; flex-wrap: wrap">
            <button class="btn sm" type="button" (click)="selectAll()">9 angles by default</button>
            <button class="btn ghost sm" type="button" (click)="clearAll()">Clear</button>
          </div>
        </div>

        <div class="angle-grid" style="margin-top: 0.8rem">
          @for (p of presets; track p.id) {
            <button
              type="button"
              class="angle-chip"
              [class.active]="isSelected(p.id)"
              (click)="toggle(p.id)"
            >
              <strong>{{ p.label }}</strong>
              <span class="muted" style="font-size: 0.72rem">{{ p.description }}</span>
            </button>
          }
        </div>

        <label class="field" style="margin-top: 0.8rem">
          Prompt notes
          <textarea
            rows="2"
            [ngModel]="prompt()"
            (ngModelChange)="prompt.set($event)"
            placeholder="e.g. cinematic 35mm, soft rim light, neutral background"
          ></textarea>
        </label>

        <button
          class="btn primary"
          style="margin-top: 0.9rem; width: 100%"
          (click)="generate()"
          [disabled]="!canGenerate() || running()"
        >
          @if (running()) {
            Rendering {{ selectedCount() }} angle{{ selectedCount() === 1 ? '' : 's' }}…
          } @else {
            Generate {{ selectedCount() }} angle{{ selectedCount() === 1 ? '' : 's' }}
          }
        </button>
      </section>
    </div>

    @if (results().length > 0) {
      <section style="margin-top: 1.4rem">
        <div class="row" style="justify-content: space-between; margin-bottom: 0.6rem">
          <div>
            <div class="eyebrow">Output</div>
            <h2 style="margin-top: 0.3rem; font-size: 1.2rem">Rendered angles</h2>
          </div>
          <button class="btn ghost sm" type="button" (click)="clearResults()">Clear results</button>
        </div>
        <div class="results-grid">
          @for (r of results(); track r.id) {
            <div class="result-tile card">
              <div class="result-thumb" [style.background-image]="'url(' + r.uri + ')'">
                @if (r.status !== 'ready') {
                  <div class="result-overlay">
                    <span class="loader"></span>
                    <span>{{ r.status }}</span>
                  </div>
                }
              </div>
              <div class="row" style="justify-content: space-between; padding: 0.55rem 0.7rem">
                <strong style="font-size: 0.82rem">{{ r.label }}</strong>
                <span class="chip muted">{{ r.status }}</span>
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
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
        gap: 1rem;
        margin-top: 1.2rem;
      }
      @media (max-width: 960px) { .layout { grid-template-columns: 1fr; } }
      .panel { padding: 1.1rem; }
      .source-wrap { margin-top: 0.7rem; }
      .source-preview {
        height: 320px;
        border-radius: 14px;
        background-position: center;
        background-size: cover;
        background-color: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--border);
      }
      .dropzone {
        width: 100%;
        height: 220px;
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
        transition: background 0.18s, border-color 0.18s;
      }
      .dropzone:hover { background: rgba(139, 92, 246, 0.06); border-color: var(--neon-violet); }
      .angle-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
      }
      @media (max-width: 540px) { .angle-grid { grid-template-columns: repeat(2, 1fr); } }
      .angle-chip {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        gap: 0.15rem;
        padding: 0.55rem 0.7rem;
        border-radius: 10px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.02);
        color: var(--text-1);
        cursor: pointer;
        transition: border-color 0.18s, background 0.18s;
        font-size: 0.85rem;
      }
      .angle-chip:hover { border-color: var(--border-strong); }
      .angle-chip.active {
        border-color: var(--neon-violet);
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(34, 211, 238, 0.08));
      }
      .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 0.7rem;
      }
      .result-tile { overflow: hidden; padding: 0; }
      .result-thumb {
        height: 200px;
        background-color: rgba(255, 255, 255, 0.04);
        background-size: cover;
        background-position: center;
        position: relative;
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
export class CameraAnglesToolComponent {
  private readonly eligibilitySrv = inject(ImageEligibilityService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly presets = ANGLE_PRESETS;
  protected readonly sourceUri = signal<string | null>(null);
  protected readonly sourceName = signal<string | null>(null);
  protected readonly selected = signal<Set<string>>(new Set(ANGLE_PRESETS.map((a) => a.id)));
  protected readonly prompt = signal('cinematic 35mm, soft rim light, neutral background');
  protected readonly running = signal(false);
  protected readonly results = signal<GeneratedAngle[]>([]);
  protected readonly eligibility = signal<EligibilityResult | null>(null);

  protected readonly selectedCount = computed(() => this.selected().size);
  protected readonly canGenerate = computed(() => !!this.sourceUri() && this.selected().size > 0);

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
    this.eligibility.set(null);
  }

  protected isSelected(id: string) { return this.selected().has(id); }

  protected toggle(id: string) {
    this.selected.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected selectAll() {
    this.selected.set(new Set(ANGLE_PRESETS.map((a) => a.id)));
  }

  protected clearAll() {
    this.selected.set(new Set());
  }

  protected clearResults() { this.results.set([]); }

  protected verdictLabel(v: EligibilityResult['verdict']) {
    return { allowed: 'Allowed ✓', warning: 'Allowed with warnings', blocked: 'Blocked' }[v];
  }

  protected generate() {
    if (!this.canGenerate()) return;
    const selectedIds = ANGLE_PRESETS.filter((p) => this.selected().has(p.id));
    const queue: GeneratedAngle[] = selectedIds.map((p, i) => ({
      id: `${Date.now()}-${i}`,
      angleId: p.id,
      label: p.label,
      uri: FALLBACK_RESULTS[i % FALLBACK_RESULTS.length],
      status: 'queued',
    }));
    this.results.set(queue);
    this.running.set(true);

    queue.forEach((item, i) => {
      setTimeout(() => {
        this.results.update((list) =>
          list.map((r) => (r.id === item.id ? { ...r, status: 'rendering' } : r)),
        );
      }, 200 + i * 120);
      setTimeout(() => {
        this.results.update((list) =>
          list.map((r) => (r.id === item.id ? { ...r, status: 'ready' } : r)),
        );
        if (i === queue.length - 1) this.running.set(false);
      }, 900 + i * 180);
    });
  }
}
