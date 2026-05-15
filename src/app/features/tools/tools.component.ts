import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ToolCard {
  path: string;
  title: string;
  tagline: string;
  description: string;
  accent: 'violet' | 'cyan' | 'amber';
  emoji: string;
}

@Component({
  selector: 'app-tools',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header style="margin-bottom: 1.4rem">
      <div class="eyebrow">Workshop</div>
      <h1 style="margin-top: 0.3rem">Tools</h1>
      <p class="muted" style="margin-top: 0.4rem; max-width: 56ch">
        Quick utilities to fix, edit, or remake an image or clip — without
        starting a full project. Use any of them on their own, or as part
        of a bigger video.
      </p>
    </header>

    <section class="tools-grid">
      @for (t of tools; track t.path) {
        <a class="tool-card card" [routerLink]="t.path" [attr.data-accent]="t.accent">
          <div class="tool-icon">{{ t.emoji }}</div>
          <div class="tool-body">
            <div class="eyebrow">{{ t.tagline }}</div>
            <h2 class="tool-title">{{ t.title }}</h2>
            <p class="tool-desc">{{ t.description }}</p>
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
      .tools-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }
      .tool-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
        padding: 1.2rem;
        text-decoration: none;
        color: var(--text-1);
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
        border: 1px solid var(--border);
      }
      .tool-card:hover {
        transform: translateY(-2px);
        border-color: var(--border-strong);
        box-shadow: var(--shadow-soft);
      }
      .tool-card::before {
        content: '';
        position: absolute;
        inset: -50% -30% auto auto;
        width: 220px;
        height: 220px;
        border-radius: 50%;
        pointer-events: none;
        opacity: 0.5;
        filter: blur(40px);
      }
      .tool-card[data-accent='violet']::before { background: rgba(139, 92, 246, 0.35); }
      .tool-card[data-accent='cyan']::before   { background: rgba(34, 211, 238, 0.28); }
      .tool-card[data-accent='amber']::before  { background: rgba(251, 191, 36, 0.28); }
      .tool-icon {
        font-size: 1.8rem;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: rgba(var(--wash-rgb), 0.05);
        border: 1px solid var(--border);
      }
      .tool-title {
        font-size: 1.15rem;
        margin-top: 0.25rem;
      }
      .tool-desc {
        font-size: 0.86rem;
        color: var(--text-2);
        margin-top: 0.45rem;
        line-height: 1.45;
      }
      .tool-cta {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--neon-cyan);
        margin-top: auto;
      }
      .eyebrow {
        font-size: 0.66rem;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: var(--text-mute);
        font-weight: 700;
      }
    `,
  ],
})
export class ToolsComponent {
  protected readonly tools: ToolCard[] = [
    {
      path: 'camera-angles',
      title: 'Different angles',
      tagline: 'One photo → many angles',
      description:
        'Upload one photo and get the same subject from up to 9 angles — front, profile, low, high — in one shot.',
      accent: 'violet',
      emoji: '🎥',
    },
    {
      path: 'skin-enhancer',
      title: 'Polish a face',
      tagline: 'Cleaner skin, sharper face',
      description:
        'Get three cleaned-up versions of a portrait. Compare them side by side and pick the one you like.',
      accent: 'cyan',
      emoji: '✨',
    },
    {
      path: 'image-editor',
      title: 'Image editor',
      tagline: 'Expand · Erase · Replace · Upscale',
      description:
        'One canvas, four moves. Expand the frame and let AI fill it, erase something, replace it with a prompt or photo, or make the whole image up to 8× sharper.',
      accent: 'cyan',
      emoji: '🛠️',
    },
    {
      path: 'audio-editor',
      title: 'Audio editor',
      tagline: 'Trim · Stretch · Loop',
      description:
        'Listen to any audio file, trim it, fade it in or out, loop it, change the speed. Save it to your media or drop it straight into a scene.',
      accent: 'amber',
      emoji: '🎚',
    },
    {
      path: 'video-editor',
      title: 'Video editor',
      tagline: 'Multi-track timeline',
      description:
        'CapCut-style timeline with one video lane plus audio and SFX. Drag, resize, snap clips. Make a clip longer than the source and AI extends the video for you. Remove or swap objects with a prompt.',
      accent: 'violet',
      emoji: '🎞',
    },
    {
      path: 'video-clone',
      title: 'Remake a video',
      tagline: 'Your clip → a new version',
      description:
        'Drop in any video and remake it — same shots, new style. Choose how it rebuilds (whole video, keyframes, or style-only), add a prompt, pick the people in it, and decide whether to keep the original voice and music.',
      accent: 'cyan',
      emoji: '🪞',
    },
    {
      path: 'eligibility',
      title: 'Safety check',
      tagline: 'Is this image OK to use?',
      description:
        'Before you use a photo, run it through quick checks — faces, sensitive content, watermarks, and minors — so you know whether you can legally include it.',
      accent: 'amber',
      emoji: '🛡️',
    },
  ];
}
