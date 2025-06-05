// __tests__/onboardingManager.test.js

/**
 * @jest-environment jsdom
 */

global.localStorage = {
  _store: {},
  getItem(key) { return this._store[key] || null; },
  setItem(key, value) { this._store[key] = String(value); },
  removeItem(key) { delete this._store[key]; },
  clear() { this._store = {}; }
};

const { setupDOM, cleanupDOM, wait } = require('./setup/testHelpers');
const { 
  OnboardingManager, 
  StepRenderer, 
  EventHandler,
  Utils,
  CONFIG,
  STEPS 
} = require('../onboarding.js');

describe('OnboardingManager Core Functionality Tests', () => { 
  let manager;
  let container;

  beforeEach(() => {
    const domElements = setupDOM();
    container = domElements.onboardingContainer;
    

    manager = new OnboardingManager();
    manager.container = container;
    manager.eventHandler = new EventHandler();
    manager.stepRenderer = new StepRenderer(container, manager.eventHandler);
  });

  afterEach(() => {
    cleanupDOM();
    jest.clearAllMocks();
  });

  describe('Initialization and Startup', () => { 
    test('should correctly check startup conditions', () => { 
      expect(Utils.shouldStartOnboarding()).toBe(false);
      
      // Set intro and onboarding as completed
      localStorage.setItem('hasSeenIntro', 'true');
      expect(Utils.shouldStartOnboarding()).toBe(true);
      localStorage.setItem('hasSeenOnboarding', 'true');
      expect(Utils.shouldStartOnboarding()).toBe(false);
    });

    test('start() should initialize all components', () => { 
      manager.start();
      
      expect(container.style.display).toBe('block');
      expect(manager.tooltipEl).toBeTruthy();
      expect(container.querySelector('.onboarding-tooltip')).toBeTruthy();
    });
  });

  describe('Step Rendering', () => { 
    beforeEach(() => {
      // Manually create tooltip
      manager.createTooltip();
    });

    test('renderStep(0) should display the first step', () => { 
      manager.renderStep(0);
      
      const tooltip = container.querySelector('.onboarding-tooltip');
      const tooltipText = tooltip.querySelector('.tooltip-text');
      const nextBtn = tooltip.querySelector('.tooltip-next');
      const highlightCircle = container.querySelector('.highlight-circle');
      
      expect(tooltipText.textContent).toBe(STEPS[0].text);
      expect(nextBtn.disabled).toBe(true);
      expect(highlightCircle).toBeTruthy();
    });

    test('after tip1 completion, should update text and enable Next button', () => { 
      manager.tip1Completed = true;
      manager.renderStep(0);
      
      const tooltipText = container.querySelector('.tooltip-text');
      const nextBtn = container.querySelector('.tooltip-next');
      
      expect(tooltipText.textContent).toContain('Great! The menu is open');
      expect(nextBtn.disabled).toBe(false);
      expect(container.querySelector('.highlight-circle')).toBeFalsy();
    });
  });

  describe('Interaction Handling', () => { 
    test('handleTip1Interaction should update status and recreate tooltip', async () => { 
      jest.useFakeTimers();
      
      manager.createTooltip();
      manager.renderStep(0);
      
      const initialTooltip = manager.tooltipEl;
      
      // Trigger interaction
      manager.handleTip1Interaction();
      
      expect(manager.tip1Completed).toBe(true);
      expect(manager.tooltipEl).toBeNull();
      
      jest.advanceTimersByTime(200);
      
      expect(manager.tooltipEl).toBeTruthy();
      expect(manager.tooltipEl).not.toBe(initialTooltip);
      
      jest.useRealTimers();
    });

    test('handleNext should switch to the next step', () => { 
      manager.createTooltip();
      manager.currentStep = 0;
      manager.tip1Completed = true;
      
      const renderStepSpy = jest.spyOn(manager, 'renderStep');
      
      manager.handleNext();
      
      expect(renderStepSpy).toHaveBeenCalledWith(1);
    });

    test('handleNext on the last step should call finish', () => { 
      manager.currentStep = STEPS.length - 1;
      const finishSpy = jest.spyOn(manager, 'finish');
      
      manager.handleNext();
      
      expect(finishSpy).toHaveBeenCalled();
    });
  });

  describe('Completion Flow', () => { 
    test('finish() should clean up and mark as complete', () => { 
      manager.createTooltip();
      manager.renderStep(0);
      
      manager.finish();
      
      expect(container.style.display).toBe('none');
      expect(localStorage.getItem('hasSeenOnboarding')).toBe('true');
      expect(manager.tip1Completed).toBe(false);
    });
  });
});