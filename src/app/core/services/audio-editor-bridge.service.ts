import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Hand-off between any flow-surface "Edit audio" button and the
 * /tools/audio-editor page. Mirrors ImageEditorBridgeService — the editor
 * consumes the request on init, plays + edits the audio, and (when the user
 * clicks "Apply & return") invokes onApply so the originating surface can
 * swap its audio asset.
 */
export interface AudioEditorRequest {
  sourceUri: string;
  sourceName?: string;
  durationSec?: number;
  contextLabel?: string;
  returnTo: string;
  onApply: (newUri: string, durationSec?: number) => void;
}

@Injectable({ providedIn: 'root' })
export class AudioEditorBridgeService {
  private readonly router = inject(Router);
  private readonly _pending = signal<AudioEditorRequest | null>(null);
  readonly hasPending = computed(() => this._pending() !== null);

  open(opts: {
    sourceUri: string;
    sourceName?: string;
    durationSec?: number;
    contextLabel?: string;
    onApply: (newUri: string, durationSec?: number) => void;
  }) {
    const returnTo = this.router.url;
    this._pending.set({ ...opts, returnTo });
    this.router.navigateByUrl('/tools/audio-editor');
  }

  consume(): AudioEditorRequest | null {
    const req = this._pending();
    this._pending.set(null);
    return req;
  }
}
