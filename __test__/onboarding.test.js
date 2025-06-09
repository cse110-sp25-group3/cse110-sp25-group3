/**
 * @jest-environment jsdom
 */

/**
 * onboarding.test.js
 */

const {
  OnboardingManager,
  Utils,
  CONFIG,
  STEPS
} = require('../source/components/onboarding/onboarding');

describe('OnboardingManager', () => {
  let manager;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="phone" style="position:relative;">
        <button class="hamburger-btn">Menu</button>
        <div id="${CONFIG.CONTAINER_ID}"></div>
      </div>
    `;
    localStorage.clear();
    manager = new OnboardingManager();
  });

  test('finish() should hide container and set SEEN_ONBOARDING in localStorage', () => {
    manager.start();
    manager.finish();

    const container = document.getElementById(CONFIG.CONTAINER_ID);
    expect(container.style.display).toBe('none');
    expect(localStorage.getItem(CONFIG.STORAGE_KEYS.SEEN_ONBOARDING)).toBe('true');
  });
});
