import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import {
  CharactersService,
  DetectedCharacter,
} from '../core/services/characters.service';
import { CharacterProfile } from '../core/models/contract.model';

interface PendingEdits {
  name: string;
  role: string;
  age: string;
  gender: string;
  description: string;
  wardrobe: string;
}

@Component({
  selector: 'app-character-extract-dialog',
  imports: [FormsModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <div class="overlay" (click)="onClose()">
        <div class="dialog" (click)="$event.stopPropagation()">
          <header class="head">
            <div>
              <div class="eyebrow">🎭 Character extraction</div>
              <h2>Pick characters from this video</h2>
              <p class="muted">
                The backend detected the faces below. For each one you want to keep,
                edit the name and traits and click <strong>Save to library</strong>.
                Anything you skip is discarded.
              </p>
            </div>
            <button class="icon-close" type="button" (click)="onClose()" title="Close">×</button>
          </header>

          @if (loading()) {
            <div class="body center">
              <span class="loader"></span>
              <p class="muted" style="margin-top: 0.6rem">Detecting faces across keyframes…</p>
            </div>
          } @else if (detections().length === 0) {
            <div class="body center">
              <span style="font-size: 1.6rem">🤷</span>
              <p class="muted" style="margin-top: 0.4rem">No faces detected.</p>
              <button class="btn sm" type="button" (click)="rerun()" style="margin-top: 0.5rem">↻ Try again</button>
            </div>
          } @else {
            <div class="body">
              @for (d of detections(); track d.id) {
                <article class="det-card" [class.saved]="savedIds().has(d.id)" [class.rejected]="rejectedIds().has(d.id)">
                  <div class="det-frames">
                    <div class="det-face" [style.background-image]="'url(' + d.faceUri + ')'"></div>
                    <div class="det-strip">
                      @for (f of d.bestFrames; track f) {
                        <div class="det-frame" [style.background-image]="'url(' + f + ')'"></div>
                      }
                    </div>
                    <div class="det-confidence">
                      <span class="chip cyan">{{ d.confidence * 100 | number: '1.0-0' }}% match</span>
                    </div>
                  </div>

                  @if (savedIds().has(d.id)) {
                    <div class="det-saved">
                      <strong>✓ Saved as "{{ edits()[d.id].name }}"</strong>
                      <p class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">
                        Find them under the Characters page for further edits.
                      </p>
                    </div>
                  } @else if (rejectedIds().has(d.id)) {
                    <div class="det-rejected">
                      <strong>✗ Rejected</strong>
                      <button class="btn ghost sm" type="button" (click)="unreject(d.id)" style="margin-top: 0.3rem">
                        ↩ Undo
                      </button>
                    </div>
                  } @else {
                    <div class="det-form">
                      <div class="grid-2">
                        <label class="field">
                          Name *
                          <input
                            [ngModel]="edits()[d.id].name"
                            (ngModelChange)="patch(d.id, { name: $event })"
                            placeholder="e.g. Maya Reyes"
                          />
                        </label>
                        <label class="field">
                          Role
                          <input
                            [ngModel]="edits()[d.id].role"
                            (ngModelChange)="patch(d.id, { role: $event })"
                            placeholder="protagonist / villain / extra…"
                          />
                        </label>
                      </div>
                      <div class="grid-2">
                        <label class="field">
                          Age
                          <input
                            [ngModel]="edits()[d.id].age"
                            (ngModelChange)="patch(d.id, { age: $event })"
                            placeholder="late 20s / 40s…"
                          />
                        </label>
                        <label class="field">
                          Gender
                          <input
                            [ngModel]="edits()[d.id].gender"
                            (ngModelChange)="patch(d.id, { gender: $event })"
                            placeholder="optional"
                          />
                        </label>
                      </div>
                      <label class="field">
                        Description
                        <textarea
                          rows="2"
                          [ngModel]="edits()[d.id].description"
                          (ngModelChange)="patch(d.id, { description: $event })"
                          placeholder="A weathered war journalist, sharp eyes…"
                        ></textarea>
                      </label>
                      <label class="field">
                        Wardrobe
                        <input
                          [ngModel]="edits()[d.id].wardrobe"
                          (ngModelChange)="patch(d.id, { wardrobe: $event })"
                          placeholder="trench coat, denim, scuffed boots"
                        />
                      </label>
                      <div class="row det-actions">
                        <button class="btn ghost sm danger" type="button" (click)="reject(d.id)">
                          ✗ Reject
                        </button>
                        <button
                          class="btn primary sm"
                          type="button"
                          (click)="save(d)"
                          [disabled]="!edits()[d.id].name.trim()"
                        >
                          ✓ Save to library
                        </button>
                      </div>
                    </div>
                  }
                </article>
              }
            </div>
          }

          <footer class="foot">
            <span class="muted" style="font-size: 0.78rem">
              {{ savedIds().size }} saved · {{ rejectedIds().size }} rejected · {{ pendingCount() }} pending
            </span>
            <div class="row">
              <button class="btn ghost sm" type="button" (click)="rerun()" [disabled]="loading()">↻ Re-detect</button>
              <button class="btn primary sm" type="button" (click)="finish()">
                @if (pendingNameableCount() > 0) {
                  ✓ Save {{ pendingNameableCount() }} & done
                } @else {
                  Done
                }
              </button>
            </div>
          </footer>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host { display: contents; }
      .overlay { position: fixed; inset: 0; background: rgba(2, 4, 14, 0.7); backdrop-filter: blur(6px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
      .dialog { width: min(900px, 100%); max-height: 92vh; display: flex; flex-direction: column; background: rgba(var(--surface-rgb), 0.96); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: 0 24px 60px rgba(0,0,0,0.45); }
      .head { padding: 1rem 1.2rem; display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; border-bottom: 1px solid var(--border); }
      .head h2 { margin: 0.3rem 0 0.2rem; font-family: var(--font-display); font-size: 1.1rem; }
      .head .muted { margin: 0; font-size: 0.78rem; max-width: 64ch; line-height: 1.45; }
      .eyebrow { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--text-mute); font-weight: 700; }
      .icon-close { width: 30px; height: 30px; border-radius: 8px; background: transparent; border: 1px solid var(--border); color: var(--text-2); font-size: 1.1rem; cursor: pointer; }
      .icon-close:hover { color: var(--text-1); border-color: rgba(139, 92, 246, 0.55); }
      .body { padding: 0.7rem 1rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 0.7rem; min-height: 0; }
      .body.center { align-items: center; justify-content: center; padding: 3rem 1rem; text-align: center; }

      .det-card { display: grid; grid-template-columns: 220px 1fr; gap: 0.9rem; padding: 0.7rem; background: rgba(var(--surface-rgb),0.55); border: 1px solid var(--border); border-radius: 12px; }
      .det-card.saved { border-color: rgba(52,211,153,0.55); background: rgba(52,211,153,0.07); }
      .det-card.rejected { opacity: 0.5; }

      .det-frames { display: flex; flex-direction: column; gap: 0.4rem; position: relative; }
      .det-face { width: 100%; aspect-ratio: 1; background-size: cover; background-position: center; border-radius: 10px; border: 1px solid var(--border); }
      .det-strip { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 0.25rem; }
      .det-frame { aspect-ratio: 1; background-size: cover; background-position: center; border-radius: 6px; border: 1px solid var(--border); }
      .det-confidence { position: absolute; top: 6px; left: 6px; }

      .det-form { display: flex; flex-direction: column; gap: 0.45rem; min-width: 0; }
      .det-form .field { font-size: 0.74rem; color: var(--text-2); display: flex; flex-direction: column; gap: 3px; }
      .det-form input, .det-form textarea { background: rgba(var(--surface-rgb),0.6); border: 1px solid var(--border); border-radius: 6px; padding: 0.38rem 0.55rem; color: var(--text-1); font-size: 0.86rem; font-family: inherit; resize: vertical; }
      .det-form input:focus, .det-form textarea:focus { outline: none; border-color: rgba(139, 92, 246, 0.55); }
      .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.45rem; }
      .det-actions { justify-content: flex-end; margin-top: 0.2rem; gap: 0.4rem; }
      .det-actions .btn.danger:hover { color: #ff6b8a; border-color: rgba(255, 107, 138, 0.55); }

      .det-saved, .det-rejected { display: flex; flex-direction: column; justify-content: center; padding: 0.5rem; }

      .foot { padding: 0.7rem 1.1rem 0.9rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; gap: 0.6rem; align-items: center; flex-wrap: wrap; background: rgba(var(--surface-rgb),0.7); }
      .foot .row { display: flex; gap: 0.4rem; }
      .chip.cyan { background: rgba(34,211,238,0.18); color: var(--neon-cyan, #22d3ee); padding: 2px 8px; border-radius: 999px; font-size: 0.7rem; }
    `,
  ],
})
export class CharacterExtractDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() videoUri: string | null = null;

  @Output() readonly close = new EventEmitter<void>();
  /** Fires per character saved — payload is the new CharacterProfile id. */
  @Output() readonly saved = new EventEmitter<CharacterProfile>();

  private readonly charactersSrv = inject(CharactersService);

  protected readonly loading = signal(false);
  protected readonly detections = signal<DetectedCharacter[]>([]);
  protected readonly edits = signal<Record<string, PendingEdits>>({});
  protected readonly savedIds = signal<Set<string>>(new Set());
  protected readonly rejectedIds = signal<Set<string>>(new Set());

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open) {
      this.run();
    }
  }

  protected pendingCount(): number {
    return this.detections().length - this.savedIds().size - this.rejectedIds().size;
  }

  /** How many pending detections have a non-empty name and could be saved on "Done". */
  protected pendingNameableCount(): number {
    return this.detections().filter((d) =>
      !this.savedIds().has(d.id) &&
      !this.rejectedIds().has(d.id) &&
      this.edits()[d.id]?.name.trim().length > 0,
    ).length;
  }

  /** Bulk-save anything still pending with a valid name, then close. */
  protected finish() {
    for (const d of this.detections()) {
      if (this.savedIds().has(d.id) || this.rejectedIds().has(d.id)) continue;
      if (!this.edits()[d.id]?.name.trim()) continue;
      this.save(d);
    }
    this.onClose();
  }

  protected rerun() {
    this.run();
  }

  private run() {
    if (!this.videoUri) return;
    this.loading.set(true);
    this.detections.set([]);
    this.savedIds.set(new Set());
    this.rejectedIds.set(new Set());
    this.charactersSrv.detectCharactersFromVideo(this.videoUri).subscribe((list) => {
      const edits: Record<string, PendingEdits> = {};
      list.forEach((d) => {
        edits[d.id] = {
          name: d.suggestedName ?? '',
          role: '',
          age: d.suggestedAge ?? '',
          gender: d.suggestedGender ?? '',
          description: '',
          wardrobe: '',
        };
      });
      this.edits.set(edits);
      this.detections.set(list);
      this.loading.set(false);
    });
  }

  protected patch(id: string, patch: Partial<PendingEdits>) {
    this.edits.update((map) => ({ ...map, [id]: { ...map[id], ...patch } }));
  }

  protected save(d: DetectedCharacter) {
    const edit = this.edits()[d.id];
    if (!edit?.name.trim()) return;
    const profile = this.charactersSrv.saveDetected(d, {
      name: edit.name.trim(),
      role: edit.role.trim(),
      age: edit.age.trim(),
      gender: edit.gender.trim(),
      description: edit.description.trim(),
      wardrobe: edit.wardrobe.trim(),
      tags: ['extracted'],
    });
    this.savedIds.update((set) => new Set(set).add(d.id));
    this.saved.emit(profile);
  }

  protected reject(id: string) {
    this.rejectedIds.update((set) => new Set(set).add(id));
  }

  protected unreject(id: string) {
    this.rejectedIds.update((set) => {
      const next = new Set(set);
      next.delete(id);
      return next;
    });
  }

  protected onClose() {
    this.close.emit();
  }
}
