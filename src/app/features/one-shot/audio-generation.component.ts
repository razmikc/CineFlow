import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AssetsService } from '../../core/services/assets.service';
import { ModelsService } from '../../core/services/models.service';
import { AiModel } from '../../core/models/contract.model';
import { PromptEnhancerDialogComponent } from '../../shared/prompt-enhancer-dialog.component';

interface GeneratedTrack {
  id: string;
  uri: string;
  status: 'queued' | 'rendering' | 'ready';
  prompt: string;
  model: string;
  saved: boolean;
}

const DURATIONS: { sec: number; label: string }[] = [
  { sec: 30, label: '30s' },
  { sec: 60, label: '1m' },
  { sec: 120, label: '2m' },
  { sec: 180, label: '3m' },
];

const SAMPLE_AUDIO_POOL = [
  'https://www.w3schools.com/html/horse.mp3',
  'https://www.kozco.com/tech/piano2.wav',
];

@Component({
  selector: 'app-one-shot-audio',
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
      <h1>One-shot audio</h1>
      <p class="muted" style="margin-top: 0.4rem; max-width: 64ch">
        Generate music or sound from a prompt. Describe genre, mood, instruments,
        structure — the model returns playable tracks straight to your library.
      </p>
    </header>

    <div class="layout">
      <section class="card panel">
        <div class="row" style="justify-content: space-between; align-items: center; gap: 0.5rem">
          <div class="eyebrow">1 · Prompt</div>
          <button class="btn ghost sm" type="button" (click)="enhancerOpen.set(true)">
            ✨ Enhance prompt
          </button>
        </div>
        <textarea
          rows="6"
          [ngModel]="prompt()"
          (ngModelChange)="prompt.set($event)"
          placeholder="e.g. driving lo-fi beat, 110 BPM, vinyl crackle, mellow piano, instrumental"
          style="margin-top: 0.4rem"
        ></textarea>

        <div class="eyebrow" style="margin-top: 1rem">Lyrics <span class="muted" style="font-size: 0.72rem; letter-spacing: 0">(optional)</span></div>
        <textarea
          rows="3"
          [ngModel]="lyrics()"
          (ngModelChange)="lyrics.set($event)"
          placeholder="Drop a verse, a hook, or leave empty for instrumental"
          style="margin-top: 0.3rem"
        ></textarea>
      </section>

      <section class="card panel">
        <div class="eyebrow">2 · Output</div>

        <label class="field" style="margin-top: 0.4rem">Duration</label>
        <div class="chip-grid compact" style="margin-top: 0.4rem">
          @for (d of durations; track d.sec) {
            <button
              type="button"
              class="opt-chip sm"
              [class.active]="durationSec() === d.sec"
              (click)="durationSec.set(d.sec)"
            >{{ d.label }}</button>
          }
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
      mode="audio"
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
            <h2 style="margin-top: 0.3rem; font-size: 1.15rem">Tracks</h2>
          </div>
          <button class="btn ghost sm" type="button" (click)="clearResults()">Clear</button>
        </div>
        <div class="results-grid">
          @for (r of results(); track r.id) {
            <div class="result-tile card">
              <div class="result-art">
                <span class="result-emoji">🎵</span>
                @if (r.status !== 'ready') {
                  <div class="result-overlay"><span class="loader"></span><span>{{ r.status }}</span></div>
                }
              </div>
              @if (r.status === 'ready') {
                <audio class="result-audio" [src]="r.uri" controls preload="metadata"></audio>
              }
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
      .chip-grid { display: flex; flex-wrap: wrap; gap: 0.35rem; }
      .opt-chip { background: transparent; border: 1px solid var(--border); border-radius: 999px; padding: 0.32rem 0.8rem; color: var(--text-2); cursor: pointer; font-size: 0.78rem; }
      .opt-chip.active { background: var(--grad-secondary); color: white; border-color: transparent; }
      .results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.8rem; }
      .result-tile { padding: 0.6rem; display: flex; flex-direction: column; gap: 0.4rem; }
      .result-art { background: linear-gradient(135deg, rgba(251, 191, 36, 0.4), rgba(255, 77, 173, 0.3)); border-radius: 10px; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; position: relative; }
      .result-emoji { font-size: 2.2rem; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4)); }
      .result-audio { width: 100%; }
      .result-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 0.4rem; color: white; flex-direction: column; background: rgba(0,0,0,0.45); border-radius: 10px; }
      .result-actions { display: flex; gap: 0.4rem; }
    `,
  ],
})
export class OneShotAudioComponent {
  private readonly assetsSrv = inject(AssetsService);
  private readonly modelsSrv = inject(ModelsService);

  protected readonly durations = DURATIONS;

  protected readonly prompt = signal('');
  protected readonly lyrics = signal('');
  protected readonly durationSec = signal(60);
  protected readonly count = signal(2);
  protected readonly modelId = signal('');
  protected readonly results = signal<GeneratedTrack[]>([]);
  protected readonly running = signal(false);
  protected readonly enhancerOpen = signal(false);

  protected readonly availableModels = computed<AiModel[]>(() =>
    this.modelsSrv
      .models()
      .filter((m) => m.capability === 'music_generation' || m.capability === 'audio_generation'),
  );

  protected readonly selectedModel = computed(() =>
    this.availableModels().find((m) => m.id === this.modelId()),
  );

  protected readonly estimateCost = computed(() => {
    const m = this.selectedModel();
    if (!m) return 0;
    return m.costPerUnit * (this.durationSec() / 30) * this.count();
  });

  protected readonly canGenerate = computed(() => {
    if (this.running()) return false;
    if (!this.modelId()) return false;
    return this.prompt().trim().length > 0;
  });

  protected readonly blockedReason = computed<string | null>(() => {
    if (this.canGenerate()) return null;
    if (!this.prompt().trim()) return 'Describe the track to generate.';
    if (!this.modelId()) return 'Pick a music model.';
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

  protected clearResults() { this.results.set([]); }

  protected appendToPrompt(extra: string) {
    if (!extra.trim()) return;
    const current = this.prompt().trim();
    this.prompt.set(current ? `${current}, ${extra}` : extra);
  }

  protected generate() {
    if (!this.canGenerate()) return;
    const n = this.count();
    const promptText = this.composedPrompt();
    const modelName = this.selectedModel()?.name ?? 'unknown';
    const now = Date.now();
    const queued: GeneratedTrack[] = Array.from({ length: n }, (_, i) => ({
      id: `${now}-${i}`,
      uri: SAMPLE_AUDIO_POOL[(now + i) % SAMPLE_AUDIO_POOL.length],
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
      }, 1800 + i * 320);
    });
  }

  private composedPrompt(): string {
    const lyrics = this.lyrics().trim();
    return lyrics ? `${this.prompt().trim()}\nLyrics: ${lyrics}` : this.prompt().trim();
  }

  protected saveToAssets(r: GeneratedTrack) {
    if (r.saved || r.status !== 'ready') return;
    const m = this.selectedModel();
    this.assetsSrv
      .generate({
        type: 'audio',
        name: `one-shot-${r.id.slice(-6)}.mp3`,
        prompt: r.prompt,
        provider: m?.provider ?? 'unknown',
        model: m?.name ?? 'one-shot-audio',
      })
      .subscribe(() => {
        this.results.update((list) =>
          list.map((x) => (x.id === r.id ? { ...x, saved: true } : x)),
        );
      });
  }
}
