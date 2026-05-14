import { Injectable, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Asset, AssetType } from '../models/contract.model';
import { MOCK_ASSETS } from './mock-data';

@Injectable({ providedIn: 'root' })
export class AssetsService {
  private readonly _assets = signal<Asset[]>(structuredClone(MOCK_ASSETS));
  readonly assets = this._assets.asReadonly();

  list(): Observable<Asset[]> {
    return of(this._assets()).pipe(delay(160));
  }

  filter(type?: AssetType, term?: string): Observable<Asset[]> {
    const filtered = this._assets().filter((a) => {
      const okType = type ? a.type === type : true;
      const okTerm = term
        ? `${a.name} ${a.tags.join(' ')} ${a.prompt ?? ''}`.toLowerCase().includes(term.toLowerCase())
        : true;
      return okType && okTerm;
    });
    return of(filtered).pipe(delay(140));
  }

  get(id: string): Asset | undefined {
    return this._assets().find((a) => a.id === id);
  }

  generate(input: {
    type: AssetType;
    name: string;
    prompt: string;
    provider: string;
    model: string;
  }): Observable<Asset> {
    const fallbackImages = [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800',
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
    ];
    const newAsset: Asset = {
      id: `asset-${this._assets().length + 1}`,
      type: input.type,
      name: input.name,
      source: 'generated',
      uri: fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
      thumbnail: fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
      provider: input.provider,
      model: input.model,
      prompt: input.prompt,
      tags: ['generated'],
      createdAt: new Date().toISOString(),
    };
    this._assets.update((list) => [newAsset, ...list]);
    return of(newAsset).pipe(delay(900));
  }

  upload(input: { type: AssetType; name: string; uri: string }): Observable<Asset> {
    const newAsset: Asset = {
      id: `asset-${this._assets().length + 1}`,
      type: input.type,
      name: input.name,
      source: 'uploaded',
      uri: input.uri,
      thumbnail: input.uri,
      tags: ['uploaded'],
      createdAt: new Date().toISOString(),
    };
    this._assets.update((list) => [newAsset, ...list]);
    return of(newAsset).pipe(delay(220));
  }

  remove(id: string): Observable<void> {
    this._assets.update((list) => list.filter((a) => a.id !== id));
    return of(undefined).pipe(delay(120));
  }

  /** Patch an existing asset — used by the image-editor bridge when the
   *  user applies an edited image back to an asset. */
  update(id: string, patch: Partial<Asset>): void {
    this._assets.update((list) =>
      list.map((a) => (a.id === id ? { ...a, ...patch, id: a.id } : a)),
    );
  }
}
