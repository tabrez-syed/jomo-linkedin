import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PauseGateController } from '~/lib/pause-gate-controller';

describe('PauseGateController', () => {
  let controller: PauseGateController;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.classList.remove('jomo-pause-gate-lock');
    controller = new PauseGateController();
  });

  afterEach(() => {
    controller.cleanup();
  });

  it('mounts a docked sheet with continue and done buttons only', () => {
    expect(controller.show({ pageCount: 2, formattedDuration: '00:12:00' })).toBe(true);

    const root = document.querySelector<HTMLElement>('[data-jomo-pause-gate="true"]');
    expect(root).not.toBeNull();
    expect(root?.textContent).toContain('Page 2');
    expect(root?.textContent).toContain('00:12:00');
    expect(root?.querySelector('[data-jomo-gate-action="continue"]')).not.toBeNull();
    expect(root?.querySelector('[data-jomo-gate-action="done"]')).not.toBeNull();
    expect(root?.querySelector('[data-jomo-gate-action="reset"]')).toBeNull();
  });

  it('refuses to mount a second gate while one is already active', () => {
    expect(controller.show({ pageCount: 1, formattedDuration: '00:01:00' })).toBe(true);
    expect(controller.show({ pageCount: 2, formattedDuration: '00:02:00' })).toBe(false);
  });

  it('locks page scroll while active and releases the lock after continue', () => {
    const onContinue = vi.fn();
    controller.show({ pageCount: 1, formattedDuration: '00:01:00', onContinue });

    const wheelWhileActive = new WheelEvent('wheel', { cancelable: true });
    window.dispatchEvent(wheelWhileActive);
    expect(wheelWhileActive.defaultPrevented).toBe(true);

    document.querySelector<HTMLButtonElement>('[data-jomo-gate-action="continue"]')?.click();
    expect(onContinue).toHaveBeenCalledTimes(1);

    const wheelAfterClose = new WheelEvent('wheel', { cancelable: true });
    window.dispatchEvent(wheelAfterClose);
    expect(wheelAfterClose.defaultPrevented).toBe(false);
  });

  it('calls done callback and removes the gate', () => {
    const onDoneForNow = vi.fn();
    controller.show({ pageCount: 1, formattedDuration: '00:01:00', onDoneForNow });

    document.querySelector<HTMLButtonElement>('[data-jomo-gate-action="done"]')?.click();

    expect(onDoneForNow).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-jomo-pause-gate="true"]')).toBeNull();
    expect(controller.isActive()).toBe(false);
  });

  it('cleanup removes the gate and restores scrolling', () => {
    controller.show({ pageCount: 1, formattedDuration: '00:01:00' });
    expect(controller.isActive()).toBe(true);

    controller.cleanup();

    expect(controller.isActive()).toBe(false);
    expect(document.querySelector('[data-jomo-pause-gate="true"]')).toBeNull();

    const wheelAfter = new WheelEvent('wheel', { cancelable: true });
    window.dispatchEvent(wheelAfter);
    expect(wheelAfter.defaultPrevented).toBe(false);
  });

  it('lets the user type in editable fields without intercepting keys', () => {
    controller.show({ pageCount: 1, formattedDuration: '00:01:00' });

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const keyEvent = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
    Object.defineProperty(keyEvent, 'target', { value: input });
    window.dispatchEvent(keyEvent);

    expect(keyEvent.defaultPrevented).toBe(false);
  });
});
