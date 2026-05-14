import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Carries a hand-off between any flow-surface "Edit image" button and the
 * /tools/image-editor page. The image-editor consumes the request on init,
 * pre-loads the source image, and (when the user clicks "Apply & return")
 * invokes the onApply callback so the originating surface can swap its image.
 *
 * The request is single-use — `consume()` clears it. The bridge state is
 * memory-only; reloading the page wipes it, which is fine: the editor just
 * starts fresh.
 */
export interface EditorRequest {
  sourceUri: string;
  contextLabel?: string;
  returnTo: string;
  onApply: (newUri: string) => void;
}

@Injectable({ providedIn: 'root' })
export class ImageEditorBridgeService {
  private readonly router = inject(Router);
  private readonly _pending = signal<EditorRequest | null>(null);
  readonly hasPending = computed(() => this._pending() !== null);

  /** Capture an edit request and navigate to the image editor. */
  open(opts: { sourceUri: string; contextLabel?: string; onApply: (newUri: string) => void }) {
    const returnTo = this.router.url;
    this._pending.set({ ...opts, returnTo });
    this.router.navigateByUrl('/tools/image-editor');
  }

  /** Read & clear the pending request. Returns null if none is pending. */
  consume(): EditorRequest | null {
    const req = this._pending();
    this._pending.set(null);
    return req;
  }
}
