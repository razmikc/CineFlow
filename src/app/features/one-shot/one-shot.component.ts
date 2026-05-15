import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Card {
  path: string;
  title: string;
  tagline: string;
  description: string;
  accent: 'violet' | 'cyan' | 'amber';
  emoji: string;
}

@Component({
  selector: 'app-one-shot',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header style="margin-bottom: 1.4rem">
      <div class="eyebrow">Quick make</div>
      <h1 style="margin-top: 0.3rem">One shot</h1>
      <p class="muted" style="margin-top: 0.4rem; max-width: 56ch">
        Don't want to plan a whole video? Just describe what you want and get
        an image, a short clip, or a piece of music. Output goes straight into
        your media.
      </p>
    </header>

    <section class="tools-grid">
      @for (c of cards; track c.path) {
        <a class="tool-card card" [routerLink]="c.path" [attr.data-accent]="c.accent">
          <div class="tool-icon">{{ c.emoji }}</div>
          <div class="tool-body">
            <div class="eyebrow">{{ c.tagline }}</div>
            <h2 class="tool-title">{{ c.title }}</h2>
            <p class="tool-desc">{{ c.description }}</p>
          </div>
          <div class="tool-cta">
            Open
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 5l5 5-5 5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </a>
      }
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .tools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
      .tool-card { position: relative; display: flex; flex-direction: column; gap: 0.9rem; padding: 1.2rem; text-decoration: none; color: var(--text-1); overflow: hidden; cursor: pointer; transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s; border: 1px solid var(--border); }
      .tool-card:hover { transform: translateY(-2px); border-color: var(--border-strong); box-shadow: var(--shadow-soft); }
      .tool-card::before { content: ''; position: absolute; inset: -50% -30% auto auto; width: 220px; height: 220px; border-radius: 50%; pointer-events: none; opacity: 0.5; filter: blur(40px); }
      .tool-card[data-accent='violet']::before { background: rgba(139, 92, 246, 0.35); }
      .tool-card[data-accent='cyan']::before   { background: rgba(34, 211, 238, 0.28); }
      .tool-icon { font-size: 1.8rem; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); }
      .tool-title { font-size: 1.15rem; margin-top: 0.25rem; }
      .tool-desc { font-size: 0.86rem; color: var(--text-2); margin-top: 0.45rem; line-height: 1.45; }
      .tool-cta { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.85rem; font-weight: 600; color: var(--neon-cyan); margin-top: auto; }
      .eyebrow { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.16em; color: var(--text-mute); font-weight: 700; }
    `,
  ],
})
export class OneShotComponent {
  protected readonly cards: Card[] = [
    {
      path: 'image',
      title: 'Make an image',
      tagline: 'Describe it · get a picture',
      description: 'Type what you want — or attach photos as references. Pick a model, get up to 4 variations.',
      accent: 'violet',
      emoji: '🖼️',
    },
    {
      path: 'video',
      title: 'Make a video',
      tagline: 'Describe it · get a clip',
      description: 'Type what you want. Add a starting frame, a start-and-end pair to animate between, or a face to keep someone consistent.',
      accent: 'cyan',
      emoji: '🎞',
    },
    {
      path: 'audio',
      title: 'Make music or sound',
      tagline: 'Describe it · hear it',
      description: 'Tell it the genre, mood, tempo, and instruments — get a playable track. Optional lyrics for songs with vocals.',
      accent: 'amber',
      emoji: '🎵',
    },
  ];
}
