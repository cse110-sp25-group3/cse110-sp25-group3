// __tests__/stepRenderer.test.js

global.localStorage = {
  _store: {},
  getItem(key) { return this._store[key] || null; },
  setItem(key, value) { this._store[key] = String(value); },
  removeItem(key) { delete this._store[key]; },
  clear() { this._store = {}; }
};

const { StepRenderer, EventHandler } = require('../onboarding.js');

describe('StepRenderer', () => {
  let container, stepRenderer, eventHandler;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="phone" style="position: relative; width: 375px; height: 667px;">
        <div id="onboarding-container" style="position:absolute; top:0; left:0;"></div>
      </div>
    `;
    
    container = document.getElementById('onboarding-container');
    eventHandler = new EventHandler();
    stepRenderer = new StepRenderer(container, eventHandler);
  });

  test('createOverlay should create only one overlay', () => {
    const overlay1 = stepRenderer.createOverlay();
    const overlay2 = stepRenderer.createOverlay();
    
    expect(overlay1).toBe(overlay2);
    expect(container.querySelectorAll('.onboarding-overlay').length).toBe(1);
  });

  test('cleanup should remove all elements', () => {
    stepRenderer.createOverlay();
    

    const highlight = document.createElement('div');
    highlight.className = 'highlight-circle';
    container.appendChild(highlight);
    stepRenderer.highlightEl = highlight;
    
    stepRenderer.cleanup();
    
    expect(container.querySelector('.onboarding-overlay')).toBeNull();
    expect(container.querySelector('.highlight-circle')).toBeNull();
  });
});
