// __tests__/tooltipPositioner.test.js
global.localStorage = {
  _store: {},
  getItem(key) { return this._store[key] || null; },
  setItem(key, value) { this._store[key] = String(value); },
  removeItem(key) { delete this._store[key]; },
  clear() { this._store = {}; }
};


const { TooltipPositioner } = require('../onboarding.js');

describe('TooltipPositioner', () => {
  let phoneEl, tooltipEl, targetEl;

  beforeEach(() => {
    document.body.innerHTML = `
      <div class="phone" style="position: relative; width: 300px; height: 500px;">
        <div id="tooltip" style="position: absolute; width: 100px; height: 50px;"></div>
      </div>
      <div id="target" style="position: absolute;"></div>
    `;

    phoneEl = document.querySelector('.phone');
    tooltipEl = document.getElementById('tooltip');
    targetEl = document.getElementById('target');

    // Mock target's position and dimensions
    targetEl.getBoundingClientRect = jest.fn(() => ({
      left: 20,
      top: 30,
      width: 60,
      height: 40,
      right: 80,
      bottom: 70
    }));
  });

  test('should position tooltip without going off-screen', () => {
    Object.defineProperty(tooltipEl, 'offsetWidth', { value: 100, configurable: true });
    Object.defineProperty(tooltipEl, 'offsetHeight', { value: 50, configurable: true });
    Object.defineProperty(phoneEl, 'clientWidth', { value: 300, configurable: true });
    Object.defineProperty(phoneEl, 'clientHeight', { value: 500, configurable: true });

   
    TooltipPositioner.position(tooltipEl, targetEl, 'right', { left: 0, top: 0 });

    
    const leftPx       = parseInt(tooltipEl.style.left, 10);
    const topPx        = parseInt(tooltipEl.style.top, 10);
    const tooltipWidth = tooltipEl.offsetWidth;
    const tooltipHeight= tooltipEl.offsetHeight;
    const parentWidth  = phoneEl.clientWidth;
    const parentHeight = phoneEl.clientHeight;

    // Horizontal position: 0 ≤ leftPx ≤ parentWidth - tooltipWidth
    expect(leftPx).toBeGreaterThanOrEqual(0);
    expect(leftPx + tooltipWidth).toBeLessThanOrEqual(parentWidth);

    // Vertical position: 0 ≤ topPx ≤ parentHeight - tooltipHeight
    expect(topPx).toBeGreaterThanOrEqual(0);
    expect(topPx + tooltipHeight).toBeLessThanOrEqual(parentHeight);
  });

  test('should clamp position when out of bounds', () => {
    tooltipEl.style.width = '280px';

    // Manually mock width and height: offsetWidth = 280, offsetHeight = 50
    Object.defineProperty(tooltipEl, 'offsetWidth', { value: 280, configurable: true });
    Object.defineProperty(tooltipEl, 'offsetHeight', { value: 50, configurable: true });
    Object.defineProperty(phoneEl, 'clientWidth', { value: 300, configurable: true });
    Object.defineProperty(phoneEl, 'clientHeight', { value: 500, configurable: true });

    TooltipPositioner.position(tooltipEl, targetEl, 'right', { left: 0, top: 0 });

    const leftPx       = parseInt(tooltipEl.style.left, 10);
    const topPx        = parseInt(tooltipEl.style.top, 10);
    const tooltipWidth = tooltipEl.offsetWidth;
    const tooltipHeight= tooltipEl.offsetHeight;
    const parentWidth  = phoneEl.clientWidth;
    const parentHeight = phoneEl.clientHeight;

    // Clamp horizontal direction: left + tooltipWidth ≤ parentWidth, and leftPx ≥ 0
    expect(leftPx + tooltipWidth).toBeLessThanOrEqual(parentWidth);
    expect(leftPx).toBeGreaterThanOrEqual(0);

    // Vertical direction still within visible area: 0 ≤ topPx ≤ parentHeight - tooltipHeight
    expect(topPx).toBeGreaterThanOrEqual(0);
    expect(topPx + tooltipHeight).toBeLessThanOrEqual(parentHeight);
  });
});