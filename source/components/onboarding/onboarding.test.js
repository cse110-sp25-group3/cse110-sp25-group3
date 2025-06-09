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
} = require('./onboarding');

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

  test('start() should show the container and render step 1 tooltip (disabled Next)', () => {
    // simulate intro is done and onboarding not yet
    localStorage.setItem(CONFIG.STORAGE_KEYS.SEEN_INTRO, 'true');
    localStorage.removeItem(CONFIG.STORAGE_KEYS.SEEN_ONBOARDING);

    manager.start();

    const container = document.getElementById(CONFIG.CONTAINER_ID);
    expect(container.style.display).toBe('block');

    const tooltip = container.querySelector('.onboarding-tooltip');
    expect(tooltip).not.toBeNull();
    expect(manager.currentStep).toBe(0);

    // Next button disabled until interaction
    const nextBtn = tooltip.querySelector('.tooltip-next');
    expect(nextBtn.disabled).toBe(true);
  });

    test('handleTip1Interaction() should mark step1 complete and update tooltip text', () => {
    jest.useFakeTimers(); 
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.SEEN_INTRO, 'true');
    manager.start();

    manager.handleTip1Interaction();
    expect(manager.tip1Completed).toBe(true);

    jest.runAllTimers();  

    const container = document.getElementById(CONFIG.CONTAINER_ID);
    const tooltip  = container.querySelector('.onboarding-tooltip');
    expect(tooltip).not.toBeNull();

    const text = tooltip.querySelector('.tooltip-text').textContent;
    expect(text).toMatch(/Excellent! You open the main menu/);

    const nextBtn = tooltip.querySelector('.tooltip-next');
    expect(nextBtn.disabled).toBe(false);
    });

  test('finish() should hide container and set SEEN_ONBOARDING in localStorage', () => {
    manager.start();
    manager.finish();

    const container = document.getElementById(CONFIG.CONTAINER_ID);
    expect(container.style.display).toBe('none');
    expect(localStorage.getItem(CONFIG.STORAGE_KEYS.SEEN_ONBOARDING)).toBe('true');
  });
});
