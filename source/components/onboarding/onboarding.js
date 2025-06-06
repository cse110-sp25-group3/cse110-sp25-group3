/**
 * Onboarding System - Interactive Tutorial for Job Feed App
 * 
 * Architecture:
 * - OnboardingManager: Main controller, handles lifecycle
 * - StepRenderer: Handles rendering of individual steps
 * - TooltipPositioner: Handles tooltip positioning logic
 * - EventHandler: Manages all event listeners
 */

(function() {
  'use strict';

  // CONFIGURATION 
  const CONFIG = {
    CONTAINER_ID: 'onboarding-container',
    MAX_WAIT_ATTEMPTS: 10,
    WAIT_INTERVAL: 500,
    STEP_TRANSITION_DELAY: 300,
    STORAGE_KEYS: {
      SEEN_INTRO: 'hasSeenIntro',
      SEEN_ONBOARDING: 'hasSeenOnboarding'
    }
  };

  const STEPS = [
  {
    name: 'tip1',
    targetSelector: '.hamburger-btn',
    text: 'Welcome! To begin, please click on the menu button. This will reveal the main navigation, allowing you to access all the powerful features of our platform.',
    placement: 'right',
    isCircle: true,
    requiresInteraction: true
  },
  {
    name: 'tip2',
    targetSelector: '#nav-menu a[href*="feed"]', 
    text: 'The Job Feed page shows your skill match percentage for each position. \nClick "view detail" to see specific job and company information. \n\nClick ✅ at the bottom to apply for a job in one click, and click ❌ to quickly browse the next job.',
    placement: 'bottom-right',
    positionOffset: { left: -50, top: 0 }
  },
  {
    name: 'tip3',
    targetSelector: '#nav-menu a[href*="preferences"]', 
    text: 'By setting your desired criteria here, our system can refine its recommendations, ensuring you receive suggestions for more accurate and relevant positions',
    placement: 'bottom-right',
    positionOffset: { left: -50, top: 0 }
  },
  {
    name: 'tip4',
    targetSelector: '#nav-menu a[href*="applications"]', 
    text: 'Here you can easily view all the jobs you have applied to and track their current status, keeping you informed every step of the way.',
    placement: 'bottom-right',
    positionOffset: { left: -50, top: 0 }
  },
  {
    name: 'tip5',
    targetSelector: '#nav-menu a[href*="documents"]', 
    text: 'Upload your resume in the Documents section. An updated profile greatly improves your skill matches. \nReady to see how well your skills align with top roles? \nClick finish button to upload your resume!',
    placement: 'bottom-right',
    positionOffset: { left: -50, top: -20 }
  }
];
  // UTILITY FUNCTIONS
  const Utils = {
    getPhoneRect: () => document.querySelector('.phone').getBoundingClientRect(),
    
    waitForElement: (selector, callback, maxAttempts = CONFIG.MAX_WAIT_ATTEMPTS) => {
      let attempts = 0;
      const check = () => {
        attempts++;
        const element = document.querySelector(selector);
        if (element) {
          callback(element);
        } else if (attempts < maxAttempts) {
          setTimeout(check, CONFIG.WAIT_INTERVAL);
        } else {
          callback(null);
        }
      };
      check();
    },

    isOnboardingCompleted: () => localStorage.getItem(CONFIG.STORAGE_KEYS.SEEN_ONBOARDING) === 'true',
    
    shouldStartOnboarding: () => {
      return localStorage.getItem(CONFIG.STORAGE_KEYS.SEEN_INTRO) === 'true' && 
             !Utils.isOnboardingCompleted();
    },

    markOnboardingComplete: () => {
      localStorage.setItem(CONFIG.STORAGE_KEYS.SEEN_ONBOARDING, 'true');
    }
  };

  // EVENT HANDLER 
  class EventHandler {
    constructor() {
      this.listeners = new Map();
    }

    add(element, event, handler, options = false) {
      const key = `${element.tagName}-${event}`;
      if (this.listeners.has(key)) {
        this.remove(element, event);
      }
      element.addEventListener(event, handler, options);
      this.listeners.set(key, { element, event, handler, options });
    }

    remove(element, event) {
      const key = `${element.tagName}-${event}`;
      const listener = this.listeners.get(key);
      if (listener) {
        element.removeEventListener(event, listener.handler, listener.options);
        this.listeners.delete(key);
      }
    }

    clear() {
      this.listeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      this.listeners.clear();
    }
  }

  // TOOLTIP POSITIONER
  class TooltipPositioner {
    static position(tooltipEl, targetEl, placement, offset = {}) {
      const targetRect = targetEl.getBoundingClientRect();
      const phoneRect = Utils.getPhoneRect();
      
      // Get tooltip dimensions
      tooltipEl.classList.add('visible');
      const tooltipRect = tooltipEl.getBoundingClientRect();

      let left, top;

      switch (placement) {
        case 'right':
          left = targetRect.right - phoneRect.left + 15;
          top = targetRect.top - phoneRect.top + (targetRect.height - tooltipRect.height) / 2;
          break;
        case 'bottom-right':
          left = targetRect.right - phoneRect.left - tooltipRect.width + targetRect.width;
          top = targetRect.bottom - phoneRect.top + 12;
          break;
        default:
          left = targetRect.right - phoneRect.left + 12;
          top = targetRect.top - phoneRect.top + (targetRect.height - tooltipRect.height) / 2;
      }

      // Apply offsets
      if (offset.left) left += offset.left;
      if (offset.top) top += offset.top;

      // Boundary checks
      const phoneWidth = phoneRect.width;
      const phoneHeight = phoneRect.height;
      
      left = Math.max(12, Math.min(left, phoneWidth - tooltipRect.width - 12));
      top = Math.max(12, Math.min(top, phoneHeight - tooltipRect.height - 12));

      tooltipEl.style.left = `${left}px`;
      tooltipEl.style.top = `${top}px`;
    }
  }

  // STEP RENDERER 
  class StepRenderer {
    constructor(container, eventHandler) {
      this.container = container;
      this.eventHandler = eventHandler;
      this.overlay = null;
      this.highlightEl = null;
    }

    createOverlay() {
      if (!this.overlay) {
        this.overlay = document.createElement('div');
        this.overlay.className = 'onboarding-overlay';
        this.container.appendChild(this.overlay);
      }
      return this.overlay;
    }

    renderCircleHighlight(targetEl, onInteraction) {
      const overlay = this.createOverlay();
      const rect = targetEl.getBoundingClientRect();
      const phoneRect = Utils.getPhoneRect();

      // Calculate circle parameters
      const cx = rect.left - phoneRect.left + rect.width / 2;
      const cy = rect.top - phoneRect.top + rect.height / 2;
      const radius = Math.max(rect.width, rect.height) / 2 + 12;

      // Create highlight circle
      this.highlightEl = document.createElement('div');
      this.highlightEl.className = 'highlight-circle';
      this.highlightEl.style.cssText = `
        left: ${cx - radius}px;
        top: ${cy - radius}px;
        width: ${radius * 2}px;
        height: ${radius * 2}px;
      `;
      this.container.appendChild(this.highlightEl);

      // Set up interaction
      overlay.style.pointerEvents = 'auto';
      this.eventHandler.add(overlay, 'click', (e) => {
        const clickX = e.clientX - phoneRect.left;
        const clickY = e.clientY - phoneRect.top;
        const distance = Math.sqrt((clickX - cx) ** 2 + (clickY - cy) ** 2);
        
        if (distance <= radius) {
          targetEl.click();
          onInteraction();
        } else {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    }

    renderRectHighlight(targetEl) {
      const overlay = this.createOverlay();
      const rect = targetEl.getBoundingClientRect();
      const phoneRect = Utils.getPhoneRect();

      // Calculate relative position
      const left = rect.left - phoneRect.left;
      const top = rect.top - phoneRect.top;
      const width = rect.width;
      const height = rect.height;

      // Set CSS variables for rect cutout
      const leftPct = (left / phoneRect.width) * 100;
      const topPct = (top / phoneRect.height) * 100;
      const rightPct = ((left + width) / phoneRect.width) * 100;
      const bottomPct = ((top + height) / phoneRect.height) * 100;

      overlay.style.setProperty('--rect-left', `${leftPct}%`);
      overlay.style.setProperty('--rect-top', `${topPct}%`);
      overlay.style.setProperty('--rect-right', `${rightPct}%`);
      overlay.style.setProperty('--rect-bottom', `${bottomPct}%`);
      overlay.classList.remove('circle-cutout');
      overlay.classList.add('rect-cutout');

      // Create highlight rectangle
      this.highlightEl = document.createElement('div');
      this.highlightEl.className = 'highlight-rect';
      this.highlightEl.style.cssText = `
        left: ${left}px;
        top: ${top}px;
        width: ${width}px;
        height: ${height}px;
      `;
      this.container.appendChild(this.highlightEl);

      // Prevent interaction with other areas
      overlay.style.pointerEvents = 'auto';
      this.eventHandler.add(overlay, 'click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    }

    cleanup() {
        const allHighlights = this.container.querySelectorAll('.highlight-circle, .highlight-rect');
        allHighlights.forEach(highlight => {
            highlight.remove();
        });
      if (this.highlightEl) {
        this.highlightEl.remove();
        this.highlightEl = null;
      }
      
      if (this.overlay) {
        //this.overlay.style.pointerEvents = 'none';
        this.overlay.remove();
        this.overlay = null;
      }
      
    }
  }

  // MAIN ONBOARDING MANAGER 
  class OnboardingManager {
    constructor() {
      this.currentStep = 0;
      this.container = null;
      this.tooltipEl = null;
      this.eventHandler = new EventHandler();
      this.stepRenderer = null;
      this.hasStarted = false; 

      this.tip1Completed = false; 
    }

    init() {
      if (Utils.isOnboardingCompleted()) return;
      
      // check if to start onboarding
      if (Utils.shouldStartOnboarding()) {
        this.waitForElements();
      }

      // Check localStorage flag to determine if onboarding should start
      const shouldStart = localStorage.getItem('shouldStartOnboarding') === 'true';
      if (shouldStart) {
        // dont remove the flag, just wait for elements
        this.waitForElements();
      }

      // Listen for initialization events
      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', () => this.checkAndStart());
      } else {
        this.checkAndStart();
      }
      window.addEventListener('load', () => this.checkAndStart());
    }

    checkAndStart() {
      if (Utils.shouldStartOnboarding() && !this.hasStarted) {
        this.waitForElements();
      }
    }

    waitForElements() {
      Utils.waitForElement('.hamburger-btn', (element) => {
        if (element) {
          this.start();
        }
      });
    }

    start() {
      this.container = document.getElementById(CONFIG.CONTAINER_ID);
      if (!this.container) {
        return;
      }
      this.container.style.display = 'block';
      this.stepRenderer = new StepRenderer(this.container, this.eventHandler);
      
      this.createTooltip();
      this.renderStep(0);
    }

    createTooltip() {
      
      if (this.tooltipEl && this.tooltipEl.parentNode) {
        this.tooltipEl.parentNode.removeChild(this.tooltipEl);
      }
      
      this.tooltipEl = document.createElement('div');
      this.tooltipEl.className = 'onboarding-tooltip';
      this.container.appendChild(this.tooltipEl);

      this.tooltipEl.innerHTML = `
        <div class="tooltip-text"></div>
        <div class="tooltip-buttons">
          <button class="tooltip-prev">Back</button>
          <button class="tooltip-next">Next</button>
        </div>
      `;

      const prevBtn = this.tooltipEl.querySelector('.tooltip-prev');
      const nextBtn = this.tooltipEl.querySelector('.tooltip-next');
      
      prevBtn.addEventListener('click', () => {
        this.goToStep(this.currentStep - 1);
      });
      
      nextBtn.addEventListener('click', () => {
        this.handleNext();
      });
      }

    renderStep(index) {
    if (index < 0 || index >= STEPS.length) return;

    this.currentStep = index;
    const step = STEPS[index];
    const targetEl = document.querySelector(step.targetSelector);

    if (!targetEl) {
        console.log(`🔴 [ONBOARDING] Target element not found: ${step.targetSelector}`);
        
       
        if (index === 0) {
        setTimeout(() => this.renderStep(index), 2000);
        } else {
        
        console.log(`🔄 [ONBOARDING] Waiting for element: ${step.targetSelector}`);
        setTimeout(() => this.renderStep(index), 500);
        }
        return;
    }      
    
    console.log(`🟢 [ONBOARDING] Found target element for step ${index}:`, targetEl);
    
    const existingTooltips = document.querySelectorAll('.onboarding-tooltip');
    if (existingTooltips.length > 1) {
        existingTooltips.forEach((tooltip, i) => {
        if (i < existingTooltips.length - 1) {
            tooltip.remove();
        }
        });
    }
    
    this.stepRenderer.cleanup();
    this.updateTooltipButtons(index);
    
    // check if tip1 is completed
    if (index === 0 && this.tip1Completed) {
        this.updateTooltipContent('Excellent! You open the main menu, click Next to continue tutorial.');
        const nextBtn = this.tooltipEl.querySelector('.tooltip-next');
        nextBtn.disabled = false;
    } else {
        this.updateTooltipContent(step.text);
        
        if (step.isCircle) {
        this.stepRenderer.renderCircleHighlight(targetEl, () => this.handleTip1Interaction());
        } else {
        this.stepRenderer.renderRectHighlight(targetEl);
        }
    }

    TooltipPositioner.position(this.tooltipEl, targetEl, step.placement, step.positionOffset);
    this.tooltipEl.classList.add('visible');
    }

    updateTooltipButtons(index) {
      const prevBtn = this.tooltipEl.querySelector('.tooltip-prev');
      const nextBtn = this.tooltipEl.querySelector('.tooltip-next');
      
      prevBtn.style.display = index <= 1 ? 'none' : 'inline-block';
      nextBtn.textContent = index === STEPS.length - 1 ? 'Finish' : 'Next';
      
      // for tip1, disable next button until interaction
      if (index === 0 && !this.tip1Completed) {
        nextBtn.disabled = true;
      } else {
        nextBtn.disabled = false;
      }
    }

    updateTooltipContent(text) {
      this.tooltipEl.querySelector('.tooltip-text').textContent = text;
    }

    handleTip1Interaction() {
      this.tip1Completed = true;
      
      const highlightCircle = this.container.querySelector('.highlight-circle');
        if (highlightCircle) {
            highlightCircle.style.animation = 'none';
            highlightCircle.style.opacity = '0';
            highlightCircle.style.transition = 'opacity 0.3s ease';
        }

      // clean up existing tooltip for tip1 
      if (this.tooltipEl && this.tooltipEl.parentNode) {
        this.tooltipEl.parentNode.removeChild(this.tooltipEl);
        this.tooltipEl = null;
      }
      
      this.stepRenderer.cleanup();
      
      // 200ms delay to ensure cleanup is complete
      setTimeout(() => {
        this.createTooltip();
        
        this.renderStep(0);
      }, 200);
    }

    handleNext() {
      if (this.currentStep < STEPS.length - 1) {
        this.goToStep(this.currentStep + 1);
      } else {
        this.finish();
      }
    }

    goToStep(index) {
      if (index < 0 || index >= STEPS.length) {
        return;
      }
    
      if (index === 0) {
        this.tip1Completed = false;
      }
      
      this.stepRenderer.cleanup();
      this.renderStep(index);
    }

    finish() {
      this.stepRenderer.cleanup();
      this.container.style.display = 'none';
      Utils.markOnboardingComplete();
      this.tip1Completed = false; 
      setTimeout(() => {
    window.location.href = '/source/pages/documents/documents.html';
   }, 100);
    }
  }

  // =================== INITIALIZATION ===================
  const onboardingManager = new OnboardingManager();
  onboardingManager.init();

  // Export for manual testing
  window.startOnboarding = () => onboardingManager.start();
  window.triggerOnboarding = () => {
    localStorage.setItem(CONFIG.STORAGE_KEYS.SEEN_INTRO, 'true');
    localStorage.removeItem(CONFIG.STORAGE_KEYS.SEEN_ONBOARDING);
    onboardingManager.init();
  };

    // =================== TEST EXPORTS ===================
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      OnboardingManager,
      StepRenderer,
      EventHandler,
      TooltipPositioner,
      Utils,
    
      CONFIG,
      STEPS
    };
  }
})();