import { initializeBackgroundSystem } from '~/entrypoints/shared/background-system';
import './style.css';

export const LINKEDIN_AUTOPLAY_URL = 'https://www.linkedin.com/mypreferences/d/autoplay-videos';

const STORAGE_KEY = 'onboardingCompleted';

export type OnboardingLink = {
  url: string;
  label: string;
};

export type OnboardingStep = {
  title: string;
  description: string;
  points: string[];
  link?: OnboardingLink;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'A small timer that just sits there',
    description:
      'While you scroll LinkedIn, Jomo shows a tiny clock in the corner counting how long you\'ve been here. Seeing the number is the point.',
    points: [
      'No history, no streaks, no dashboard.',
      'Just the live count, while you\'re here, on the page where you\'re here.'
    ]
  },
  {
    title: 'Keep going? — at the end of every page',
    description:
      'When you reach the end of a feed page, LinkedIn would normally load the next one for you. Jomo asks you instead.',
    points: [
      'A small panel slides up. It says how long you\'ve been here.',
      'Two buttons: keep going, or done for now. That\'s the whole feature.'
    ]
  },
  {
    title: 'One more thing — turn off autoplay videos',
    description:
      'LinkedIn already has a setting for this. We don\'t need to reimplement it; we just point you at it. One click, then come back.',
    points: [
      'Open LinkedIn\'s autoplay setting in a new tab.',
      'Toggle it off. Close the tab. Done.'
    ],
    link: {
      url: LINKEDIN_AUTOPLAY_URL,
      label: 'Open LinkedIn autoplay settings'
    }
  }
];

type StorageLike = {
  get(keys: string | string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
};

type InitializeOptions = {
  storage?: StorageLike;
  navigate?: (url: string) => void;
  reviewMode?: boolean;
};

function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T | null;
  if (!element) {
    throw new Error(`[Jomo] Missing onboarding element: ${id}`);
  }
  return element;
}

function defaultStorage(): StorageLike {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    return chrome.storage.local;
  }
  // Fallback for non-extension contexts (tests can pass their own storage).
  const memory: Record<string, unknown> = {};
  return {
    async get(keys) {
      const list = Array.isArray(keys) ? keys : [keys];
      const out: Record<string, unknown> = {};
      for (const k of list) {
        if (k in memory) out[k] = memory[k];
      }
      return out;
    },
    async set(items) {
      Object.assign(memory, items);
    }
  };
}

function defaultNavigate(url: string) {
  window.location.href = url;
}

function isCompleted(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

export async function initializeOnboardingWizard(options: InitializeOptions = {}): Promise<void> {
  initializeBackgroundSystem();

  const storage = options.storage ?? defaultStorage();
  const navigate = options.navigate ?? defaultNavigate;
  const reviewMode =
    options.reviewMode ??
    (typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('review') === '1');

  const stored = await storage.get(STORAGE_KEY);
  if (!reviewMode && isCompleted(stored[STORAGE_KEY])) {
    navigate('https://www.linkedin.com/feed/');
    return;
  }

  const stepLabel = getRequiredElement<HTMLElement>('wizard-step-label');
  const title = getRequiredElement<HTMLElement>('wizard-title');
  const description = getRequiredElement<HTMLElement>('wizard-description');
  const points = getRequiredElement<HTMLUListElement>('wizard-points');
  const extra = getRequiredElement<HTMLElement>('wizard-extra');
  const indicators = getRequiredElement<HTMLElement>('wizard-indicators');
  const backButton = getRequiredElement<HTMLButtonElement>('wizard-back');
  const nextButton = getRequiredElement<HTMLButtonElement>('wizard-next');
  const doneButton = getRequiredElement<HTMLButtonElement>('wizard-done');

  let stepIndex = 0;

  const render = () => {
    const step = ONBOARDING_STEPS[stepIndex];
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === ONBOARDING_STEPS.length - 1;

    stepLabel.textContent = `Step ${stepIndex + 1} of ${ONBOARDING_STEPS.length}`;
    title.textContent = step.title;
    description.textContent = step.description;

    points.innerHTML = '';
    for (const item of step.points) {
      const li = document.createElement('li');
      li.textContent = item;
      points.appendChild(li);
    }

    extra.innerHTML = '';
    if (step.link) {
      const link = document.createElement('a');
      link.href = step.link.url;
      link.textContent = step.link.label;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'btn btn-secondary';
      extra.appendChild(link);
    }

    indicators.innerHTML = '';
    ONBOARDING_STEPS.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = `indicator${i === stepIndex ? ' active' : ''}`;
      indicators.appendChild(dot);
    });

    backButton.hidden = isFirst;
    nextButton.hidden = isLast;
    doneButton.hidden = !isLast;
  };

  backButton.addEventListener('click', () => {
    stepIndex = Math.max(0, stepIndex - 1);
    render();
  });

  nextButton.addEventListener('click', () => {
    stepIndex = Math.min(ONBOARDING_STEPS.length - 1, stepIndex + 1);
    render();
  });

  doneButton.addEventListener('click', async () => {
    await storage.set({ [STORAGE_KEY]: true });
    navigate('https://www.linkedin.com/feed/');
  });

  render();
}

if (typeof import.meta !== 'undefined' && (import.meta as { env?: { MODE?: string } }).env?.MODE !== 'test') {
  initializeOnboardingWizard().catch((error) => {
    console.error('[Jomo] Failed to initialize onboarding wizard:', error);
  });
}
