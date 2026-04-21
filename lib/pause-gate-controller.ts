import { PAUSE_GATE_COPY, type PauseGateCopy } from '~/lib/pause-gate-copy';

const SCROLL_BLOCK_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'PageDown',
  'PageUp',
  'Home',
  'End',
  ' ',
  'Spacebar'
]);

type ShowOptions = {
  pageCount: number;
  formattedDuration: string;
  onContinue?: () => void;
  onDoneForNow?: () => void;
};

export class PauseGateController {
  private readonly copy: PauseGateCopy;
  private root: HTMLElement | null = null;
  private wheelHandler: ((event: WheelEvent) => void) | null = null;
  private touchMoveHandler: ((event: TouchEvent) => void) | null = null;
  private keyDownHandler: ((event: KeyboardEvent) => void) | null = null;

  constructor(options?: { copy?: PauseGateCopy }) {
    this.copy = options?.copy ?? PAUSE_GATE_COPY;
  }

  show(options: ShowOptions): boolean {
    if (this.root) {
      return false;
    }

    const root = document.createElement('section');
    root.setAttribute('data-jomo-pause-gate', 'true');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.style.cssText = `
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2147483646;
      display: grid;
      justify-items: center;
      box-sizing: border-box;
      pointer-events: none;
    `;

    const panel = document.createElement('article');
    panel.style.cssText = `
      width: min(620px, calc(100vw - 28px));
      border-radius: 14px 14px 0 0;
      border: 1px solid rgba(0, 0, 0, 0.16);
      border-bottom: 0;
      background: #ffffff;
      color: rgba(16, 32, 37, 0.96);
      padding: 22px 22px 18px;
      display: grid;
      gap: 12px;
      box-shadow: 0 -2px 18px rgba(0, 0, 0, 0.12);
      pointer-events: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const pageBadge = document.createElement('p');
    pageBadge.textContent = this.copy.pageLabel(options.pageCount);
    pageBadge.style.cssText = `
      margin: 0;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: rgba(23, 49, 48, 0.7);
    `;

    const title = document.createElement('h2');
    title.textContent = this.copy.title;
    title.style.cssText = 'margin: 0; font-size: 1.55rem; line-height: 1.2; font-weight: 700;';

    const subtitle = document.createElement('p');
    subtitle.textContent = this.copy.durationLabel(options.formattedDuration);
    subtitle.style.cssText = 'margin: 0; color: rgba(16, 32, 37, 0.72); font-size: 1rem;';

    const actions = document.createElement('div');
    actions.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px;';

    const continueButton = this.createButton(this.copy.continueLabel, 'continue', true);
    const doneButton = this.createButton(this.copy.doneLabel, 'done');

    continueButton.addEventListener('click', () => {
      try {
        options.onContinue?.();
      } finally {
        this.cleanup();
      }
    });

    doneButton.addEventListener('click', () => {
      try {
        options.onDoneForNow?.();
      } finally {
        this.cleanup();
      }
    });

    actions.append(continueButton, doneButton);
    panel.append(pageBadge, title, subtitle, actions);
    root.append(panel);
    document.body.appendChild(root);

    this.root = root;
    this.enableScrollBlock();
    return true;
  }

  isActive(): boolean {
    return this.root !== null;
  }

  cleanup(): void {
    this.disableScrollBlock();
    this.root?.remove();
    this.root = null;
  }

  private createButton(label: string, action: 'continue' | 'done', primary = false): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.setAttribute('data-jomo-gate-action', action);
    button.style.cssText = `
      border: 1px solid rgba(16, 32, 37, 0.16);
      border-radius: 999px;
      background: ${primary ? 'rgba(23, 49, 48, 1)' : '#ffffff'};
      color: ${primary ? 'rgba(240, 247, 239, 1)' : 'rgba(16, 32, 37, 0.9)'};
      padding: 10px 18px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
    `;
    return button;
  }

  private enableScrollBlock(): void {
    document.documentElement.classList.add('jomo-pause-gate-lock');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    this.wheelHandler = (event) => event.preventDefault();
    this.touchMoveHandler = (event) => event.preventDefault();
    this.keyDownHandler = (event) => {
      if (!SCROLL_BLOCK_KEYS.has(event.key)) return;
      if (this.isEditableTarget(event.target)) return;
      event.preventDefault();
    };

    window.addEventListener('wheel', this.wheelHandler, { capture: true, passive: false });
    window.addEventListener('touchmove', this.touchMoveHandler, { capture: true, passive: false });
    window.addEventListener('keydown', this.keyDownHandler, true);
  }

  private disableScrollBlock(): void {
    document.documentElement.classList.remove('jomo-pause-gate-lock');
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');

    if (this.wheelHandler) {
      window.removeEventListener('wheel', this.wheelHandler, true);
      this.wheelHandler = null;
    }
    if (this.touchMoveHandler) {
      window.removeEventListener('touchmove', this.touchMoveHandler, true);
      this.touchMoveHandler = null;
    }
    if (this.keyDownHandler) {
      window.removeEventListener('keydown', this.keyDownHandler, true);
      this.keyDownHandler = null;
    }
  }

  private isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    return target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
  }
}
