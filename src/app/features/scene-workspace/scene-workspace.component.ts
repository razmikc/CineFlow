import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ScenesService } from '../../core/services/scenes.service';
import { ProjectsService } from '../../core/services/projects.service';
import { AssetsService } from '../../core/services/assets.service';
import { JobsService } from '../../core/services/jobs.service';
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
  | { kind: 'endFrame' };

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
              <button class="btn ghost sm" (click)="prepareScene()" [disabled]="isPreparing()">
                @if (isPreparing()) { <span class="loader"></span> Preparing… }
                @else { ⚡ Prepare scene }
              </button>
              <button class="btn primary sm" (click)="generateScene()" [disabled]="s.review.status === 'generating'">
                ▶ Generate scene
              </button>
              <button class="btn cool sm" (click)="approveScene()"
                [disabled]="s.review.status === 'approved'">
                ✓ {{ s.review.status === 'approved' ? 'Approved' : 'Approve' }}
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

          <div class="ws-grid">
            <section class="preview card">
              <div class="preview-stage" [style.background-image]="'url(' + previewImage() + ')'">
                <div class="overlay-grid">
                  @for (o of overlayObjects(); track o.id) {
                    <button class="overlay-pin" [class.selected]="selectedObjectId() === o.id"
                      [style.left.%]="o.x" [style.top.%]="o.y"
                      (click)="selectObject(o.id)">
                      <span class="pin-dot"></span>
                      <span class="pin-label">{{ o.name }}</span>
                    </button>
                  }
                </div>
                <div class="preview-meta">
                  <span class="chip muted">{{ p.output.aspectRatio }}</span>
                  <span class="chip muted">{{ p.output.resolution }}</span>
                  <span class="chip muted">{{ s.durationSec }}s</span>
                  <span class="chip cyan">{{ s.camera.shotType }}</span>
                  <span class="chip cyan">{{ s.camera.movement }}</span>
                </div>
                <div class="preview-controls">
                  <button class="iconbtn">⏮</button>
                  <button class="iconbtn play-btn">▶</button>
                  <button class="iconbtn">⏭</button>
                  <div class="timeline">
                    <div class="timeline-fill" style="width: 35%"></div>
                  </div>
                  <span class="mono" style="font-size: 0.78rem">0:02 / 0:0{{ s.durationSec }}</span>
                </div>
              </div>

              <div class="keyframes-row">
                @for (kf of keyframeSlots; track kf.which) {
                  <div class="keyframe">
                    <div class="kf-thumb" [style.background-image]="'url(' + keyframeThumb(s, kf.which) + ')'">
                      <span class="kf-icon">{{ kf.icon }}</span>
                      @if (keyframeFor(s, kf.which); as data) {
                        @if (data.locked) { <span class="kf-lock">🔒</span> }
                      }
                    </div>
                    <div class="kf-body">
                      <strong style="font-size: 0.82rem">{{ kf.label }}</strong>
                      <input class="kf-desc" [ngModel]="keyframeFor(s, kf.which)?.description ?? ''"
                        (ngModelChange)="updateKeyframe(kf.which, { description: $event })"
                        placeholder="describe this keyframe…"/>
                      <div class="row" style="gap: 0.3rem; margin-top: 0.3rem; flex-wrap: wrap">
                        <button class="btn ghost sm" (click)="generateKeyframe(kf.which)">✨ Generate</button>
                        <button class="btn sm" (click)="openAssetPicker({ kind: kf.which })">📁 Replace</button>
                        <button class="btn sm" (click)="updateKeyframe(kf.which, { locked: !keyframeFor(s, kf.which)?.locked })">
                          {{ keyframeFor(s, kf.which)?.locked ? '🔓 Unlock' : '🔒 Lock' }}
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <div class="prompt-panel">
                <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
                  <div class="section-title" style="margin: 0">
                    Compiled scene prompt
                    @if (s.promptOverride) { <span class="chip amber sm-chip">edited</span> }
                  </div>
                  <div class="row" style="gap: 0.3rem">
                    @if (!editingPrompt()) {
                      <button class="btn sm" (click)="startEditPrompt()">✏️ Edit raw</button>
                      <button class="btn primary sm" (click)="regeneratePrompt()">↻ Regenerate prompt</button>
                    } @else {
                      <button class="btn sm" (click)="cancelEditPrompt()">Cancel</button>
                      <button class="btn primary sm" (click)="saveEditPrompt()">Save</button>
                    }
                  </div>
                </div>
                @if (!editingPrompt()) {
                  <div class="prompt-text mono">{{ effectivePrompt() }}</div>
                } @else {
                  <textarea class="prompt-edit mono" rows="12"
                    [ngModel]="promptDraft()" (ngModelChange)="promptDraft.set($event)"></textarea>
                  @if (s.promptOverride) {
                    <button class="btn ghost sm" (click)="resetPromptToCompiled()" style="margin-top: 0.4rem">
                      Reset to compiled
                    </button>
                  }
                }
              </div>
            </section>

            <aside class="objects-panel card">
              <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
                <div class="section-title" style="margin: 0">Objects ({{ s.objects.length }})</div>
                <button class="btn ghost sm" (click)="addObject()">+ Add</button>
              </div>
              <div class="objects-list">
                @for (o of s.objects; track o.id) {
                  <button class="object-row" [class.selected]="selectedObjectId() === o.id"
                    (click)="selectObject(o.id)">
                    @if (assetForObject(o); as a) {
                      <span class="object-thumb" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'"></span>
                    } @else {
                      <span class="object-icon" [innerHTML]="iconFor(o.type)"></span>
                    }
                    <div style="flex: 1; min-width: 0; text-align: left">
                      <div class="row" style="gap: 0.4rem">
                        <strong style="font-size: 0.86rem">{{ o.name }}</strong>
                        @if (o.locked) { <span class="chip green sm-chip">🔒</span> }
                      </div>
                      <div class="muted" style="font-size: 0.74rem; margin-top: 2px">{{ o.type }}</div>
                    </div>
                    <span class="status-chip" [class]="o.status">●</span>
                  </button>
                }
                @if (s.objects.length === 0) {
                  <div class="empty-objects">
                    <p class="muted" style="font-size: 0.82rem">No objects yet. Add a character, prop, or sound.</p>
                  </div>
                }
              </div>
            </aside>

            <aside class="inspector card">
              @if (selectedObject(); as obj) {
                <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
                  <div class="section-title" style="margin: 0">Inspector</div>
                  <span class="chip muted">{{ obj.type }}</span>
                </div>
                <label class="field">Type</label>
                <select [ngModel]="obj.type" (ngModelChange)="updateObject(obj.id, { type: $event })">
                  <option value="character">character</option>
                  <option value="prop">prop</option>
                  <option value="background">background</option>
                  <option value="effect">effect</option>
                  <option value="subtitle">subtitle</option>
                  <option value="music">music</option>
                  <option value="sfx">sfx</option>
                  <option value="voice">voice</option>
                </select>

                <label class="field" style="margin-top: 0.7rem">Name</label>
                <input [ngModel]="obj.name" (ngModelChange)="updateObject(obj.id, { name: $event })"/>

                <label class="field" style="margin-top: 0.7rem">Description</label>
                <textarea rows="2" [ngModel]="obj.description" (ngModelChange)="updateObject(obj.id, { description: $event })"></textarea>

                <label class="field" style="margin-top: 0.7rem">Prompt</label>
                <textarea rows="3" [ngModel]="obj.prompt" (ngModelChange)="updateObject(obj.id, { prompt: $event })"></textarea>

                @if (assetForObject(obj); as a) {
                  <div class="row" style="margin-top: 0.7rem; gap: 0.5rem">
                    <div class="asset-thumb" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'"></div>
                    <div style="flex: 1; min-width: 0">
                      <div style="font-size: 0.85rem; font-weight: 600">{{ a.name }}</div>
                      <div class="muted" style="font-size: 0.74rem">{{ a.provider }} · {{ a.model }}</div>
                    </div>
                    <button class="iconbtn sm" (click)="updateObject(obj.id, { assetId: undefined })" title="Detach asset">×</button>
                  </div>
                }

                <div class="action-grid">
                  <button class="action" (click)="regenerate(obj)">
                    <span class="action-icon">↻</span><span>Regenerate</span>
                  </button>
                  <button class="action" (click)="askAiToImprove(obj)">
                    <span class="action-icon">🪄</span><span>Ask AI to improve</span>
                  </button>
                  <button class="action" (click)="openAssetPicker({ kind: 'object', objectId: obj.id })">
                    <span class="action-icon">📁</span><span>Replace from assets</span>
                  </button>
                  <button class="action" (click)="toggleLock(obj)">
                    <span class="action-icon">{{ obj.locked ? '🔓' : '🔒' }}</span>
                    <span>{{ obj.locked ? 'Unlock' : 'Lock' }}</span>
                  </button>
                  <button class="action" (click)="duplicateObject(obj)">
                    <span class="action-icon">📋</span><span>Duplicate</span>
                  </button>
                  <button class="action danger" (click)="removeObject(obj.id)">
                    <span class="action-icon">🗑</span><span>Remove</span>
                  </button>
                </div>
              } @else {
                <div class="empty-inspector">
                  <div style="font-size: 1.6rem">🎯</div>
                  <div style="font-family: var(--font-display); font-weight: 600">Select an object</div>
                  <p class="muted" style="font-size: 0.82rem">Click any object on the preview or in the list to edit it.</p>
                </div>
              }

              <div class="divider"></div>

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

              <div class="divider"></div>
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
            </aside>
          </div>

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
  protected readonly isPreparing = signal(false);

  protected readonly keyframeSlots: { which: 'startFrame' | 'endFrame'; label: string; icon: string }[] = [
    { which: 'startFrame', label: 'Start frame', icon: '◧' },
    { which: 'endFrame', label: 'End frame', icon: '◨' },
  ];

  protected readonly selectedObject = computed(() => {
    const id = this.selectedObjectId();
    return this.scene()?.objects.find((o) => o.id === id);
  });

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
        this.scene.set(s);
        if (s && s.objects.length > 0) this.selectedObjectId.set(s.objects[0].id);
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
  protected prepareScene() {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return;
    this.isPreparing.set(true);
    this.updateSceneField('review', { ...s.review, status: 'prepared' });
    this.jobs.enqueue({
      projectId: p.id,
      sceneId: s.id,
      provider: p.models.image.provider,
      model: p.models.image.model,
      costEstimate: 2,
      outputAssetIds: [],
    }).subscribe();
    if (!s.startFrame?.assetId) this.generateKeyframe('startFrame');
    setTimeout(() => this.isPreparing.set(false), 1500);
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
}
