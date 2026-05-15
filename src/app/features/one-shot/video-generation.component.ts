import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AssetsService } from '../../core/services/assets.service';
import { ModelsService } from '../../core/services/models.service';
import {
  EligibilityResult,
  ImageEligibilityService,
} from '../../core/services/image-eligibility.service';
import { AiModel } from '../../core/models/contract.model';
import { SAMPLE_VIDEO_POOL } from '../../core/services/sample-videos';
import { PromptEnhancerDialogComponent } from '../../shared/prompt-enhancer-dialog.component';

type FrameMode = 'text_only' | 'start_frame' | 'start_end';

interface FrameSlot {
  uri: string;
  name: string;
  source: 'upload' | 'asset';
  eligibility: EligibilityResult | null;
}

interface GeneratedClip {
  id: string;
  uri: string;
  status: 'queued' | 'rendering' | 'ready';
  prompt: string;
  model: string;
  saved: boolean;
}

const ASPECTS: { value: string; label: string }[] = [
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '1:1', label: '1:1' },
  { value: '4:5', label: '4:5' },
  { value: '2.39:1', label: '2.39:1' },
];

@Component({
  selector: 'app-one-shot-video',
  imports: [FormsModule, RouterLink, DecimalPipe, PromptEnhancerDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      <a routerLink="/one-shot" class="btn ghost sm" style="margin-bottom: 0.5rem">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5l-5 5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to One shot
      </a>
      <h1>One-shot video</h1>
      <p class="muted" style="margin-top: 0.4rem; max-width: 64ch">
        Generate a short clip from a prompt. Add a start frame for image-to-video, a start + end
        frame to interpolate between two shots, or pin an avatar to keep a character consistent.
      </p>
    </header>

    <div class="layout">
      <section class="card panel">
        <div class="eyebrow">1 · Mode</div>
        <div class="row" style="gap: 0.4rem; flex-wrap: wrap; margin-top: 0.4rem">
          <button class="tab" type="button" [class.active]="mode() === 'text_only'" (click)="setMode('text_only')">From prompt</button>
          <button class="tab" type="button" [class.active]="mode() === 'start_frame'" (click)="setMode('start_frame')">Start frame</button>
          <button class="tab" type="button" [class.active]="mode() === 'start_end'" (click)="setMode('start_end')">Start → End</button>
        </div>

        @if (mode() !== 'text_only') {
          <div class="eyebrow" style="margin-top: 1rem">2 · Frames</div>
          <p class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">
            @if (mode() === 'start_frame') {
              Drop a still — the model animates it forward based on your prompt.
            } @else {
              Drop two stills — the model interpolates motion from start to end.
            }
          </p>

          <div class="frames">
            <div class="frame-slot">
              <div class="frame-label">Start frame</div>
              @if (startFrame(); as f) {
                <div class="frame-tile" [class]="f.eligibility ? 'verdict-' + f.eligibility.verdict : ''">
                  <div class="frame-thumb" [style.background-image]="'url(' + f.uri + ')'"></div>
                  <button class="frame-remove iconbtn" type="button" (click)="clearFrame('start')" title="Remove">×</button>
                  <span class="frame-name">{{ f.name }}</span>
                </div>
              } @else {
                <button class="frame-drop" type="button" (click)="triggerUpload('start')">
                  <span style="font-size: 1.4rem">📥</span>
                  <span>Upload start frame</span>
                </button>
              }
            </div>

            @if (mode() === 'start_end') {
              <div class="frame-arrow">→</div>
              <div class="frame-slot">
                <div class="frame-label">End frame</div>
                @if (endFrame(); as f) {
                  <div class="frame-tile" [class]="f.eligibility ? 'verdict-' + f.eligibility.verdict : ''">
                    <div class="frame-thumb" [style.background-image]="'url(' + f.uri + ')'"></div>
                    <button class="frame-remove iconbtn" type="button" (click)="clearFrame('end')" title="Remove">×</button>
                    <span class="frame-name">{{ f.name }}</span>
                  </div>
                } @else {
                  <button class="frame-drop" type="button" (click)="triggerUpload('end')">
                    <span style="font-size: 1.4rem">📥</span>
                    <span>Upload end frame</span>
                  </button>
                }
              </div>
            }
          </div>
        }

        <div class="row" style="margin-top: 1rem; justify-content: space-between; align-items: center; gap: 0.5rem">
          <div class="eyebrow">{{ mode() === 'text_only' ? '2' : '3' }} · Prompt</div>
          <button class="btn ghost sm" type="button" (click)="enhancerOpen.set(true)">
            ✨ Enhance prompt
          </button>
        </div>
        <textarea
          rows="4"
          [ngModel]="prompt()"
          (ngModelChange)="prompt.set($event)"
          placeholder="e.g. slow dolly-in on a foggy forest path, golden hour light, gentle camera shake"
          style="margin-top: 0.4rem"
        ></textarea>

        <div class="eyebrow" style="margin-top: 1rem">Avatar <span class="muted" style="font-size: 0.72rem; letter-spacing: 0">(optional)</span></div>
        <p class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">
          Pin a character reference so faces and wardrobe stay consistent across renders.
        </p>
        @if (avatar(); as a) {
          <div class="avatar-row">
            <div class="avatar-thumb" [style.background-image]="'url(' + a.uri + ')'"></div>
            <div class="avatar-meta">
              <strong>{{ a.name }}</strong>
              @if (a.eligibility; as e) {
                <span class="chip" [class]="verdictTone(e.verdict)">{{ verdictLabel(e.verdict) }}</span>
              } @else {
                <span class="chip muted"><span class="loader-xs"></span> scanning</span>
              }
            </div>
            <button class="iconbtn" type="button" (click)="clearAvatar()" title="Remove avatar">×</button>
          </div>
        } @else {
          <button class="btn sm" type="button" (click)="triggerUpload('avatar')" style="margin-top: 0.4rem">+ Upload avatar</button>
        }
        <input #fileInput type="file" accept="image/*" hidden (change)="onFile($event)"/>
      </section>

      <section class="card panel">
        <div class="eyebrow">4 · Output</div>

        <label class="field" style="margin-top: 0.4rem">Aspect ratio</label>
        <div class="chip-grid compact" style="margin-top: 0.4rem">
          @for (a of aspects; track a.value) {
            <button
              type="button"
              class="opt-chip sm"
              [class.active]="aspect() === a.value"
              (click)="aspect.set(a.value)"
            >{{ a.label }}</button>
          }
        </div>

        <label class="field" style="margin-top: 0.8rem">Duration ({{ durationSec() }}s)</label>
        <input
          type="range"
          min="2"
          max="10"
          step="1"
          [ngModel]="durationSec()"
          (ngModelChange)="durationSec.set(+$event)"
          style="width: 100%; margin-top: 0.2rem"
        />
        <div class="row" style="justify-content: space-between; font-size: 0.74rem; color: var(--text-3)">
          <span>2s</span>
          <span>10s</span>
        </div>

        <label class="field" style="margin-top: 0.8rem">Variations</label>
        <input
          type="range"
          min="1"
          max="4"
          step="1"
          [ngModel]="count()"
          (ngModelChange)="count.set(+$event)"
          style="width: 100%; margin-top: 0.2rem"
        />
        <div class="row" style="justify-content: space-between; font-size: 0.74rem; color: var(--text-3)">
          <span>1</span><span class="mono">{{ count() }}</span><span>4</span>
        </div>

        <div class="eyebrow" style="margin-top: 1rem">Model</div>
        <select [ngModel]="modelId()" (ngModelChange)="modelId.set($event)" style="margin-top: 0.4rem">
          @for (m of availableModels(); track m.id) {
            <option [value]="m.id">{{ m.provider }} · {{ m.name }} — {{ m.speed }} · {{ m.costPerUnit }}/{{ m.unit }}</option>
          }
        </select>
        @if (selectedModel(); as m) {
          <p class="muted" style="font-size: 0.78rem; margin-top: 0.35rem">{{ m.description }}</p>
        }

        <p class="muted" style="margin-top: 0.8rem; font-size: 0.78rem">
          Estimated cost: <span class="mono">{{ estimateCost() | number: '1.2-2' }}</span> credits
        </p>

        <button
          class="btn primary"
          style="margin-top: 0.8rem; width: 100%"
          (click)="generate()"
          [disabled]="!canGenerate() || running()"
        >
          @if (running()) { Rendering {{ count() }}… }
          @else { ✨ Generate ({{ count() }}) }
        </button>

        @if (blockedReason(); as r) {
          <div class="muted" style="font-size: 0.78rem; text-align: center; margin-top: 0.4rem">{{ r }}</div>
        }
      </section>
    </div>

    <app-prompt-enhancer-dialog
      mode="video"
      [open]="enhancerOpen()"
      (close)="enhancerOpen.set(false)"
      (insert)="appendToPrompt($event)"
      (replace)="prompt.set($event)"
    />

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
              <div class="result-video-wrap" [style.aspect-ratio]="aspectRatioCss()">
                @if (r.status === 'ready') {
                  <video class="result-video" [src]="r.uri" controls preload="metadata" playsinline></video>
                } @else {
                  <div class="result-overlay"><span class="loader"></span><span>{{ r.status }}</span></div>
                }
              </div>
              <div class="result-actions">
                <button class="btn sm" type="button" (click)="saveToAssets(r)" [disabled]="r.saved || r.status !== 'ready'">
                  @if (r.saved) { ✓ In library } @else { Save to library }
                </button>
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
      .layout { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(280px, 1fr); gap: 1rem; margin-top: 1rem; }
      .panel { padding: 1rem 1.1rem; }
      .eyebrow { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--text-mute); font-weight: 700; }
      .tab { background: transparent; border: 1px solid var(--border); border-radius: 999px; padding: 0.35rem 0.85rem; color: var(--text-2); cursor: pointer; font-size: 0.8rem; }
      .tab.active { background: var(--grad-secondary); color: white; border-color: transparent; }
      .chip-grid { display: flex; flex-wrap: wrap; gap: 0.35rem; }
      .opt-chip { background: transparent; border: 1px solid var(--border); border-radius: 999px; padding: 0.32rem 0.8rem; color: var(--text-2); cursor: pointer; font-size: 0.78rem; }
      .opt-chip.active { background: var(--grad-secondary); color: white; border-color: transparent; }
      .frames { display: flex; align-items: stretch; gap: 0.6rem; margin-top: 0.5rem; }
      .frame-slot { flex: 1; display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }
      .frame-label { font-size: 0.74rem; color: var(--text-2); }
      .frame-drop { width: 100%; aspect-ratio: 16/9; border: 1.5px dashed var(--border-strong); border-radius: 12px; background: rgba(255,255,255,0.02); color: var(--text-2); cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.3rem; font-size: 0.82rem; }
      .frame-drop:hover { border-color: rgba(139, 92, 246, 0.6); color: var(--text-1); }
      .frame-tile { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
      .frame-tile.verdict-blocked { border-color: rgba(255, 107, 138, 0.6); }
      .frame-tile.verdict-warning { border-color: rgba(251, 191, 36, 0.6); }
      .frame-thumb { aspect-ratio: 16/9; background-size: cover; background-position: center; }
      .frame-name { position: absolute; bottom: 6px; left: 6px; right: 36px; font-size: 0.72rem; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.6); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .frame-remove { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 999px; width: 24px; height: 24px; cursor: pointer; }
      .frame-arrow { align-self: center; font-size: 1.4rem; color: var(--text-2); padding-top: 1.2rem; }
      .avatar-row { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.5rem; padding: 0.5rem; border: 1px solid var(--border); border-radius: 10px; }
      .avatar-thumb { width: 48px; height: 48px; border-radius: 50%; background-size: cover; background-position: center; border: 1px solid var(--border); }
      .avatar-meta { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
      .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.8rem; }
      .result-tile { padding: 0.6rem; display: flex; flex-direction: column; gap: 0.4rem; }
      .result-video-wrap { background: #06081a; border-radius: 10px; overflow: hidden; position: relative; }
      .result-video { width: 100%; height: 100%; object-fit: contain; display: block; }
      .result-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 0.4rem; color: white; flex-direction: column; }
      .result-actions { display: flex; gap: 0.4rem; }
      .verdict-blocked .frame-thumb { filter: grayscale(0.4) brightness(0.7); }
      .chip { font-size: 0.7rem; padding: 2px 8px; border-radius: 999px; }
      .chip.green { background: rgba(52, 211, 153, 0.18); color: #34d399; }
      .chip.amber { background: rgba(251, 191, 36, 0.18); color: #fbbf24; }
      .chip.rose  { background: rgba(255, 107, 138, 0.2); color: #ff6b8a; }
      .chip.muted { background: rgba(255,255,255,0.06); color: var(--text-2); }
      .loader-xs { width: 10px; height: 10px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; display: inline-block; animation: spin 0.7s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `,
  ],
})
export class OneShotVideoComponent {
  private readonly assetsSrv = inject(AssetsService);
  private readonly modelsSrv = inject(ModelsService);
  private readonly eligibilitySrv = inject(ImageEligibilityService);

  protected readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly aspects = ASPECTS;
  protected readonly mode = signal<FrameMode>('text_only');
  protected readonly prompt = signal('');
  protected readonly startFrame = signal<FrameSlot | null>(null);
  protected readonly endFrame = signal<FrameSlot | null>(null);
  protected readonly avatar = signal<FrameSlot | null>(null);
  protected readonly aspect = signal('16:9');
  protected readonly durationSec = signal(4);
  protected readonly count = signal(2);
  protected readonly modelId = signal('');
  protected readonly results = signal<GeneratedClip[]>([]);
  protected readonly running = signal(false);
  protected readonly enhancerOpen = signal(false);

  /** Which slot the next file upload should populate. */
  private uploadTarget: 'start' | 'end' | 'avatar' = 'start';

  protected readonly availableModels = computed<AiModel[]>(() => {
    const all = this.modelsSrv.models();
    if (this.mode() === 'text_only') {
      return all.filter((m) => m.capability === 'text_to_video');
    }
    return all.filter(
      (m) => m.capability === 'image_to_video' || m.capability === 'text_to_video',
    );
  });

  protected readonly selectedModel = computed(() =>
    this.availableModels().find((m) => m.id === this.modelId()),
  );

  protected readonly estimateCost = computed(() => {
    const m = this.selectedModel();
    if (!m) return 0;
    return m.costPerUnit * this.durationSec() * this.count();
  });

  protected readonly aspectRatioCss = computed(() => {
    const [w, h] = this.aspect().split(':').map(Number);
    return Number.isFinite(w) && Number.isFinite(h) && h > 0 ? `${w} / ${h}` : '16 / 9';
  });

  protected readonly canGenerate = computed(() => {
    if (this.running()) return false;
    if (!this.modelId()) return false;
    if (!this.prompt().trim()) return false;
    if (this.mode() === 'start_frame' && !this.startFrame()) return false;
    if (this.mode() === 'start_end' && (!this.startFrame() || !this.endFrame())) return false;
    if (this.startFrame()?.eligibility?.verdict === 'blocked') return false;
    if (this.endFrame()?.eligibility?.verdict === 'blocked') return false;
    if (this.avatar()?.eligibility?.verdict === 'blocked') return false;
    return true;
  });

  protected readonly blockedReason = computed<string | null>(() => {
    if (this.canGenerate()) return null;
    if (!this.prompt().trim()) return 'Write a prompt to describe the shot.';
    if (this.mode() === 'start_frame' && !this.startFrame()) return 'Upload a start frame.';
    if (this.mode() === 'start_end' && (!this.startFrame() || !this.endFrame())) {
      return 'Upload both start and end frames.';
    }
    if (this.startFrame()?.eligibility?.verdict === 'blocked') return 'Start frame blocked by eligibility check.';
    if (this.endFrame()?.eligibility?.verdict === 'blocked') return 'End frame blocked by eligibility check.';
    if (this.avatar()?.eligibility?.verdict === 'blocked') return 'Avatar blocked by eligibility check.';
    if (!this.modelId()) return 'Pick a model.';
    return null;
  });

  constructor() {
    effect(() => {
      const first = this.availableModels()[0];
      if (first && !this.availableModels().some((m) => m.id === this.modelId())) {
        this.modelId.set(first.id);
      }
    });
  }

  protected setMode(m: FrameMode) {
    this.mode.set(m);
    if (m === 'text_only') {
      this.startFrame.set(null);
      this.endFrame.set(null);
    } else if (m === 'start_frame') {
      this.endFrame.set(null);
    }
  }

  protected triggerUpload(which: 'start' | 'end' | 'avatar') {
    this.uploadTarget = which;
    this.fileInput()?.nativeElement.click();
  }

  protected onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;
      const slot: FrameSlot = { uri: result, name: file.name, source: 'upload', eligibility: null };
      const target = this.uploadTarget;
      if (target === 'start') this.startFrame.set(slot);
      else if (target === 'end') this.endFrame.set(slot);
      else this.avatar.set(slot);
      this.eligibilitySrv.check({ fileName: file.name, uri: result }).subscribe((e) => {
        const updater = (s: FrameSlot | null) => (s ? { ...s, eligibility: e } : s);
        if (target === 'start') this.startFrame.update(updater);
        else if (target === 'end') this.endFrame.update(updater);
        else this.avatar.update(updater);
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  protected clearFrame(which: 'start' | 'end') {
    if (which === 'start') this.startFrame.set(null);
    else this.endFrame.set(null);
  }

  protected clearAvatar() { this.avatar.set(null); }
  protected clearResults() { this.results.set([]); }

  protected appendToPrompt(extra: string) {
    if (!extra.trim()) return;
    const current = this.prompt().trim();
    this.prompt.set(current ? `${current}, ${extra}` : extra);
  }

  protected generate() {
    if (!this.canGenerate()) return;
    const n = this.count();
    const promptText = this.prompt().trim();
    const modelName = this.selectedModel()?.name ?? 'unknown';
    const now = Date.now();
    const queued: GeneratedClip[] = Array.from({ length: n }, (_, i) => ({
      id: `${now}-${i}`,
      uri: SAMPLE_VIDEO_POOL[(now + i) % SAMPLE_VIDEO_POOL.length],
      status: 'queued',
      prompt: promptText,
      model: modelName,
      saved: false,
    }));
    this.results.set(queued);
    this.running.set(true);

    queued.forEach((item, i) => {
      setTimeout(() => {
        this.results.update((list) =>
          list.map((r) => (r.id === item.id ? { ...r, status: 'rendering' } : r)),
        );
      }, 250 + i * 160);
      setTimeout(() => {
        this.results.update((list) =>
          list.map((r) => (r.id === item.id ? { ...r, status: 'ready' } : r)),
        );
        if (i === queued.length - 1) this.running.set(false);
      }, 1500 + i * 320);
    });
  }

  protected saveToAssets(r: GeneratedClip) {
    if (r.saved || r.status !== 'ready') return;
    const m = this.selectedModel();
    this.assetsSrv
      .generate({
        type: 'video',
        name: `one-shot-${r.id.slice(-6)}.mp4`,
        prompt: r.prompt,
        provider: m?.provider ?? 'unknown',
        model: m?.name ?? 'one-shot-video',
      })
      .subscribe(() => {
        this.results.update((list) =>
          list.map((x) => (x.id === r.id ? { ...x, saved: true } : x)),
        );
      });
  }

  protected verdictLabel(v: EligibilityResult['verdict']): string {
    return { allowed: 'OK', warning: 'Warning', blocked: 'Blocked' }[v];
  }

  protected verdictTone(v: EligibilityResult['verdict']): string {
    return { allowed: 'green', warning: 'amber', blocked: 'rose' }[v];
  }
}
