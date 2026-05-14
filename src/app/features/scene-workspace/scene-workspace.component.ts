import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ScenesService } from '../../core/services/scenes.service';
import { ProjectsService } from '../../core/services/projects.service';
import { AssetsService } from '../../core/services/assets.service';
import { AudioEditorBridgeService } from '../../core/services/audio-editor-bridge.service';
import { ImageEditorBridgeService } from '../../core/services/image-editor-bridge.service';
import { JobsService } from '../../core/services/jobs.service';
import { ModelsService } from '../../core/services/models.service';
import { sampleVideoFor } from '../../core/services/sample-videos';
import {
  Asset,
  CreativeContract,
  Scene,
  SceneKeyframe,
  SceneObject,
  SceneVersion,
} from '../../core/models/contract.model';

type AssetPickerTarget =
  | { kind: 'object'; objectId: string }
  | { kind: 'startFrame' }
  | { kind: 'endFrame' }
  | { kind: 'backgroundMusic' }
  | { kind: 'narrationVoice' };

const AUDIO_OBJECT_TYPES = new Set<string>(['music', 'sfx', 'voice']);
const VISUAL_OBJECT_TYPES: ReadonlyArray<string> = ['character', 'prop', 'background', 'effect', 'subtitle'];

@Component({
  selector: 'app-scene-workspace',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (scene(); as s) {
      @if (project(); as p) {
        <div class="workspace">
          <header class="ws-header">
            <div>
              <a class="back" [routerLink]="['/projects', p.id]">← Back to {{ p.title }}</a>
              <div class="row" style="gap: 0.55rem; margin-top: 8px">
                <span class="scene-num">Scene {{ s.index + 1 }}</span>
                <input class="title-input" [ngModel]="s.title" (ngModelChange)="updateSceneField('title', $event)"/>
                <span class="chip" [class]="statusTone(s.review.status)">{{ s.review.status }}</span>
                @if (allScenesApproved()) {
                  <span class="chip green">all scenes approved ✨</span>
                }
              </div>
              <p class="muted" style="margin-top: 6px; font-size: 0.85rem">{{ s.objective }}</p>
            </div>
            <div class="row" style="flex-wrap: wrap; gap: 0.4rem">
              <button class="btn primary sm" (click)="generateScene()" [disabled]="s.review.status === 'generating'">
                ▶ Generate scene
              </button>
              <button class="btn cool sm" (click)="approveScene()"
                [disabled]="s.review.status === 'approved'">
                ✓ {{ s.review.status === 'approved' ? 'Approved' : 'Approve' }}
              </button>
              <button class="btn ghost sm" (click)="saveDraft()" [disabled]="draftSaving()">
                @if (draftSaving()) { <span class="loader"></span> Saving… }
                @else { 💾 Save draft }
              </button>
              <button class="btn sm" (click)="goNext()"
                [disabled]="!canGoNext()" [title]="canGoNext() ? '' : 'Approve this scene first'">
                Next scene →
              </button>
              @if (allScenesApproved()) {
                <a class="btn cool sm" [routerLink]="['/projects', p.id, 'final']">🎞 Final video</a>
              }
              <button class="btn danger sm" (click)="confirmDeleteScene()" title="Delete this scene">🗑 Delete scene</button>
            </div>
          </header>

          <nav class="scene-pills">
            @for (sc of p.scenes; track sc.id) {
              <a class="pill" [routerLink]="['/projects', p.id, 'scenes', sc.id]"
                [class.active]="sc.id === s.id" [class]="'tone-' + sceneStatusTone(sc.review.status)">
                <span class="pill-num">{{ sc.index + 1 }}</span>
                <span class="pill-text">{{ sc.title }}</span>
              </a>
            }
            @if (allScenesApproved()) {
              <a class="pill final" [routerLink]="['/projects', p.id, 'final']">
                <span class="pill-num">★</span>
                <span class="pill-text">Final video</span>
              </a>
            }
          </nav>

          @if (hasRenderedVideo()) {
            <section class="card preview">
              <div class="preview-stage" [style.background-image]="'url(' + previewImage() + ')'">
                <video
                  class="preview-video"
                  style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; background: #000;"
                  [src]="sampleVideoUri(s)"
                  [poster]="previewImage()"
                  controls
                  playsinline
                  preload="metadata"></video>
                <div class="preview-meta">
                  <span class="chip muted">{{ p.output.aspectRatio }}</span>
                  <span class="chip muted">{{ p.output.resolution }}</span>
                  <span class="chip muted">{{ s.durationSec }}s</span>
                  <span class="chip cyan">{{ s.camera.shotType }}</span>
                  <span class="chip cyan">{{ s.camera.movement }}</span>
                </div>
              </div>
            </section>
          } @else {
            <div class="prep-banner" [class]="'tone-' + statusTone(s.review.status)">
              <div>
                <div class="prep-banner-title">{{ previewStateLabel(s) }}</div>
                <p class="muted" style="font-size: 0.82rem; margin-top: 0.2rem">{{ previewStateHelp(s) }}</p>
              </div>
              <div class="row" style="gap: 0.4rem; flex-wrap: wrap">
                @if (s.review.status === 'generating') {
                  <span class="row" style="gap: 0.4rem"><span class="loader"></span> Rendering…</span>
                } @else if (s.review.status === 'failed') {
                  <button class="btn primary" (click)="generateScene()">↻ Retry generation</button>
                } @else {
                  <button class="btn primary" (click)="generateScene()">▶ Generate scene video</button>
                }
              </div>
            </div>
          }


          <section class="layers-section">
            <header class="layers-head">
              <div>
                <h2 class="section-title" style="margin: 0; font-size: 1.05rem">Scene layers</h2>
                <p class="muted" style="font-size: 0.82rem; margin-top: 0.25rem; max-width: 70ch">
                  Every ingredient the AI needs to render this scene. Edit any layer in place — when everything looks right,
                  hit <strong>Generate scene</strong> above and the video appears here.
                </p>
              </div>
              <span class="muted" style="font-size: 0.74rem; align-self: center">{{ layerCount(s) }} layers</span>
            </header>

            <div class="layers-grid">
              <article class="layer-card layer-prompt layer-row">
                <header class="layer-head">
                  <span class="layer-icon">📝</span>
                  <strong>Scene prompt</strong>
                  @if (s.promptOverride) { <span class="chip amber">edited</span> }
                  <span class="spacer"></span>
                  <div class="row" style="gap: 0.3rem">
                    @if (!editingPrompt()) {
                      <button class="btn ghost sm" (click)="startEditPrompt()">✏️ Edit raw</button>
                      <button class="btn primary sm" (click)="regeneratePrompt()">↻ Regenerate</button>
                    } @else {
                      <button class="btn sm" (click)="cancelEditPrompt()">Cancel</button>
                      <button class="btn primary sm" (click)="saveEditPrompt()">Save</button>
                      @if (s.promptOverride) {
                        <button class="btn ghost sm" (click)="resetPromptToCompiled()">Reset</button>
                      }
                    }
                  </div>
                </header>
                @if (!editingPrompt()) {
                  <div class="prompt-text mono">{{ effectivePrompt() }}</div>
                } @else {
                  <textarea class="prompt-edit mono" rows="6"
                    [ngModel]="promptDraft()" (ngModelChange)="promptDraft.set($event)"></textarea>
                }
              </article>

              <article class="layer-card layer-row keyframes-pair">
                <header class="layer-head">
                  <span class="layer-icon">🎞</span>
                  <strong>Start &amp; end frames</strong>
                  <span class="muted" style="font-size: 0.78rem">scene opens here · ends here</span>
                </header>
                <div class="keyframes-inner">
                  @for (kf of keyframeSlots; track kf.which; let isLast = $last) {
                    <div class="keyframe-slot">
                      <div class="keyframe-slot-label">
                        <span class="layer-icon">{{ kf.icon }}</span>
                        <strong>{{ kf.label }}</strong>
                        <span class="chip" [class]="keyframeFor(s, kf.which)?.assetId ? 'green' : 'muted'">
                          {{ keyframeFor(s, kf.which)?.assetId ? 'ready' : 'empty' }}
                        </span>
                        @if (keyframeFor(s, kf.which)?.locked) { <span class="chip green">🔒</span> }
                      </div>
                      <div class="layer-thumb" [style.background-image]="'url(' + keyframeThumb(s, kf.which) + ')'">
                        @if (!keyframeThumb(s, kf.which)) {
                          <div class="layer-thumb-empty">Not generated yet</div>
                        }
                        @if (keyframeThumb(s, kf.which)) {
                          <button class="edit-img-btn" type="button" title="Edit {{ kf.label }} in image editor" (click)="editKeyframe(s, kf.which, kf.label)">
                            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3l3 3-9 9-3 1 1-3 8-10z" stroke-linejoin="round"/></svg>
                          </button>
                        }
                      </div>
                      <input class="layer-desc" [ngModel]="keyframeFor(s, kf.which)?.description ?? ''"
                        (ngModelChange)="updateKeyframe(kf.which, { description: $event })"
                        placeholder="describe this keyframe…"/>
                      <div class="layer-actions">
                        <button class="btn ghost sm" (click)="generateKeyframe(kf.which)" title="Generate">✨ Generate</button>
                        <button class="btn sm" (click)="openAssetPicker({ kind: kf.which })" title="Pick from assets">📁 Replace</button>
                        <button class="btn sm" (click)="updateKeyframe(kf.which, { locked: !keyframeFor(s, kf.which)?.locked })" [title]="keyframeFor(s, kf.which)?.locked ? 'Unlock' : 'Lock'">
                          {{ keyframeFor(s, kf.which)?.locked ? '🔓' : '🔒' }}
                        </button>
                      </div>
                    </div>
                    @if (!isLast) {
                      <div class="keyframe-arrow" aria-hidden="true">
                        <svg viewBox="0 0 48 24" width="48" height="24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M2 12h40" stroke-linecap="round"/>
                          <path d="m36 6 8 6-8 6" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span class="keyframe-arrow-label">scene flow</span>
                      </div>
                    }
                  }
                </div>
              </article>

              <article class="layer-card layer-audio">
                <header class="layer-head">
                  <span class="layer-icon">🎵</span>
                  <strong>Background music</strong>
                  <span class="chip" [class]="s.audio.backgroundMusic.assetId ? 'green' : 'muted'">
                    {{ s.audio.backgroundMusic.assetId ? 'ready' : (s.audio.backgroundMusic.genre || 'not set') }}
                  </span>
                </header>
                <div class="row" style="gap: 0.3rem; flex-wrap: wrap">
                  <button class="tab sm" type="button" [class.active]="s.audio.backgroundMusic.mode === 'generate'" (click)="updateBackgroundMusic({ mode: 'generate' })">Generate</button>
                  <button class="tab sm" type="button" [class.active]="s.audio.backgroundMusic.mode === 'asset'" (click)="updateBackgroundMusic({ mode: 'asset' })">Asset</button>
                  <button class="tab sm" type="button" [class.active]="s.audio.backgroundMusic.mode === 'manual'" (click)="updateBackgroundMusic({ mode: 'manual' })">Manual</button>
                </div>
                @if (s.audio.backgroundMusic.mode !== 'asset') {
                  <div class="grid-2" style="margin-top: 0.4rem; gap: 0.4rem">
                    <input
                      [ngModel]="s.audio.backgroundMusic.genre"
                      (ngModelChange)="updateBackgroundMusic({ genre: $event })"
                      placeholder="genre"/>
                    <input
                      [ngModel]="s.audio.backgroundMusic.tempo"
                      (ngModelChange)="updateBackgroundMusic({ tempo: $event })"
                      placeholder="tempo"/>
                  </div>
                }
                @if (s.audio.backgroundMusic.assetId; as aid) {
                  @if (assets.get(aid); as a) {
                    <div class="layer-asset">
                      <span style="font-size: 1.2rem">🎵</span>
                      <div style="flex: 1; min-width: 0">
                        <div style="font-size: 0.84rem; font-weight: 600">{{ a.name }}</div>
                        <div class="muted" style="font-size: 0.72rem">{{ a.provider || 'manual' }}{{ a.durationSec ? ' · ' + a.durationSec + 's' : '' }}</div>
                      </div>
                      <button class="iconbtn sm" (click)="updateBackgroundMusic({ assetId: undefined })" title="Detach">×</button>
                    </div>
                    <audio class="layer-audio-player" controls preload="metadata" [src]="a.uri"></audio>
                  }
                }
                <div class="layer-actions">
                  <button class="btn sm" type="button" (click)="openAssetPicker({ kind: 'backgroundMusic' })">
                    📁 {{ s.audio.backgroundMusic.assetId ? 'Replace' : 'Pick' }}
                  </button>
                  @if (s.audio.backgroundMusic.assetId) {
                    <button class="btn sm" type="button" (click)="editMusic()" title="Trim / stretch / fade">✏️ Edit</button>
                  }
                  @if (s.audio.backgroundMusic.mode === 'generate') {
                    <button class="btn primary sm" type="button">✨ Generate</button>
                  }
                </div>
              </article>

              <article class="layer-card layer-audio">
                <header class="layer-head">
                  <span class="layer-icon">🔊</span>
                  <strong>Sound effects</strong>
                  <span class="chip" [class]="s.audio.soundEffects.length > 0 ? 'cyan' : 'muted'">
                    {{ s.audio.soundEffects.length }}
                  </span>
                </header>
                <p class="muted" style="font-size: 0.76rem">Footsteps, door slam, ambient crowd, etc.</p>
                <div class="chip-input">
                  @for (sfx of s.audio.soundEffects; track sfx) {
                    <span class="chip cyan">{{ sfx }} <button class="x" type="button" (click)="removeSoundEffect(sfx)">×</button></span>
                  }
                  <input
                    #sfxInput
                    placeholder="add + Enter"
                    (keydown.enter)="addSoundEffect(sfxInput.value); sfxInput.value = ''"
                  />
                </div>
              </article>

              <article class="layer-card layer-audio">
                <header class="layer-head">
                  <span class="layer-icon">🎙</span>
                  <strong>Narration</strong>
                  <span class="chip" [class]="s.narration.text.trim() ? 'cyan' : 'muted'">
                    {{ s.narration.text.trim() ? 'dialogue' : 'silent' }}
                  </span>
                </header>
                <textarea
                  rows="3"
                  [ngModel]="s.narration.text"
                  (ngModelChange)="updateNarration({ text: $event })"
                  placeholder="dialogue or VO text…"
                ></textarea>
                @if (s.narration.voiceRef) {
                  <div class="row" style="gap: 0.4rem; align-items: center; margin-top: 0.3rem">
                    <span class="chip cyan">{{ narrationVoiceLabel(s) }}</span>
                    <button class="iconbtn sm" (click)="updateNarration({ voiceRef: '' })" title="Clear voice">×</button>
                  </div>
                  @if (narrationAsset(s); as va) {
                    <audio class="layer-audio-player" controls preload="metadata" [src]="va.uri"></audio>
                  }
                } @else if (voiceModels().length > 0) {
                  <div class="row" style="gap: 0.3rem; margin-top: 0.3rem; flex-wrap: wrap">
                    @for (m of voiceModels(); track m.id) {
                      <button class="tab sm" type="button" (click)="updateNarration({ voiceRef: m.id })">
                        {{ m.provider }}
                      </button>
                    }
                  </div>
                }
                <div class="layer-actions">
                  <button class="btn sm" type="button" (click)="openAssetPicker({ kind: 'narrationVoice' })">📁 Voice</button>
                  @if (narrationAsset(s)) {
                    <button class="btn sm" type="button" (click)="editNarration()" title="Trim / stretch / fade">✏️ Edit</button>
                  }
                  @if (s.narration.text.trim()) {
                    <button class="btn primary sm" type="button">✨ Generate VO</button>
                  }
                </div>
              </article>

              <article class="layer-card layer-audio">
                <header class="layer-head">
                  <span class="layer-icon">💬</span>
                  <strong>Subtitles</strong>
                  <label class="row" style="margin-left: auto; gap: 0.3rem; font-size: 0.78rem">
                    <input
                      type="checkbox"
                      [ngModel]="s.subtitles.enabled"
                      (ngModelChange)="updateSubtitles({ enabled: $event })"
                    />
                    Enabled
                  </label>
                </header>
                @if (s.subtitles.enabled) {
                  <textarea
                    rows="2"
                    [ngModel]="subtitleText(s)"
                    (ngModelChange)="updateSubtitles({ text: $event })"
                    [placeholder]="s.narration.text.trim() ? 'Defaults to narration above — type here to override' : 'Subtitle text for this scene'"
                  ></textarea>
                  <div class="row" style="gap: 0.4rem; margin-top: 0.4rem; flex-wrap: wrap; font-size: 0.78rem">
                    <select
                      [ngModel]="s.subtitles.style"
                      (ngModelChange)="updateSubtitles({ style: $event })"
                      style="flex: 1; min-width: 140px"
                    >
                      <option value="clean lower third">Clean lower third</option>
                      <option value="karaoke">Karaoke</option>
                      <option value="bold caption">Bold caption</option>
                      <option value="minimal">Minimal</option>
                      <option value="documentary">Documentary</option>
                    </select>
                    <input
                      [ngModel]="s.subtitles.fontFamily ?? ''"
                      (ngModelChange)="updateSubtitles({ fontFamily: $event || undefined })"
                      [placeholder]="globalSubtitleFont() + ' (project default)'"
                      style="flex: 1; min-width: 120px"
                    />
                    <input
                      type="color"
                      [ngModel]="s.subtitles.color ?? globalSubtitleColor()"
                      (ngModelChange)="updateSubtitles({ color: $event })"
                      title="Per-scene color override"
                    />
                  </div>
                  @if (subtitleText(s); as preview) {
                    <div
                      class="subtitle-preview"
                      [style.font-family]="s.subtitles.fontFamily || globalSubtitleFont()"
                      [style.color]="s.subtitles.color || globalSubtitleColor()"
                      style="margin-top: 0.5rem; padding: 0.4rem 0.7rem; border-radius: 6px; background: rgba(0,0,0,0.55); display: inline-block; font-size: 0.9rem"
                    >
                      {{ preview }}
                    </div>
                  }
                } @else {
                  <p class="muted" style="font-size: 0.82rem">Subtitles are off for this scene. Toggle to overlay text from the narration.</p>
                }
              </article>

              @for (o of visualObjects(); track o.id) {
                <article class="layer-card layer-visual" [class.locked]="o.locked" [class.selected]="selectedObjectId() === o.id" (click)="selectObject(o.id)">
                  <header class="layer-head">
                    <span class="layer-icon" [innerHTML]="iconFor(o.type)"></span>
                    <input class="layer-name-input" [ngModel]="o.name" (ngModelChange)="updateObject(o.id, { name: $event })" (click)="$event.stopPropagation()"/>
                    <span class="chip muted">{{ o.type }}</span>
                    <span class="status-chip" [class]="o.status">●</span>
                  </header>
                  @if (assetForObject(o); as a) {
                    <div class="layer-thumb" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'">
                      @if (a.type === 'image') {
                        <button class="edit-img-btn" type="button" title="Edit image" (click)="$event.stopPropagation(); editObjectAsset(a, o.name)">
                          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3l3 3-9 9-3 1 1-3 8-10z" stroke-linejoin="round"/></svg>
                        </button>
                      }
                    </div>
                  } @else {
                    <div class="layer-thumb">
                      <div class="layer-thumb-empty">No asset yet</div>
                    </div>
                  }
                  <textarea
                    rows="2"
                    [ngModel]="o.prompt"
                    (ngModelChange)="updateObject(o.id, { prompt: $event })"
                    (click)="$event.stopPropagation()"
                    placeholder="prompt…"
                  ></textarea>
                  <div class="layer-actions" (click)="$event.stopPropagation()">
                    <button class="btn ghost sm" (click)="regenerate(o)" title="Regenerate">↻</button>
                    <button class="btn sm" (click)="openAssetPicker({ kind: 'object', objectId: o.id })" title="Replace">📁</button>
                    <button class="btn sm" (click)="toggleLock(o)" [title]="o.locked ? 'Unlock' : 'Lock'">{{ o.locked ? '🔓' : '🔒' }}</button>
                    <button class="btn ghost sm" (click)="duplicateObject(o)" title="Duplicate">📋</button>
                    <button class="btn danger sm" (click)="removeObject(o.id)" title="Remove">🗑</button>
                  </div>
                </article>
              }

              <button class="layer-add" type="button" (click)="addObject()">
                <span style="font-size: 1.6rem">+</span>
                <strong style="font-size: 0.92rem">Add visual layer</strong>
                <span class="muted" style="font-size: 0.72rem">character · prop · background · effect · subtitle</span>
              </button>
            </div>
          </section>

          <section class="card scene-settings">
            <div class="grid-2" style="gap: 1.2rem">
              <div>
                <div class="section-title">Cost estimate</div>
                <div class="cost-bar">
                  <div class="cost-segments">
                    <div class="cost-seg" style="background: var(--neon-violet); flex: 3" title="Video"></div>
                    <div class="cost-seg" style="background: var(--neon-cyan); flex: 1" title="Image"></div>
                    <div class="cost-seg" style="background: var(--neon-green); flex: 1.2" title="Audio"></div>
                  </div>
                  <div class="row" style="justify-content: space-between; margin-top: 0.4rem; font-size: 0.76rem">
                    <span class="muted">Estimated</span>
                    <span class="mono"><strong>{{ s.costEstimate ?? 0 }}</strong> credits</span>
                  </div>
                </div>
              </div>
              <div>
                <div class="section-title">Continuity</div>
                <div class="check-row">
                  <input type="checkbox" [ngModel]="s.continuity.usePreviousFinalFrame" (ngModelChange)="updateContinuity('usePreviousFinalFrame', $event)"/>
                  <div>
                    <div style="font-weight: 600; font-size: 0.86rem">Use previous final frame</div>
                    <div class="muted" style="font-size: 0.74rem">Enforces visual continuity</div>
                  </div>
                </div>
                <div class="check-row">
                  <input type="checkbox" [ngModel]="s.continuity.exportFinalFrameForNextScene" (ngModelChange)="updateContinuity('exportFinalFrameForNextScene', $event)"/>
                  <div>
                    <div style="font-weight: 600; font-size: 0.86rem">Export final frame</div>
                    <div class="muted" style="font-size: 0.74rem">For next scene's input</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="versions card">
            <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
              <div class="section-title" style="margin: 0">Version history</div>
              <button class="btn ghost sm" (click)="openCompare()" [disabled]="versions().length < 2">Compare</button>
            </div>
            <div class="versions-grid">
              @for (v of versions(); track v.id) {
                <div class="version">
                  <div class="version-thumb" [style.background-image]="'url(' + v.thumbnailUri + ')'"></div>
                  <div style="padding: 0.55rem 0.7rem">
                    <div class="row" style="justify-content: space-between">
                      <strong style="font-size: 0.85rem">v{{ v.versionNumber }}</strong>
                      <span class="chip" [class]="versionTone(v.approvalStatus)">{{ v.approvalStatus }}</span>
                    </div>
                    <div class="muted" style="font-size: 0.76rem; margin-top: 4px">{{ v.userComment }}</div>
                    <div class="row" style="justify-content: space-between; margin-top: 6px">
                      <span class="mono" style="font-size: 0.7rem">{{ v.cost }} cr</span>
                      <span class="muted" style="font-size: 0.7rem">{{ v.createdAt | date: 'short' }}</span>
                    </div>
                  </div>
                </div>
              }
              @if (versions().length === 0) {
                <div class="empty-version">No versions yet — generate the scene to start a history.</div>
              }
            </div>
          </section>

          <section class="row jobs-row">
            <div class="card flex-col" style="flex: 1">
              <div class="section-title">Active jobs</div>
              @for (j of activeJobs(); track j.id) {
                <div class="job-row">
                  <div class="row" style="gap: 0.4rem">
                    <strong style="font-size: 0.85rem">{{ j.model }}</strong>
                    <span class="muted" style="font-size: 0.78rem">{{ j.objectId }}</span>
                  </div>
                  <div class="job-progress"><div class="job-fill" [style.width.%]="j.progress"></div></div>
                  <span class="mono" style="font-size: 0.78rem">{{ j.progress | number: '1.0-0' }}%</span>
                </div>
              }
              @if (activeJobs().length === 0) {
                <p class="muted" style="font-size: 0.85rem">No jobs running.</p>
              }
            </div>
            <div class="card flex-col" style="flex: 1">
              <div class="section-title">Quality checks</div>
              <div class="quality-list">
                @for (q of qualityChecks(s); track q.label) {
                  <div class="quality" [class]="q.tone">
                    <span class="dot"></span>
                    <span>{{ q.label }}</span>
                    <span class="spacer"></span>
                    <span class="mono" style="font-size: 0.78rem">{{ q.value }}</span>
                  </div>
                }
              </div>
            </div>
          </section>
        </div>

        @if (assetPickerTarget(); as target) {
          <div class="modal-backdrop" (click)="closeAssetPicker()">
            <div class="modal" (click)="$event.stopPropagation()">
              <div class="row" style="justify-content: space-between; margin-bottom: 0.6rem">
                <strong style="font-family: var(--font-display); font-size: 1.05rem">Pick asset</strong>
                <button class="iconbtn" (click)="closeAssetPicker()">×</button>
              </div>
              <div class="picker-grid">
                @for (a of pickerAssets(); track a.id) {
                  <button class="picker-item" (click)="applyPickedAsset(a)">
                    <div class="picker-thumb" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'"></div>
                    <div class="picker-name">{{ a.name }}</div>
                    <div class="muted" style="font-size: 0.7rem">{{ a.type }}</div>
                  </button>
                }
                @if (pickerAssets().length === 0) {
                  <div class="empty-version">No assets in library — generate one from the Asset library page.</div>
                }
              </div>
            </div>
          </div>
        }

        @if (compareOpen()) {
          <div class="modal-backdrop" (click)="compareOpen.set(false)">
            <div class="modal wide" (click)="$event.stopPropagation()">
              <div class="row" style="justify-content: space-between; margin-bottom: 0.6rem">
                <strong style="font-family: var(--font-display); font-size: 1.05rem">Compare versions</strong>
                <button class="iconbtn" (click)="compareOpen.set(false)">×</button>
              </div>
              <div class="row" style="gap: 0.5rem; margin-bottom: 0.6rem">
                <select [ngModel]="compareLeftId()" (ngModelChange)="compareLeftId.set($event)">
                  @for (v of versions(); track v.id) {
                    <option [ngValue]="v.id">v{{ v.versionNumber }} · {{ v.userComment }}</option>
                  }
                </select>
                <span class="muted">vs</span>
                <select [ngModel]="compareRightId()" (ngModelChange)="compareRightId.set($event)">
                  @for (v of versions(); track v.id) {
                    <option [ngValue]="v.id">v{{ v.versionNumber }} · {{ v.userComment }}</option>
                  }
                </select>
              </div>
              <div class="compare-grid">
                @for (side of compareSides(); track side.id) {
                  <div class="compare-side">
                    <div class="compare-thumb" [style.background-image]="'url(' + side.thumbnailUri + ')'"></div>
                    <strong>v{{ side.versionNumber }}</strong>
                    <span class="chip" [class]="versionTone(side.approvalStatus)">{{ side.approvalStatus }}</span>
                    <p class="muted" style="font-size: 0.82rem">{{ side.userComment }}</p>
                    <span class="mono" style="font-size: 0.78rem">{{ side.cost }} credits</span>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        @if (confirmDelete()) {
          <div class="modal-backdrop" (click)="confirmDelete.set(false)">
            <div class="modal" (click)="$event.stopPropagation()">
              <strong style="font-family: var(--font-display); font-size: 1.05rem">Delete scene?</strong>
              <p class="muted" style="margin-top: 0.4rem">
                This will remove "{{ s.title }}" and all of its objects. This cannot be undone.
              </p>
              <div class="row" style="gap: 0.5rem; justify-content: flex-end; margin-top: 1rem">
                <button class="btn" (click)="confirmDelete.set(false)">Cancel</button>
                <button class="btn danger" (click)="deleteScene()">Delete scene</button>
              </div>
            </div>
          </div>
        }
      }
    } @else {
      <div class="loading">
        <span class="loader"></span>
        <span style="margin-left: 0.6rem">Loading scene…</span>
      </div>
    }
  `,
  styleUrl: './scene-workspace.component.scss',
})
export class SceneWorkspaceComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly scenesService = inject(ScenesService);
  private readonly projectsService = inject(ProjectsService);
  protected readonly assets = inject(AssetsService);
  protected readonly jobs = inject(JobsService);
  private readonly editorBridge = inject(ImageEditorBridgeService);
  private readonly audioBridge = inject(AudioEditorBridgeService);
  private readonly modelsSrv = inject(ModelsService);

  private modelsForCapability(cap: 'voice_clone' | 'music_generation' | 'audio_generation') {
    return this.modelsSrv.models().filter((m) => m.capability === cap);
  }

  protected readonly project = signal<CreativeContract | undefined>(undefined);
  protected readonly scene = signal<Scene | undefined>(undefined);
  protected readonly versions = signal<SceneVersion[]>([]);
  protected readonly selectedObjectId = signal<string | null>(null);
  protected readonly editingPrompt = signal(false);
  protected readonly promptDraft = signal('');
  protected readonly assetPickerTarget = signal<AssetPickerTarget | null>(null);
  protected readonly compareOpen = signal(false);
  protected readonly compareLeftId = signal<string | null>(null);
  protected readonly compareRightId = signal<string | null>(null);
  protected readonly confirmDelete = signal(false);
  protected readonly draftSaving = signal(false);

  protected readonly keyframeSlots: { which: 'startFrame' | 'endFrame'; label: string; icon: string }[] = [
    { which: 'startFrame', label: 'Start frame', icon: '◧' },
    { which: 'endFrame', label: 'End frame', icon: '◨' },
  ];

  protected readonly selectedObject = computed(() => {
    const id = this.selectedObjectId();
    return this.scene()?.objects.find((o) => o.id === id);
  });

  /** Objects that show up in the "Visual layers" panel. Audio types
   *  (music / sfx / voice) get dedicated panels and are filtered out here. */
  protected readonly visualObjects = computed(() => {
    return this.scene()?.objects.filter((o) => !AUDIO_OBJECT_TYPES.has(o.type)) ?? [];
  });

  protected readonly voiceModels = computed(() =>
    this.modelsForCapability('voice_clone'),
  );
  protected readonly musicModels = computed(() =>
    this.modelsForCapability('music_generation'),
  );

  /** True only when the backend has actually rendered this scene's video. */
  protected readonly hasRenderedVideo = computed(() => {
    const s = this.scene();
    return s?.review.status === 'completed' || s?.review.status === 'approved';
  });

  protected previewStateLabel(s: Scene): string {
    return {
      draft: 'Scene not prepared yet',
      prepared: 'Ready to generate',
      waiting_for_user: 'Needs your attention',
      generating: 'Rendering scene video',
      failed: 'Generation failed',
      completed: 'Generated',
      approved: 'Approved',
    }[s.review.status] ?? s.review.status;
  }

  protected previewStateHelp(s: Scene): string {
    return {
      draft: 'Edit the layers below — start frame, prompt, audio, narration — then click Generate scene.',
      prepared: 'Every layer is ready. Click Generate scene to render the video.',
      waiting_for_user: 'Resolve the flagged layer below, then re-generate.',
      generating: 'The backend is composing the video from the layers below. This usually takes 1–3 minutes.',
      failed: 'The render failed. Edit any layer and retry.',
      completed: 'The scene video is ready — approve it or edit a layer to re-render.',
      approved: 'This scene is locked and will be used in the final film stitch.',
    }[s.review.status] ?? '';
  }

  protected layerCount(s: Scene): number {
    // start + end + prompt + music + sfx + narration + visual layers
    return 6 + (s.objects.filter((o) => !AUDIO_OBJECT_TYPES.has(o.type)).length);
  }

  protected readonly previewImage = computed(() => {
    const s = this.scene();
    if (!s) return '';
    const startAsset = s.startFrame?.assetId ? this.assets.get(s.startFrame.assetId) : undefined;
    if (startAsset) return startAsset.thumbnail || startAsset.uri;
    if (s.thumbnailUrl) return s.thumbnailUrl;
    if (s.background.assetId) {
      const a = this.assets.get(s.background.assetId);
      if (a) return a.thumbnail || a.uri;
    }
    return 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200';
  });

  protected readonly overlayObjects = computed(() => {
    const s = this.scene();
    if (!s) return [];
    return s.objects.map((o, i) => ({
      ...o,
      x: 18 + (i * 14) % 70,
      y: 28 + (i * 18) % 50,
    }));
  });

  protected readonly compiledPrompt = computed(() => {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return '';
    return [
      `# Scene ${s.index + 1}: ${s.title}`,
      `Objective: ${s.objective}`,
      `Genre: ${p.creativeDirection.genre}; Mood: ${p.creativeDirection.mood.join(', ')}`,
      `Camera: ${s.camera.shotType}, ${s.camera.movement}, ${s.camera.lens}`,
      `Background: ${s.background.description}`,
      s.startFrame?.description ? `Start frame: ${s.startFrame.description}` : '',
      s.endFrame?.description ? `End frame: ${s.endFrame.description}` : '',
      ...s.characters.map((c) => `Character ${c.ref}: ${c.emotion} — ${c.action}`),
      ...s.objects.filter((o) => o.prompt).map((o) => `${o.type}/${o.name}: ${o.prompt}`),
      `Audio: ${s.audio.backgroundMusic.genre}, tempo ${s.audio.backgroundMusic.tempo}; SFX: ${s.audio.soundEffects.join(', ')}`,
      `Subtitles: ${s.subtitles.enabled ? s.subtitles.style : 'off'}`,
      `Negative: ${p.creativeDirection.negativeRules.join('; ')}`,
      `Duration: ${s.durationSec}s @ ${p.output.fps}fps, ${p.output.aspectRatio}`,
    ].filter(Boolean).join('\n');
  });

  protected readonly effectivePrompt = computed(() => {
    const s = this.scene();
    return s?.promptOverride ?? this.compiledPrompt();
  });

  protected readonly activeJobs = computed(() => {
    const s = this.scene();
    if (!s) return [];
    return this.jobs.jobs().filter((j) => j.sceneId === s.id);
  });

  protected readonly allScenesApproved = computed(() => {
    const p = this.project();
    return !!p && p.scenes.length > 0 && p.scenes.every((sc) => sc.review.status === 'approved');
  });

  protected readonly canGoNext = computed(() => {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return false;
    const hasNext = !!p.scenes.find((x) => x.index === s.index + 1);
    return hasNext && s.review.status === 'approved';
  });

  protected readonly pickerAssets = computed(() => {
    const target = this.assetPickerTarget();
    if (!target) return [];
    if (target.kind === 'startFrame' || target.kind === 'endFrame') {
      return this.assets.assets().filter((a) => a.type === 'image');
    }
    if (target.kind === 'backgroundMusic') {
      return this.assets.assets().filter((a) => a.type === 'music' || a.type === 'audio');
    }
    if (target.kind === 'narrationVoice') {
      return this.assets.assets().filter((a) => a.type === 'voice' || a.type === 'audio');
    }
    const obj = this.scene()?.objects.find((o) => o.id === target.objectId);
    if (!obj) return this.assets.assets();
    const allowedByType: Record<string, Asset['type'][]> = {
      character: ['image'],
      prop: ['image'],
      background: ['image'],
      effect: ['image', 'video'],
      subtitle: ['font'],
      music: ['music', 'audio'],
      sfx: ['audio'],
      voice: ['voice', 'audio'],
    };
    const allowed = allowedByType[obj.type];
    return allowed ? this.assets.assets().filter((a) => allowed.includes(a.type)) : this.assets.assets();
  });

  protected readonly compareSides = computed(() => {
    const list = this.versions();
    const left = list.find((v) => v.id === this.compareLeftId());
    const right = list.find((v) => v.id === this.compareRightId());
    return [left, right].filter((v): v is SceneVersion => !!v);
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const projectId = params.get('id');
      const sceneId = params.get('sceneId');
      if (!projectId || !sceneId) return;
      this.projectsService.get(projectId).subscribe((p) => this.project.set(p));
      this.scenesService.get(projectId, sceneId).subscribe((s) => {
        if (!s) { this.scene.set(s); return; }
        const prepared = this.autoPrepareScene(s);
        this.scene.set(prepared);
        if (prepared.objects.length > 0) this.selectedObjectId.set(prepared.objects[0].id);
        if (prepared !== s) {
          // Persist the auto-filled state so refresh keeps the same kit.
          this.scenesService.updateScene(projectId, prepared).subscribe();
        }
      });
      this.scenesService.versions(sceneId).subscribe((v) => {
        this.versions.set(v);
        if (v.length >= 2) {
          this.compareLeftId.set(v[0].id);
          this.compareRightId.set(v[1].id);
        } else if (v.length === 1) {
          this.compareLeftId.set(v[0].id);
          this.compareRightId.set(v[0].id);
        }
      });
    });
  }

  protected statusTone(s: string) {
    return { draft: 'muted', prepared: 'cyan', generating: 'amber', completed: 'green', approved: 'green', failed: 'rose', waiting_for_user: 'amber' }[s] ?? 'muted';
  }
  protected sceneStatusTone = this.statusTone;
  protected versionTone(s: string) {
    return { approved: 'green', rejected: 'rose', pending: 'amber' }[s] ?? 'muted';
  }
  protected iconFor(type: SceneObject['type']) {
    const map: Record<string, string> = {
      character: '👤',
      prop: '📦',
      background: '🖼',
      effect: '✨',
      subtitle: '🅰',
      music: '🎵',
      sfx: '🔊',
      voice: '🎙',
    };
    return `<span style="font-size: 1.05rem">${map[type] ?? '◇'}</span>`;
  }
  protected qualityChecks(s: Scene) {
    return [
      { label: 'Prompt completeness', value: s.objective ? 'Pass' : 'Missing objective', tone: s.objective ? 'green' : 'amber' },
      { label: 'Character drift risk', value: s.characters.length === 0 ? 'No chars' : 'Locked', tone: 'green' },
      { label: 'Audio sync', value: s.audio.backgroundMusic.genre ? 'Ready' : 'Skipped', tone: 'green' },
      { label: 'Safety / IP', value: 'No flags', tone: 'green' },
      { label: 'Duration', value: `${s.durationSec}s`, tone: 'green' },
      { label: 'Start frame', value: s.startFrame?.assetId ? 'Ready' : 'Missing', tone: s.startFrame?.assetId ? 'green' : 'amber' },
    ];
  }

  protected keyframeFor(s: Scene, which: 'startFrame' | 'endFrame'): SceneKeyframe | undefined {
    return s[which];
  }

  protected sampleVideoUri(s: Scene): string {
    return sampleVideoFor(s.index);
  }
  protected keyframeThumb(s: Scene, which: 'startFrame' | 'endFrame'): string {
    const kf = this.keyframeFor(s, which);
    if (kf?.assetId) {
      const a = this.assets.get(kf.assetId);
      if (a) return a.thumbnail || a.uri;
    }
    return '';
  }

  protected selectObject(id: string) { this.selectedObjectId.set(id); }
  protected toggleLock(o: SceneObject) {
    this.updateObject(o.id, { locked: !o.locked });
  }
  protected updateObject(id: string, patch: Partial<SceneObject>) {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return;
    const updatedObj = { ...s.objects.find((x) => x.id === id)!, ...patch };
    const updatedScene = { ...s, objects: s.objects.map((o) => (o.id === id ? updatedObj : o)) };
    this.scene.set(updatedScene);
    this.scenesService.updateObject(p.id, s.id, updatedObj).subscribe();
  }
  protected removeObject(id: string) {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return;
    const updatedScene = { ...s, objects: s.objects.filter((o) => o.id !== id) };
    this.scene.set(updatedScene);
    this.scenesService.removeObject(p.id, s.id, id).subscribe();
    this.selectedObjectId.set(updatedScene.objects[0]?.id ?? null);
  }
  protected duplicateObject(o: SceneObject) {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return;
    this.scenesService.duplicateObject(p.id, s.id, o.id).subscribe((updated) => {
      if (updated) {
        this.scene.set(updated);
        const newObj = updated.objects.find((x) => x.name === `${o.name} (copy)`);
        if (newObj) this.selectedObjectId.set(newObj.id);
      }
    });
  }
  protected addObject() {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return;
    const newObj: SceneObject = {
      id: `obj-${Date.now()}`,
      type: 'prop',
      name: 'New object',
      prompt: '',
      status: 'pending',
      locked: false,
    };
    const updatedScene = { ...s, objects: [...s.objects, newObj] };
    this.scene.set(updatedScene);
    this.scenesService.updateScene(p.id, updatedScene).subscribe();
    this.selectedObjectId.set(newObj.id);
  }
  protected regenerate(o: SceneObject) {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return;
    this.updateObject(o.id, { status: 'generating' });
    this.jobs.enqueue({
      projectId: p.id,
      sceneId: s.id,
      objectId: o.id,
      provider: p.models.image.provider,
      model: p.models.image.model,
      costEstimate: 0.4,
      outputAssetIds: [],
    }).subscribe();
    const prompt = o.prompt || `${o.type} ${o.name}, cinematic`;
    this.assets.generate({
      type: o.type === 'music' ? 'music' : o.type === 'sfx' ? 'audio' : o.type === 'voice' ? 'voice' : 'image',
      name: `${o.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`,
      prompt,
      provider: p.models.image.provider,
      model: p.models.image.model,
    }).subscribe((asset) => {
      this.updateObject(o.id, { status: 'ready', assetId: asset.id });
    });
  }
  protected askAiToImprove(o: SceneObject) {
    const p = this.project();
    if (!p || !o.prompt) {
      this.updateObject(o.id, {
        prompt: `${o.name}, cinematic ${p?.creativeDirection.genre ?? ''} style, ${p?.creativeDirection.mood.join(', ') ?? 'atmospheric'}, detailed`,
      });
      return;
    }
    const improved = `${o.prompt.replace(/\.+\s*$/, '')}, ${p.creativeDirection.mood.slice(0, 2).join(' and ') || 'atmospheric'}, sharp focus, ${p.creativeDirection.genre || 'cinematic'} mood, 35mm`;
    this.updateObject(o.id, { prompt: improved });
  }
  protected updateSceneField<K extends keyof Scene>(key: K, value: Scene[K]) {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return;
    const updated = { ...s, [key]: value };
    this.scene.set(updated);
    this.scenesService.updateScene(p.id, updated).subscribe();
  }
  protected updateContinuity<K extends keyof Scene['continuity']>(key: K, value: Scene['continuity'][K]) {
    const s = this.scene();
    if (!s) return;
    this.updateSceneField('continuity', { ...s.continuity, [key]: value });
  }

  protected updateBackgroundMusic(patch: Partial<Scene['audio']['backgroundMusic']>) {
    const s = this.scene();
    if (!s) return;
    const next: Scene['audio'] = {
      ...s.audio,
      backgroundMusic: { ...s.audio.backgroundMusic, ...patch },
    };
    this.updateSceneField('audio', next);
  }

  protected addSoundEffect(value: string) {
    const v = value.trim();
    if (!v) return;
    const s = this.scene();
    if (!s) return;
    if (s.audio.soundEffects.includes(v)) return;
    const next: Scene['audio'] = {
      ...s.audio,
      soundEffects: [...s.audio.soundEffects, v],
    };
    this.updateSceneField('audio', next);
  }

  protected removeSoundEffect(value: string) {
    const s = this.scene();
    if (!s) return;
    const next: Scene['audio'] = {
      ...s.audio,
      soundEffects: s.audio.soundEffects.filter((x) => x !== value),
    };
    this.updateSceneField('audio', next);
  }

  protected updateNarration(patch: Partial<Scene['narration']>) {
    const s = this.scene();
    if (!s) return;
    this.updateSceneField('narration', { ...s.narration, ...patch });
  }

  protected updateSubtitles(patch: Partial<Scene['subtitles']>) {
    const s = this.scene();
    if (!s) return;
    this.updateSceneField('subtitles', { ...s.subtitles, ...patch });
  }

  protected subtitleText(s: Scene): string {
    return s.subtitles.text ?? s.narration.text ?? '';
  }

  protected globalSubtitleFont(): string {
    const p = this.project();
    return p?.creativeDirection.subtitleStyle?.fontFamily || p?.creativeDirection.fonts.subtitle || 'Inter';
  }

  protected globalSubtitleColor(): string {
    return this.project()?.creativeDirection.subtitleStyle?.color || '#FFFFFF';
  }

  protected narrationVoiceLabel(s: Scene): string {
    const ref = s.narration.voiceRef;
    if (!ref) return '';
    const asset = this.assets.get(ref);
    if (asset) return `${asset.name} (asset)`;
    const model = this.modelsSrv.models().find((m) => m.id === ref);
    if (model) return `${model.provider} · ${model.name}`;
    return ref;
  }
  protected updateKeyframe(which: 'startFrame' | 'endFrame', patch: Partial<SceneKeyframe>) {
    const s = this.scene();
    if (!s) return;
    const current: SceneKeyframe = s[which] ?? { mode: 'generate', description: '' };
    this.updateSceneField(which, { ...current, ...patch });
  }
  protected generateKeyframe(which: 'startFrame' | 'endFrame') {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return;
    const kf = s[which] ?? { mode: 'generate', description: '' };
    const description = kf.description || (which === 'startFrame' ? `Opening shot of "${s.title}"` : `Closing shot of "${s.title}"`);
    this.assets.generate({
      type: 'image',
      name: `${s.id}-${which}-${Date.now()}.png`,
      prompt: `${description}, ${p.creativeDirection.genre}, ${p.creativeDirection.mood.join(', ')}`,
      provider: p.models.image.provider,
      model: p.models.image.model,
    }).subscribe((asset) => {
      this.updateKeyframe(which, { assetId: asset.id, description });
    });
  }
  /**
   * Stand-in for what the backend would do when the contract says
   * "scene needs to be prepared": fill every missing layer (start/end image,
   * music, narration text + voice, sound effects, visual-layer assets) with
   * mock assets from the library so the user lands on a scene with everything
   * already suggested. Returns the same scene reference when nothing was
   * missing — otherwise a new patched scene.
   */
  private autoPrepareScene(s: Scene): Scene {
    const imageAssets = this.assets.assets().filter((a) => a.type === 'image');
    const musicAssets = this.assets.assets().filter((a) => a.type === 'music' || a.type === 'audio');
    const voiceAssets = this.assets.assets().filter((a) => a.type === 'voice');
    if (imageAssets.length === 0) return s;

    const pickImage = (seed: number) => imageAssets[seed % imageAssets.length];
    let next = s;
    let touched = false;
    const seed = s.objects.length + s.title.length;

    // Start frame
    if (!next.startFrame?.assetId) {
      next = {
        ...next,
        startFrame: {
          mode: 'generate',
          description: next.startFrame?.description || `Opening shot of "${next.title}"`,
          prompt: next.startFrame?.prompt || next.objective,
          assetId: pickImage(seed).id,
        },
      };
      touched = true;
    }
    // End frame
    if (!next.endFrame?.assetId) {
      next = {
        ...next,
        endFrame: {
          mode: 'generate',
          description: next.endFrame?.description || `Closing shot of "${next.title}"`,
          prompt: next.endFrame?.prompt || next.objective,
          assetId: pickImage(seed + 1).id,
        },
      };
      touched = true;
    }

    // Background music asset
    if (!next.audio.backgroundMusic.assetId && musicAssets.length > 0) {
      next = {
        ...next,
        audio: {
          ...next.audio,
          backgroundMusic: {
            ...next.audio.backgroundMusic,
            assetId: musicAssets[seed % musicAssets.length].id,
            genre: next.audio.backgroundMusic.genre || 'cinematic ambient',
            tempo: next.audio.backgroundMusic.tempo || 'slow',
          },
        },
      };
      touched = true;
    }

    // Sound effects default
    if (next.audio.soundEffects.length === 0) {
      next = {
        ...next,
        audio: {
          ...next.audio,
          soundEffects: ['ambient room tone', 'subtle wind'],
        },
      };
      touched = true;
    }

    // Narration text + voice
    if (!next.narration.text.trim() || !next.narration.voiceRef) {
      next = {
        ...next,
        narration: {
          text: next.narration.text || `Voice-over for "${next.title}".`,
          voiceRef: next.narration.voiceRef || voiceAssets[0]?.id || '',
        },
      };
      touched = true;
    }

    // Visual-layer assets — every non-audio object gets a thumbnail + ready
    if (next.objects.some((o) => !AUDIO_OBJECT_TYPES.has(o.type) && (!o.assetId || o.status === 'pending'))) {
      next = {
        ...next,
        objects: next.objects.map((o, i) => {
          if (AUDIO_OBJECT_TYPES.has(o.type)) return o;
          if (o.assetId && o.status !== 'pending') return o;
          return {
            ...o,
            assetId: o.assetId || pickImage(seed + 2 + i).id,
            status: 'ready' as const,
          };
        }),
      };
      touched = true;
    }

    // Bump status to 'prepared' if it was still draft
    if (touched && next.review.status === 'draft') {
      next = { ...next, review: { ...next.review, status: 'prepared' } };
    }

    return touched ? next : s;
  }
  protected generateScene() {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return;
    this.jobs.enqueue({
      projectId: p.id,
      sceneId: s.id,
      provider: p.models.video.provider,
      model: p.models.video.model,
      costEstimate: s.costEstimate ?? 30,
      outputAssetIds: [],
    }).subscribe();
    this.updateSceneField('review', { ...s.review, status: 'generating' });
    setTimeout(() => {
      const cur = this.scene();
      if (cur) this.updateSceneField('review', { ...cur.review, status: 'completed' });
    }, 8000);
  }
  protected approveScene() {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return;
    this.scenesService.approve(p.id, s.id).subscribe((approved) => {
      if (approved) this.scene.set(approved);
      this.projectsService.get(p.id).subscribe((np) => np && this.project.set(np));
    });
  }
  protected goNext() {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return;
    const next = p.scenes.find((x) => x.index === s.index + 1);
    if (next) this.router.navigate(['/projects', p.id, 'scenes', next.id]);
  }

  protected startEditPrompt() {
    this.promptDraft.set(this.effectivePrompt());
    this.editingPrompt.set(true);
  }
  protected cancelEditPrompt() {
    this.editingPrompt.set(false);
    this.promptDraft.set('');
  }
  protected saveEditPrompt() {
    this.updateSceneField('promptOverride', this.promptDraft());
    this.editingPrompt.set(false);
  }
  protected resetPromptToCompiled() {
    this.updateSceneField('promptOverride', undefined);
    this.promptDraft.set(this.compiledPrompt());
  }
  protected regeneratePrompt() {
    this.updateSceneField('promptOverride', undefined);
  }

  protected openAssetPicker(target: AssetPickerTarget) {
    this.assetPickerTarget.set(target);
  }
  protected closeAssetPicker() {
    this.assetPickerTarget.set(null);
  }
  protected applyPickedAsset(a: Asset) {
    const target = this.assetPickerTarget();
    if (!target) return;
    if (target.kind === 'object') {
      this.updateObject(target.objectId, { assetId: a.id, status: 'ready' });
    } else if (target.kind === 'backgroundMusic') {
      this.updateBackgroundMusic({ assetId: a.id, mode: 'asset' });
    } else if (target.kind === 'narrationVoice') {
      this.updateNarration({ voiceRef: a.id });
    } else {
      this.updateKeyframe(target.kind, { assetId: a.id, description: a.prompt || a.name });
    }
    this.closeAssetPicker();
  }

  protected openCompare() {
    if (this.versions().length < 2) return;
    this.compareOpen.set(true);
  }

  protected confirmDeleteScene() {
    this.confirmDelete.set(true);
  }

  protected saveDraft() {
    const p = this.project();
    const s = this.scene();
    if (!p || !s || this.draftSaving()) return;
    this.draftSaving.set(true);
    const route = `/projects/${p.id}/scenes/${s.id}`;
    this.projectsService.saveDraft(p.id, route).subscribe({
      next: () => {
        this.draftSaving.set(false);
        this.router.navigate(['/drafts']);
      },
      error: () => this.draftSaving.set(false),
    });
  }
  protected deleteScene() {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return;
    this.scenesService.remove(p.id, s.id).subscribe((scenes) => {
      this.confirmDelete.set(false);
      if (scenes.length === 0) {
        this.router.navigate(['/projects', p.id]);
      } else {
        const target = scenes[Math.min(s.index, scenes.length - 1)];
        this.router.navigate(['/projects', p.id, 'scenes', target.id]);
      }
    });
  }

  protected assetForObject(o: SceneObject) {
    return o.assetId ? this.assets.get(o.assetId) : undefined;
  }

  protected editObjectAsset(a: Asset, objectName: string) {
    this.editorBridge.open({
      sourceUri: a.uri,
      contextLabel: `Scene object · ${objectName || a.name}`,
      onApply: (newUri) => {
        this.assets.update(a.id, { uri: newUri, thumbnail: newUri });
      },
    });
  }

  /** The voice asset attached to the narration, if voiceRef is an asset ID. */
  protected narrationAsset(s: Scene): Asset | undefined {
    const ref = s.narration?.voiceRef;
    if (!ref) return undefined;
    return this.assets.get(ref);
  }

  protected editMusic() {
    const s = this.scene();
    if (!s) return;
    const aid = s.audio.backgroundMusic.assetId;
    if (!aid) return;
    const asset = this.assets.get(aid);
    if (!asset) return;
    this.audioBridge.open({
      sourceUri: asset.uri,
      sourceName: asset.name,
      durationSec: asset.durationSec,
      contextLabel: `Scene "${s.title || 'untitled'}" · background music`,
      onApply: (newUri, dur) => {
        // Create a new audio asset for the edited version and attach it
        this.assets
          .generate({
            type: 'audio',
            name: `${asset.name.replace(/\.[a-z0-9]+$/i, '')}-edited.mp3`,
            prompt: '(edited from audio editor)',
            provider: 'audio-editor',
            model: 'mock-edit',
          })
          .subscribe((newAsset) => {
            // Patch the new asset's uri + duration to match the edit
            this.assets.update(newAsset.id, { uri: newUri, durationSec: dur ?? asset.durationSec });
            this.updateBackgroundMusic({ assetId: newAsset.id });
          });
      },
    });
  }

  protected editNarration() {
    const s = this.scene();
    if (!s) return;
    const asset = this.narrationAsset(s);
    if (!asset) return;
    this.audioBridge.open({
      sourceUri: asset.uri,
      sourceName: asset.name,
      durationSec: asset.durationSec,
      contextLabel: `Scene "${s.title || 'untitled'}" · narration`,
      onApply: (newUri, dur) => {
        this.assets
          .generate({
            type: 'audio',
            name: `${asset.name.replace(/\.[a-z0-9]+$/i, '')}-edited.mp3`,
            prompt: '(narration edit)',
            provider: 'audio-editor',
            model: 'mock-edit',
          })
          .subscribe((newAsset) => {
            this.assets.update(newAsset.id, { uri: newUri, durationSec: dur ?? asset.durationSec });
            this.updateNarration({ voiceRef: newAsset.id });
          });
      },
    });
  }

  protected editKeyframe(s: Scene, which: 'startFrame' | 'endFrame', label: string) {
    const kf = this.keyframeFor(s, which);
    const asset = kf?.assetId ? this.assets.get(kf.assetId) : undefined;
    if (!asset) return;
    this.editorBridge.open({
      sourceUri: asset.uri,
      contextLabel: `Scene "${s.title || 'untitled'}" · ${label}`,
      onApply: (newUri) => {
        this.assets.update(asset.id, { uri: newUri, thumbnail: newUri });
      },
    });
  }
}
