import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ProjectsService } from '../../core/services/projects.service';
import { AssetsService } from '../../core/services/assets.service';
import { CharactersService } from '../../core/services/characters.service';
import { ScenesService } from '../../core/services/scenes.service';
import { ModelsService } from '../../core/services/models.service';
import { ContractExportService } from '../../core/services/contract-export.service';
import { MoodboardService, MoodboardSuggestion } from '../../core/services/moodboard.service';
import { StoryboardService, StoryboardSuggestion } from '../../core/services/storyboard.service';
import {
  AdAudience,
  AdBeatEntry,
  AdBeatType,
  AdBrand,
  AdCompliance,
  AdConfig,
  AdCta,
  AdCtaAction,
  AdIndustry,
  AdPlacement,
  AdPlacementConfig,
  AdPlatform,
  AdProductOffer,
  AdVariant,
  AdVariantAxis,
  AdVoiceTone,
  AspectRatio,
  Asset,
  Character,
  CharacterProfile,
  CharacterVoice,
  CreativeContract,
  CreativeDirection,
  MoodboardReference,
  ProjectGoal,
  Resolution,
  Scene,
  ShortAudioChoice,
  ShortBeat,
  ShortCaptionStyle,
  ShortCta,
  ShortCtaAction,
  ShortEmojiDensity,
  ShortVideoConfig,
  StoryboardPanel,
} from '../../core/models/contract.model';

type StepKey =
  | 'goal'
  | 'script'
  | 'style'
  | 'characters'
  | 'assets'
  | 'scenes'
  | 'review'
  // YouTube Short-specific
  | 'yt_hook'
  | 'yt_audio'
  | 'yt_style'
  | 'yt_beats'
  | 'yt_cta'
  // Advertisement-specific
  | 'ad_brand'
  | 'ad_product'
  | 'ad_audience'
  | 'ad_visual'
  | 'ad_structure'
  | 'ad_variants';

interface WizardStep {
  key: StepKey;
  label: string;
  sub: string;
}

const DEFAULT_STEPS: WizardStep[] = [
  { key: 'goal', label: 'Goal', sub: 'Pick the kind of video' },
  { key: 'script', label: 'Script & structure', sub: 'LLM, duration, pacing' },
  { key: 'style', label: 'Global style', sub: 'Mood, palette, fonts' },
  { key: 'characters', label: 'Characters', sub: 'Reusable avatars & voices' },
  { key: 'assets', label: 'Assets', sub: 'Reference materials' },
  { key: 'scenes', label: 'Scenes', sub: 'Plan & order' },
  { key: 'review', label: 'Review & generate', sub: 'YAML / JSON' },
];

const YT_SHORT_STEPS: WizardStep[] = [
  { key: 'goal', label: 'Goal', sub: 'YouTube Short selected' },
  { key: 'yt_hook', label: 'Hook & topic', sub: 'First 3s + payoff' },
  { key: 'yt_audio', label: 'Trending audio', sub: 'Pick or generate, snap cuts' },
  { key: 'yt_style', label: 'Vertical style', sub: '9:16 captions, safe zone' },
  { key: 'characters', label: 'Cast', sub: 'Optional — creator or character' },
  { key: 'yt_beats', label: 'Beat storyboard', sub: 'Micro-scenes, 1–3s each' },
  { key: 'yt_cta', label: 'CTA & loop', sub: 'End card + loop back' },
  { key: 'review', label: 'Review & generate', sub: 'Shorts checklist + YAML' },
];

const AD_STEPS: WizardStep[] = [
  { key: 'goal', label: 'Goal', sub: 'Advertisement selected' },
  { key: 'ad_brand', label: 'Brand', sub: 'Identity, voice, colors' },
  { key: 'ad_product', label: 'Product & offer', sub: 'USP, benefits, promo' },
  { key: 'ad_audience', label: 'Audience & placement', sub: 'Who, where, length' },
  { key: 'ad_visual', label: 'Visual & compliance', sub: 'Moodboard + disclaimers' },
  { key: 'characters', label: 'Cast', sub: 'Optional — talent or models' },
  { key: 'ad_structure', label: 'Ad structure', sub: 'Hook → Problem → CTA' },
  { key: 'ad_variants', label: 'A/B variants', sub: 'Test multiple cuts' },
  { key: 'review', label: 'Review & generate', sub: 'Compliance + YAML' },
];

function stepsForGoal(goal: ProjectGoal | undefined): WizardStep[] {
  switch (goal) {
    case 'youtube_short':
      return YT_SHORT_STEPS;
    case 'ad':
      return AD_STEPS;
    default:
      return DEFAULT_STEPS;
  }
}

function defaultShortConfig(): ShortVideoConfig {
  return {
    niche: '',
    hook: '',
    payoff: '',
    targetRetentionPct: 75,
    trendingAngle: '',
    audio: { source: 'trending', bpm: 120 },
    captionStyle: 'bold',
    textOverlayColor: '#ffffff',
    emojiDensity: 'sparse',
    beats: [],
    cta: { copy: 'Follow for more', action: 'follow', loopBack: true },
  };
}

function defaultAdConfig(): AdConfig {
  return {
    brand: {
      name: '',
      tagline: '',
      voiceTone: 'casual',
      primaryColor: '#0A3055',
      secondaryColor: '#22d3ee',
    },
    product: {
      productName: '',
      usp: '',
      primaryBenefit: '',
      supportingBenefits: [],
    },
    audience: {
      ageMin: 18,
      ageMax: 45,
      gender: 'all',
      regions: [],
      interests: [],
      psychographics: '',
    },
    placement: { platforms: ['meta'], placements: ['feed'], lengthSec: 15 },
    compliance: {
      industry: 'general',
      disclaimers: [],
      restrictedTerms: [],
      brandSafeOnly: true,
    },
    structure: [],
    variants: [],
    primaryCta: { copy: 'Shop now', action: 'shop' },
  };
}

function aspectFromPlacement(
  placements: AdPlacement[],
  platforms: AdPlatform[],
): AspectRatio | null {
  if (placements.includes('reels') || placements.includes('stories')) return '9:16';
  if (placements.includes('bumper') || placements.includes('in_stream_skippable') || placements.includes('in_stream_non_skippable')) return '16:9';
  if (placements.includes('feed')) {
    if (platforms.includes('tiktok') || platforms.includes('snap')) return '9:16';
    return '1:1';
  }
  if (placements.includes('cover')) return '16:9';
  if (platforms.includes('tiktok') || platforms.includes('snap') || platforms.includes('pinterest')) return '9:16';
  if (platforms.includes('ooh') || platforms.includes('ott') || platforms.includes('tv') || platforms.includes('youtube')) return '16:9';
  return null;
}

const TRENDING_AUDIO_POOL: ShortAudioChoice[] = [
  { source: 'trending', trackId: 'aud-1', title: 'Soft Sunrise', artist: 'Lo-Fi Loops', bpm: 92, beatDropMs: 1200, durationSec: 30, trendScore: 88 },
  { source: 'trending', trackId: 'aud-2', title: 'Neon Pulse', artist: 'Synth Cab', bpm: 128, beatDropMs: 800, durationSec: 30, trendScore: 94 },
  { source: 'trending', trackId: 'aud-3', title: 'Hyper Cut', artist: 'BeatGrid', bpm: 156, beatDropMs: 500, durationSec: 30, trendScore: 91 },
  { source: 'trending', trackId: 'aud-4', title: 'Velvet Hour', artist: 'Aurora', bpm: 108, beatDropMs: 1500, durationSec: 30, trendScore: 82 },
  { source: 'trending', trackId: 'aud-5', title: 'Ride Out', artist: 'Lone Wolf', bpm: 140, beatDropMs: 900, durationSec: 30, trendScore: 79 },
  { source: 'trending', trackId: 'aud-6', title: 'Glow Up', artist: 'Spark', bpm: 118, beatDropMs: 1100, durationSec: 30, trendScore: 86 },
];

const AD_PLATFORMS: { id: AdPlatform; label: string }[] = [
  { id: 'meta', label: 'Meta (FB/IG)' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'snap', label: 'Snapchat' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'ooh', label: 'OOH (billboard)' },
  { id: 'ott', label: 'OTT (CTV)' },
  { id: 'tv', label: 'Broadcast TV' },
];

const AD_PLACEMENTS: { id: AdPlacement; label: string }[] = [
  { id: 'feed', label: 'Feed' },
  { id: 'reels', label: 'Reels' },
  { id: 'stories', label: 'Stories' },
  { id: 'in_stream_skippable', label: 'In-stream (skippable)' },
  { id: 'in_stream_non_skippable', label: 'In-stream (non-skippable)' },
  { id: 'bumper', label: 'Bumper (6s)' },
  { id: 'cover', label: 'Cover' },
  { id: 'native', label: 'Native' },
];

const AD_BEAT_SKELETON: { type: AdBeatType; label: string; defaultDuration: number }[] = [
  { type: 'hook', label: 'Hook', defaultDuration: 2 },
  { type: 'problem', label: 'Problem', defaultDuration: 3 },
  { type: 'solution', label: 'Solution (product reveal)', defaultDuration: 4 },
  { type: 'proof', label: 'Proof', defaultDuration: 3 },
  { type: 'cta', label: 'Call to action', defaultDuration: 3 },
];

