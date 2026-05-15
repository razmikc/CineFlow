import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { ProjectsService } from '../../core/services/projects.service';
import { MoodboardService, MoodboardSuggestion } from '../../core/services/moodboard.service';
import { CreativeContract, Scene } from '../../core/models/contract.model';

type ApplyState = 'idle' | 'applying';

const BEAT_LABELS = ['Cold open', 'Setup', 'Inciting incident', 'Rising action', 'Climax', 'Resolution'];

const LIGHTING_VARIANTS = [
  'soft natural light, gentle fill',
  'low-key cinematic, hard rim',
  'golden hour, warm bounce',
  'practical neons, hard shadows',
  'overcast diffuse, cool tones',
  'high-contrast spot, theatrical',
];

@Component({
  selector: 'app-moodboard-page',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['../wizard/wizard-moodboard-storyboard.scss', './moodboard.component.scss'],
  template: `
    @if (project(); as p) {
      <div class="mb-page">
        <header class="mb-header">
          <div>
            <a class="back" [routerLink]="['/projects', p.id]">
              <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m12 5-5 5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Back to my project
            </a>
            <h1>The look & the scenes</h1>
            <p class="muted">
              Here's the overall look for your video and how your scenes break down.
              Read it through, change what you want, then jump into scene 1.
            </p>
          </div>
          <div class="row">
            <button class="btn ghost sm" (click)="regenerateMoodboard()" [disabled]="moodboardLoading()">
              @if (moodboardLoading()) { <span class="loader"></span> Regen moodboard… }
              @else { ↻ Moodboard }
            </button>
            <button class="btn ghost sm" (click)="regenerateScenes()" [disabled]="scenesLoading()">
              @if (scenesLoading()) { <span class="loader"></span> Regen scenes… }
              @else { ↻ Scenes }
            </button>
            <button class="btn ghost sm" (click)="saveDraft()" [disabled]="draftSaving()">
              @if (draftSaving()) { <span class="loader"></span> Saving… }
              @else { 💾 Save draft }
            </button>
            <button class="btn sm" (click)="skipAndContinue()" [disabled]="applyState() !== 'idle'">
              Skip → Scene 1
            </button>
            <button class="btn primary" (click)="applyAndContinue()" [disabled]="applyState() !== 'idle' || !suggestion()">
              @if (applyState() === 'applying') { <span class="loader"></span> Applying… }
              @else { ✓ Apply & continue }
            </button>
          </div>
        </header>

        @if (moodboardLoading() && !suggestion()) {
          <div class="loading">
            <span class="loader"></span>
            <span style="margin-left: 0.6rem">Asking backend for a moodboard…</span>
          </div>
        }

        @if (suggestion(); as s) {
          <section class="mb-card identity-card">
            <div class="identity-head">
              <div>
                <div class="field-label">Visual identity</div>
                <div class="mb-meta-text">
                  <strong>{{ p.creativeDirection.genre || 'genre tbd' }}</strong> · {{ s.era }}
                </div>
              </div>
              <div class="palette-row">
                @for (c of s.colorPalette; track c) {
                  <div class="swatch" [style.background]="c" [title]="c">
                    <span class="swatch-label">{{ c }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="identity-meta">
              <div>
                <div class="field-label">Global mood</div>
                <div class="chip-row">
                  @for (m of s.mood; track m) { <span class="chip">{{ m }}</span> }
                </div>
              </div>
              <div>
                <div class="field-label">Fonts</div>
                <div class="mb-meta-text">{{ s.fonts.title }} / {{ s.fonts.subtitle }}</div>
              </div>
            </div>

            <div class="moodboard-rationale">{{ s.rationale }}</div>

            <details class="references-toggle">
              <summary>{{ s.references.length }} reference images</summary>
              <div class="moodboard-grid">
                @for (r of s.references; track r.id) {
                  <div class="mb-tile" [class.locked]="r.locked">
                    <div class="mb-thumb" [style.background-image]="'url(' + (r.thumbnail || r.uri) + ')'"></div>
                    <div class="mb-body">
                      <span style="font-size: 0.74rem; color: var(--text-2); flex: 1">{{ r.tag }}</span>
                      <button class="iconbtn sm" [title]="r.locked ? 'Unlock' : 'Lock'" (click)="toggleLock(r.id)">
                        {{ r.locked ? '🔒' : '🔓' }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            </details>
          </section>
        }

        <section class="mb-card">
          <div class="row" style="justify-content: space-between; align-items: baseline">
            <div>
              <div class="field-label">Scene plan</div>
              <div class="mb-meta-text">
                {{ p.scenes.length }} scenes · {{ totalSec() }}s total · target {{ p.output.targetDurationSec }}s
              </div>
            </div>
          </div>

          @if (p.scenes.length === 0) {
            <div class="empty-state" style="padding: 2rem; text-align: center">
              <div class="empty-art" style="font-size: 1.6rem">🎬</div>
              <p class="muted">No scenes planned yet. Click <strong>↻ Scenes</strong> to ask the backend.</p>
            </div>
          }

          <div class="scene-plan">
            @for (s of p.scenes; track s.id; let i = $index) {
              <article class="scene-plan-card">
                <div class="sp-thumb" [class.has-image]="!!sceneThumb(s)" [style.background-image]="sceneThumb(s)">
                  <div class="sp-placeholder">
                    <span class="sp-icon" aria-hidden="true">🎬</span>
                    <span class="sp-bignum">{{ i + 1 }}</span>
                  </div>
                </div>
                <div class="sp-body">
                  <header class="sp-header">
                    <input
                      class="sp-title-input"
                      [ngModel]="s.title"
                      (ngModelChange)="updateScene(s.id, { title: $event })"
                      placeholder="Scene title"
                    />
                    @if (s.storyboardPanel?.beat) {
                      <span class="chip cyan">{{ s.storyboardPanel?.beat }}</span>
                    }
                    <div class="sp-duration-edit">
                      <input
                        type="number"
                        min="1"
                        max="120"
                        [ngModel]="s.durationSec"
                        (ngModelChange)="updateScene(s.id, { durationSec: +$event || 1 })"
                      />
                      <span class="muted">s</span>
                    </div>
                  </header>

                  <label class="sp-field">
                    <span class="field-label inline">Prompt</span>
                    <textarea
                      rows="2"
                      [ngModel]="s.objective"
                      (ngModelChange)="updateScene(s.id, { objective: $event })"
                      placeholder="What happens visually? Who's there, how does it look, what's the action?"
                    ></textarea>
                  </label>

                  <label class="sp-field">
                    <span class="field-label inline">Dialog / narration</span>
                    <textarea
                      rows="2"
                      [ngModel]="s.narration.text"
                      (ngModelChange)="updateNarration(s.id, $event)"
                      placeholder="Spoken lines or voice-over for this scene."
                    ></textarea>
                  </label>

                  <div class="sp-meta-grid">
                    <label class="sp-field">
                      <span class="field-label inline">Mood</span>
                      <input
                        [ngModel]="moodText(s)"
                        (ngModelChange)="updateMood(s.id, $event)"
                        placeholder="tense, urgent, quiet — comma-separated"
                      />
                    </label>
                    <label class="sp-field">
                      <span class="field-label inline">Lighting</span>
                      <input
                        [ngModel]="s.lighting ?? ''"
                        (ngModelChange)="updateScene(s.id, { lighting: $event })"
                        placeholder="e.g. low-key cinematic, hard rim"
                      />
                    </label>
                  </div>
                </div>
              </article>
            }
          </div>
        </section>
      </div>
    } @else {
      <div class="loading">
        <span class="loader"></span>
        <span style="margin-left: 0.6rem">Loading project…</span>
      </div>
    }
  `,
})
export class MoodboardPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projects = inject(ProjectsService);
  private readonly moodboardSvc = inject(MoodboardService);

  protected readonly project = signal<CreativeContract | undefined>(undefined);
  protected readonly suggestion = signal<MoodboardSuggestion | null>(null);
  protected readonly moodboardLoading = signal(false);
  protected readonly scenesLoading = signal(false);
  protected readonly applyState = signal<ApplyState>('idle');
  protected readonly draftSaving = signal(false);

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => this.projects.get(params.get('id') ?? '')),
        takeUntilDestroyed(),
      )
      .subscribe((p) => {
        if (!p) return;
        this.project.set(p);
        this.fetchMoodboard();
        if (p.scenes.length === 0) {
          this.planScenes();
        }
      });
  }

  protected totalSec(): number {
    const p = this.project();
    return p ? p.scenes.reduce((sum, s) => sum + (s.durationSec || 0), 0) : 0;
  }

  protected sceneThumb(s: Scene): string {
    const uri = s.storyboardPanel?.thumbnailUri ?? s.storyboardPanel?.keyframeUri ?? s.thumbnailUrl;
    return uri ? `url(${uri})` : '';
  }

  protected moodText(s: Scene): string {
    return (s.mood ?? []).join(', ');
  }

  protected updateScene(sceneId: string, patch: Partial<Scene>) {
    const p = this.project();
    if (!p) return;
    const scenes = p.scenes.map((s) => (s.id === sceneId ? { ...s, ...patch } : s));
    this.project.set({ ...p, scenes });
    this.projects.update(p.id, { scenes }).subscribe();
  }

  protected updateNarration(sceneId: string, text: string) {
    const p = this.project();
    if (!p) return;
    const scenes = p.scenes.map((s) =>
      s.id === sceneId ? { ...s, narration: { ...s.narration, text } } : s,
    );
    this.project.set({ ...p, scenes });
    this.projects.update(p.id, { scenes }).subscribe();
  }

  protected updateMood(sceneId: string, raw: string) {
    const mood = raw
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);
    this.updateScene(sceneId, { mood });
  }

  protected regenerateMoodboard() {
    this.fetchMoodboard(true);
  }

  protected regenerateScenes() {
    this.planScenes();
  }

  protected saveDraft() {
    const p = this.project();
    if (!p || this.draftSaving()) return;
    this.draftSaving.set(true);
    this.projects.saveDraft(p.id, `/projects/${p.id}/moodboard`).subscribe({
      next: () => {
        this.draftSaving.set(false);
        this.router.navigate(['/drafts']);
      },
      error: () => this.draftSaving.set(false),
    });
  }

  private fetchMoodboard(regenerateLocked = false) {
    const p = this.project();
    if (!p || this.moodboardLoading()) return;
    this.moodboardLoading.set(true);
    this.moodboardSvc.suggest(p.id, { regenerateLocked }).subscribe({
      next: (s) => {
        this.suggestion.set(s);
        this.moodboardLoading.set(false);
      },
      error: () => this.moodboardLoading.set(false),
    });
  }

  private planScenes() {
    const p = this.project();
    if (!p || this.scenesLoading()) return;
    this.scenesLoading.set(true);
    const scenes = this.synthesizeScenes(p);
    this.projects.update(p.id, { scenes }).subscribe({
      next: (next) => {
        if (next) this.project.set(next);
        this.scenesLoading.set(false);
      },
      error: () => this.scenesLoading.set(false),
    });
  }

  protected toggleLock(refId: string) {
    const s = this.suggestion();
    if (!s) return;
    this.suggestion.set({
      ...s,
      references: s.references.map((r) => (r.id === refId ? { ...r, locked: !r.locked } : r)),
    });
  }

  protected applyAndContinue() {
    const p = this.project();
    const s = this.suggestion();
    if (!p || !s || this.applyState() !== 'idle') return;
    this.applyState.set('applying');
    this.moodboardSvc.apply(p.id, s).subscribe({
      next: () => this.navigateToFirstScene(),
      error: () => this.applyState.set('idle'),
    });
  }

  protected skipAndContinue() {
    if (this.applyState() !== 'idle') return;
    this.navigateToFirstScene();
  }

  private navigateToFirstScene() {
    const p = this.project();
    if (!p) {
      this.applyState.set('idle');
      return;
    }
    const first = p.scenes[0];
    if (!first) {
      this.applyState.set('idle');
      return;
    }
    this.router.navigate(['/projects', p.id, 'scenes', first.id]);
  }

  private synthesizeScenes(p: CreativeContract): Scene[] {
    const target = Math.max(12, p.output.targetDurationSec || 30);
    const count = Math.min(BEAT_LABELS.length, Math.max(3, Math.round(target / 6)));
    const baseDuration = Math.max(2, Math.floor(target / count));
    const remainder = target - baseDuration * count;

    const baseMood = p.creativeDirection.mood.length > 0
      ? p.creativeDirection.mood
      : ['cinematic', 'atmospheric'];
    const baseLighting = p.creativeDirection.lighting || '';
    const protagonist = p.characters[0]?.name?.trim() || '';
    const beats = Array.from({ length: count }, (_, i) => BEAT_LABELS[i] ?? `Beat ${i + 1}`);
    const narrations = this.distributeNarration(p, count, beats, protagonist);

    return Array.from({ length: count }).map((_, i) => {
      const beat = beats[i];
      const lightingVariant = LIGHTING_VARIANTS[i % LIGHTING_VARIANTS.length];
      const mood = this.deriveSceneMood(baseMood, beat, i);
      return {
        id: `scene-${String(i + 1).padStart(3, '0')}`,
        index: i,
        title: `${i + 1}. ${beat}`,
        objective: this.deriveObjective(p, beat, protagonist),
        durationSec: baseDuration + (i === count - 1 ? remainder : 0),
        generationMode: 'prepare_then_generate',
        background: { mode: 'generate', description: '' },
        camera: { shotType: i === 0 ? 'wide shot' : 'medium shot', movement: 'static', lens: '35mm' },
        characters: [],
        objects: [],
        narration: { text: narrations[i], voiceRef: '' },
        audio: {
          backgroundMusic: { mode: 'generate', genre: '', tempo: i >= count - 1 ? 'building' : 'medium' },
          soundEffects: [],
        },
        subtitles: { enabled: true, style: 'clean lower third' },
        transitionOut: { type: i === count - 1 ? 'fade' : 'cut', durationMs: 400 },
        continuity: { usePreviousFinalFrame: true, exportFinalFrameForNextScene: true },
        review: { status: 'draft', lockedAssets: [] },
        costEstimate: 30,
        storyboardPanel: { beat, action: '', locked: false },
        mood,
        lighting: baseLighting ? `${baseLighting} · ${lightingVariant}` : lightingVariant,
      } satisfies Scene;
    });
  }

  private distributeNarration(
    p: CreativeContract,
    count: number,
    beats: string[],
    protagonist: string,
  ): string[] {
    const chunks = (p.description || '')
      .split(/\n+/)
      .flatMap((para) => para.split(/(?<=[.!?])\s+(?=[A-Z(])/))
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (chunks.length === 0) {
      return beats.map((beat) => this.fallbackNarration(beat, protagonist, p));
    }

    if (chunks.length >= count) {
      const result: string[] = [];
      const per = Math.floor(chunks.length / count);
      const extra = chunks.length - per * count;
      let cursor = 0;
      for (let i = 0; i < count; i++) {
        const take = per + (i < extra ? 1 : 0);
        result.push(chunks.slice(cursor, cursor + take).join(' '));
        cursor += take;
      }
      return result;
    }

    return Array.from({ length: count }, (_, i) =>
      i < chunks.length ? chunks[i] : this.fallbackNarration(beats[i], protagonist, p),
    );
  }

  private fallbackNarration(beat: string, protagonist: string, p: CreativeContract): string {
    const subject = protagonist || p.title || 'our subject';
    const genre = p.creativeDirection.genre || 'story';
    switch (beat) {
      case 'Cold open':
        return `We meet ${subject}. The ${genre} begins quietly, before anything is said.`;
      case 'Setup':
        return `${subject} moves through the day. Nothing yet has gone wrong.`;
      case 'Inciting incident':
        return `Something pulls ${subject} out of the familiar. The story tilts.`;
      case 'Rising action':
        return `${subject} commits. There is no turning back now.`;
      case 'Climax':
        return `Everything ${subject} carried comes to this single moment.`;
      case 'Resolution':
        return `${subject} breathes. The world is the same — and not.`;
      default:
        return `${subject} continues forward into the next beat.`;
    }
  }

  private deriveSceneMood(baseMood: string[], beat: string, i: number): string[] {
    const beatTones: Record<string, string[]> = {
      'Cold open': ['quiet', 'curious'],
      Setup: ['grounded', 'observational'],
      'Inciting incident': ['tense', 'unsettled'],
      'Rising action': ['urgent', 'building'],
      Climax: ['intense', 'high-stakes'],
      Resolution: ['reflective', 'resolved'],
    };
    const extras = beatTones[beat] ?? [];
    const carried = baseMood[i % baseMood.length] ? [baseMood[i % baseMood.length]] : [];
    return [...new Set([...carried, ...extras])].slice(0, 3);
  }

  private deriveObjective(p: CreativeContract, beat: string, protagonist: string): string {
    const subject = protagonist || p.title || 'the protagonist';
    const genre = p.creativeDirection.genre || 'cinematic';
    switch (beat) {
      case 'Cold open':
        return `Open on ${subject} in the ${genre} world. Establish atmosphere before any dialogue.`;
      case 'Setup':
        return `Introduce the situation around ${subject}. Plant the question the audience will follow.`;
      case 'Inciting incident':
        return `Something shifts. ${subject} encounters the moment that turns the story.`;
      case 'Rising action':
        return `Stakes climb. ${subject} commits to a direction.`;
      case 'Climax':
        return `The decisive beat. Maximum tension around ${subject}.`;
      case 'Resolution':
        return `Land the emotional payoff. Leave the audience with one feeling.`;
      default:
        return `Beat focused on ${subject}.`;
    }
  }

}
