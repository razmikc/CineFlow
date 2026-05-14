import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  EligibilityResult,
  EligibilityRuleResult,
  ImageEligibilityService,
} from '../../../core/services/image-eligibility.service';

interface QueueItem {
  id: string;
  fileName: string;
  uri: string;
  result: EligibilityResult | null;
}

@Component({
  selector: 'app-eligibility-checker',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      <a routerLink="/tools" class="btn ghost sm" style="margin-bottom: 0.5rem">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5l-5 5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to tools
      </a>
      <h1>Image eligibility checker</h1>
      <p class="muted" style="margin-top: 0.4rem; max-width: 60ch">
        Verify an image before uploading. The same checks run on every upload across the app —
        use this tool to test borderline content or audit existing files.
      </p>
    </header>

    <section class="card panel" style="margin-top: 1rem">
      <div class="row" style="justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.6rem">
        <div>
          <div class="eyebrow">Checks performed</div>
          <p class="muted" style="margin-top: 0.3rem; font-size: 0.82rem">
            Third-party faces · multiple faces · NSFW · minor detection · watermark · copyrighted logos · quality · public figures
          </p>
        </div>
        <button class="btn primary" type="button" (click)="triggerUpload()">
          + Add image{{ queue().length > 0 ? 's' : '' }}
        </button>
      </div>
      <input
        #fileInput
        type="file"
        accept="image/*"
        multiple
        hidden
        (change)="onFileSelected($event)"
      />

      @if (queue().length === 0) {
        <button class="dropzone" type="button" (click)="triggerUpload()">
          <div style="font-size: 1.8rem">🛡️</div>
          <strong>Drop one or more images to check</strong>
          <span class="muted" style="font-size: 0.78rem">Results appear instantly — nothing is saved to your library.</span>
        </button>
      }
    </section>

    @if (queue().length > 0) {
      <section style="margin-top: 1.2rem; display: flex; flex-direction: column; gap: 0.8rem">
        @for (item of queue(); track item.id) {
          <article class="card item" [class]="item.result ? 'verdict-' + item.result.verdict : ''">
            <div class="thumb" [style.background-image]="'url(' + item.uri + ')'"></div>
            <div class="body">
              <div class="row" style="justify-content: space-between; align-items: flex-start; gap: 0.6rem">
                <div>
                  <strong style="font-size: 0.95rem">{{ item.fileName }}</strong>
                  @if (item.result; as r) {
                    <div class="row" style="gap: 0.4rem; margin-top: 0.3rem; flex-wrap: wrap">
                      <span class="chip" [class]="verdictTone(r.verdict)">{{ verdictLabel(r.verdict) }}</span>
                      <span class="chip muted">Score {{ r.score }}/100</span>
                      <span class="chip muted">{{ countFails(r) }} fail · {{ countWarns(r) }} warn</span>
                    </div>
                    <p class="muted" style="margin-top: 0.4rem; font-size: 0.82rem">{{ r.summary }}</p>
                  } @else {
                    <div class="row" style="gap: 0.4rem; margin-top: 0.4rem; color: var(--text-3); font-size: 0.82rem">
                      <span class="loader"></span> Scanning…
                    </div>
                  }
                </div>
                <button class="iconbtn" title="Remove" (click)="remove(item.id)">×</button>
              </div>

              @if (item.result; as r) {
                <div class="rules">
                  @for (rule of r.rules; track rule.id) {
                    <div class="rule" [class]="'rule-' + rule.severity">
                      <div class="rule-dot"></div>
                      <div class="rule-body">
                        <div class="row" style="justify-content: space-between; gap: 0.5rem">
                          <strong style="font-size: 0.83rem">{{ rule.label }}</strong>
                          <span class="muted" style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em">{{ rule.severity }}</span>
                        </div>
                        <div class="muted" style="font-size: 0.78rem; margin-top: 0.2rem">{{ rule.detail }}</div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </article>
        }
      </section>
    }
  `,
  styles: [
    `
      :host { display: block; }
      .panel { padding: 1.1rem; }
      .dropzone {
        margin-top: 0.8rem;
        width: 100%;
        height: 180px;
        background: rgba(255, 255, 255, 0.02);
        border: 1.5px dashed var(--border-strong);
        border-radius: 14px;
        color: var(--text-2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        cursor: pointer;
      }
      .dropzone:hover { background: rgba(251, 191, 36, 0.06); border-color: var(--neon-amber); }
      .item {
        display: grid;
        grid-template-columns: 200px 1fr;
        gap: 1rem;
        padding: 0;
        overflow: hidden;
      }
      @media (max-width: 720px) {
        .item { grid-template-columns: 1fr; }
        .thumb { height: 220px !important; }
      }
      .item.verdict-blocked { border-color: rgba(251, 113, 133, 0.5); }
      .item.verdict-warning { border-color: rgba(251, 191, 36, 0.45); }
      .item.verdict-allowed { border-color: rgba(52, 211, 153, 0.45); }
      .thumb {
        background-position: center;
        background-size: cover;
        background-color: rgba(255, 255, 255, 0.04);
        min-height: 180px;
      }
      .body { padding: 0.9rem 1rem 1rem; }
      .rules {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 0.45rem;
        margin-top: 0.7rem;
      }
      .rule {
        display: flex;
        gap: 0.55rem;
        padding: 0.55rem 0.7rem;
        border-radius: 10px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.025);
      }
      .rule-dot {
        flex-shrink: 0;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        margin-top: 0.4rem;
        background: var(--neon-green);
      }
      .rule-warn .rule-dot { background: var(--neon-amber); }
      .rule-fail .rule-dot { background: var(--neon-rose); }
      .rule-warn { border-color: rgba(251, 191, 36, 0.35); }
      .rule-fail { border-color: rgba(251, 113, 133, 0.4); background: rgba(251, 113, 133, 0.06); }
      .rule-body { flex: 1; min-width: 0; }
      .chip.green { background: rgba(52, 211, 153, 0.15); color: var(--neon-green); }
      .chip.amber { background: rgba(251, 191, 36, 0.18); color: var(--neon-amber); }
      .chip.rose  { background: rgba(251, 113, 133, 0.18); color: var(--neon-rose); }
      .loader {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.18);
        border-top-color: var(--neon-cyan);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        display: inline-block;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `,
  ],
})
export class EligibilityCheckerComponent {
  private readonly eligibilitySrv = inject(ImageEligibilityService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly queue = signal<QueueItem[]>([]);

  protected triggerUpload() { this.fileInput()?.nativeElement.click(); }

  protected onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') return;
        const item: QueueItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          fileName: file.name,
          uri: result,
          result: null,
        };
        this.queue.update((list) => [item, ...list]);
        this.eligibilitySrv
          .check({ fileName: file.name, uri: result })
          .subscribe((r) => {
            this.queue.update((list) =>
              list.map((q) => (q.id === item.id ? { ...q, result: r } : q)),
            );
          });
      };
      reader.readAsDataURL(file);
    });
    input.value = '';
  }

  protected remove(id: string) {
    this.queue.update((list) => list.filter((q) => q.id !== id));
  }

  protected verdictLabel(v: EligibilityResult['verdict']) {
    return { allowed: 'Allowed', warning: 'Warning', blocked: 'Blocked' }[v];
  }

  protected verdictTone(v: EligibilityResult['verdict']) {
    return { allowed: 'green', warning: 'amber', blocked: 'rose' }[v];
  }

  protected countFails(r: EligibilityResult) {
    return r.rules.filter((x: EligibilityRuleResult) => x.severity === 'fail').length;
  }
  protected countWarns(r: EligibilityResult) {
    return r.rules.filter((x: EligibilityRuleResult) => x.severity === 'warn').length;
  }
}
