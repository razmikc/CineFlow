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
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AssetsService } from '../../../core/services/assets.service';
import { ModelsService } from '../../../core/services/models.service';
import { CharactersService } from '../../../core/services/characters.service';
import { AiModel, CharacterProfile } from '../../../core/models/contract.model';
import { SAMPLE_VIDEO_POOL } from '../../../core/services/sample-videos';
import { PromptEnhancerDialogComponent } from '../../../shared/prompt-enhancer-dialog.component';
import { CharacterExtractDialogComponent } from '../../../shared/character-extract-dialog.component';

type CloneStrategy = 'frame_by_frame' | 'keyframe_interp' | 'whole_video' | 'style_only';
type MatchOption<T extends string = string> = 'match' | T;

interface SourceVideo {
  uri: string;
  name: string;
  durationSec?: number;
  width?: number;
  height?: number;
}

interface ClonedClip {
  id: string;
  uri: string;
  status: 'queued' | 'rendering' | 'ready';
  strategy: CloneStrategy;
  prompt: string;
  model: string;
  saved: boolean;
}

interface StrategyMeta {
  key: CloneStrategy;
  label: string;
  emoji: string;
  hint: string;
  cost: 'low' | 'medium' | 'high';
}

const STRATEGIES: StrategyMeta[] = [
  {
    key: 'whole_video',
    label: 'Whole video (v2v)',
    emoji: '🎞',
    hint: 'Backend feeds the full clip into a video-to-video model. Best motion preservation; needs a v2v-capable model.',
    cost: 'medium',
  },
  {
    key: 'keyframe_interp',
    label: 'Keyframe + interpolate',
    emoji: '🔑',
    hint: 'Extract a few keyframes, regenerate them with the prompt, then interpolate motion. Fast and cheap; good for short clips.',
    cost: 'low',
  },
  {
    key: 'frame_by_frame',
    label: 'Frame-by-frame',
    emoji: '🎬',
    hint: 'Re-render every frame against the source frame + prompt. Highest fidelity, highest cost.',
    cost: 'high',
  },
  {
    key: 'style_only',
    label: 'Style transfer',
    emoji: '🎨',
    hint: 'Keep the original composition and motion exactly; only swap the visual style (e.g. "anime", "Wes Anderson palette").',
    cost: 'low',
  },
];

const RESOLUTIONS: { value: MatchOption<'720p' | '1080p' | '2k' | '4k'>; label: string }[] = [
  { value: 'match', label: 'Match source' },
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' },
  { value: '2k', label: '2K' },
  { value: '4k', label: '4K' },
];

const ASPECTS: { value: MatchOption<'16:9' | '9:16' | '1:1' | '4:5' | '2.39:1'>; label: string }[] = [
  { value: 'match', label: 'Match' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '1:1', label: '1:1' },
  { value: '4:5', label: '4:5' },
  { value: '2.39:1', label: '2.39:1' },
];

const FPS_OPTIONS: { value: MatchOption<'24' | '30' | '60'>; label: string }[] = [
  { value: 'match', label: 'Match' },
  { value: '24', label: '24' },
  { value: '30', label: '30' },
  { value: '60', label: '60' },
];