@Component({
  selector: 'app-wizard',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (project(); as p) {
      <div class="wizard">
        <header class="wiz-header">
          <div>
            <a class="back" routerLink="/dashboard">
              <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m12 5-5 5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Dashboard
            </a>
            <div class="row" style="gap: 0.55rem; margin-top: 6px">
              <input class="title-input" [ngModel]="p.title" (ngModelChange)="updateField('title', $event)" />
              <span class="chip" [class]="statusTone(p.status)">{{ p.status }}</span>
            </div>
            <div class="muted" style="font-size: 0.78rem; margin-top: 4px">
              Last edited {{ p.updatedAt | date: 'medium' }}
            </div>
          </div>
          <div class="row">
            <button class="btn ghost sm" (click)="togglePreview()">
              <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 10s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z"/>
                <circle cx="10" cy="10" r="2.2"/>
              </svg>
              {{ previewOpen() ? 'Hide' : 'Show' }} contract
            </button>
            <button class="btn cool" (click)="generateContract()">
              <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3v14M5 3l5 5-5 5M5 17l5-5-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Generate contract
            </button>
          </div>
        </header>

        <div class="wiz-body" [class.with-preview]="previewOpen()">
          <aside class="steps">
            @for (s of steps(); track s.key; let i = $index) {
              <button
                class="step"
                [class.active]="active() === s.key"
                [class.done]="completed(s.key, p)"
                (click)="setStep(s.key)"
              >
                <span class="step-no">{{ completed(s.key, p) ? '✓' : i + 1 }}</span>
                <div class="step-text">
                  <div class="step-title">{{ s.label }}</div>
                  <div class="step-sub">{{ s.sub }}</div>
                </div>
              </button>
            }
          </aside>

          <section class="step-content card">
            @switch (active()) {
              @case ('goal') {
                <h2>Project goal</h2>
                <p class="muted">Pick the kind of video you're orchestrating. This drives default models, pacing, and templates.</p>
                <div class="grid-3" style="margin-top: 1rem">
                  @for (g of goals; track g.key) {
                    <button
                      class="goal-card"
                      [class.selected]="p.goal === g.key"
                      (click)="setGoal(g.key)"
                    >
                      <div class="goal-emoji">{{ g.emoji }}</div>
                      <div class="goal-title">{{ g.label }}</div>
                      <div class="muted" style="font-size: 0.78rem">{{ g.sub }}</div>
                    </button>
                  }
                </div>
                <div class="divider"></div>
                <div class="grid-2">
                  <div>
                    <label class="field">Title</label>
                    <input [ngModel]="p.title" (ngModelChange)="updateField('title', $event)" placeholder="Untitled video"/>
                  </div>
                  <div>
                    <label class="field">Output language</label>
                    <select [ngModel]="p.output.language" (ngModelChange)="updateOutput('language', $event)">
                      <option value="en">English</option>
                      <option value="hy">Armenian</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                    </select>
                  </div>
                </div>
                <div style="margin-top: 0.9rem">
                  <label class="field">Description</label>
                  <textarea [ngModel]="p.description" (ngModelChange)="updateField('description', $event)" rows="3" placeholder="A one-line pitch — the LLM uses this when proposing a script."></textarea>
                </div>
              }

              @case ('script') {
                <h2>Script & structure</h2>
                <p class="muted">Decide the LLM, scene count, pacing, and tone. The system can generate a draft script you can edit.</p>
                <div class="grid-3" style="margin-top: 1rem">
                  <div>
                    <label class="field">Aspect ratio</label>
                    <select [ngModel]="p.output.aspectRatio" (ngModelChange)="updateOutput('aspectRatio', $event)">
                      <option value="16:9">16:9 — landscape</option>
                      <option value="9:16">9:16 — vertical</option>
                      <option value="1:1">1:1 — square</option>
                      <option value="4:5">4:5 — feed</option>
                      <option value="21:9">21:9 — cinematic</option>
                    </select>
                  </div>
                  <div>
                    <label class="field">Resolution</label>
                    <select [ngModel]="p.output.resolution" (ngModelChange)="updateOutput('resolution', $event)">
                      <option value="720p">720p</option>
                      <option value="1080p">1080p</option>
                      <option value="2k">2K</option>
                      <option value="4k">4K</option>
                    </select>
                  </div>
                  <div>
                    <label class="field">FPS</label>
                    <select [ngModel]="p.output.fps" (ngModelChange)="updateOutput('fps', +$event)">
                      <option [ngValue]="24">24 fps · cinematic</option>
                      <option [ngValue]="30">30 fps · standard</option>
                      <option [ngValue]="60">60 fps · smooth</option>
                    </select>
                  </div>
                </div>
                <div class="grid-2" style="margin-top: 0.9rem">
                  <div>
                    <label class="field">Target duration (seconds)</label>
                    <input type="number" [ngModel]="p.output.targetDurationSec" (ngModelChange)="updateOutput('targetDurationSec', +$event)" min="6" max="600"/>
                  </div>
                  <div>
                    <label class="field">Approval policy</label>
                    <select [ngModel]="p.orchestration.approvalPolicy" (ngModelChange)="updateOrchestration('approvalPolicy', $event)">
                      <option value="approve_each_scene">Approve each scene</option>
                      <option value="approve_at_end">Approve at end</option>
                      <option value="auto">Auto-approve</option>
                    </select>
                  </div>
                </div>
                <div style="margin-top: 1rem">
                  <label class="field">Choose script LLM</label>
                  <div class="provider-grid">
                    @for (m of scriptModels(); track m.id) {
                      <button class="provider-card"
                        [class.selected]="p.models.script.model === m.name"
                        (click)="updateModel('script', m.provider, m.name)">
                        <div class="row" style="justify-content: space-between">
                          <span class="provider-name">{{ m.name }}</span>
                          <span class="chip muted">{{ m.provider }}</span>
                        </div>
                        <div class="muted" style="font-size: 0.78rem">{{ m.description }}</div>
                      </button>
                    }
                  </div>
                </div>
                <div style="margin-top: 1rem">
                  <label class="field">Generated draft script</label>
                  <button class="btn primary sm" (click)="mockGenerateScript()" style="margin-bottom: 0.55rem">
                    <svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M10 2v3m0 10v3M2 10h3m10 0h3M4.2 4.2l2.1 2.1m7.4 7.4 2.1 2.1M4.2 15.8l2.1-2.1m7.4-7.4 2.1-2.1" stroke-linecap="round"/></svg>
                    Generate with {{ p.models.script.model }}
                  </button>
                  <textarea rows="8" [ngModel]="draftScript()" (ngModelChange)="draftScript.set($event)"
                    placeholder="Your script appears here. Edit freely or regenerate with another LLM."></textarea>
                </div>
              }

              @case ('style') {
                <h2>Global style</h2>
                <p class="muted">A consistent look + feel: realism, mood, palette, and forbidden elements applied across every scene.</p>

                <label class="field" style="margin-top: 1rem">Genre</label>
                <input [ngModel]="p.creativeDirection.genre" (ngModelChange)="updateCreative('genre', $event)" placeholder="cinematic fantasy drama"/>

                <label class="field" style="margin-top: 0.85rem">Mood</label>
                <div class="chip-input">
                  @for (m of p.creativeDirection.mood; track m) {
                    <span class="chip cyan">{{ m }} <button class="x" (click)="removeMood(m)">×</button></span>
                  }
                  <input #moodInput placeholder="add a mood + Enter" (keydown.enter)="addMood(moodInput.value); moodInput.value = ''"/>
                </div>

                <div class="grid-2" style="margin-top: 1rem">
                  <div>
                    <label class="field">Realism level</label>
                    <input type="range" min="0" max="100" [ngModel]="p.creativeDirection.realismLevel * 100"
                      (ngModelChange)="updateCreative('realismLevel', $event / 100)" class="slider"/>
                    <div class="row" style="justify-content: space-between; margin-top: 4px">
                      <span class="muted" style="font-size: 0.74rem">Stylized</span>
                      <span class="mono">{{ (p.creativeDirection.realismLevel * 100) | number: '1.0-0' }}%</span>
                      <span class="muted" style="font-size: 0.74rem">Photo-real</span>
                    </div>
                  </div>
                  <div>
                    <label class="field">Title font</label>
                    <select [ngModel]="p.creativeDirection.fonts.title" (ngModelChange)="updateFonts('title', $event)">
                      <option>Inter</option>
                      <option>Montserrat</option>
                      <option>Poppins</option>
                      <option>Orbitron</option>
                      <option>Space Grotesk</option>
                      <option>Playfair Display</option>
                    </select>
                  </div>
                </div>

                <label class="field" style="margin-top: 1rem">Color palette</label>
                <div class="palette-edit">
                  @for (c of p.creativeDirection.colorPalette; track $index) {
                    <div class="palette-item">
                      <input type="color" [ngModel]="c" (ngModelChange)="setPaletteColor($index, $event)"/>
                      <span class="mono" style="font-size: 0.78rem">{{ c }}</span>
                      <button class="iconbtn sm" (click)="removePaletteColor($index)" title="Remove">×</button>
                    </div>
                  }
                  <button class="btn ghost sm" (click)="addPaletteColor()">+ Add color</button>
                </div>

                <label class="field" style="margin-top: 1rem">Negative rules</label>
                <div class="chip-input">
                  @for (r of p.creativeDirection.negativeRules; track r) {
                    <span class="chip rose">{{ r }} <button class="x" (click)="removeNegative(r)">×</button></span>
                  }
                  <input #negInput placeholder="e.g. no distorted hands + Enter" (keydown.enter)="addNegative(negInput.value); negInput.value = ''"/>
                </div>

                <div class="divider"></div>

                <div class="row" style="justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.6rem">
                  <div>
                    <div class="section-title" style="margin: 0">AI Moodboard</div>
                    <p class="muted" style="font-size: 0.82rem; margin-top: 4px">
                      Suggest reference shots, a palette, fonts, lighting and era from the goal + mood.
                      Locked items survive regeneration.
                    </p>
                  </div>
                  <div class="row" style="gap: 0.4rem">
                    <button class="btn sm" (click)="suggestMoodboard()" [disabled]="moodboardLoading()">
                      @if (moodboardLoading()) { <span class="loader"></span> Suggesting… }
                      @else { ✨ Suggest moodboard }
                    </button>
                    @if (p.creativeDirection.references.length > 0) {
                      <button class="btn ghost sm" (click)="clearMoodboard()" type="button">Clear</button>
                    }
                  </div>
                </div>

                @if (moodboardRationale()) {
                  <div class="moodboard-rationale">{{ moodboardRationale() }}</div>
                }

                <div class="grid-2" style="margin-top: 0.8rem">
                  <div>
                    <label class="field">Lighting</label>
                    <input
                      [ngModel]="p.creativeDirection.lighting"
                      (ngModelChange)="updateCreative('lighting', $event)"
                      placeholder="e.g. golden hour, soft rim light, low contrast"
                    />
                  </div>
                  <div>
                    <label class="field">Era / period</label>
                    <input
                      [ngModel]="p.creativeDirection.era"
                      (ngModelChange)="updateCreative('era', $event)"
                      placeholder="e.g. retro-future 1985, present day, 1970s"
                    />
                  </div>
                </div>

                @if (p.creativeDirection.references.length === 0) {
                  <div class="empty-state" style="margin-top: 0.8rem; padding: 1.4rem; text-align: center">
                    <div class="empty-art" style="font-size: 1.6rem">🎨</div>
                    <p class="muted" style="font-size: 0.85rem">
                      No references yet — click <strong>Suggest moodboard</strong> to populate, or add manually below.
                    </p>
                  </div>
                } @else {
                  <div class="moodboard-grid">
                    @for (r of p.creativeDirection.references; track r.id) {
                      <div class="mb-tile" [class.locked]="r.locked">
                        <div class="mb-thumb" [style.background-image]="'url(' + (r.thumbnail || r.uri) + ')'"></div>
                        <div class="mb-body">
                          <input
                            class="mb-tag-input"
                            [ngModel]="r.tag"
                            (ngModelChange)="updateMoodboardTag(r.id, $event)"
                            placeholder="tag"
                          />
                          <div class="row" style="gap: 0.25rem; justify-content: flex-end">
                            <button class="iconbtn sm" [title]="r.locked ? 'Unlock' : 'Lock'"
                              (click)="toggleReferenceLock(r.id)">
                              {{ r.locked ? '🔒' : '🔓' }}
                            </button>
                            <button class="iconbtn sm" title="Remove" (click)="removeMoodboardReference(r.id)">×</button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              }

              @case ('characters') {
                <div class="row" style="justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.6rem">
                  <div>
                    <h2>Characters & avatars</h2>
                    <p class="muted">Define reusable characters once — name, look, wardrobe, voice. The continuity lock keeps them consistent across every scene.</p>
                  </div>
                  <div class="row" style="gap: 0.4rem; flex-wrap: wrap">
                    <button class="btn" (click)="openLibraryPicker()" type="button">
                      <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="10" cy="7" r="3.2"/><path d="M3.5 17c.8-3.4 3.5-5 6.5-5s5.7 1.6 6.5 5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                      Import from library
                    </button>
                    <button class="btn primary" (click)="addAndEditCharacter()">+ Add character</button>
                  </div>
                </div>

                <div class="char-layout">
                  <aside class="char-list">
                    @if (p.characters.length === 0) {
                      <div class="empty-state" style="padding: 1.4rem; text-align: center">
                        <div class="empty-art" style="font-size: 1.8rem">👤</div>
                        <p class="muted" style="font-size: 0.85rem">No characters yet</p>
                        <div class="row" style="gap: 0.4rem; justify-content: center; margin-top: 0.4rem; flex-wrap: wrap">
                          <button class="btn sm" (click)="openLibraryPicker()" type="button">Import from library</button>
                          <button class="btn primary sm" (click)="addAndEditCharacter()">+ Add first character</button>
                        </div>
                      </div>
                    }
                    @for (c of p.characters; track c.id) {
                      <button class="char-row" [class.active]="selectedCharId() === c.id" (click)="selectedCharId.set(c.id)">
                        <div class="char-row-thumb" [style.background-image]="thumbForChar(c)"></div>
                        <div style="flex: 1; min-width: 0; text-align: left">
                          <div class="row" style="gap: 0.4rem">
                            <strong style="font-size: 0.9rem">{{ c.name || 'Unnamed' }}</strong>
                            @if (c.continuityLock) { <span class="chip green sm-chip" title="Continuity locked">🔒</span> }
                          </div>
                          <div class="muted" style="font-size: 0.74rem; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">
                            {{ c.description || 'No description yet' }}
                          </div>
                          <div class="row" style="gap: 0.3rem; margin-top: 4px">
                            <span class="chip muted sm-chip">{{ c.voice.provider }}</span>
                            @if (c.referenceImages.length > 0) { <span class="chip cyan sm-chip">{{ c.referenceImages.length }} refs</span> }
                          </div>
                        </div>
                      </button>
                    }
                  </aside>

                  <section class="char-editor">
                    @if (selectedCharacter(); as c) {
                      <div class="row" style="justify-content: space-between; align-items: flex-start">
                        <div>
                          <div class="eyebrow">Editing character</div>
                          <h3 style="margin-top: 4px">{{ c.name || 'Unnamed character' }}</h3>
                        </div>
                        <div class="row" style="gap: 0.4rem">
                          <button class="btn sm" (click)="duplicateCharacter(c.id)">⧉ Duplicate</button>
                          <button class="btn danger sm" (click)="removeCharacter(c.id)">Delete</button>
                        </div>
                      </div>

                      <div class="grid-2" style="margin-top: 1rem">
                        <div>
                          <label class="field">Name</label>
                          <input [ngModel]="c.name" (ngModelChange)="updateCharacter(c.id, { name: $event })" placeholder="e.g. Aram"/>
                        </div>
                        <div>
                          <label class="field">Wardrobe</label>
                          <input [ngModel]="c.wardrobe" (ngModelChange)="updateCharacter(c.id, { wardrobe: $event })" placeholder="e.g. dark coat, simple elegant style"/>
                        </div>
                      </div>

                      <label class="field" style="margin-top: 0.85rem">Description</label>
                      <textarea rows="2" [ngModel]="c.description" (ngModelChange)="updateCharacter(c.id, { description: $event })"
                        placeholder="e.g. Armenian man, early 30s, expressive face, contemplative eyes"></textarea>

                      <div class="grid-2" style="margin-top: 0.85rem">
                        <div>
                          <label class="field">Emotion profile</label>
                          <input [ngModel]="c.emotionProfile" (ngModelChange)="updateCharacter(c.id, { emotionProfile: $event })" placeholder="e.g. calm, curious, melancholic"/>
                        </div>
                        <div>
                          <label class="field">Movement style</label>
                          <input [ngModel]="c.movementStyle" (ngModelChange)="updateCharacter(c.id, { movementStyle: $event })" placeholder="e.g. measured, deliberate"/>
                        </div>
                      </div>

                      <div class="divider"></div>

                      <div class="row" style="justify-content: space-between; align-items: flex-start">
                        <div>
                          <div class="section-title" style="margin: 0">Reference images</div>
                          <p class="muted" style="font-size: 0.8rem">Lock visual identity so the video model keeps the character consistent across scenes.</p>
                        </div>
                        <div class="row" style="gap: 0.4rem">
                          <button class="btn sm" (click)="generateAvatarFor(c)" [disabled]="generatingAvatarFor() === c.id">
                            @if (generatingAvatarFor() === c.id) { <span class="loader"></span> Generating… }
                            @else { ✨ Generate avatar }
                          </button>
                          <button class="btn sm" [class.primary]="showPickerForCharId() === c.id" (click)="togglePicker(c.id)">
                            🖼 Pick from library
                          </button>
                        </div>
                      </div>

                      <div class="ref-grid">
                        @for (refId of c.referenceImages; track refId) {
                          @if (assets.get(refId); as a) {
                            <div class="ref-thumb" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'" [title]="a.name">
                              <button class="ref-remove" (click)="removeReference(c.id, refId)" title="Remove reference">×</button>
                              <span class="ref-name">{{ a.name }}</span>
                            </div>
                          }
                        }
                        @if (c.referenceImages.length === 0) {
                          <div class="empty-references">
                            <div style="font-size: 1.5rem">🪄</div>
                            <p>No references yet — generate an avatar or pick existing images from your library.</p>
                          </div>
                        }
                      </div>

                      @if (showPickerForCharId() === c.id) {
                        <div class="picker-panel">
                          <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
                            <strong style="font-family: var(--font-display)">Select reference images</strong>
                            <button class="iconbtn" (click)="togglePicker(null)">×</button>
                          </div>
                          @if (imageAssets().length === 0) {
                            <p class="muted" style="font-size: 0.85rem">No image assets in library — try generating one or upload from the Assets tab.</p>
                          }
                          <div class="picker-grid">
                            @for (a of imageAssets(); track a.id) {
                              <button class="picker-item" [class.selected]="c.referenceImages.includes(a.id)"
                                (click)="toggleReference(c.id, a.id)">
                                <div class="picker-thumb" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'">
                                  @if (c.referenceImages.includes(a.id)) { <span class="picker-check">✓</span> }
                                </div>
                                <div class="picker-name">{{ a.name }}</div>
                              </button>
                            }
                          </div>
                        </div>
                      }

                      <div class="divider"></div>

                      <div class="section-title">Voice</div>
                      <div class="grid-3">
                        <div>
                          <label class="field">Source mode</label>
                          <select [ngModel]="c.voice.mode" (ngModelChange)="updateCharacterVoice(c.id, 'mode', $event)">
                            <option value="generate">Generate</option>
                            <option value="asset">From asset</option>
                            <option value="manual">Manual</option>
                          </select>
                        </div>
                        <div>
                          <label class="field">Provider</label>
                          <select [ngModel]="c.voice.provider" (ngModelChange)="updateCharacterVoice(c.id, 'provider', $event)">
                            <option value="elevenlabs">ElevenLabs</option>
                            <option value="openai">OpenAI</option>
                            <option value="google">Google TTS</option>
                            <option value="assets">From assets</option>
                          </select>
                        </div>
                        <div>
                          <label class="field">Accent</label>
                          <input [ngModel]="c.voice.accent" (ngModelChange)="updateCharacterVoice(c.id, 'accent', $event)" placeholder="e.g. soft Armenian"/>
                        </div>
                      </div>

                      <label class="field" style="margin-top: 0.85rem">Voice ID (optional)</label>
                      <input [ngModel]="c.voice.voiceId ?? ''" (ngModelChange)="updateCharacterVoice(c.id, 'voiceId', $event)" placeholder="provider-specific voice id"/>

                      <div class="divider"></div>
                      <label class="check-line">
                        <input type="checkbox" [ngModel]="c.continuityLock" (ngModelChange)="updateCharacter(c.id, { continuityLock: $event })"/>
                        <div>
                          <div style="font-weight: 600">Continuity lock</div>
                          <div class="muted" style="font-size: 0.78rem">Keeps look, wardrobe, and voice consistent across all scenes</div>
                        </div>
                      </label>
                    } @else {
                      <div class="empty-editor">
                        <div style="font-size: 2.4rem">👤</div>
                        <h3 style="margin-top: 0.5rem">No character selected</h3>
                        <p class="muted" style="max-width: 280px">Pick a character from the list, import one from your library, or add a new one to start building your cast.</p>
                        <div class="row" style="gap: 0.4rem; margin-top: 0.8rem; flex-wrap: wrap; justify-content: center">
                          <button class="btn" (click)="openLibraryPicker()" type="button">Import from library</button>
                          <button class="btn primary" (click)="addAndEditCharacter()">+ Add character</button>
                        </div>
                      </div>
                    }
                  </section>
                </div>

                @if (libraryPickerOpen()) {
                  <div class="modal-backdrop" (click)="closeLibraryPicker()">
                    <div class="modal wide" (click)="$event.stopPropagation()">
                      <div class="row" style="justify-content: space-between; margin-bottom: 0.6rem">
                        <div>
                          <strong style="font-family: var(--font-display); font-size: 1.05rem">Import from character library</strong>
                          <div class="muted" style="font-size: 0.8rem; margin-top: 2px">
                            Imports a copy — name, description, wardrobe and reference images flow into the project.
                            Edits here won't affect the library entry.
                          </div>
                        </div>
                        <button class="iconbtn" (click)="closeLibraryPicker()">×</button>
                      </div>

                      @if (charactersLibrary.characters().length === 0) {
                        <div class="muted" style="padding: 1.2rem 0; text-align: center">
                          Your character library is empty.
                          <a routerLink="/characters" style="margin-left: 0.3rem">Create one →</a>
                        </div>
                      } @else {
                        <div class="lib-picker-grid">
                          @for (profile of charactersLibrary.characters(); track profile.id) {
                            <button
                              class="lib-card"
                              [class.imported]="isProfileImported(p, profile)"
                              [disabled]="importingProfileId() === profile.id || isProfileImported(p, profile)"
                              (click)="importLibraryCharacter(profile)"
                              type="button"
                            >
                              <div class="lib-thumb" [style.background-image]="libraryThumb(profile)"></div>
                              <div class="lib-meta">
                                <div class="row" style="justify-content: space-between; align-items: flex-start">
                                  <strong style="font-size: 0.92rem">{{ profile.name || 'Untitled' }}</strong>
                                  @if (importingProfileId() === profile.id) { <span class="loader"></span> }
                                  @else if (isProfileImported(p, profile)) { <span class="chip green">✓ in project</span> }
                                  @else { <span class="chip cyan">{{ profile.images.length }} img</span> }
                                </div>
                                @if (profile.role) {
                                  <div class="muted" style="font-size: 0.76rem">{{ profile.role }}</div>
                                }
                                @if (profile.description) {
                                  <p class="lib-desc">{{ profile.description }}</p>
                                }
                              </div>
                            </button>
                          }
                        </div>
                      }
                    </div>
                  </div>
                }
              }

              @case ('assets') {
                <h2>Assets</h2>
                <p class="muted">Bring your own — or let AI generate. Each asset stores prompt, provider, and version.</p>
                <div class="row" style="margin-top: 0.9rem">
                  <a routerLink="/assets" class="btn primary sm">Open asset library</a>
                  <button class="btn sm" (click)="triggerUpload()">+ Upload files</button>
                  <input #fileInput type="file" multiple style="display: none"
                    accept="image/*,video/*,audio/*"
                    (change)="onFileUpload($event)"/>
                  <button class="btn sm" (click)="generateSampleAsset()">✨ Generate image</button>
                  <button class="btn sm" disabled title="Coming soon">Connect Drive</button>
                  <button class="btn sm" disabled title="Coming soon">Stock providers</button>
                </div>
                @if (uploadStatus(); as status) {
                  <p class="muted" style="font-size: 0.78rem; margin-top: 0.4rem">{{ status }}</p>
                }
                <div class="asset-strip" style="margin-top: 1rem">
                  @for (a of assets.assets().slice(0, 12); track a.id) {
                    <div class="asset-mini" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'">
                      <span class="asset-mini-tag">{{ a.type }}</span>
                    </div>
                  }
                </div>
              }

              @case ('scenes') {
                <div class="row" style="justify-content: space-between; flex-wrap: wrap; gap: 0.6rem">
                  <div>
                    <h2>Scenes</h2>
                    <p class="muted">Plan and order your scenes. Each scene is a fully-typed block in the contract.</p>
                  </div>
                  <div class="row" style="gap: 0.5rem; flex-wrap: wrap">
                    <div class="view-toggle">
                      <button [class.active]="scenesView() === 'list'" (click)="scenesView.set('list')">List</button>
                      <button [class.active]="scenesView() === 'storyboard'" (click)="scenesView.set('storyboard')">Storyboard</button>
                    </div>
                    @if (scenesView() === 'storyboard') {
                      <button class="btn sm" (click)="suggestStoryboard()" [disabled]="storyboardLoading() || p.scenes.length === 0">
                        @if (storyboardLoading()) { <span class="loader"></span> Suggesting… }
                        @else { ✨ Suggest storyboard }
                      </button>
                    }
                    <button class="btn primary sm" (click)="addScene()">+ Add scene</button>
                  </div>
                </div>

                @if (storyboardRationale() && scenesView() === 'storyboard') {
                  <div class="moodboard-rationale" style="margin-top: 0.8rem">{{ storyboardRationale() }}</div>
                }

                @if (scenesView() === 'list') {
                  <div class="scenes-list">
                    @for (s of p.scenes; track s.id; let i = $index; let last = $last) {
                      <div class="scene-row-wrap">
                        <a class="scene-row" [routerLink]="['/projects', p.id, 'scenes', s.id]">
                          <div class="scene-thumb" [style.background-image]="s.thumbnailUrl ? 'url(' + s.thumbnailUrl + ')' : ''">
                            <span class="scene-num">{{ s.index + 1 }}</span>
                          </div>
                          <div style="flex: 1; min-width: 0">
                            <div class="row" style="gap: 0.4rem">
                              <strong>{{ s.title }}</strong>
                              <span class="chip" [class]="sceneStatusTone(s.review.status)">{{ s.review.status }}</span>
                            </div>
                            <div class="muted" style="font-size: 0.85rem">{{ s.objective }}</div>
                            <div class="row" style="gap: 0.4rem; margin-top: 0.5rem; flex-wrap: wrap">
                              <span class="chip muted">{{ s.durationSec }}s</span>
                              <span class="chip muted">{{ s.camera.shotType }}</span>
                              <span class="chip muted">{{ s.objects.length }} objects</span>
                              <span class="chip cyan">~{{ s.costEstimate ?? 0 }} credits</span>
                            </div>
                          </div>
                          <div class="row">
                            <button class="iconbtn">→</button>
                          </div>
                        </a>
                        <div class="scene-row-actions">
                          <button class="iconbtn sm" title="Move up" [disabled]="i === 0"
                            (click)="moveScene(s.id, -1); $event.stopPropagation()">↑</button>
                          <button class="iconbtn sm" title="Move down" [disabled]="last"
                            (click)="moveScene(s.id, 1); $event.stopPropagation()">↓</button>
                          <button class="iconbtn sm" title="Duplicate"
                            (click)="duplicateScene(s.id); $event.stopPropagation()">⧉</button>
                          <button class="iconbtn sm danger" title="Delete"
                            (click)="askDeleteScene(s.id); $event.stopPropagation()">🗑</button>
                        </div>
                      </div>
                    }
                    @if (p.scenes.length === 0) {
                      <div class="empty-state">
                        <div class="empty-art">🎬</div>
                        <div style="font-family: var(--font-display); font-weight: 600">No scenes yet</div>
                        <p class="muted" style="font-size: 0.85rem">Generate from script or add manually.</p>
                        <button class="btn primary sm" (click)="addScene()">+ Add first scene</button>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="storyboard-grid">
                    @if (p.scenes.length === 0) {
                      <div class="sb-empty">
                        <div style="font-size: 1.8rem">🎬</div>
                        <div style="font-family: var(--font-display); font-weight: 600">No scenes to storyboard</div>
                        <p class="muted" style="font-size: 0.85rem">Add a scene first, then suggest panels.</p>
                        <button class="btn primary sm" (click)="addScene()">+ Add first scene</button>
                      </div>
                    }
                    @for (s of p.scenes; track s.id; let i = $index) {
                      <div class="sb-panel" [class.locked]="s.storyboardPanel?.locked">
                        <div class="sb-frame" [style.background-image]="storyboardThumb(s)">
                          @if (!s.storyboardPanel?.keyframeUri && !s.thumbnailUrl) {
                            <div class="sb-frame-empty">No frame yet</div>
                          }
                          <span class="sb-num">#{{ i + 1 }}</span>
                          <span class="sb-duration">{{ s.durationSec }}s</span>
                        </div>
                        <div class="sb-body">
                          <input
                            class="sb-title-input"
                            [ngModel]="s.title"
                            (ngModelChange)="updateScene(s.id, { title: $event })"
                            placeholder="Scene title"
                          />
                          <div class="sb-beat">{{ s.storyboardPanel?.beat || 'Beat — not set' }}</div>
                          <textarea
                            class="sb-action"
                            rows="2"
                            [ngModel]="s.storyboardPanel?.action ?? s.objective"
                            (ngModelChange)="updatePanelAction(s.id, $event)"
                            placeholder="What happens in this shot?"
                          ></textarea>
                          <div class="sb-meta">
                            <span class="chip muted">{{ s.camera.shotType }}</span>
                            <span class="chip muted">{{ s.camera.movement }}</span>
                            <span class="chip muted">{{ s.camera.lens }}</span>
                            @if (s.storyboardPanel?.provider) {
                              <span class="chip cyan">{{ s.storyboardPanel?.provider }}</span>
                            }
                            @if (s.storyboardPanel?.locked) {
                              <span class="chip green">🔒 locked</span>
                            }
                          </div>
                          <div class="sb-actions">
                            <button class="btn sm" type="button"
                              (click)="regenerateStoryboardPanel(s.id)"
                              [disabled]="regeneratingPanelId() === s.id">
                              @if (regeneratingPanelId() === s.id) { <span class="loader"></span> Regen… }
                              @else { ↻ Regenerate }
                            </button>
                            <button class="btn ghost sm" type="button" (click)="toggleStoryboardLock(s.id)">
                              {{ s.storyboardPanel?.locked ? 'Unlock' : 'Lock' }}
                            </button>
                            <a class="btn ghost sm" [routerLink]="['/projects', p.id, 'scenes', s.id]">Open →</a>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }

                @if (p.scenes.length > 0) {
                  <div class="finalize-banner" [class.ready]="allScenesApproved(p)">
                    <div>
                      <strong>{{ allScenesApproved(p) ? 'All scenes approved 🎉' : 'Approval progress' }}</strong>
                      <p class="muted" style="font-size: 0.82rem; margin: 4px 0 0">
                        {{ approvedCount(p) }} / {{ p.scenes.length }} scenes approved.
                        {{ allScenesApproved(p) ? "You're ready to render the final video." : 'Approve every scene to unlock final assembly.' }}
                      </p>
                    </div>
                    <a class="btn cool" [routerLink]="['/projects', p.id, 'final']">🎞 Open final video</a>
                  </div>
                }
              }

              @case ('review') {
                <h2>Review contract</h2>
                <p class="muted">Inspect, validate, and export your normalized contract. This file becomes the source of truth.</p>
                <div class="row" style="margin-top: 1rem; gap: 0.5rem">
                  <button class="btn sm" [class.primary]="format() === 'yaml'" (click)="format.set('yaml')">YAML</button>
                  <button class="btn sm" [class.primary]="format() === 'json'" (click)="format.set('json')">JSON</button>
                  <div class="spacer"></div>
                  <button class="btn sm" (click)="copyContract()">Copy</button>
                  <button class="btn sm" (click)="downloadContract()">Download</button>
                </div>
                <pre class="contract-pre">{{ contractText() }}</pre>
                <div class="checklist">
                  <div class="check-item" [class.ok]="!!p.title"><span class="dot"></span> Title set</div>
                  <div class="check-item" [class.ok]="!!p.creativeDirection.genre"><span class="dot"></span> Genre defined</div>
                  <div class="check-item" [class.ok]="p.characters.length > 0"><span class="dot"></span> At least one character</div>
                  <div class="check-item" [class.ok]="p.scenes.length > 0"><span class="dot"></span> At least one scene</div>
                  <div class="check-item" [class.ok]="p.creativeDirection.colorPalette.length >= 2"><span class="dot"></span> 2+ palette colors</div>
                  <div class="check-item" [class.ok]="allScenesApproved(p)"><span class="dot"></span> All scenes approved</div>
                </div>
                <div class="row" style="margin-top: 1.2rem; gap: 0.5rem; flex-wrap: wrap">
                  <a class="btn primary" [routerLink]="['/projects', p.id, 'final']">🎞 Open final-video assembly</a>
                  @if (p.scenes.length > 0) {
                    <a class="btn" [routerLink]="['/projects', p.id, 'scenes', p.scenes[0].id]">↺ Back to Scene 1</a>
                  }
                </div>
              }

              @case ('yt_hook') {
                @let sc = p.shortConfig ?? null;
                <h2>Hook & topic</h2>
                <p class="muted">Shorts live or die on the first 3 seconds. Lock the niche, write a magnetic hook, and promise a payoff.</p>

                <div class="grid-2" style="margin-top: 1rem">
                  <div>
                    <label class="field">Channel niche</label>
                    <input [ngModel]="sc?.niche ?? ''" (ngModelChange)="updateShort('niche', $event)"
                      placeholder="e.g. behind-the-scenes filmmaking tips"/>
                  </div>
                  <div>
                    <label class="field">Trending angle</label>
                    <input [ngModel]="sc?.trendingAngle ?? ''" (ngModelChange)="updateShort('trendingAngle', $event)"
                      placeholder="POV, debunk, before/after, day-in-the-life…"/>
                  </div>
                </div>

                <label class="field" style="margin-top: 0.9rem">
                  Hook (first 3 seconds)
                  <span class="muted" style="text-transform: none; font-size: 0.7rem"> — keep it under 12 words</span>
                </label>
                <textarea rows="2" [ngModel]="sc?.hook ?? ''" (ngModelChange)="updateShort('hook', $event)"
                  placeholder="“You're editing your shorts wrong — here's the cut that fixed my retention.”"></textarea>

                <label class="field" style="margin-top: 0.9rem">Payoff / twist</label>
                <textarea rows="2" [ngModel]="sc?.payoff ?? ''" (ngModelChange)="updateShort('payoff', $event)"
                  placeholder="What does the viewer get if they stay? Reveal, transformation, punchline."></textarea>

                <label class="field" style="margin-top: 0.9rem">Target retention</label>
                <input type="range" min="50" max="100"
                  [ngModel]="sc?.targetRetentionPct ?? 75"
                  (ngModelChange)="updateShort('targetRetentionPct', $event)" class="slider"/>
                <div class="row" style="justify-content: space-between">
                  <span class="muted" style="font-size: 0.74rem">50%</span>
                  <span class="mono">{{ sc?.targetRetentionPct ?? 75 }}%</span>
                  <span class="muted" style="font-size: 0.74rem">100%</span>
                </div>
              }

              @case ('yt_audio') {
                @let sc = p.shortConfig ?? null;
                <h2>Trending audio</h2>
                <p class="muted">Audio drives the algorithm. Pick a trending track or generate one — the BPM + drop time auto-snap your beat cuts.</p>

                <div class="row" style="margin-top: 0.9rem; gap: 0.4rem; flex-wrap: wrap">
                  @for (src of audioSources; track src.id) {
                    <button class="tab" [class.active]="(sc?.audio?.source ?? 'trending') === src.id"
                      (click)="updateShortAudio('source', src.id)" type="button">{{ src.label }}</button>
                  }
                </div>

                @if ((sc?.audio?.source ?? 'trending') === 'trending') {
                  <div class="audio-grid">
                    @for (t of trendingAudio; track t.trackId) {
                      <button class="audio-card" type="button"
                        [class.selected]="sc?.audio?.trackId === t.trackId"
                        (click)="pickTrendingAudio(t)">
                        <div class="audio-art">
                          <div class="audio-wave"></div>
                          <span class="audio-bpm">{{ t.bpm }} BPM</span>
                        </div>
                        <div class="audio-meta">
                          <div class="row" style="justify-content: space-between; gap: 0.3rem">
                            <strong style="font-size: 0.88rem">{{ t.title }}</strong>
                            <span class="chip cyan">🔥 {{ t.trendScore }}</span>
                          </div>
                          <div class="muted" style="font-size: 0.74rem">{{ t.artist }}</div>
                          <div class="muted" style="font-size: 0.72rem; margin-top: 2px">Drop @ {{ t.beatDropMs }}ms · {{ t.durationSec }}s</div>
                        </div>
                      </button>
                    }
                  </div>
                } @else if ((sc?.audio?.source ?? 'trending') === 'generated') {
                  <label class="field" style="margin-top: 0.9rem">Audio prompt</label>
                  <textarea rows="2"
                    [ngModel]="sc?.audio?.title ?? ''"
                    (ngModelChange)="updateShortAudio('title', $event)"
                    placeholder="e.g. driving lo-fi beat with vinyl crackle, 110 BPM"></textarea>
                  <div class="grid-3" style="margin-top: 0.6rem">
                    <div>
                      <label class="field">Provider</label>
                      <select [ngModel]="sc?.audio?.provider ?? 'suno'"
                        (ngModelChange)="updateShortAudio('provider', $event)">
                        <option value="suno">Suno</option>
                        <option value="udio">Udio</option>
                        <option value="elevenlabs">ElevenLabs Music</option>
                      </select>
                    </div>
                    <div>
                      <label class="field">BPM</label>
                      <input type="number" min="60" max="200"
                        [ngModel]="sc?.audio?.bpm ?? 120"
                        (ngModelChange)="updateShortAudio('bpm', $event)"/>
                    </div>
                    <div>
                      <label class="field">Beat drop (ms)</label>
                      <input type="number" min="0" max="10000"
                        [ngModel]="sc?.audio?.beatDropMs ?? 0"
                        (ngModelChange)="updateShortAudio('beatDropMs', $event)"/>
                    </div>
                  </div>
                } @else {
                  <p class="muted" style="margin-top: 0.9rem">Upload an audio asset on the Asset Library page, then return here and select <em>Trending</em> or <em>Generate</em> to pick a different source.</p>
                }

                @if (sc?.audio?.trackId || sc?.audio?.title) {
                  <div class="audio-summary card gradient" style="margin-top: 1rem">
                    <div class="row" style="gap: 0.6rem; align-items: flex-start">
                      <span class="chip cyan">selected</span>
                      <div>
                        <strong>{{ sc?.audio?.title || 'Generated track' }}</strong>
                        @if (sc?.audio?.artist) { <span class="muted"> · {{ sc?.audio?.artist }}</span> }
                        <div class="muted" style="font-size: 0.76rem; margin-top: 4px">
                          {{ sc?.audio?.bpm ?? '?' }} BPM · drop @ {{ sc?.audio?.beatDropMs ?? '?' }}ms · suggest cuts every {{ beatIntervalMs(sc?.audio?.bpm) }}ms
                        </div>
                      </div>
                    </div>
                  </div>
                }
              }

              @case ('yt_style') {
                @let sc = p.shortConfig ?? null;
                <h2>Vertical style</h2>
                <p class="muted">9:16 only. Captions are non-negotiable — most viewers watch muted. Stay inside the safe zone or YouTube clips your text.</p>

                <div class="yt-style-grid">
                  <div class="phone-preview" [style.background-image]="moodboardHero(p)">
                    <div class="phone-frame">
                      <div class="safe-zone"></div>
                      <div class="caption-strip"
                        [class]="'caption-' + (sc?.captionStyle ?? 'bold')"
                        [style.color]="sc?.textOverlayColor || '#fff'">
                        {{ sc?.hook || 'Your hook here.' }}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="field">Caption style</label>
                    <div class="row" style="gap: 0.4rem; flex-wrap: wrap">
                      @for (s of captionStyles; track s.id) {
                        <button class="tab" type="button"
                          [class.active]="(sc?.captionStyle ?? 'bold') === s.id"
                          (click)="updateShort('captionStyle', s.id)">{{ s.label }}</button>
                      }
                    </div>

                    <label class="field" style="margin-top: 0.9rem">Text overlay color</label>
                    <div class="row" style="gap: 0.5rem">
                      <input type="color"
                        [ngModel]="sc?.textOverlayColor || '#ffffff'"
                        (ngModelChange)="updateShort('textOverlayColor', $event)"/>
                      <span class="mono" style="font-size: 0.8rem">{{ sc?.textOverlayColor || '#ffffff' }}</span>
                    </div>

                    <label class="field" style="margin-top: 0.9rem">Emoji density</label>
                    <div class="row" style="gap: 0.4rem; flex-wrap: wrap">
                      @for (d of emojiDensities; track d.id) {
                        <button class="tab" type="button"
                          [class.active]="(sc?.emojiDensity ?? 'sparse') === d.id"
                          (click)="updateShort('emojiDensity', d.id)">{{ d.label }}</button>
                      }
                    </div>

                    <div class="divider"></div>
                    <div class="muted" style="font-size: 0.8rem">
                      Locked: <strong>9:16</strong> · max <strong>60s</strong> · audio on first <strong>3s</strong>.
                    </div>
                  </div>
                </div>
              }

              @case ('yt_beats') {
                @let sc = p.shortConfig ?? null;
                @let beats = sc?.beats ?? [];
                <h2>Beat-by-beat storyboard</h2>
                <p class="muted">Cut on the beat. Each block is 1–3s. The hook beat must land before 3s; the payoff lands before retention drops.</p>

                <div class="row" style="gap: 0.4rem; margin-top: 0.9rem; flex-wrap: wrap">
                  <button class="btn sm" type="button" (click)="suggestShortBeats()">✨ Suggest beats</button>
                  <button class="btn primary sm" type="button" (click)="addShortBeat()">+ Add beat</button>
                  <span class="spacer"></span>
                  <span class="muted" style="font-size: 0.8rem">
                    Total {{ totalBeatsSec(beats) }}s / {{ p.output.targetDurationSec }}s
                  </span>
                </div>

                @if (beats.length === 0) {
                  <div class="empty-state" style="margin-top: 0.8rem">
                    <div class="empty-art">🎬</div>
                    <p class="muted" style="font-size: 0.85rem">No beats yet — click <strong>Suggest beats</strong> to derive a starting structure from your hook + audio.</p>
                  </div>
                } @else {
                  <div class="beat-list">
                    @for (b of beats; track b.id; let i = $index) {
                      <div class="beat-row" [class.hook-beat]="b.label === 'hook'" [class.payoff-beat]="b.label === 'payoff'">
                        <div class="beat-tag">
                          <span class="mono" style="font-size: 0.72rem">{{ i + 1 }}</span>
                          <select [ngModel]="b.label" (ngModelChange)="updateBeat(b.id, { label: $event })">
                            <option value="hook">hook</option>
                            <option value="setup">setup</option>
                            <option value="payoff">payoff</option>
                            <option value="cta">cta</option>
                            <option value="other">other</option>
                          </select>
                        </div>
                        <input
                          [ngModel]="b.onScreenText"
                          (ngModelChange)="updateBeat(b.id, { onScreenText: $event })"
                          placeholder="On-screen text for this beat"
                        />
                        <div class="row" style="gap: 0.3rem">
                          <input type="number" min="1" max="10" style="width: 60px"
                            [ngModel]="b.durationSec"
                            (ngModelChange)="updateBeat(b.id, { durationSec: $event })"/>
                          <span class="muted" style="font-size: 0.72rem">s</span>
                          <button class="iconbtn sm danger" title="Delete" type="button"
                            (click)="removeBeat(b.id)">×</button>
                        </div>
                      </div>
                    }
                  </div>
                }
              }

              @case ('yt_cta') {
                @let sc = p.shortConfig ?? null;
                <h2>CTA & loop</h2>
                <p class="muted">The last 2–3 seconds. Stack a CTA, optionally loop back to the opening frame, and add a pinned-comment seed.</p>

                <div class="grid-2" style="margin-top: 0.9rem">
                  <div>
                    <label class="field">CTA action</label>
                    <select [ngModel]="sc?.cta?.action ?? 'follow'"
                      (ngModelChange)="updateShortCta('action', $event)">
                      <option value="follow">Follow</option>
                      <option value="subscribe">Subscribe</option>
                      <option value="like">Like</option>
                      <option value="comment">Comment</option>
                      <option value="visit_link">Visit link</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label class="field">CTA copy</label>
                    <input [ngModel]="sc?.cta?.copy ?? ''"
                      (ngModelChange)="updateShortCta('copy', $event)"
                      placeholder="Follow for daily editing breakdowns"/>
                  </div>
                </div>

                <label class="field" style="margin-top: 0.9rem">Pinned comment seed</label>
                <textarea rows="2"
                  [ngModel]="sc?.cta?.pinnedComment ?? ''"
                  (ngModelChange)="updateShortCta('pinnedComment', $event)"
                  placeholder="Drop a question viewers will answer — boosts comments + watch time."></textarea>

                <label class="field" style="margin-top: 0.9rem">End-card frame prompt</label>
                <textarea rows="2"
                  [ngModel]="sc?.cta?.endCardPrompt ?? ''"
                  (ngModelChange)="updateShortCta('endCardPrompt', $event)"
                  placeholder="Static frame the algorithm uses as the next-video card backdrop"></textarea>

                <label class="check-line" style="margin-top: 1rem">
                  <input type="checkbox"
                    [ngModel]="sc?.cta?.loopBack ?? false"
                    (ngModelChange)="updateShortCta('loopBack', $event)"/>
                  <div>
                    <div style="font-weight: 600">Loop back to first frame</div>
                    <div class="muted" style="font-size: 0.78rem">Returns to beat #1's keyframe at the end — pads watch-time as the autoplay decides what to do next.</div>
                  </div>
                </label>
              }

              @case ('ad_brand') {
                @let ac = p.adConfig ?? null;
                <h2>Brand</h2>
                <p class="muted">Identity that anchors every variant. Brand voice + colors flow into the moodboard suggestion.</p>

                <div class="grid-2" style="margin-top: 1rem">
                  <div>
                    <label class="field">Brand name</label>
                    <input [ngModel]="ac?.brand?.name ?? ''"
                      (ngModelChange)="updateAdBrand('name', $event)" placeholder="Acme Co."/>
                  </div>
                  <div>
                    <label class="field">Tagline</label>
                    <input [ngModel]="ac?.brand?.tagline ?? ''"
                      (ngModelChange)="updateAdBrand('tagline', $event)" placeholder="Less talk. More do."/>
                  </div>
                </div>

                <div class="grid-3" style="margin-top: 0.9rem">
                  <div>
                    <label class="field">Voice tone</label>
                    <select [ngModel]="ac?.brand?.voiceTone ?? 'casual'"
                      (ngModelChange)="updateAdBrand('voiceTone', $event)">
                      <option value="premium">Premium</option>
                      <option value="casual">Casual</option>
                      <option value="edgy">Edgy</option>
                      <option value="friendly">Friendly</option>
                      <option value="authoritative">Authoritative</option>
                    </select>
                  </div>
                  <div>
                    <label class="field">Primary color</label>
                    <div class="row" style="gap: 0.5rem">
                      <input type="color" [ngModel]="ac?.brand?.primaryColor ?? '#0A3055'"
                        (ngModelChange)="updateAdBrand('primaryColor', $event)"/>
                      <span class="mono" style="font-size: 0.78rem">{{ ac?.brand?.primaryColor }}</span>
                    </div>
                  </div>
                  <div>
                    <label class="field">Secondary color</label>
                    <div class="row" style="gap: 0.5rem">
                      <input type="color" [ngModel]="ac?.brand?.secondaryColor ?? '#22d3ee'"
                        (ngModelChange)="updateAdBrand('secondaryColor', $event)"/>
                      <span class="mono" style="font-size: 0.78rem">{{ ac?.brand?.secondaryColor }}</span>
                    </div>
                  </div>
                </div>

                <label class="field" style="margin-top: 0.9rem">Brand guidelines URL</label>
                <input [ngModel]="ac?.brand?.guidelinesUrl ?? ''"
                  (ngModelChange)="updateAdBrand('guidelinesUrl', $event)"
                  placeholder="https://brand.acme.co/guidelines"/>

                <div class="divider"></div>
                <div class="row" style="justify-content: space-between; align-items: flex-start">
                  <div>
                    <div class="section-title" style="margin: 0">Logo</div>
                    <p class="muted" style="font-size: 0.8rem">Picked from your asset library. Upload one first on the Assets page.</p>
                  </div>
                  <button class="btn sm" type="button" (click)="toggleAdLogoPicker()">
                    {{ ac?.brand?.logoAssetId ? 'Change logo' : 'Pick logo' }}
                  </button>
                </div>

                @if (ac?.brand?.logoAssetId; as logoId) {
                  @if (assets.get(logoId); as logo) {
                    <div class="row" style="margin-top: 0.6rem; gap: 0.6rem">
                      <div class="ref-thumb"
                        [style.background-image]="'url(' + (logo.thumbnail || logo.uri) + ')'"
                        style="width: 96px; height: 96px"></div>
                      <div>
                        <div style="font-weight: 600">{{ logo.name }}</div>
                        <button class="btn ghost sm" type="button"
                          (click)="updateAdBrand('logoAssetId', undefined)">Remove</button>
                      </div>
                    </div>
                  }
                }

                @if (adLogoPickerOpen()) {
                  <div class="picker-panel" style="margin-top: 0.7rem">
                    <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
                      <strong>Select logo asset</strong>
                      <button class="iconbtn" type="button" (click)="toggleAdLogoPicker()">×</button>
                    </div>
                    @if (imageAssets().length === 0) {
                      <p class="muted" style="font-size: 0.85rem">No image assets yet — upload one on the Assets page.</p>
                    }
                    <div class="picker-grid">
                      @for (a of imageAssets(); track a.id) {
                        <button class="picker-item"
                          [class.selected]="ac?.brand?.logoAssetId === a.id"
                          (click)="pickAdLogo(a.id)" type="button">
                          <div class="picker-thumb" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'"></div>
                          <div class="picker-name">{{ a.name }}</div>
                        </button>
                      }
                    </div>
                  </div>
                }
              }

              @case ('ad_product') {
                @let ac = p.adConfig ?? null;
                <h2>Product & offer</h2>
                <p class="muted">Sharp USP + a primary benefit beat everything else. Promo code and urgency are optional but lift CTR.</p>

                <div class="grid-2" style="margin-top: 1rem">
                  <div>
                    <label class="field">Product / service name</label>
                    <input [ngModel]="ac?.product?.productName ?? ''"
                      (ngModelChange)="updateAdProduct('productName', $event)"
                      placeholder="Acme Smart Mug"/>
                  </div>
                  <div>
                    <label class="field">Unique selling proposition</label>
                    <input [ngModel]="ac?.product?.usp ?? ''"
                      (ngModelChange)="updateAdProduct('usp', $event)"
                      placeholder="The only mug that keeps coffee at exactly 55°C all day"/>
                  </div>
                </div>

                <label class="field" style="margin-top: 0.9rem">Primary benefit</label>
                <input [ngModel]="ac?.product?.primaryBenefit ?? ''"
                  (ngModelChange)="updateAdProduct('primaryBenefit', $event)"
                  placeholder="Never reheat your coffee again"/>

                <label class="field" style="margin-top: 0.9rem">Supporting benefits</label>
                <div class="chip-input">
                  @for (b of ac?.product?.supportingBenefits ?? []; track b) {
                    <span class="chip cyan">{{ b }} <button class="x" type="button" (click)="removeSupportingBenefit(b)">×</button></span>
                  }
                  <input #benInput placeholder="add benefit + Enter"
                    (keydown.enter)="addSupportingBenefit(benInput.value); benInput.value = ''"/>
                </div>

                <div class="grid-3" style="margin-top: 0.9rem">
                  <div>
                    <label class="field">Price point</label>
                    <input [ngModel]="ac?.product?.pricePoint ?? ''"
                      (ngModelChange)="updateAdProduct('pricePoint', $event)"
                      placeholder="$49.99"/>
                  </div>
                  <div>
                    <label class="field">Promo code</label>
                    <input [ngModel]="ac?.product?.promoCode ?? ''"
                      (ngModelChange)="updateAdProduct('promoCode', $event)"
                      placeholder="LAUNCH20"/>
                  </div>
                  <div>
                    <label class="field">Urgency angle</label>
                    <input [ngModel]="ac?.product?.urgency ?? ''"
                      (ngModelChange)="updateAdProduct('urgency', $event)"
                      placeholder="Limited drop — ends Sunday"/>
                  </div>
                </div>
              }

              @case ('ad_audience') {
                @let ac = p.adConfig ?? null;
                <h2>Audience & placement</h2>
                <p class="muted">Who sees this, where they see it, and how long they have. Placement drives aspect ratio automatically.</p>

                <div class="grid-3" style="margin-top: 1rem">
                  <div>
                    <label class="field">Age min</label>
                    <input type="number" min="13" max="75" [ngModel]="ac?.audience?.ageMin ?? 18"
                      (ngModelChange)="updateAdAudience('ageMin', $event)"/>
                  </div>
                  <div>
                    <label class="field">Age max</label>
                    <input type="number" min="13" max="100" [ngModel]="ac?.audience?.ageMax ?? 45"
                      (ngModelChange)="updateAdAudience('ageMax', $event)"/>
                  </div>
                  <div>
                    <label class="field">Gender</label>
                    <select [ngModel]="ac?.audience?.gender ?? 'all'"
                      (ngModelChange)="updateAdAudience('gender', $event)">
                      <option value="all">All</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non_binary">Non-binary</option>
                    </select>
                  </div>
                </div>

                <label class="field" style="margin-top: 0.9rem">Regions</label>
                <div class="chip-input">
                  @for (r of ac?.audience?.regions ?? []; track r) {
                    <span class="chip cyan">{{ r }} <button class="x" type="button" (click)="removeRegion(r)">×</button></span>
                  }
                  <input #regInput placeholder="US, EU, MENA…"
                    (keydown.enter)="addRegion(regInput.value); regInput.value = ''"/>
                </div>

                <label class="field" style="margin-top: 0.9rem">Interests</label>
                <div class="chip-input">
                  @for (it of ac?.audience?.interests ?? []; track it) {
                    <span class="chip cyan">{{ it }} <button class="x" type="button" (click)="removeInterest(it)">×</button></span>
                  }
                  <input #intInput placeholder="add interest + Enter"
                    (keydown.enter)="addInterest(intInput.value); intInput.value = ''"/>
                </div>

                <label class="field" style="margin-top: 0.9rem">Psychographics</label>
                <textarea rows="2" [ngModel]="ac?.audience?.psychographics ?? ''"
                  (ngModelChange)="updateAdAudience('psychographics', $event)"
                  placeholder="Values, lifestyle, decision drivers…"></textarea>

                <div class="divider"></div>

                <label class="field">Platforms</label>
                <div class="row" style="gap: 0.4rem; flex-wrap: wrap">
                  @for (pt of adPlatforms; track pt.id) {
                    <button class="tab" type="button"
                      [class.active]="(ac?.placement?.platforms ?? []).includes(pt.id)"
                      (click)="toggleAdPlatform(pt.id)">{{ pt.label }}</button>
                  }
                </div>

                <label class="field" style="margin-top: 0.9rem">Placements</label>
                <div class="row" style="gap: 0.4rem; flex-wrap: wrap">
                  @for (pl of adPlacements; track pl.id) {
                    <button class="tab" type="button"
                      [class.active]="(ac?.placement?.placements ?? []).includes(pl.id)"
                      (click)="toggleAdPlacementOption(pl.id)">{{ pl.label }}</button>
                  }
                </div>

                <div class="grid-2" style="margin-top: 0.9rem">
                  <div>
                    <label class="field">Length</label>
                    <select [ngModel]="ac?.placement?.lengthSec ?? 15"
                      (ngModelChange)="updateAdPlacement('lengthSec', +$event)">
                      <option [ngValue]="6">6 sec (bumper)</option>
                      <option [ngValue]="15">15 sec</option>
                      <option [ngValue]="30">30 sec</option>
                      <option [ngValue]="60">60 sec</option>
                    </select>
                  </div>
                  <div>
                    <label class="field">Resolved aspect ratio</label>
                    <input [ngModel]="p.output.aspectRatio" disabled/>
                  </div>
                </div>
              }

              @case ('ad_visual') {
                @let ac = p.adConfig ?? null;
                <h2>Visual direction & compliance</h2>
                <p class="muted">Moodboard tuned to brand colors, plus the legal guardrails this category needs.</p>

                <div class="row" style="gap: 0.4rem; margin-top: 0.8rem">
                  <button class="btn sm" type="button" (click)="suggestMoodboard()" [disabled]="moodboardLoading()">
                    @if (moodboardLoading()) { <span class="loader"></span> Suggesting… }
                    @else { ✨ Suggest moodboard }
                  </button>
                </div>

                @if (moodboardRationale()) {
                  <div class="moodboard-rationale" style="margin-top: 0.6rem">{{ moodboardRationale() }}</div>
                }

                @if (p.creativeDirection.references.length > 0) {
                  <div class="moodboard-grid" style="margin-top: 0.8rem">
                    @for (r of p.creativeDirection.references; track r.id) {
                      <div class="mb-tile" [class.locked]="r.locked">
                        <div class="mb-thumb" [style.background-image]="'url(' + (r.thumbnail || r.uri) + ')'"></div>
                        <div class="mb-body">
                          <span class="muted" style="font-size: 0.72rem">{{ r.tag }}</span>
                          <div class="row" style="gap: 0.2rem; justify-content: flex-end">
                            <button class="iconbtn sm" type="button"
                              (click)="toggleReferenceLock(r.id)">{{ r.locked ? '🔒' : '🔓' }}</button>
                            <button class="iconbtn sm" type="button"
                              (click)="removeMoodboardReference(r.id)">×</button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }

                <div class="divider"></div>

                <div class="grid-2">
                  <div>
                    <label class="field">Industry vertical</label>
                    <select [ngModel]="ac?.compliance?.industry ?? 'general'"
                      (ngModelChange)="updateAdCompliance('industry', $event)">
                      <option value="general">General</option>
                      <option value="health">Health & wellness</option>
                      <option value="alcohol">Alcohol</option>
                      <option value="finance">Finance</option>
                      <option value="auto">Automotive</option>
                      <option value="food">Food & beverage</option>
                      <option value="fashion">Fashion</option>
                      <option value="tech">Tech / software</option>
                      <option value="gaming">Gaming</option>
                      <option value="travel">Travel</option>
                      <option value="kids">Kids</option>
                    </select>
                  </div>
                  <div>
                    <label class="field check-line" style="margin-top: 0.4rem">
                      <input type="checkbox"
                        [ngModel]="ac?.compliance?.brandSafeOnly ?? true"
                        (ngModelChange)="updateAdCompliance('brandSafeOnly', $event)"/>
                      <span>Brand-safe content only</span>
                    </label>
                  </div>
                </div>

                <label class="field" style="margin-top: 0.9rem">Required disclaimers</label>
                <div class="chip-input">
                  @for (d of ac?.compliance?.disclaimers ?? []; track d) {
                    <span class="chip amber">{{ d }} <button class="x" type="button" (click)="removeDisclaimer(d)">×</button></span>
                  }
                  <input #discInput placeholder="e.g. “Results may vary” + Enter"
                    (keydown.enter)="addDisclaimer(discInput.value); discInput.value = ''"/>
                </div>

                <label class="field" style="margin-top: 0.9rem">Restricted terms</label>
                <div class="chip-input">
                  @for (t of ac?.compliance?.restrictedTerms ?? []; track t) {
                    <span class="chip rose">{{ t }} <button class="x" type="button" (click)="removeRestrictedTerm(t)">×</button></span>
                  }
                  <input #rtInput placeholder="e.g. “cure”, “guarantee” + Enter"
                    (keydown.enter)="addRestrictedTerm(rtInput.value); rtInput.value = ''"/>
                </div>
              }

              @case ('ad_structure') {
                @let ac = p.adConfig ?? null;
                @let structure = ac?.structure ?? [];
                <h2>Ad structure</h2>
                <p class="muted">Five-beat skeleton. Each beat becomes a scene with a storyboard panel.</p>

                <div class="row" style="gap: 0.4rem; margin-top: 0.9rem">
                  <button class="btn primary sm" type="button" (click)="seedAdStructure()" [disabled]="structure.length > 0">
                    ✨ Seed 5-beat structure
                  </button>
                  @if (structure.length > 0) {
                    <button class="btn ghost sm" type="button" (click)="clearAdStructure()">Clear</button>
                  }
                </div>

                @if (structure.length === 0) {
                  <div class="empty-state" style="margin-top: 0.8rem">
                    <div class="empty-art">🪜</div>
                    <p class="muted" style="font-size: 0.85rem">No structure yet — click <strong>Seed 5-beat structure</strong> to scaffold Hook → Problem → Solution → Proof → CTA.</p>
                  </div>
                } @else {
                  <div class="ad-beats">
                    @for (b of structure; track b.id; let i = $index) {
                      <div class="ad-beat" [attr.data-type]="b.type">
                        <div class="ad-beat-header">
                          <span class="chip">{{ i + 1 }}. {{ adBeatLabel(b.type) }}</span>
                          <input type="number" min="1" max="60" style="width: 70px"
                            [ngModel]="b.durationSec"
                            (ngModelChange)="updateAdBeatField(b.id, { durationSec: +$event })"/>
                          <span class="muted" style="font-size: 0.72rem">s</span>
                          <span class="spacer"></span>
                          @if (b.sceneId) {
                            <a class="btn ghost sm" [routerLink]="['/projects', p.id, 'scenes', b.sceneId]">Open scene →</a>
                          }
                        </div>
                        <textarea rows="2" placeholder="Copy / narration for this beat"
                          [ngModel]="b.copy"
                          (ngModelChange)="updateAdBeatField(b.id, { copy: $event })"></textarea>
                      </div>
                    }
                  </div>

                  <div class="row" style="margin-top: 1rem">
                    <button class="btn cool sm" type="button" (click)="generateAdScenesFromStructure()">
                      ↗ Generate scenes from structure
                    </button>
                    <span class="muted" style="font-size: 0.78rem">Creates one Scene per beat with the right shot type and duration.</span>
                  </div>
                }
              }

              @case ('ad_variants') {
                @let ac = p.adConfig ?? null;
                @let variants = ac?.variants ?? [];
                <h2>A/B variants</h2>
                <p class="muted">Test different angles cheaply. Vary one axis per variant for clean signal.</p>

                <div class="row" style="gap: 0.4rem; margin-top: 0.9rem">
                  <button class="btn sm" type="button" (click)="addVariant('hook')">+ Hook variant</button>
                  <button class="btn sm" type="button" (click)="addVariant('cta')">+ CTA variant</button>
                  <button class="btn sm" type="button" (click)="addVariant('visual')">+ Visual variant</button>
                  @if (variants.length === 0) {
                    <button class="btn primary sm" type="button" (click)="seedDefaultVariants()">✨ Seed 3 variants</button>
                  }
                </div>

                @if (variants.length === 0) {
                  <div class="empty-state" style="margin-top: 0.8rem">
                    <div class="empty-art">🅰🅱</div>
                    <p class="muted" style="font-size: 0.85rem">No variants yet. Pick an axis above or seed 3 defaults.</p>
                  </div>
                } @else {
                  <div class="variants-grid">
                    @for (v of variants; track v.id) {
                      <div class="variant-card" [attr.data-axis]="v.variesOn">
                        <div class="row" style="justify-content: space-between; align-items: center">
                          <input class="variant-label-input"
                            [ngModel]="v.label"
                            (ngModelChange)="updateVariantField(v.id, { label: $event })"/>
                          <span class="chip cyan">varies: {{ v.variesOn }}</span>
                        </div>
                        @if (v.variesOn === 'hook') {
                          <label class="field" style="margin-top: 0.5rem">Hook override</label>
                          <textarea rows="2"
                            [ngModel]="v.hookOverride ?? ''"
                            (ngModelChange)="updateVariantField(v.id, { hookOverride: $event })"
                            placeholder="Alt opening line"></textarea>
                        }
                        @if (v.variesOn === 'cta') {
                          <label class="field" style="margin-top: 0.5rem">CTA override</label>
                          <input
                            [ngModel]="v.ctaOverride ?? ''"
                            (ngModelChange)="updateVariantField(v.id, { ctaOverride: $event })"
                            placeholder="Alt CTA copy"/>
                        }
                        @if (v.variesOn === 'visual') {
                          <label class="field" style="margin-top: 0.5rem">Visual direction</label>
                          <textarea rows="2"
                            [ngModel]="v.visualNote ?? ''"
                            (ngModelChange)="updateVariantField(v.id, { visualNote: $event })"
                            placeholder="Different look / set / palette"></textarea>
                        }
                        <div class="row" style="justify-content: flex-end; margin-top: 0.5rem">
                          <button class="btn danger sm" type="button" (click)="removeVariant(v.id)">Delete</button>
                        </div>
                      </div>
                    }
                  </div>
                }
              }
            }

            <div class="step-footer">
              <button class="btn ghost" (click)="prev()" [disabled]="!hasPrev()">← Back</button>
              <span class="muted">Step {{ stepIndex() + 1 }} / {{ steps().length }}</span>
              @if (active() !== 'review') {
                <button class="btn primary" (click)="next()">Continue →</button>
              } @else {
                <button class="btn cool" (click)="generateContract()">🚀 Generate Scene 1</button>
              }
            </div>
          </section>

          @if (previewOpen()) {
            <aside class="contract-preview card">
              <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
                <div class="row" style="gap: 0.4rem">
                  <span class="chip cyan">live</span>
                  <strong style="font-family: var(--font-display)">Contract</strong>
                </div>
                <div class="row" style="gap: 0.3rem">
                  <button class="btn sm" [class.primary]="format() === 'yaml'" (click)="format.set('yaml')">YAML</button>
                  <button class="btn sm" [class.primary]="format() === 'json'" (click)="format.set('json')">JSON</button>
                </div>
              </div>
              <pre class="contract-pre side">{{ contractText() }}</pre>
            </aside>
          }
        </div>

        @if (deleteSceneId(); as did) {
          <div class="modal-backdrop" (click)="deleteSceneId.set(null)">
            <div class="modal" (click)="$event.stopPropagation()">
              <strong style="font-family: var(--font-display); font-size: 1.05rem">Delete scene?</strong>
              <p class="muted" style="margin-top: 0.4rem">
                Removes this scene and its objects. This cannot be undone.
              </p>
              <div class="row" style="gap: 0.5rem; justify-content: flex-end; margin-top: 1rem">
                <button class="btn" (click)="deleteSceneId.set(null)">Cancel</button>
                <button class="btn danger" (click)="deleteSceneConfirmed(did)">Delete</button>
              </div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="loading">
        <span class="loader"></span>
        <span style="margin-left: 0.6rem">Loading project…</span>
      </div>
    }
  `,
  styleUrls: [
    './wizard.component.scss',
    './wizard-moodboard-storyboard.scss',
    './wizard-goal-flows.scss',
  ],
})
export class WizardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projects = inject(ProjectsService);
  protected readonly assets = inject(AssetsService);
  private readonly scenes = inject(ScenesService);
  protected readonly modelsService = inject(ModelsService);
  private readonly exportSvc = inject(ContractExportService);
  private readonly moodboardSvc = inject(MoodboardService);
  private readonly storyboardSvc = inject(StoryboardService);
  protected readonly charactersLibrary = inject(CharactersService);

  protected readonly active = signal<StepKey>('goal');
  protected readonly previewOpen = signal(true);
  protected readonly format = signal<'yaml' | 'json'>('yaml');
  protected readonly draftScript = signal('');
  protected readonly moodboardLoading = signal(false);
  protected readonly moodboardRationale = signal<string | null>(null);
  protected readonly storyboardLoading = signal(false);
  protected readonly storyboardRationale = signal<string | null>(null);
  protected readonly scenesView = signal<'list' | 'storyboard'>('list');
  protected readonly regeneratingPanelId = signal<string | null>(null);
  protected readonly libraryPickerOpen = signal(false);
  protected readonly importingProfileId = signal<string | null>(null);

  protected readonly project = signal<CreativeContract | undefined>(undefined);
  protected readonly selectedCharId = signal<string | null>(null);
  protected readonly showPickerForCharId = signal<string | null>(null);
  protected readonly generatingAvatarFor = signal<string | null>(null);
  protected readonly uploadStatus = signal<string | null>(null);
  protected readonly deleteSceneId = signal<string | null>(null);

  protected readonly imageAssets = computed(() =>
    this.assets.assets().filter((a) => a.type === 'image'),
  );
  protected readonly selectedCharacter = computed(() => {
    const id = this.selectedCharId();
    return this.project()?.characters.find((c) => c.id === id);
  });

  protected readonly steps = computed<WizardStep[]>(() => stepsForGoal(this.project()?.goal));

  protected readonly goals = [
    { key: 'cinematic_trailer' as ProjectGoal, label: 'Cinematic trailer', sub: 'Hero piece with mood and motion', emoji: '🎬' },
    { key: 'music_video' as ProjectGoal, label: 'Music video', sub: 'Synced to a soundtrack', emoji: '🎵' },
    { key: 'ad' as ProjectGoal, label: 'Advertisement', sub: 'Hook → benefit → CTA', emoji: '📢' },
    { key: 'children_story' as ProjectGoal, label: "Children's story", sub: 'Bright, warm, narrated', emoji: '🧸' },
    { key: 'explainer' as ProjectGoal, label: 'Explainer', sub: 'Educate in 60–120s', emoji: '💡' },
    { key: 'product_demo' as ProjectGoal, label: 'Product demo', sub: 'Features in motion', emoji: '🛠️' },
    { key: 'youtube_short' as ProjectGoal, label: 'YouTube short', sub: '9:16 punchy clip', emoji: '📱' },
    { key: 'educational' as ProjectGoal, label: 'Educational', sub: 'Lesson with visuals', emoji: '🎓' },
    { key: 'documentary' as ProjectGoal, label: 'Documentary', sub: 'Long-form storytelling', emoji: '🎙️' },
  ];

  protected readonly scriptModels = computed(() => this.modelsService.byCapability('script_generation'));

  protected readonly contractText = computed(() => {
    const p = this.project();
    if (!p) return '';
    return this.format() === 'yaml' ? this.exportSvc.toYaml(p) : this.exportSvc.toJson(p);
  });

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) return this.projects.get(id);
          return this.projects
            .create({ title: 'Untitled video', goal: 'cinematic_trailer', description: '' });
        }),
        takeUntilDestroyed(),
      )
      .subscribe((p) => {
        if (!p) return;
        this.project.set(p);
        // If we just created a new project (URL is /projects/new), update URL to /projects/:id without re-routing.
        const currentId = this.route.snapshot.paramMap.get('id');
        if (!currentId) {
          this.router.navigate(['/projects', p.id], { replaceUrl: true });
        }
      });
  }

  protected stepIndex() { return this.steps().findIndex((s) => s.key === this.active()); }
  protected hasPrev() { return this.stepIndex() > 0; }
  protected setStep(s: StepKey) { this.active.set(s); }
  protected next() {
    const list = this.steps();
    const i = this.stepIndex();
    if (i < list.length - 1) this.active.set(list[i + 1].key);
  }
  protected prev() {
    const list = this.steps();
    const i = this.stepIndex();
    if (i > 0) this.active.set(list[i - 1].key);
  }
  protected togglePreview() { this.previewOpen.update((v) => !v); }

  protected completed(key: StepKey, p: CreativeContract): boolean {
    switch (key) {
      case 'goal': return !!p.title && !!p.goal;
      case 'script': return !!p.description && p.output.targetDurationSec > 0;
      case 'style': return !!p.creativeDirection.genre && p.creativeDirection.colorPalette.length >= 2;
      case 'characters': return p.characters.length > 0;
      case 'assets': return true;
      case 'scenes': return p.scenes.length > 0;
      case 'review': return p.scenes.length > 0;
      case 'yt_hook': return !!p.shortConfig?.hook?.trim() && !!p.shortConfig?.niche?.trim();
      case 'yt_audio': return !!p.shortConfig?.audio?.title || p.shortConfig?.audio?.source === 'generated';
      case 'yt_style': return !!p.shortConfig?.captionStyle;
      case 'yt_beats': return (p.shortConfig?.beats?.length ?? 0) > 0;
      case 'yt_cta': return !!p.shortConfig?.cta?.copy?.trim();
      case 'ad_brand': return !!p.adConfig?.brand?.name?.trim();
      case 'ad_product': return !!p.adConfig?.product?.productName?.trim() && !!p.adConfig?.product?.usp?.trim();
      case 'ad_audience': return (p.adConfig?.placement?.platforms?.length ?? 0) > 0;
      case 'ad_visual': return !!p.adConfig?.compliance?.industry;
      case 'ad_structure': return (p.adConfig?.structure?.length ?? 0) >= 3;
      case 'ad_variants': return (p.adConfig?.variants?.length ?? 0) > 0;
    }
  }

  protected statusTone(s: CreativeContract['status']) {
    return { draft: 'muted', in_progress: 'cyan', review: 'amber', completed: 'green' }[s];
  }
  protected sceneStatusTone(s: string) {
    return { draft: 'muted', prepared: 'cyan', generating: 'amber', completed: 'green', approved: 'green', failed: 'rose', waiting_for_user: 'amber' }[s] ?? 'muted';
  }

  protected updateField<K extends keyof CreativeContract>(key: K, value: CreativeContract[K]) {
    const p = this.project();
    if (!p) return;
    const updated = { ...p, [key]: value };
    this.project.set(updated);
    this.projects.update(p.id, { [key]: value } as Partial<CreativeContract>);
  }

  protected setGoal(goal: ProjectGoal) {
    const p = this.project();
    if (!p) return;
    const patch: Partial<CreativeContract> = { goal };

    if (goal === 'youtube_short') {
      patch.output = {
        ...p.output,
        aspectRatio: '9:16',
        targetDurationSec: Math.min(p.output.targetDurationSec || 30, 60) || 30,
      };
      if (!p.shortConfig) patch.shortConfig = defaultShortConfig();
    } else if (goal === 'ad') {
      if (!p.adConfig) patch.adConfig = defaultAdConfig();
    }

    const next: CreativeContract = { ...p, ...patch };
    this.project.set(next);
    this.projects.update(p.id, patch);

    // If the current active step doesn't exist in the new flow, reset to goal.
    const nextSteps = stepsForGoal(goal);
    if (!nextSteps.find((s) => s.key === this.active())) {
      this.active.set('goal');
    }
  }

  private patchProject(patch: Partial<CreativeContract>) {
    const p = this.project();
    if (!p) return;
    this.project.set({ ...p, ...patch });
    this.projects.update(p.id, patch);
  }

  protected updateShort<K extends keyof ShortVideoConfig>(key: K, value: ShortVideoConfig[K]) {
    const p = this.project();
    if (!p) return;
    const shortConfig: ShortVideoConfig = { ...(p.shortConfig ?? defaultShortConfig()), [key]: value };
    this.patchProject({ shortConfig });
  }

  protected updateShortAudio<K extends keyof ShortAudioChoice>(key: K, value: ShortAudioChoice[K]) {
    const p = this.project();
    if (!p) return;
    const cfg = p.shortConfig ?? defaultShortConfig();
    const shortConfig: ShortVideoConfig = { ...cfg, audio: { ...cfg.audio, [key]: value } };
    this.patchProject({ shortConfig });
  }

  protected updateShortCta<K extends keyof ShortCta>(key: K, value: ShortCta[K]) {
    const p = this.project();
    if (!p) return;
    const cfg = p.shortConfig ?? defaultShortConfig();
    const shortConfig: ShortVideoConfig = { ...cfg, cta: { ...cfg.cta, [key]: value } };
    this.patchProject({ shortConfig });
  }

  protected updateAdBrand<K extends keyof AdBrand>(key: K, value: AdBrand[K]) {
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    const adConfig: AdConfig = { ...cfg, brand: { ...cfg.brand, [key]: value } };
    this.patchProject({ adConfig });
  }

  protected updateAdProduct<K extends keyof AdProductOffer>(key: K, value: AdProductOffer[K]) {
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    const adConfig: AdConfig = { ...cfg, product: { ...cfg.product, [key]: value } };
    this.patchProject({ adConfig });
  }

  protected updateAdAudience<K extends keyof AdAudience>(key: K, value: AdAudience[K]) {
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    const adConfig: AdConfig = { ...cfg, audience: { ...cfg.audience, [key]: value } };
    this.patchProject({ adConfig });
  }

  protected updateAdPlacement<K extends keyof AdPlacementConfig>(key: K, value: AdPlacementConfig[K]) {
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    const adConfig: AdConfig = { ...cfg, placement: { ...cfg.placement, [key]: value } };
    // Aspect ratio follows placement.
    const aspect = aspectFromPlacement(adConfig.placement.placements, adConfig.placement.platforms);
    const patch: Partial<CreativeContract> = { adConfig };
    if (aspect && aspect !== p.output.aspectRatio) {
      patch.output = { ...p.output, aspectRatio: aspect };
    }
    this.patchProject(patch);
  }

  protected updateAdCompliance<K extends keyof AdCompliance>(key: K, value: AdCompliance[K]) {
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    const adConfig: AdConfig = { ...cfg, compliance: { ...cfg.compliance, [key]: value } };
    this.patchProject({ adConfig });
  }

  protected updateAdCta<K extends keyof AdCta>(key: K, value: AdCta[K]) {
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    const adConfig: AdConfig = { ...cfg, primaryCta: { ...cfg.primaryCta, [key]: value } };
    this.patchProject({ adConfig });
  }

  /* ============== YouTube Short helpers ============== */
  protected readonly trendingAudio = TRENDING_AUDIO_POOL;
  protected readonly audioSources: { id: ShortAudioChoice['source']; label: string }[] = [
    { id: 'trending', label: 'Trending' },
    { id: 'generated', label: 'Generate' },
    { id: 'upload', label: 'Upload' },
  ];
  protected readonly captionStyles: { id: ShortCaptionStyle; label: string }[] = [
    { id: 'bold', label: 'Bold' },
    { id: 'karaoke', label: 'Karaoke' },
    { id: 'animated', label: 'Animated' },
    { id: 'minimal', label: 'Minimal' },
  ];
  protected readonly emojiDensities: { id: ShortEmojiDensity; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'sparse', label: 'Sparse' },
    { id: 'medium', label: 'Medium' },
    { id: 'heavy', label: 'Heavy' },
  ];

  protected pickTrendingAudio(t: ShortAudioChoice) {
    const p = this.project();
    if (!p) return;
    const cfg = p.shortConfig ?? defaultShortConfig();
    const shortConfig: ShortVideoConfig = { ...cfg, audio: { ...t, source: 'trending' } };
    this.patchProject({ shortConfig });
  }

  protected beatIntervalMs(bpm: number | undefined): number {
    if (!bpm || bpm <= 0) return 0;
    return Math.round(60_000 / bpm);
  }

  protected moodboardHero(p: CreativeContract): string {
    const ref = p.creativeDirection.references.find((r) => r.locked) ?? p.creativeDirection.references[0];
    return ref ? `url(${ref.thumbnail || ref.uri})` : '';
  }

  protected totalBeatsSec(beats: ShortBeat[]): number {
    return beats.reduce((sum, b) => sum + (b.durationSec || 0), 0);
  }

  protected addShortBeat() {
    const p = this.project();
    if (!p) return;
    const cfg = p.shortConfig ?? defaultShortConfig();
    const beat: ShortBeat = {
      id: `beat-${Date.now()}`,
      index: cfg.beats.length,
      label: cfg.beats.length === 0 ? 'hook' : 'setup',
      durationSec: 2,
      onScreenText: '',
    };
    this.patchProject({ shortConfig: { ...cfg, beats: [...cfg.beats, beat] } });
  }

  protected updateBeat(id: string, patch: Partial<ShortBeat>) {
    const p = this.project();
    if (!p?.shortConfig) return;
    const beats = p.shortConfig.beats.map((b) => (b.id === id ? { ...b, ...patch } : b));
    this.patchProject({ shortConfig: { ...p.shortConfig, beats } });
  }

  protected removeBeat(id: string) {
    const p = this.project();
    if (!p?.shortConfig) return;
    const beats = p.shortConfig.beats.filter((b) => b.id !== id).map((b, i) => ({ ...b, index: i }));
    this.patchProject({ shortConfig: { ...p.shortConfig, beats } });
  }

  protected suggestShortBeats() {
    const p = this.project();
    if (!p) return;
    const cfg = p.shortConfig ?? defaultShortConfig();
    const total = p.output.targetDurationSec || 30;
    const seeds: { label: ShortBeat['label']; text: string; ratio: number }[] = [
      { label: 'hook', text: cfg.hook || 'Strong opening line', ratio: 0.1 },
      { label: 'setup', text: 'Set up the problem or context', ratio: 0.2 },
      { label: 'setup', text: 'Build curiosity / show evidence', ratio: 0.25 },
      { label: 'payoff', text: cfg.payoff || 'Deliver the payoff', ratio: 0.3 },
      { label: 'cta', text: cfg.cta.copy || 'Follow for more', ratio: 0.15 },
    ];
    const beats: ShortBeat[] = seeds.map((s, i) => ({
      id: `beat-${Date.now()}-${i}`,
      index: i,
      label: s.label,
      durationSec: Math.max(1, Math.round(total * s.ratio)),
      onScreenText: s.text,
    }));
    this.patchProject({ shortConfig: { ...cfg, beats } });
  }

  /* ============== Advertisement helpers ============== */
  protected readonly adPlatforms = AD_PLATFORMS;
  protected readonly adPlacements = AD_PLACEMENTS;
  protected readonly adLogoPickerOpen = signal(false);

  protected toggleAdLogoPicker() { this.adLogoPickerOpen.update((v) => !v); }
  protected pickAdLogo(assetId: string) {
    this.updateAdBrand('logoAssetId', assetId);
    this.adLogoPickerOpen.set(false);
  }

  protected addSupportingBenefit(value: string) {
    const v = value.trim();
    if (!v) return;
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    if (cfg.product.supportingBenefits.includes(v)) return;
    this.updateAdProduct('supportingBenefits', [...cfg.product.supportingBenefits, v]);
  }
  protected removeSupportingBenefit(v: string) {
    const p = this.project();
    if (!p?.adConfig) return;
    this.updateAdProduct(
      'supportingBenefits',
      p.adConfig.product.supportingBenefits.filter((b) => b !== v),
    );
  }
  protected addRegion(value: string) {
    const v = value.trim();
    if (!v) return;
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    if (cfg.audience.regions.includes(v)) return;
    this.updateAdAudience('regions', [...cfg.audience.regions, v]);
  }
  protected removeRegion(v: string) {
    const p = this.project();
    if (!p?.adConfig) return;
    this.updateAdAudience('regions', p.adConfig.audience.regions.filter((r) => r !== v));
  }
  protected addInterest(value: string) {
    const v = value.trim();
    if (!v) return;
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    if (cfg.audience.interests.includes(v)) return;
    this.updateAdAudience('interests', [...cfg.audience.interests, v]);
  }
  protected removeInterest(v: string) {
    const p = this.project();
    if (!p?.adConfig) return;
    this.updateAdAudience('interests', p.adConfig.audience.interests.filter((i) => i !== v));
  }

  protected toggleAdPlatform(id: AdPlatform) {
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    const has = cfg.placement.platforms.includes(id);
    const platforms = has
      ? cfg.placement.platforms.filter((x) => x !== id)
      : [...cfg.placement.platforms, id];
    this.updateAdPlacement('platforms', platforms);
  }
  protected toggleAdPlacementOption(id: AdPlacement) {
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    const has = cfg.placement.placements.includes(id);
    const placements = has
      ? cfg.placement.placements.filter((x) => x !== id)
      : [...cfg.placement.placements, id];
    this.updateAdPlacement('placements', placements);
  }

  protected addDisclaimer(value: string) {
    const v = value.trim();
    if (!v) return;
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    if (cfg.compliance.disclaimers.includes(v)) return;
    this.updateAdCompliance('disclaimers', [...cfg.compliance.disclaimers, v]);
  }
  protected removeDisclaimer(v: string) {
    const p = this.project();
    if (!p?.adConfig) return;
    this.updateAdCompliance('disclaimers', p.adConfig.compliance.disclaimers.filter((d) => d !== v));
  }
  protected addRestrictedTerm(value: string) {
    const v = value.trim();
    if (!v) return;
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    if (cfg.compliance.restrictedTerms.includes(v)) return;
    this.updateAdCompliance('restrictedTerms', [...cfg.compliance.restrictedTerms, v]);
  }
  protected removeRestrictedTerm(v: string) {
    const p = this.project();
    if (!p?.adConfig) return;
    this.updateAdCompliance(
      'restrictedTerms',
      p.adConfig.compliance.restrictedTerms.filter((t) => t !== v),
    );
  }

  protected adBeatLabel(type: AdBeatType): string {
    return AD_BEAT_SKELETON.find((b) => b.type === type)?.label ?? type;
  }

  protected seedAdStructure() {
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    if (cfg.structure.length > 0) return;
    const structure: AdBeatEntry[] = AD_BEAT_SKELETON.map((s, i) => ({
      id: `adbeat-${Date.now()}-${i}`,
      type: s.type,
      copy: '',
      durationSec: s.defaultDuration,
    }));
    this.patchProject({ adConfig: { ...cfg, structure } });
  }

  protected clearAdStructure() {
    const p = this.project();
    if (!p?.adConfig) return;
    this.patchProject({ adConfig: { ...p.adConfig, structure: [] } });
  }

  protected updateAdBeatField(id: string, patch: Partial<AdBeatEntry>) {
    const p = this.project();
    if (!p?.adConfig) return;
    const structure = p.adConfig.structure.map((b) => (b.id === id ? { ...b, ...patch } : b));
    this.patchProject({ adConfig: { ...p.adConfig, structure } });
  }

  protected generateAdScenesFromStructure() {
    const p = this.project();
    if (!p?.adConfig) return;
    const scenes: Scene[] = p.adConfig.structure.map((b, i) => ({
      id: `scene-ad-${b.id}`,
      index: i,
      title: `${i + 1}. ${this.adBeatLabel(b.type)}`,
      objective: b.copy || this.adBeatLabel(b.type),
      durationSec: b.durationSec,
      generationMode: 'prepare_then_generate',
      background: { mode: 'generate', description: '' },
      camera: {
        shotType: b.type === 'hook' ? 'close up' : b.type === 'cta' ? 'medium shot' : 'medium shot',
        movement: 'static',
        lens: '35mm',
      },
      characters: [],
      objects: [],
      narration: { text: b.copy, voiceRef: '' },
      audio: { backgroundMusic: { mode: 'generate', genre: '', tempo: 'medium' }, soundEffects: [] },
      subtitles: { enabled: true, style: 'bold lower third' },
      transitionOut: { type: 'cut', durationMs: 200 },
      continuity: { usePreviousFinalFrame: true, exportFinalFrameForNextScene: true },
      review: { status: 'draft', lockedAssets: [] },
      costEstimate: 30,
    }));
    const structure = p.adConfig.structure.map((b, i) => ({ ...b, sceneId: scenes[i].id }));
    this.project.set({ ...p, scenes, adConfig: { ...p.adConfig, structure } });
    this.projects.update(p.id, { scenes, adConfig: { ...p.adConfig, structure } });
  }

  protected addVariant(axis: AdVariantAxis) {
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    const variant: AdVariant = {
      id: `var-${Date.now()}`,
      label: `Variant ${cfg.variants.length + 1}`,
      variesOn: axis,
    };
    this.patchProject({ adConfig: { ...cfg, variants: [...cfg.variants, variant] } });
  }

  protected seedDefaultVariants() {
    const p = this.project();
    if (!p) return;
    const cfg = p.adConfig ?? defaultAdConfig();
    if (cfg.variants.length > 0) return;
    const variants: AdVariant[] = [
      { id: `var-${Date.now()}-h`, label: 'A — Pain-point hook', variesOn: 'hook', hookOverride: '' },
      { id: `var-${Date.now()}-c`, label: 'B — Urgency CTA', variesOn: 'cta', ctaOverride: 'Save today only' },
      { id: `var-${Date.now()}-v`, label: 'C — UGC look', variesOn: 'visual', visualNote: 'Phone-shot, natural light' },
    ];
    this.patchProject({ adConfig: { ...cfg, variants } });
  }

  protected updateVariantField(id: string, patch: Partial<AdVariant>) {
    const p = this.project();
    if (!p?.adConfig) return;
    const variants = p.adConfig.variants.map((v) => (v.id === id ? { ...v, ...patch } : v));
    this.patchProject({ adConfig: { ...p.adConfig, variants } });
  }

  protected removeVariant(id: string) {
    const p = this.project();
    if (!p?.adConfig) return;
    this.patchProject({
      adConfig: { ...p.adConfig, variants: p.adConfig.variants.filter((v) => v.id !== id) },
    });
  }
  protected updateOutput<K extends keyof CreativeContract['output']>(key: K, value: CreativeContract['output'][K]) {
    const p = this.project();
    if (!p) return;
    const updated = { ...p, output: { ...p.output, [key]: value } };
    this.project.set(updated);
    this.projects.update(p.id, { output: updated.output });
  }
  protected updateOrchestration<K extends keyof CreativeContract['orchestration']>(key: K, value: CreativeContract['orchestration'][K]) {
    const p = this.project();
    if (!p) return;
    const updated = { ...p, orchestration: { ...p.orchestration, [key]: value } };
    this.project.set(updated);
    this.projects.update(p.id, { orchestration: updated.orchestration });
  }
  protected updateModel(slot: keyof CreativeContract['models'], provider: string, model: string) {
    const p = this.project();
    if (!p) return;
    const updated = { ...p, models: { ...p.models, [slot]: { provider, model } } };
    this.project.set(updated);
    this.projects.update(p.id, { models: updated.models });
  }
  protected updateCreative<K extends keyof CreativeContract['creativeDirection']>(key: K, value: CreativeContract['creativeDirection'][K]) {
    const p = this.project();
    if (!p) return;
    const updated = { ...p, creativeDirection: { ...p.creativeDirection, [key]: value } };
    this.project.set(updated);
    this.projects.update(p.id, { creativeDirection: updated.creativeDirection });
  }
  protected updateFonts(slot: keyof CreativeContract['creativeDirection']['fonts'], value: string) {
    const p = this.project();
    if (!p) return;
    const updated = {
      ...p,
      creativeDirection: { ...p.creativeDirection, fonts: { ...p.creativeDirection.fonts, [slot]: value } },
    };
    this.project.set(updated);
    this.projects.update(p.id, { creativeDirection: updated.creativeDirection });
  }
  protected addMood(value: string) {
    if (!value.trim()) return;
    const p = this.project();
    if (!p) return;
    if (p.creativeDirection.mood.includes(value)) return;
    this.updateCreative('mood', [...p.creativeDirection.mood, value.trim()]);
  }
  protected removeMood(value: string) {
    const p = this.project();
    if (!p) return;
    this.updateCreative('mood', p.creativeDirection.mood.filter((m) => m !== value));
  }
  protected addNegative(value: string) {
    if (!value.trim()) return;
    const p = this.project();
    if (!p) return;
    this.updateCreative('negativeRules', [...p.creativeDirection.negativeRules, value.trim()]);
  }
  protected removeNegative(value: string) {
    const p = this.project();
    if (!p) return;
    this.updateCreative('negativeRules', p.creativeDirection.negativeRules.filter((r) => r !== value));
  }
  protected setPaletteColor(i: number, value: string) {
    const p = this.project();
    if (!p) return;
    const palette = [...p.creativeDirection.colorPalette];
    palette[i] = value;
    this.updateCreative('colorPalette', palette);
  }
  protected addPaletteColor() {
    const p = this.project();
    if (!p) return;
    this.updateCreative('colorPalette', [...p.creativeDirection.colorPalette, '#7c3aed']);
  }
  protected removePaletteColor(i: number) {
    const p = this.project();
    if (!p) return;
    const palette = [...p.creativeDirection.colorPalette];
    palette.splice(i, 1);
    this.updateCreative('colorPalette', palette);
  }

  protected suggestMoodboard() {
    const p = this.project();
    if (!p || this.moodboardLoading()) return;
    this.moodboardLoading.set(true);
    this.moodboardSvc.suggest(p.id).subscribe({
      next: (suggestion: MoodboardSuggestion) => {
        this.moodboardRationale.set(suggestion.rationale);
        this.moodboardSvc.apply(p.id, suggestion).subscribe((direction) => {
          if (direction) this.applyCreativeDirection(direction);
          this.moodboardLoading.set(false);
        });
      },
      error: () => this.moodboardLoading.set(false),
    });
  }

  protected clearMoodboard() {
    const p = this.project();
    if (!p) return;
    const direction: CreativeDirection = { ...p.creativeDirection, references: [] };
    this.applyCreativeDirection(direction);
    this.moodboardSvc.update(p.id, direction).subscribe();
    this.moodboardRationale.set(null);
  }

  protected toggleReferenceLock(refId: string) {
    const p = this.project();
    if (!p) return;
    const references = p.creativeDirection.references.map((r) =>
      r.id === refId ? { ...r, locked: !r.locked } : r,
    );
    this.applyCreativeDirection({ ...p.creativeDirection, references });
    this.moodboardSvc.toggleLock(p.id, refId).subscribe();
  }

  protected removeMoodboardReference(refId: string) {
    const p = this.project();
    if (!p) return;
    const references = p.creativeDirection.references.filter((r) => r.id !== refId);
    this.applyCreativeDirection({ ...p.creativeDirection, references });
    this.moodboardSvc.removeReference(p.id, refId).subscribe();
  }

  protected updateMoodboardTag(refId: string, tag: string) {
    const p = this.project();
    if (!p) return;
    const references = p.creativeDirection.references.map((r) =>
      r.id === refId ? { ...r, tag } : r,
    );
    const direction: CreativeDirection = { ...p.creativeDirection, references };
    this.applyCreativeDirection(direction);
    this.moodboardSvc.update(p.id, direction).subscribe();
  }

  private applyCreativeDirection(direction: CreativeDirection) {
    const p = this.project();
    if (!p) return;
    this.project.set({ ...p, creativeDirection: direction });
  }

  protected openLibraryPicker() {
    this.libraryPickerOpen.set(true);
  }

  protected closeLibraryPicker() {
    this.libraryPickerOpen.set(false);
  }

  protected libraryThumb(profile: CharacterProfile): string {
    const primary = profile.images.find((i) => i.id === profile.primaryImageId) ?? profile.images[0];
    return primary ? `url(${primary.thumbnail || primary.uri})` : '';
  }

  protected isProfileImported(project: CreativeContract, profile: CharacterProfile): boolean {
    const norm = (s: string) => s.trim().toLowerCase();
    return !!project.characters.find((c) => norm(c.name) === norm(profile.name) && !!profile.name);
  }

  protected importLibraryCharacter(profile: CharacterProfile) {
    const p = this.project();
    if (!p || this.importingProfileId()) return;
    if (this.isProfileImported(p, profile)) return;
    this.importingProfileId.set(profile.id);

    const uploads = profile.images.length
      ? forkJoin(
          profile.images.map((img) =>
            this.assets.upload({
              type: 'image',
              name: `${profile.name.toLowerCase().replace(/\s+/g, '-') || 'character'}-${img.id}.jpg`,
              uri: img.uri,
            }),
          ),
        )
      : of<Asset[]>([]);

    uploads.subscribe((createdAssets) => {
      const referenceImages = createdAssets.map((a) => a.id);
      const newChar: Character = {
        id: `char-${Date.now()}`,
        name: profile.name,
        description: profile.description,
        referenceImages,
        wardrobe: profile.wardrobe ?? '',
        voice: { mode: 'generate', provider: 'elevenlabs', accent: 'neutral', voiceId: '' },
        emotionProfile: profile.personality ?? '',
        movementStyle: '',
        continuityLock: true,
      };
      const current = this.project();
      if (!current) {
        this.importingProfileId.set(null);
        return;
      }
      const characters = [...current.characters, newChar];
      this.project.set({ ...current, characters });
      this.projects.update(current.id, { characters });
      this.selectedCharId.set(newChar.id);
      this.importingProfileId.set(null);
      this.libraryPickerOpen.set(false);
    });
  }

  protected addAndEditCharacter() {
    const p = this.project();
    if (!p) return;
    const id = `char-${Date.now()}`;
    const newChar: Character = {
      id,
      name: '',
      description: '',
      referenceImages: [],
      wardrobe: '',
      voice: { mode: 'generate', provider: 'elevenlabs', accent: 'neutral', voiceId: '' },
      emotionProfile: '',
      movementStyle: '',
      continuityLock: true,
    };
    const characters = [...p.characters, newChar];
    this.project.set({ ...p, characters });
    this.projects.update(p.id, { characters });
    this.selectedCharId.set(id);
  }
  protected removeCharacter(id: string) {
    const p = this.project();
    if (!p) return;
    const characters = p.characters.filter((c) => c.id !== id);
    this.project.set({ ...p, characters });
    this.projects.update(p.id, { characters });
    if (this.selectedCharId() === id) this.selectedCharId.set(characters[0]?.id ?? null);
  }
  protected duplicateCharacter(id: string) {
    const p = this.project();
    if (!p) return;
    const original = p.characters.find((c) => c.id === id);
    if (!original) return;
    const copy: Character = {
      ...original,
      id: `char-${Date.now()}`,
      name: original.name ? `${original.name} (copy)` : '',
      referenceImages: [...original.referenceImages],
      voice: { ...original.voice },
    };
    const characters = [...p.characters, copy];
    this.project.set({ ...p, characters });
    this.projects.update(p.id, { characters });
    this.selectedCharId.set(copy.id);
  }
  protected updateCharacter(id: string, patch: Partial<Character>) {
    const p = this.project();
    if (!p) return;
    const characters = p.characters.map((c) => (c.id === id ? { ...c, ...patch } : c));
    this.project.set({ ...p, characters });
    this.projects.update(p.id, { characters });
  }
  protected updateCharacterVoice<K extends keyof CharacterVoice>(id: string, key: K, value: CharacterVoice[K]) {
    const p = this.project();
    if (!p) return;
    const characters = p.characters.map((c) =>
      c.id === id ? { ...c, voice: { ...c.voice, [key]: value } } : c,
    );
    this.project.set({ ...p, characters });
    this.projects.update(p.id, { characters });
  }
  protected toggleReference(charId: string, assetId: string) {
    const p = this.project();
    if (!p) return;
    const character = p.characters.find((c) => c.id === charId);
    if (!character) return;
    const has = character.referenceImages.includes(assetId);
    const referenceImages = has
      ? character.referenceImages.filter((id) => id !== assetId)
      : [...character.referenceImages, assetId];
    this.updateCharacter(charId, { referenceImages });
  }
  protected removeReference(charId: string, assetId: string) {
    this.toggleReference(charId, assetId);
  }
  protected togglePicker(charId: string | null) {
    this.showPickerForCharId.set(this.showPickerForCharId() === charId ? null : charId);
  }
  protected generateAvatarFor(c: Character) {
    if (this.generatingAvatarFor()) return;
    this.generatingAvatarFor.set(c.id);
    const prompt = [
      c.description || 'a cinematic portrait',
      c.wardrobe ? `wearing ${c.wardrobe}` : '',
      'soft cinematic light, detailed face, 35mm, photoreal',
    ].filter(Boolean).join(', ');
    this.assets.generate({
      type: 'image',
      name: `${(c.name || 'avatar').toLowerCase().replace(/\s+/g, '-')}-ref-${Date.now()}.png`,
      prompt,
      provider: 'midjourney',
      model: 'Midjourney v7',
    }).subscribe((asset) => {
      const cur = this.project()?.characters.find((x) => x.id === c.id);
      if (cur) {
        this.updateCharacter(c.id, { referenceImages: [...cur.referenceImages, asset.id] });
      }
      this.generatingAvatarFor.set(null);
    });
  }

  protected allScenesApproved(p: CreativeContract): boolean {
    return p.scenes.length > 0 && p.scenes.every((s) => s.review.status === 'approved');
  }
  protected approvedCount(p: CreativeContract): number {
    return p.scenes.filter((s) => s.review.status === 'approved').length;
  }

  protected updateScene(sceneId: string, patch: Partial<Scene>) {
    const p = this.project();
    if (!p) return;
    const scenes = p.scenes.map((s) => (s.id === sceneId ? { ...s, ...patch } : s));
    this.project.set({ ...p, scenes });
    this.projects.update(p.id, { scenes });
  }

  protected storyboardThumb(scene: Scene): string {
    const uri = scene.storyboardPanel?.thumbnailUri ?? scene.storyboardPanel?.keyframeUri ?? scene.thumbnailUrl;
    return uri ? `url(${uri})` : '';
  }

  protected updatePanelAction(sceneId: string, action: string) {
    const p = this.project();
    if (!p) return;
    const scene = p.scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    const panel: StoryboardPanel = scene.storyboardPanel
      ? { ...scene.storyboardPanel, action }
      : {
          action,
          beat: '',
          locked: false,
        };
    this.updateScene(sceneId, { storyboardPanel: panel });
    this.storyboardSvc.updatePanel(p.id, sceneId, panel).subscribe();
  }

  protected toggleStoryboardLock(sceneId: string) {
    const p = this.project();
    if (!p) return;
    const scene = p.scenes.find((s) => s.id === sceneId);
    if (!scene?.storyboardPanel) return;
    const panel: StoryboardPanel = { ...scene.storyboardPanel, locked: !scene.storyboardPanel.locked };
    this.updateScene(sceneId, { storyboardPanel: panel });
    this.storyboardSvc.toggleLock(p.id, sceneId).subscribe();
  }

  protected suggestStoryboard() {
    const p = this.project();
    if (!p || this.storyboardLoading() || p.scenes.length === 0) return;
    this.storyboardLoading.set(true);
    this.storyboardSvc.suggest(p.id).subscribe({
      next: (suggestion: StoryboardSuggestion) => {
        this.storyboardRationale.set(suggestion.rationale);
        this.storyboardSvc.applySuggestion(p.id, suggestion).subscribe((scenes) => {
          if (scenes) {
            const project = this.project();
            if (project) this.project.set({ ...project, scenes });
          }
          this.storyboardLoading.set(false);
        });
      },
      error: () => this.storyboardLoading.set(false),
    });
  }

  protected regenerateStoryboardPanel(sceneId: string) {
    const p = this.project();
    if (!p) return;
    this.regeneratingPanelId.set(sceneId);
    this.storyboardSvc.regeneratePanel(p.id, sceneId).subscribe({
      next: (panel) => {
        if (panel) this.updateScene(sceneId, { storyboardPanel: panel });
        this.regeneratingPanelId.set(null);
      },
      error: () => this.regeneratingPanelId.set(null),
    });
  }

  protected moveScene(sceneId: string, direction: -1 | 1) {
    const p = this.project();
    if (!p) return;
    this.scenes.move(p.id, sceneId, direction).subscribe((scenes) => {
      this.project.set({ ...p, scenes });
    });
  }
  protected duplicateScene(sceneId: string) {
    const p = this.project();
    if (!p) return;
    this.scenes.duplicate(p.id, sceneId).subscribe(() => {
      this.projects.get(p.id).subscribe((np) => np && this.project.set(np));
    });
  }
  protected askDeleteScene(sceneId: string) {
    this.deleteSceneId.set(sceneId);
  }
  protected deleteSceneConfirmed(sceneId: string) {
    const p = this.project();
    if (!p) return;
    this.scenes.remove(p.id, sceneId).subscribe((scenes) => {
      this.project.set({ ...p, scenes });
      this.deleteSceneId.set(null);
    });
  }

  protected triggerUpload() {
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    input?.click();
  }
  protected onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (files.length === 0) return;
    this.uploadStatus.set(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}…`);
    let done = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUri = String(reader.result);
        const type = file.type.startsWith('video/')
          ? 'video'
          : file.type.startsWith('audio/')
            ? 'audio'
            : 'image';
        this.assets.upload({ type, name: file.name, uri: dataUri }).subscribe(() => {
          done += 1;
          if (done === files.length) {
            this.uploadStatus.set(`Uploaded ${done} file${done > 1 ? 's' : ''} ✓`);
            setTimeout(() => this.uploadStatus.set(null), 3000);
          }
        });
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }
  protected generateSampleAsset() {
    this.uploadStatus.set('Generating image…');
    this.assets
      .generate({
        type: 'image',
        name: `wizard-generated-${Date.now()}.png`,
        prompt: 'cinematic still, soft warm light, atmospheric, 35mm',
        provider: 'midjourney',
        model: 'Midjourney v7',
      })
      .subscribe(() => {
        this.uploadStatus.set('Generated ✓');
        setTimeout(() => this.uploadStatus.set(null), 2500);
      });
  }

  protected addScene() {
    const p = this.project();
    if (!p) return;
    const newScene: Scene = {
      id: `scene-${String(p.scenes.length + 1).padStart(3, '0')}`,
      index: p.scenes.length,
      title: `Scene ${p.scenes.length + 1}`,
      objective: '',
      durationSec: 6,
      generationMode: 'prepare_then_generate',
      background: { mode: 'generate', description: '' },
      camera: { shotType: 'medium shot', movement: 'static', lens: '35mm' },
      characters: [],
      objects: [],
      narration: { text: '', voiceRef: '' },
      audio: { backgroundMusic: { mode: 'generate', genre: '', tempo: 'medium' }, soundEffects: [] },
      subtitles: { enabled: true, style: 'clean lower third' },
      transitionOut: { type: 'fade', durationMs: 400 },
      continuity: { usePreviousFinalFrame: true, exportFinalFrameForNextScene: true },
      review: { status: 'draft', lockedAssets: [] },
      costEstimate: 30,
    };
    const scenes = [...p.scenes, newScene];
    this.project.set({ ...p, scenes });
    this.projects.update(p.id, { scenes });
  }

  protected mockGenerateScript() {
    const p = this.project();
    if (!p) return;
    this.draftScript.set(
`Cold open
A still city street at dusk. ${p.title || 'Our hero'} steps into frame.

Beat 1: Atmosphere
${p.creativeDirection.mood.join(', ') || 'mysterious, warm'} atmosphere builds. The wind shifts.

Beat 2: Inciting incident
A small object catches the hero's eye. They kneel and pick it up.

Beat 3: Turn
The world subtly shifts — light changes, music swells.

Beat 4: Resolution
${p.title || 'A new question'} now lingers in the air.`);
  }

  protected thumbForChar(c: Character): string {
    const id = c.referenceImages[0];
    const a = id ? this.assets.get(id) : undefined;
    return a ? `url(${a.thumbnail || a.uri})` : 'linear-gradient(135deg, rgba(139,92,246,.4), rgba(34,211,238,.3))';
  }

  protected copyContract() {
    navigator.clipboard?.writeText(this.contractText());
  }
  protected downloadContract() {
    const blob = new Blob([this.contractText()], { type: this.format() === 'yaml' ? 'text/yaml' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.project()?.id ?? 'contract'}.${this.format()}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  protected generateContract() {
    const p = this.project();
    if (!p || p.scenes.length === 0) {
      // jump to scenes step to add one
      this.active.set('scenes');
      return;
    }
    this.router.navigate(['/projects', p.id, 'scenes', p.scenes[0].id]);
  }
}
