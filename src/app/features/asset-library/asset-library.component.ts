import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AssetsService } from '../../core/services/assets.service';
import { Asset, AssetType } from '../../core/models/contract.model';

@Component({
  selector: 'app-asset-library',
  imports: [FormsModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="row" style="justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem">
      <div>
        <h1>Asset library</h1>
        <p class="muted" style="margin-top: 0.4rem">Reusable images, videos, voices, music and fonts. Generate, upload, or pull from stock.</p>
      </div>
      <div class="row" style="gap: 0.5rem">
        <button class="btn cool" (click)="generate()">
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v3m0 10v3M2 10h3m10 0h3M4.2 4.2l2.1 2.1m7.4 7.4 2.1 2.1" stroke-linecap="round"/></svg>
          Generate asset
        </button>
        <button class="btn primary" (click)="upload()">+ Upload</button>
      </div>
    </header>

    <div class="row filters">
      <div class="search-box">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="9" r="6.5"/><path d="m14 14 4 4" stroke-linecap="round"/>
        </svg>
        <input placeholder="Search by name, prompt, or tag" [ngModel]="search()" (ngModelChange)="search.set($event)"/>
      </div>
      <div class="row tabs">
        <button class="tab" [class.active]="filter() === 'all'" (click)="filter.set('all')">All ({{ assetsSrv.assets().length }})</button>
        @for (t of types; track t) {
          <button class="tab" [class.active]="filter() === t" (click)="filter.set(t)">{{ t }} ({{ countByType(t) }})</button>
        }
      </div>
    </div>

    <section class="grid">
      @for (a of filtered(); track a.id) {
        <div class="asset card">
          <div class="thumb" [style.background-image]="'url(' + (a.thumbnail || a.uri) + ')'">
            <div class="thumb-overlay">
              <span class="chip" [class]="sourceTone(a.source)">{{ a.source }}</span>
              <span class="chip muted">{{ a.type }}</span>
            </div>
            <div class="thumb-actions">
              <button class="iconbtn">↻</button>
              <button class="iconbtn">🔍</button>
              <button class="iconbtn">⤓</button>
            </div>
          </div>
          <div class="body">
            <div class="row" style="justify-content: space-between">
              <strong style="font-size: 0.9rem">{{ a.name }}</strong>
              @if (a.durationSec) { <span class="mono" style="font-size: 0.75rem">{{ a.durationSec }}s</span> }
            </div>
            @if (a.prompt) {
              <div class="muted prompt-line">{{ a.prompt }}</div>
            }
            <div class="row" style="gap: 0.3rem; flex-wrap: wrap">
              @for (t of a.tags; track t) {
                <span class="tag">{{ t }}</span>
              }
            </div>
            <div class="row" style="justify-content: space-between; padding-top: 0.5rem; border-top: 1px dashed var(--border); margin-top: 0.4rem">
              <span class="muted" style="font-size: 0.74rem">
                {{ a.provider ? a.provider + ' · ' + a.model : 'manual' }}
              </span>
              <span class="muted" style="font-size: 0.74rem">{{ a.createdAt | date: 'shortDate' }}</span>
            </div>
          </div>
        </div>
      }
      @if (filtered().length === 0) {
        <div class="empty">
          <div style="font-size: 1.6rem">📦</div>
          <div style="font-family: var(--font-display); font-weight: 600">No matching assets</div>
          <p class="muted">Try a different filter or generate a new one.</p>
        </div>
      }
    </section>
  `,
  styleUrl: './asset-library.component.scss',
})
export class AssetLibraryComponent {
  protected readonly assetsSrv = inject(AssetsService);
  protected readonly search = signal('');
  protected readonly filter = signal<AssetType | 'all'>('all');
  protected readonly types: AssetType[] = ['image', 'video', 'audio', 'voice', 'music', 'font', 'logo'];

  protected readonly filtered = computed(() => {
    const term = this.search().toLowerCase();
    const type = this.filter();
    return this.assetsSrv.assets().filter((a) => {
      const okType = type === 'all' || a.type === type;
      const okTerm = !term || `${a.name} ${a.tags.join(' ')} ${a.prompt ?? ''}`.toLowerCase().includes(term);
      return okType && okTerm;
    });
  });

  protected countByType(t: AssetType) {
    return this.assetsSrv.assets().filter((a) => a.type === t).length;
  }
  protected sourceTone(s: Asset['source']) {
    return { generated: 'cyan', uploaded: 'green', library: 'amber', ai_pending: 'muted' }[s];
  }
  protected generate() {
    this.assetsSrv.generate({
      type: 'image',
      name: `generated-${Date.now()}.png`,
      prompt: 'Cinematic still, soft warm light, atmospheric, 35mm',
      provider: 'midjourney',
      model: 'Midjourney v7',
    }).subscribe();
  }
  protected upload() {
    const samples = [
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
      'https://images.unsplash.com/photo-1493804714600-6edb1cd93080?w=800',
    ];
    this.assetsSrv.upload({
      type: 'image',
      name: `upload-${Date.now()}.jpg`,
      uri: samples[Math.floor(Math.random() * samples.length)],
    }).subscribe();
  }
}
