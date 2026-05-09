import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ScenesService } from '../../core/services/scenes.service';
import { ProjectsService } from '../../core/services/projects.service';
import { AssetsService } from '../../core/services/assets.service';
import { JobsService } from '../../core/services/jobs.service';
import { CreativeContract, Scene, SceneObject, SceneVersion } from '../../core/models/contract.model';

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
              </div>
              <p class="muted" style="margin-top: 6px; font-size: 0.85rem">{{ s.objective }}</p>
            </div>
            <div class="row" style="flex-wrap: wrap; gap: 0.4rem">
              <button class="btn ghost sm">⚡ Prepare scene</button>
              <button class="btn primary sm" (click)="generateScene()">▶ Generate scene</button>
              <button class="btn cool sm" (click)="approveScene()">✓ Approve</button>
              <button class="btn sm" (click)="goNext()">Next scene →</button>
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

              <div class="prompt-panel">
                <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
                  <div class="section-title" style="margin: 0">Compiled scene prompt</div>
                  <div class="row" style="gap: 0.3rem">
                    <button class="btn sm">Edit raw</button>
                    <button class="btn primary sm">↻ Regenerate prompt</button>
                  </div>
                </div>
                <div class="prompt-text mono">{{ compiledPrompt() }}</div>
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
                    <span class="object-icon" [innerHTML]="iconFor(o.type)"></span>
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
              </div>
            </aside>

            <aside class="inspector card">
              @if (selectedObject(); as obj) {
                <div class="row" style="justify-content: space-between; margin-bottom: 0.5rem">
                  <div class="section-title" style="margin: 0">Inspector</div>
                  <span class="chip muted">{{ obj.type }}</span>
                </div>
                <label class="field">Name</label>
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
                  </div>
                }

                <div class="action-grid">
                  <button class="action" (click)="regenerate(obj)">
                    <span class="action-icon">↻</span><span>Regenerate</span>
                  </button>
                  <button class="action">
                    <span class="action-icon">🪄</span><span>Ask AI to improve</span>
                  </button>
                  <button class="action">
                    <span class="action-icon">📁</span><span>Replace from assets</span>
                  </button>
                  <button class="action" (click)="toggleLock(obj)">
                    <span class="action-icon">{{ obj.locked ? '🔓' : '🔒' }}</span>
                    <span>{{ obj.locked ? 'Unlock' : 'Lock' }}</span>
                  </button>
                  <button class="action">
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
              <button class="btn ghost sm">Compare</button>
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

  protected readonly selectedObject = computed(() => {
    const id = this.selectedObjectId();
    return this.scene()?.objects.find((o) => o.id === id);
  });

  protected readonly previewImage = computed(() => {
    const s = this.scene();
    if (!s) return '';
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
      ...s.characters.map((c) => `Character ${c.ref}: ${c.emotion} — ${c.action}`),
      ...s.objects.filter((o) => o.prompt).map((o) => `${o.type}/${o.name}: ${o.prompt}`),
      `Audio: ${s.audio.backgroundMusic.genre}, tempo ${s.audio.backgroundMusic.tempo}; SFX: ${s.audio.soundEffects.join(', ')}`,
      `Subtitles: ${s.subtitles.enabled ? s.subtitles.style : 'off'}`,
      `Negative: ${p.creativeDirection.negativeRules.join('; ')}`,
      `Duration: ${s.durationSec}s @ ${p.output.fps}fps, ${p.output.aspectRatio}`,
    ].join('\n');
  });

  protected readonly activeJobs = computed(() => {
    const s = this.scene();
    if (!s) return [];
    return this.jobs.jobs().filter((j) => j.sceneId === s.id);
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
      this.scenesService.versions(sceneId).subscribe((v) => this.versions.set(v));
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
    ];
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
    setTimeout(() => this.updateObject(o.id, { status: 'ready' }), 5000);
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
    });
  }
  protected goNext() {
    const p = this.project();
    const s = this.scene();
    if (!p || !s) return;
    const next = p.scenes.find((x) => x.index === s.index + 1);
    if (next) this.router.navigate(['/projects', p.id, 'scenes', next.id]);
  }

  protected assetForObject(o: SceneObject) {
    return o.assetId ? this.assets.get(o.assetId) : undefined;
  }
}
