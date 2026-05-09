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
import { switchMap } from 'rxjs/operators';
import { ProjectsService } from '../../core/services/projects.service';
import { AssetsService } from '../../core/services/assets.service';
import { ScenesService } from '../../core/services/scenes.service';
import { ModelsService } from '../../core/services/models.service';
import { ContractExportService } from '../../core/services/contract-export.service';
import {
  AspectRatio,
  Character,
  CharacterVoice,
  CreativeContract,
  ProjectGoal,
  Resolution,
  Scene,
} from '../../core/models/contract.model';

type StepKey = 'goal' | 'script' | 'style' | 'characters' | 'assets' | 'scenes' | 'review';

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
            @for (s of steps; track s.key; let i = $index) {
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
                      (click)="updateField('goal', g.key)"
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
              }

              @case ('characters') {
                <div class="row" style="justify-content: space-between; align-items: flex-start">
                  <div>
                    <h2>Characters & avatars</h2>
                    <p class="muted">Define reusable characters once — name, look, wardrobe, voice. The continuity lock keeps them consistent across every scene.</p>
                  </div>
                  <button class="btn primary" (click)="addAndEditCharacter()">+ Add character</button>
                </div>

                <div class="char-layout">
                  <aside class="char-list">
                    @if (p.characters.length === 0) {
                      <div class="empty-state" style="padding: 1.4rem; text-align: center">
                        <div class="empty-art" style="font-size: 1.8rem">👤</div>
                        <p class="muted" style="font-size: 0.85rem">No characters yet</p>
                        <button class="btn primary sm" (click)="addAndEditCharacter()">+ Add first character</button>
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
                        <p class="muted" style="max-width: 280px">Pick a character from the list, or add a new one to start building your cast.</p>
                        <button class="btn primary" (click)="addAndEditCharacter()" style="margin-top: 0.8rem">+ Add character</button>
                      </div>
                    }
                  </section>
                </div>
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
                <div class="row" style="justify-content: space-between">
                  <div>
                    <h2>Scenes</h2>
                    <p class="muted">Plan and order your scenes. Each scene is a fully-typed block in the contract.</p>
                  </div>
                  <button class="btn primary sm" (click)="addScene()">+ Add scene</button>
                </div>
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
            }

            <div class="step-footer">
              <button class="btn ghost" (click)="prev()" [disabled]="!hasPrev()">← Back</button>
              <span class="muted">Step {{ stepIndex() + 1 }} / {{ steps.length }}</span>
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
  styleUrl: './wizard.component.scss',
})
export class WizardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projects = inject(ProjectsService);
  protected readonly assets = inject(AssetsService);
  private readonly scenes = inject(ScenesService);
  protected readonly modelsService = inject(ModelsService);
  private readonly exportSvc = inject(ContractExportService);

  protected readonly active = signal<StepKey>('goal');
  protected readonly previewOpen = signal(true);
  protected readonly format = signal<'yaml' | 'json'>('yaml');
  protected readonly draftScript = signal('');

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

  protected readonly steps: { key: StepKey; label: string; sub: string }[] = [
    { key: 'goal', label: 'Goal', sub: 'Pick the kind of video' },
    { key: 'script', label: 'Script & structure', sub: 'LLM, duration, pacing' },
    { key: 'style', label: 'Global style', sub: 'Mood, palette, fonts' },
    { key: 'characters', label: 'Characters', sub: 'Reusable avatars & voices' },
    { key: 'assets', label: 'Assets', sub: 'Reference materials' },
    { key: 'scenes', label: 'Scenes', sub: 'Plan & order' },
    { key: 'review', label: 'Review & generate', sub: 'YAML / JSON' },
  ];

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

  protected stepIndex() { return this.steps.findIndex((s) => s.key === this.active()); }
  protected hasPrev() { return this.stepIndex() > 0; }
  protected setStep(s: StepKey) { this.active.set(s); }
  protected next() {
    const i = this.stepIndex();
    if (i < this.steps.length - 1) this.active.set(this.steps[i + 1].key);
  }
  protected prev() {
    const i = this.stepIndex();
    if (i > 0) this.active.set(this.steps[i - 1].key);
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
