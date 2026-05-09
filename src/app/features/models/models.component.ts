import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModelsService } from '../../core/services/models.service';
import { AiModel } from '../../core/models/contract.model';

@Component({
  selector: 'app-models',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="row" style="justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem">
      <div>
        <h1>AI models</h1>
        <p class="muted" style="margin-top: 0.4rem">Compare providers across capability, speed, and cost. The orchestrator picks the right one per task.</p>
      </div>
      <div class="row" style="gap: 0.4rem; flex-wrap: wrap">
        @for (cap of capabilities; track cap) {
          <button class="tab" [class.active]="capability() === cap" (click)="capability.set(cap)">{{ niceCap(cap) }}</button>
        }
      </div>
    </header>

    <section class="grid">
      @for (m of filtered(); track m.id) {
        <div class="card model">
          <div class="row" style="justify-content: space-between; align-items: flex-start">
            <div>
              <div class="row" style="gap: 0.4rem">
                <strong class="model-name">{{ m.name }}</strong>
                <span class="chip muted">v{{ m.version }}</span>
              </div>
              <div class="muted" style="margin-top: 4px">{{ m.provider }}</div>
            </div>
            <div class="logo-tile" [class]="'p-' + m.provider"></div>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-2); margin-top: 0.6rem">{{ m.description }}</p>
          <div class="grid-2" style="margin-top: 0.85rem; gap: 0.5rem">
            <div class="kv">
              <div class="k">Capability</div>
              <div class="v"><span class="chip cyan">{{ niceCap(m.capability) }}</span></div>
            </div>
            <div class="kv">
              <div class="k">Speed</div>
              <div class="v"><span class="chip" [class]="speedTone(m.speed)">{{ m.speed }}</span></div>
            </div>
            <div class="kv">
              <div class="k">Cost</div>
              <div class="v mono"><strong>{{ m.costPerUnit }}</strong> / {{ m.unit }}</div>
            </div>
            <div class="kv">
              <div class="k">Capabilities</div>
              <div class="v">
                <div class="row" style="gap: 0.25rem; flex-wrap: wrap">
                  @if (m.supportsStartEndFrame) { <span class="cap-tag">start/end frame</span> }
                  @if (m.supportsCharacterReference) { <span class="cap-tag">character ref</span> }
                  @if (m.maxDuration) { <span class="cap-tag">max {{ m.maxDuration }}s</span> }
                </div>
              </div>
            </div>
          </div>
          <button class="btn primary sm" style="margin-top: 0.85rem; width: 100%">Set as default</button>
        </div>
      }
    </section>
  `,
  styleUrl: './models.component.scss',
})
export class ModelsComponent {
  private readonly modelsSrv = inject(ModelsService);

  protected readonly capabilities: (AiModel['capability'] | 'all')[] = [
    'all',
    'text_to_video',
    'image_to_video',
    'text_to_image',
    'voice_clone',
    'music_generation',
    'script_generation',
    'upscale',
  ];
  protected readonly capability = signal<AiModel['capability'] | 'all'>('all');

  protected readonly filtered = computed(() => {
    const cap = this.capability();
    return cap === 'all'
      ? this.modelsSrv.models()
      : this.modelsSrv.models().filter((m) => m.capability === cap);
  });

  protected niceCap(c: string) {
    return c.replace(/_/g, ' ');
  }
  protected speedTone(s: AiModel['speed']) {
    return { fast: 'green', balanced: 'cyan', high_quality: 'amber' }[s];
  }
}