@Component({
  selector: 'app-video-clone-tool',
  imports: [FormsModule, RouterLink, DecimalPipe, PromptEnhancerDialogComponent, CharacterExtractDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./video-clone.component.scss'],
  template: `
    <header>
      <a routerLink="/tools" class="btn ghost sm" style="margin-bottom: 0.5rem">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5l-5 5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to tools
      </a>
      <h1>Video clone</h1>
      <p class="muted" style="margin-top: 0.4rem; max-width: 70ch">
        Drop a video, pick a strategy, and let the backend reproduce it. Add a prompt to steer the rebuild,
        upload character references to keep faces consistent, and choose whether to reuse the source voice and music
        or generate new ones.
      </p>
    </header>

    <div class="layout">
      <!-- LEFT — source -->
      <section class="card panel">
        <div class="eyebrow">1 · Source video</div>
        @if (source(); as v) {
          <div class="source-frame">
            <video class="source-video" [src]="v.uri" controls preload="metadata" #sourceVideo (loadedmetadata)="onSourceMeta(sourceVideo)"></video>
            <div class="source-meta">
              <span class="chip muted">{{ v.name }}</span>
              @if (v.durationSec) { <span class="chip cyan">{{ v.durationSec | number: '1.1-1' }}s</span> }
              @if (v.width && v.height) { <span class="chip muted">{{ v.width }}×{{ v.height }}</span> }
            </div>
            <button class="btn ghost sm" type="button" (click)="clearSource()" style="margin-top: 0.5rem">↻ Replace video</button>
          </div>
        } @else {
          <button class="drop" type="button" (click)="triggerUpload()">
            <span style="font-size: 1.8rem">📥</span>
            <strong>Upload source video</strong>
            <span class="muted" style="font-size: 0.78rem">.mp4 / .mov / .webm — backend reads frames + metadata</span>
            <span class="muted" style="font-size: 0.76rem; margin-top: 0.4rem">Or pick from <button class="link-btn" type="button" (click)="$event.stopPropagation(); useSample()">a sample clip</button></span>
          </button>
        }
        <input #fileInput type="file" accept="video/*" hidden (change)="onSourceFile($event)"/>

        <div class="eyebrow" style="margin-top: 1rem">2 · Clone strategy</div>
        <div class="strategy-grid">
          @for (s of strategies; track s.key) {
            <button
              type="button"
              class="strategy-card"
              [class.active]="strategy() === s.key"
              [class.disabled]="strategyDisabled(s.key)"
              (click)="strategy.set(s.key)"
            >
              <div class="row" style="gap: 0.4rem; align-items: center">
                <span class="strategy-emoji">{{ s.emoji }}</span>
                <strong>{{ s.label }}</strong>
                <span class="chip" [class]="costTone(s.cost)">{{ s.cost }}</span>
              </div>
              <p class="muted strategy-hint">{{ s.hint }}</p>
            </button>
          }
        </div>

        <div class="eyebrow" style="margin-top: 1rem">3 · Characters <span class="muted" style="font-size: 0.72rem; letter-spacing: 0">(optional)</span></div>
        <p class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">
          Detect characters in the source clip to clone them, or pick existing characters from your library
          to keep faces consistent across the rebuild.
        </p>

        <div class="row" style="gap: 0.4rem; margin-top: 0.45rem; flex-wrap: wrap">
          <button
            class="btn sm"
            type="button"
            (click)="openExtract()"
            [disabled]="!source()"
            title="Detect faces in the source video"
          >
            🎭 Detect from source
          </button>
          <button class="btn ghost sm" type="button" (click)="libraryPickerOpen.set(!libraryPickerOpen())">
            📚 Pick from library
          </button>
        </div>

        @if (libraryPickerOpen()) {
          <div class="lib-picker">
            @if (libraryCharacters().length === 0) {
              <p class="muted" style="font-size: 0.78rem">
                No characters in the library yet. Use <strong>Detect from source</strong> or visit the
                <strong>Characters</strong> page first.
              </p>
            } @else {
              @for (c of libraryCharacters(); track c.id) {
                <button
                  type="button"
                  class="lib-row"
                  [class.picked]="selectedCharacterIds().includes(c.id)"
                  (click)="toggleLibraryCharacter(c.id)"
                >
                  <div class="lib-thumb" [style.background-image]="charThumb(c)"></div>
                  <div class="lib-meta">
                    <strong>{{ c.name }}</strong>
                    @if (c.role) { <span class="muted" style="font-size: 0.72rem">{{ c.role }}</span> }
                  </div>
                  <span class="lib-check">{{ selectedCharacterIds().includes(c.id) ? '✓' : '+' }}</span>
                </button>
              }
            }
          </div>
        }

        @if (selectedCharacters().length > 0) {
          <div class="selected-band">
            <div class="row" style="justify-content: space-between; align-items: center">
              <strong style="font-family: var(--font-display); font-size: 0.88rem">
                Cloning {{ selectedCharacters().length }} character{{ selectedCharacters().length === 1 ? '' : 's' }}
              </strong>
              <button class="btn ghost sm" type="button" (click)="clearSelectedCharacters()">Clear all</button>
            </div>
            <div class="selected-grid">
              @for (c of selectedCharacters(); track c.id) {
                <div class="selected-tile">
                  <div class="selected-thumb" [style.background-image]="charThumb(c)"></div>
                  <div class="selected-meta">
                    <strong>{{ c.name }}</strong>
                    @if (c.role) { <span class="muted" style="font-size: 0.72rem">{{ c.role }}</span> }
                    @if (charSubtitle(c); as sub) {
                      <span class="muted" style="font-size: 0.7rem">{{ sub }}</span>
                    }
                  </div>
                  <div class="row" style="gap: 0.25rem">
                    <a
                      class="iconbtn sm"
                      [routerLink]="'/characters'"
                      [queryParams]="{ id: c.id }"
                      title="Open in Characters · generate angle images"
                    >✏</a>
                    <button class="iconbtn sm" type="button" (click)="unpickCharacter(c.id)" title="Remove from clone">×</button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <app-character-extract-dialog
          [open]="extractOpen()"
          [videoUri]="source()?.uri ?? null"
          (close)="extractOpen.set(false)"
          (saved)="onCharacterExtracted($event)"
        />
      </section>

      <!-- RIGHT — controls -->
      <section class="card panel">
        <div class="row" style="justify-content: space-between; align-items: center; gap: 0.5rem">
          <div class="eyebrow">4 · Prompt</div>
          <button class="btn ghost sm" type="button" (click)="enhancerOpen.set(true)">✨ Enhance prompt</button>
        </div>
        <textarea
          rows="4"
          [ngModel]="prompt()"
          (ngModelChange)="prompt.set($event)"
          placeholder="What to keep, what to change. e.g. ‘Same dolly-in but recreate it as a Studio Ghibli illustration, keep the lighting warm’"
          style="margin-top: 0.3rem"
        ></textarea>

        @if (strategy() === 'style_only') {
          <label class="field" style="margin-top: 0.6rem">Target style</label>
          <input
            [ngModel]="styleTarget()"
            (ngModelChange)="styleTarget.set($event)"
            placeholder="e.g. anime · Wes Anderson palette · noir · oil painting"
          />
        }

        <div class="eyebrow" style="margin-top: 1rem">5 · Audio</div>
        <div class="toggle-grid">
          <button
            type="button"
            class="toggle-card"
            [class.on]="keepVoice()"
            [disabled]="!source()"
            (click)="keepVoice.set(!keepVoice())"
          >
            <span class="toggle-icon">🎙</span>
            <div class="toggle-body">
              <div class="toggle-title">Keep source voice / VO</div>
              <div class="toggle-hint">Backend extracts dialog and lays it back onto the clone.</div>
            </div>
            <span class="toggle-switch" [attr.data-state]="keepVoice() ? 'on' : 'off'">
              <span class="toggle-knob"></span>
            </span>
          </button>
          <button
            type="button"
            class="toggle-card"
            [class.on]="keepMusic()"
            [disabled]="!source()"
            (click)="keepMusic.set(!keepMusic())"
          >
            <span class="toggle-icon">🎵</span>
            <div class="toggle-body">
              <div class="toggle-title">Keep source background music</div>
              <div class="toggle-hint">Reuses the music bed from the source clip.</div>
            </div>
            <span class="toggle-switch" [attr.data-state]="keepMusic() ? 'on' : 'off'">
              <span class="toggle-knob"></span>
            </span>
          </button>
        </div>
        @if (!keepVoice() || !keepMusic()) {
          <label class="field" style="margin-top: 0.6rem">
            Audio prompt
            <span class="muted" style="font-size: 0.72rem">(used for whichever channel isn't kept)</span>
          </label>
          <input
            [ngModel]="audioPrompt()"
            (ngModelChange)="audioPrompt.set($event)"
            placeholder="e.g. cinematic orchestral build, warm narrator"
          />
        }

        <div class="eyebrow" style="margin-top: 1rem">6 · Output</div>
        <div class="grid-3">
          <div>
            <label class="field">Duration</label>
            <select [ngModel]="durationMode()" (ngModelChange)="durationMode.set($event)">
              <option value="match">Match source</option>
              <option value="custom">Custom</option>
            </select>
            @if (durationMode() === 'custom') {
              <input
                type="number"
                min="1"
                max="60"
                [ngModel]="customDurationSec()"
                (ngModelChange)="customDurationSec.set(+$event)"
                style="margin-top: 0.3rem"
              />
            }
          </div>
          <div>
            <label class="field">Resolution</label>
            <select [ngModel]="resolution()" (ngModelChange)="resolution.set($event)">
              @for (r of resolutions; track r.value) {
                <option [value]="r.value">{{ r.label }}</option>
              }
            </select>
          </div>
          <div>
            <label class="field">FPS</label>
            <select [ngModel]="fps()" (ngModelChange)="fps.set($event)">
              @for (f of fpsOptions; track f.value) {
                <option [value]="f.value">{{ f.label }}</option>
              }
            </select>
          </div>
        </div>
        <div class="grid-3" style="margin-top: 0.5rem">
          <div>
            <label class="field">Aspect</label>
            <select [ngModel]="aspect()" (ngModelChange)="aspect.set($event)">
              @for (a of aspects; track a.value) {
                <option [value]="a.value">{{ a.label }}</option>
              }
            </select>
          </div>
          <div>
            <label class="field">Seed</label>
            <input
              type="number"
              [ngModel]="seed()"
              (ngModelChange)="seed.set(+$event || 0)"
              placeholder="0 = random"
            />
          </div>
          <div>
            <label class="field">Variants</label>
            <input
              type="number"
              min="1"
              max="4"
              [ngModel]="count()"
              (ngModelChange)="count.set(Math.max(1, Math.min(4, +$event || 1)))"
            />
          </div>
        </div>

        <div class="eyebrow" style="margin-top: 1rem">7 · Model</div>
        <select [ngModel]="modelId()" (ngModelChange)="modelId.set($event)" style="margin-top: 0.3rem">
          @for (m of availableModels(); track m.id) {
            <option [value]="m.id">{{ m.provider }} · {{ m.name }} — {{ m.speed }} · {{ m.costPerUnit }}/{{ m.unit }}</option>
          }
        </select>
        @if (selectedModel(); as m) {
          <p class="muted" style="font-size: 0.78rem; margin-top: 0.3rem">{{ m.description }}</p>
        }
        @if (availableModels().length === 0) {
          <p class="muted" style="font-size: 0.78rem; margin-top: 0.3rem; color: #ff9eb1">
            No model supports this strategy. Pick a different strategy or add a video-to-video model.
          </p>
        }

        <p class="muted" style="margin-top: 0.8rem; font-size: 0.78rem">
          Estimated cost: <span class="mono">{{ estimateCost() | number: '1.2-2' }}</span> credits
          @if (source()?.durationSec) {
            <span class="muted"> · approx {{ effectiveDuration() | number: '1.1-1' }}s output × {{ count() }} variants</span>
          }
        </p>

        <button
          class="btn primary"
          style="margin-top: 0.8rem; width: 100%"
          (click)="generate()"
          [disabled]="!canGenerate() || running()"
        >
          @if (running()) { Cloning… }
          @else { 🪞 Clone video ({{ count() }}) }
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
            <h2 style="margin-top: 0.3rem; font-size: 1.15rem">Clones</h2>
          </div>
          <button class="btn ghost sm" type="button" (click)="clearResults()">Clear</button>
        </div>
        <div class="results-grid">
          @for (r of results(); track r.id) {
            <div class="result-tile card">
              <div class="result-video-wrap">
                @if (r.status === 'ready') {
                  <video class="result-video" [src]="r.uri" controls preload="metadata" playsinline></video>
                } @else {
                  <div class="result-overlay"><span class="loader"></span><span>{{ r.status }}</span></div>
                }
                <span class="result-strategy">{{ strategyEmoji(r.strategy) }} {{ r.strategy.replace('_', ' ') }}</span>
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
})
export class VideoCloneToolComponent {
  private readonly assetsSrv = inject(AssetsService);
  private readonly modelsSrv = inject(ModelsService);
  private readonly charactersSrv = inject(CharactersService);

  protected readonly Math = Math;
  protected readonly strategies = STRATEGIES;
  protected readonly resolutions = RESOLUTIONS;
  protected readonly aspects = ASPECTS;
  protected readonly fpsOptions = FPS_OPTIONS;

  protected readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly source = signal<SourceVideo | null>(null);
  protected readonly strategy = signal<CloneStrategy>('whole_video');
  protected readonly prompt = signal('');
  protected readonly styleTarget = signal('');
  protected readonly audioPrompt = signal('');
  protected readonly selectedCharacterIds = signal<string[]>([]);
  protected readonly libraryPickerOpen = signal(false);
  protected readonly extractOpen = signal(false);

  protected readonly libraryCharacters = computed<CharacterProfile[]>(() =>
    this.charactersSrv.characters(),
  );

  protected readonly selectedCharacters = computed<CharacterProfile[]>(() => {
    const picked = new Set(this.selectedCharacterIds());
    return this.libraryCharacters().filter((c) => picked.has(c.id));
  });
  protected readonly keepVoice = signal(true);
  protected readonly keepMusic = signal(true);
  protected readonly durationMode = signal<'match' | 'custom'>('match');
  protected readonly customDurationSec = signal(8);
  protected readonly resolution = signal<(typeof RESOLUTIONS)[number]['value']>('match');
  protected readonly aspect = signal<(typeof ASPECTS)[number]['value']>('match');
  protected readonly fps = signal<(typeof FPS_OPTIONS)[number]['value']>('match');
  protected readonly seed = signal(0);
  protected readonly count = signal(1);
  protected readonly modelId = signal('');
  protected readonly results = signal<ClonedClip[]>([]);
  protected readonly running = signal(false);
  protected readonly enhancerOpen = signal(false);

  /** Only the whole_video strategy strictly needs a v2v model.
   * Other strategies fall back to image_to_video / text_to_video. */
  protected readonly availableModels = computed<AiModel[]>(() => {
    const all = this.modelsSrv.models();
    if (this.strategy() === 'whole_video') {
      return all.filter((m) => m.capability === 'video_to_video');
    }
    if (this.strategy() === 'style_only') {
      return all.filter((m) => m.capability === 'video_to_video' || m.capability === 'image_to_video');
    }
    // frame_by_frame and keyframe_interp can run on i2v + t2v stacks
    return all.filter(
      (m) =>
        m.capability === 'video_to_video' ||
        m.capability === 'image_to_video' ||
        m.capability === 'text_to_video',
    );
  });

  protected readonly selectedModel = computed(() =>
    this.availableModels().find((m) => m.id === this.modelId()),
  );

  protected readonly effectiveDuration = computed(() => {
    if (this.durationMode() === 'custom') return this.customDurationSec();
    return this.source()?.durationSec ?? 6;
  });

  protected readonly estimateCost = computed(() => {
    const m = this.selectedModel();
    if (!m) return 0;
    const multiplier = ({
      frame_by_frame: 2.0,
      keyframe_interp: 1.0,
      whole_video: 1.4,
      style_only: 1.1,
    } as const)[this.strategy()];
    return m.costPerUnit * this.effectiveDuration() * this.count() * multiplier;
  });

  protected readonly canGenerate = computed(() => {
    if (this.running()) return false;
    if (!this.source()) return false;
    if (!this.modelId()) return false;
    if (this.strategy() === 'style_only' && !this.styleTarget().trim() && !this.prompt().trim()) {
      return false;
    }
    return true;
  });

  protected readonly blockedReason = computed<string | null>(() => {
    if (this.canGenerate()) return null;
    if (!this.source()) return 'Upload a source video to clone.';
    if (this.availableModels().length === 0) {
      return 'No model supports this strategy. Pick another strategy or add a v2v model.';
    }
    if (!this.modelId()) return 'Pick a model.';
    if (this.strategy() === 'style_only' && !this.styleTarget().trim() && !this.prompt().trim()) {
      return 'Describe the target style (or write a prompt).';
    }
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

  protected strategyDisabled(_k: CloneStrategy): boolean {
    return false;
  }

  protected costTone(c: 'low' | 'medium' | 'high'): string {
    return { low: 'green', medium: 'amber', high: 'rose' }[c];
  }

  protected strategyEmoji(s: CloneStrategy): string {
    return this.strategies.find((x) => x.key === s)?.emoji ?? '🎞';
  }

  // ---------- source upload ----------

  protected triggerUpload() { this.fileInput()?.nativeElement.click(); }

  protected onSourceFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;
      this.source.set({ uri: result, name: file.name });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  protected useSample() {
    this.source.set({ uri: SAMPLE_VIDEO_POOL[0], name: 'sample · Big Buck Bunny', durationSec: 10 });
  }

  protected clearSource() { this.source.set(null); this.results.set([]); }

  protected onSourceMeta(el: HTMLVideoElement) {
    this.source.update((v) => v
      ? { ...v, durationSec: el.duration, width: el.videoWidth, height: el.videoHeight }
      : v);
  }

  // ---------- characters ----------

  protected openExtract() {
    if (!this.source()) return;
    this.extractOpen.set(true);
  }

  protected onCharacterExtracted(c: CharacterProfile) {
    // Auto-select newly saved characters so they flow straight into the clone.
    this.selectedCharacterIds.update((ids) => (ids.includes(c.id) ? ids : [...ids, c.id]));
  }

  protected toggleLibraryCharacter(id: string) {
    this.selectedCharacterIds.update((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    );
  }

  protected unpickCharacter(id: string) {
    this.selectedCharacterIds.update((ids) => ids.filter((x) => x !== id));
  }

  protected charThumb(c: CharacterProfile): string {
    const primary = c.images.find((i) => i.id === c.primaryImageId) ?? c.images[0];
    return primary ? `url(${primary.thumbnail || primary.uri})` : '';
  }

  protected charSubtitle(c: CharacterProfile): string {
    return [c.age, c.gender].filter((s) => !!s).join(' · ');
  }

  protected clearSelectedCharacters() {
    this.selectedCharacterIds.set([]);
  }

  // ---------- prompt ----------

  protected appendToPrompt(extra: string) {
    if (!extra.trim()) return;
    const cur = this.prompt().trim();
    this.prompt.set(cur ? `${cur}, ${extra}` : extra);
  }

  // ---------- generate ----------

  protected clearResults() { this.results.set([]); }

  protected generate() {
    if (!this.canGenerate()) return;
    const n = this.count();
    const now = Date.now();
    const strat = this.strategy();
    const promptText = this.prompt().trim() || (this.styleTarget().trim() ? `Restyle: ${this.styleTarget()}` : '(clone)');
    const modelName = this.selectedModel()?.name ?? 'unknown';
    const queued: ClonedClip[] = Array.from({ length: n }, (_, i) => ({
      id: `${now}-${i}`,
      uri: SAMPLE_VIDEO_POOL[(now + i + 1) % SAMPLE_VIDEO_POOL.length],
      status: 'queued',
      strategy: strat,
      prompt: promptText,
      model: modelName,
      saved: false,
    }));
    this.results.set(queued);
    this.running.set(true);

    const baseMs = ({
      frame_by_frame: 2600,
      keyframe_interp: 1400,
      whole_video: 2000,
      style_only: 1600,
    } as const)[strat];

    queued.forEach((item, i) => {
      setTimeout(() => {
        this.results.update((list) =>
          list.map((r) => (r.id === item.id ? { ...r, status: 'rendering' } : r)),
        );
      }, 250 + i * 180);
      setTimeout(() => {
        this.results.update((list) =>
          list.map((r) => (r.id === item.id ? { ...r, status: 'ready' } : r)),
        );
        if (i === queued.length - 1) this.running.set(false);
      }, baseMs + i * 340);
    });
  }

  protected saveToAssets(r: ClonedClip) {
    if (r.saved || r.status !== 'ready') return;
    const m = this.selectedModel();
    this.assetsSrv
      .generate({
        type: 'video',
        name: `clone-${r.id.slice(-6)}.mp4`,
        prompt: `(clone · ${r.strategy}) ${r.prompt}`,
        provider: m?.provider ?? 'unknown',
        model: m?.name ?? 'video-clone',
      })
      .subscribe(() => {
        this.results.update((list) =>
          list.map((x) => (x.id === r.id ? { ...x, saved: true } : x)),
        );
      });
  }
}
