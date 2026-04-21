import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ONBOARDING_STEPS, LINKEDIN_AUTOPLAY_URL, initializeOnboardingWizard } from '~/entrypoints/onboarding/main';

const STORAGE_KEY = 'onboardingCompleted';

function buildDOM(): void {
  document.body.innerHTML = `
    <main class="onboarding-shell">
      <section class="wizard-card">
        <header class="wizard-header">
          <p id="wizard-step-label"></p>
          <h1 id="wizard-title"></h1>
          <p id="wizard-description"></p>
        </header>
        <ul id="wizard-points"></ul>
        <div id="wizard-extra"></div>
        <div id="wizard-indicators"></div>
        <footer class="wizard-actions">
          <button id="wizard-back" type="button" hidden>Back</button>
          <button id="wizard-next" type="button">Next</button>
          <button id="wizard-done" type="button" hidden>Done</button>
        </footer>
      </section>
    </main>
  `;
}

function fakeStorage(initial: Record<string, unknown> = {}) {
  const store: Record<string, unknown> = { ...initial };
  return {
    get(keys: string | string[]) {
      const list = Array.isArray(keys) ? keys : [keys];
      const out: Record<string, unknown> = {};
      for (const k of list) {
        if (k in store) out[k] = store[k];
      }
      return Promise.resolve(out);
    },
    set(items: Record<string, unknown>) {
      Object.assign(store, items);
      return Promise.resolve();
    },
    _store: store
  };
}

describe('onboarding wizard', () => {
  beforeEach(() => {
    buildDOM();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('exposes exactly three steps in the timer / pause-gate / autoplay-link order', () => {
    expect(ONBOARDING_STEPS).toHaveLength(3);
    expect(ONBOARDING_STEPS[0].title.toLowerCase()).toContain('timer');
    expect(ONBOARDING_STEPS[1].title.toLowerCase()).toContain('keep going');
    expect(ONBOARDING_STEPS[2].title.toLowerCase()).toContain('autoplay');
  });

  it('points at LinkedIn\'s native autoplay setting', () => {
    expect(LINKEDIN_AUTOPLAY_URL).toBe('https://www.linkedin.com/mypreferences/d/autoplay-videos');
    expect(ONBOARDING_STEPS[2].link?.url).toBe(LINKEDIN_AUTOPLAY_URL);
  });

  it('renders the first step on initialize when not completed', async () => {
    const storage = fakeStorage();
    await initializeOnboardingWizard({ storage, navigate: () => {} });

    expect(document.getElementById('wizard-title')?.textContent).toBe(ONBOARDING_STEPS[0].title);
    expect(document.getElementById('wizard-step-label')?.textContent).toBe('Step 1 of 3');
  });

  it('navigates forward and backward and surfaces the autoplay link on the last step', async () => {
    const storage = fakeStorage();
    await initializeOnboardingWizard({ storage, navigate: () => {} });

    const next = document.getElementById('wizard-next') as HTMLButtonElement;
    next.click();
    expect(document.getElementById('wizard-title')?.textContent).toBe(ONBOARDING_STEPS[1].title);

    next.click();
    expect(document.getElementById('wizard-title')?.textContent).toBe(ONBOARDING_STEPS[2].title);

    const link = document.querySelector<HTMLAnchorElement>('#wizard-extra a');
    expect(link?.href).toBe(LINKEDIN_AUTOPLAY_URL);
    expect(link?.target).toBe('_blank');

    expect((document.getElementById('wizard-next') as HTMLButtonElement).hidden).toBe(true);
    expect((document.getElementById('wizard-done') as HTMLButtonElement).hidden).toBe(false);

    (document.getElementById('wizard-back') as HTMLButtonElement).click();
    expect(document.getElementById('wizard-title')?.textContent).toBe(ONBOARDING_STEPS[1].title);
  });

  it('persists completion and triggers navigate on Done', async () => {
    const storage = fakeStorage();
    const navigate = vi.fn();
    await initializeOnboardingWizard({ storage, navigate });

    (document.getElementById('wizard-next') as HTMLButtonElement).click();
    (document.getElementById('wizard-next') as HTMLButtonElement).click();
    (document.getElementById('wizard-done') as HTMLButtonElement).click();

    await new Promise((r) => setTimeout(r, 0));

    expect(storage._store[STORAGE_KEY]).toBe(true);
    expect(navigate).toHaveBeenCalledOnce();
  });

  it('skips the wizard and navigates immediately when already completed', async () => {
    const storage = fakeStorage({ [STORAGE_KEY]: true });
    const navigate = vi.fn();
    await initializeOnboardingWizard({ storage, navigate });

    expect(navigate).toHaveBeenCalledOnce();
    expect(document.getElementById('wizard-title')?.textContent).toBe('');
  });

  it('honors review=1 and renders even when completed', async () => {
    const storage = fakeStorage({ [STORAGE_KEY]: true });
    const navigate = vi.fn();
    await initializeOnboardingWizard({ storage, navigate, reviewMode: true });

    expect(navigate).not.toHaveBeenCalled();
    expect(document.getElementById('wizard-title')?.textContent).toBe(ONBOARDING_STEPS[0].title);
  });
});
