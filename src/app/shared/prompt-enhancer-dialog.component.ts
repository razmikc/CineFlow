import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  KeywordSection,
  PromptMode,
  PromptTemplate,
  keywordSectionsFor,
  templatesFor,
} from '../core/data/prompt-keywords';

type Tab = 'templates' | 'keywords';

@Component({
  selector: 'app-prompt-enhancer-dialog',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <div class="overlay" (click)="onClose()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <header class="head">
            <div>
              <div class="eyebrow">{{ modeLabel() }} · Prompt enhancer</div>
              <h2>{{ tab() === 'templates' ? 'Pick a starter template' : 'Pick keywords to add' }}</h2>
              <p class="muted">
                @if (tab() === 'templates') {
                  Drop a ready-made multi-section prompt into the textarea. Each line is editable — start here and refine with the Keywords tab.
                } @else {
                  Click chips to append them. Tap a green chip to remove. Picked list at the bottom shows what'll be inserted.
                }
              </p>
            </div>
            <button class="icon-close" type="button" (click)="onClose()" title="Close">×</button>
          </header>

          <div class="tab-bar">
            <button class="tab-btn" type="button" [class.active]="tab() === 'templates'" (click)="tab.set('templates')">
              📋 Templates
            </button>
            <button class="tab-btn" type="button" [class.active]="tab() === 'keywords'" (click)="tab.set('keywords')">
              🏷 Keywords
            </button>
          </div>

          @if (tab() === 'templates') {
            <div class="body">
              <div class="tmpl-grid">
                @for (t of templates(); track t.name) {
                  <button class="tmpl-card" type="button" (click)="onUseTemplate(t)">
                    <div class="tmpl-name">{{ t.name }}</div>
                    <div class="tmpl-desc">{{ t.desc }}</div>
                    <pre class="tmpl-prev">{{ t.prompt }}</pre>
                    <span class="tmpl-cta">Use this →</span>
                  </button>
                }
              </div>
            </div>
            <footer class="foot">
              <span class="muted" style="font-size: 0.74rem">
                Picking a template <strong>replaces</strong> the prompt textarea. Switch to the Keywords tab to add chips on top.
              </span>
              <div class="row">
                <button class="btn sm" type="button" (click)="onClose()">Close</button>
              </div>
            </footer>
          } @else {
          <div class="filter-row">
            <input
              type="search"
              class="filter-input"
              placeholder="Filter chips — e.g. golden, dolly, neon"
              [ngModel]="filter()"
              (ngModelChange)="filter.set($event)"
            />
            <span class="muted" style="font-size: 0.74rem">
              {{ visibleSections().length }} / {{ sections().length }} sections
            </span>
          </div>

          <div class="kw-split">
            <nav class="section-nav-v">
              @for (s of sections(); track s.key) {
                <a
                  class="section-link"
                  [class.muted]="!sectionMatchesFilter(s)"
                  (click)="scrollTo(s.key)"
                >
                  <span class="section-link-emoji">{{ s.emoji }}</span>
                  <span class="section-link-label">{{ s.key }}</span>
                  @if (pickedCountFor(s) > 0) {
                    <span class="section-link-count">{{ pickedCountFor(s) }}</span>
                  }
                </a>
              }
            </nav>

            <div class="body" #body>
              @for (s of visibleSections(); track s.key) {
                <section class="sec" [attr.id]="'sec-' + s.key">
                  <header>
                    <span class="sec-emoji">{{ s.emoji }}</span>
                    <strong>{{ s.key }}</strong>
                    <span class="muted hint">{{ s.hint }}</span>
                  </header>
                  <div class="chip-grid">
                    @for (c of s.chips; track c) {
                      @if (matchesFilter(c)) {
                        <button
                          type="button"
                          class="kw-chip"
                          [class.picked]="isPicked(c)"
                          (click)="toggle(c)"
                        >
                          {{ c }}
                        </button>
                      }
                    }
                  </div>
                </section>
              }
              @if (visibleSections().length === 0) {
                <div class="empty">No chip matches "{{ filter() }}".</div>
              }
            </div>
          </div>

          <footer class="foot">
            <div class="picked-list">
              <span class="muted" style="font-size: 0.74rem">
                Picked ({{ picked().length }}):
              </span>
              @if (picked().length === 0) {
                <span class="muted" style="font-size: 0.78rem; font-style: italic">nothing yet</span>
              } @else {
                @for (p of picked(); track p) {
                  <span class="picked-chip" (click)="toggle(p)" title="Remove">{{ p }} ×</span>
                }
              }
            </div>
            <div class="row">
              <button class="btn ghost sm" type="button" (click)="clearAll()" [disabled]="picked().length === 0">
                Clear
              </button>
              <button class="btn sm" type="button" (click)="onClose()">Cancel</button>
              <button
                class="btn primary sm"
                type="button"
                (click)="onInsert()"
                [disabled]="picked().length === 0"
              >
                ✓ Insert {{ picked().length || '' }}
              </button>
            </div>
          </footer>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host { display: contents; }
      .overlay { position: fixed; inset: 0; background: rgba(2, 4, 14, 0.7); backdrop-filter: blur(6px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
      .dialog { width: min(960px, 100%); max-height: 92vh; display: flex; flex-direction: column; background: rgba(10, 13, 35, 0.96); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.45); }
      .head { padding: 1.1rem 1.3rem; display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; border-bottom: 1px solid var(--border); }
      .head h2 { margin: 0.3rem 0 0.2rem; font-family: var(--font-display); font-size: 1.1rem; }
      .head .muted { margin: 0; font-size: 0.78rem; max-width: 64ch; line-height: 1.45; }
      .eyebrow { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--text-mute); font-weight: 700; }
      .icon-close { width: 30px; height: 30px; border-radius: 8px; background: transparent; border: 1px solid var(--border); color: var(--text-2); font-size: 1.1rem; cursor: pointer; }
      .icon-close:hover { color: var(--text-1); border-color: rgba(139, 92, 246, 0.55); }

      .tab-bar { display: flex; gap: 0.3rem; padding: 0.55rem 1.1rem 0; border-bottom: 1px solid var(--border); background: rgba(10,13,35,0.55); }
      .tab-btn { background: transparent; border: 1px solid transparent; border-bottom: none; color: var(--text-2); padding: 0.42rem 0.9rem; border-radius: 10px 10px 0 0; cursor: pointer; font-size: 0.82rem; position: relative; top: 1px; }
      .tab-btn:hover { color: var(--text-1); }
      .tab-btn.active { background: rgba(10,13,35,0.96); border-color: var(--border); color: var(--text-1); }

      .tmpl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.7rem; padding: 0.7rem 0; }
      .tmpl-card { text-align: left; background: rgba(10, 13, 35, 0.55); border: 1px solid var(--border); border-radius: var(--r-md); padding: 0.85rem 0.95rem 0.95rem; cursor: pointer; display: flex; flex-direction: column; gap: 0.35rem; color: var(--text-1); transition: border-color 0.15s, transform 0.15s; }
      .tmpl-card:hover { border-color: rgba(139, 92, 246, 0.6); transform: translateY(-1px); }
      .tmpl-name { font-family: var(--font-display); font-size: 0.95rem; }
      .tmpl-desc { font-size: 0.76rem; color: var(--text-2); font-style: italic; }
      .tmpl-prev { margin: 0.3rem 0 0; padding: 0.4rem 0.55rem; background: rgba(0,0,0,0.35); border-radius: 6px; font-family: var(--font-mono, monospace); font-size: 0.7rem; line-height: 1.35; color: var(--text-2); white-space: pre-wrap; max-height: 130px; overflow: hidden; mask-image: linear-gradient(180deg, #000 70%, transparent); -webkit-mask-image: linear-gradient(180deg, #000 70%, transparent); }
      .tmpl-cta { margin-top: auto; font-size: 0.78rem; color: var(--neon-cyan, #22d3ee); font-weight: 600; }

      .filter-row { padding: 0.6rem 1.1rem; display: flex; gap: 0.6rem; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); background: rgba(10,13,35,0.6); flex-wrap: wrap; }
      .filter-input { flex: 1 1 260px; max-width: 360px; background: rgba(10, 13, 35, 0.55); border: 1px solid var(--border); border-radius: 999px; padding: 0.38rem 0.85rem; font-size: 0.85rem; color: var(--text-1); }
      .filter-input:focus { outline: none; border-color: rgba(139, 92, 246, 0.55); }

      .kw-split { display: grid; grid-template-columns: 200px 1fr; flex: 1; min-height: 0; }
      .section-nav-v { border-right: 1px solid var(--border); background: rgba(10,13,35,0.5); padding: 0.6rem 0.45rem; overflow-y: auto; }
      .section-link { display: flex; align-items: center; gap: 0.45rem; padding: 0.32rem 0.55rem; border-radius: 8px; color: var(--text-2); font-size: 0.78rem; cursor: pointer; user-select: none; }
      .section-link:hover { background: rgba(139, 92, 246, 0.1); color: var(--text-1); }
      .section-link.muted { opacity: 0.45; }
      .section-link-emoji { font-size: 0.95rem; width: 1.1rem; text-align: center; }
      .section-link-label { flex: 1; }
      .section-link-count { background: rgba(52, 211, 153, 0.18); border: 1px solid rgba(52, 211, 153, 0.45); color: #6ee7b7; padding: 0 6px; border-radius: 999px; font-size: 0.68rem; line-height: 1.5; font-family: var(--font-mono, monospace); }

      .body { padding: 0.6rem 1.1rem 0.8rem; overflow-y: auto; min-height: 0; }
      .sec { padding: 0.7rem 0 0.4rem; border-bottom: 1px dashed rgba(255,255,255,0.06); }
      .sec:last-child { border-bottom: none; }
      .sec > header { display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.4rem; }
      .sec-emoji { font-size: 1.05rem; }
      .sec > header strong { font-family: var(--font-display); font-size: 0.9rem; }
      .sec .hint { font-size: 0.74rem; color: var(--text-2); }
      .chip-grid { display: flex; flex-wrap: wrap; gap: 0.3rem; }
      .kw-chip { background: transparent; border: 1px solid var(--border); border-radius: 999px; padding: 0.32rem 0.78rem; color: var(--text-1); cursor: pointer; font-size: 0.8rem; transition: border-color 0.12s, background 0.12s, color 0.12s; }
      .kw-chip:hover { border-color: rgba(139, 92, 246, 0.55); background: rgba(139, 92, 246, 0.08); }
      .kw-chip.picked { background: rgba(52, 211, 153, 0.18); border-color: rgba(52, 211, 153, 0.5); color: #6ee7b7; }

      .empty { padding: 2rem; text-align: center; color: var(--text-2); font-size: 0.85rem; }

      .foot { padding: 0.7rem 1.1rem 0.9rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; gap: 0.6rem; align-items: center; flex-wrap: wrap; background: rgba(10,13,35,0.7); }
      .foot .row { display: flex; gap: 0.4rem; }
      .picked-list { display: flex; flex-wrap: wrap; gap: 0.3rem; align-items: center; max-width: 60%; }
      .picked-chip { background: rgba(52, 211, 153, 0.15); border: 1px solid rgba(52, 211, 153, 0.45); color: #6ee7b7; padding: 0.2rem 0.55rem; border-radius: 999px; font-size: 0.74rem; cursor: pointer; }
      .picked-chip:hover { background: rgba(255, 107, 138, 0.18); border-color: rgba(255, 107, 138, 0.55); color: #ff9eb1; }
    `,
  ],
})
export class PromptEnhancerDialogComponent {
  @Input({ required: true }) mode!: PromptMode;
  @Input() open = false;

  @Output() readonly close = new EventEmitter<void>();
  /** Fires once when the user clicks Insert — payload is the comma-joined chip string. */
  @Output() readonly insert = new EventEmitter<string>();
  /** Fires when the user picks a template — payload replaces the whole prompt. */
  @Output() readonly replace = new EventEmitter<string>();

  protected readonly picked = signal<string[]>([]);
  protected readonly filter = signal('');
  protected readonly tab = signal<Tab>('templates');

  protected readonly sections = computed<KeywordSection[]>(() => keywordSectionsFor(this.mode));
  protected readonly templates = computed<PromptTemplate[]>(() => templatesFor(this.mode));
  protected modeLabel(): string {
    return ({ image: '🖼️ Image', video: '🎬 Video', audio: '🎵 Audio' } as const)[this.mode];
  }

  protected readonly visibleSections = computed<KeywordSection[]>(() => {
    const q = this.filter().trim().toLowerCase();
    if (!q) return this.sections();
    return this.sections()
      .map((s) => ({ ...s, chips: s.chips.filter((c) => c.toLowerCase().includes(q)) }))
      .filter((s) => s.chips.length > 0);
  });

  protected toggle(chip: string) {
    this.picked.update((list) => (list.includes(chip) ? list.filter((c) => c !== chip) : [...list, chip]));
  }

  protected isPicked(chip: string): boolean {
    return this.picked().includes(chip);
  }

  protected matchesFilter(chip: string): boolean {
    const q = this.filter().trim().toLowerCase();
    return !q || chip.toLowerCase().includes(q);
  }

  protected sectionMatchesFilter(s: KeywordSection): boolean {
    const q = this.filter().trim().toLowerCase();
    if (!q) return true;
    return s.chips.some((c) => c.toLowerCase().includes(q));
  }

  protected pickedCountFor(s: KeywordSection): number {
    const picked = new Set(this.picked());
    return s.chips.reduce((n, c) => (picked.has(c) ? n + 1 : n), 0);
  }

  protected clearAll() { this.picked.set([]); }

  protected onClose() {
    this.picked.set([]);
    this.filter.set('');
    this.tab.set('templates');
    this.close.emit();
  }

  protected onUseTemplate(t: PromptTemplate) {
    this.replace.emit(t.prompt);
    this.onClose();
  }

  protected onInsert() {
    const text = this.picked().join(', ');
    if (text) this.insert.emit(text);
    this.picked.set([]);
    this.filter.set('');
    this.close.emit();
  }

  protected scrollTo(key: string) {
    const el = document.getElementById(`sec-${key}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
