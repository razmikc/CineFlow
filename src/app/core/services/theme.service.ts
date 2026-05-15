import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light' | 'studio' | 'black';

export interface ThemeOption {
  id: ThemeMode;
  label: string;
  emoji: string;
  hint: string;
}

const STORAGE_KEY = 'cineflow.theme';

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'dark',   label: 'Dark',   emoji: '🌙', hint: 'Deep blue, neon accents.' },
  { id: 'light',  label: 'Light',  emoji: '☀️', hint: 'Clean white, AA-contrast.' },
  { id: 'studio', label: 'Studio', emoji: '🎬', hint: 'Warm dark — grading suite.' },
  { id: 'black',  label: 'Black',  emoji: '⬛', hint: 'Pure OLED black, punchy neons.' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Persisted current theme — read by templates via signal(). */
  readonly mode = signal<ThemeMode>(this.loadOrDefault());

  constructor() {
    // Apply the theme to <html data-theme="…"> on every change.
    effect(() => {
      const next = this.mode();
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', next);
      }
      if (typeof localStorage !== 'undefined') {
        try { localStorage.setItem(STORAGE_KEY, next); } catch { /* quota — ignore */ }
      }
    });
  }

  set(next: ThemeMode) {
    this.mode.set(next);
  }

  private loadOrDefault(): ThemeMode {
    if (typeof localStorage === 'undefined') return 'dark';
    try {
      const raw = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (raw === 'dark' || raw === 'light' || raw === 'studio' || raw === 'black') return raw;
    } catch { /* ignore */ }
    return 'dark';
  }
}
