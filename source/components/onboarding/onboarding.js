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
    requiresInteraction: true,
    mobileOnly: true
  },
  {
    name: 'tip2',
    targetSelector: '.nav-link[data-label="Job Feed"]',
    text: 'The Job Feed page shows your skill match percentage for each position. \nClick "view detail" to see specific job and company information. \n\nClick ✅ at the bottom to apply for a job in one click, and click ❌ to quickly browse the next job.',
    placement: 'bottom-right',
    positionOffset: { left: -50, top: 0 }
  },
  {
    name: 'tip3',
    targetSelector: '.nav-link[data-label="Job Preferences"]', 
    text: 'By setting your desired criteria here, our system can refine its recommendations, ensuring you receive suggestions for more accurate and relevant positions',
    placement: 'bottom-right',
    positionOffset: { left: -50, top: 0 }
  },
  {
    name: 'tip4',
    targetSelector: '.nav-link[data-label="View Applications"]', 
    text: 'Here you can easily view all the jobs you have applied to and track their current status, keeping you informed every step of the way.',
    placement: 'bottom-right',
    positionOffset: { left: -50, top: 0 }
  },
  {
    name: 'tip5',
    targetSelector: '.nav-link[data-label="Your Documents"]', 
    text: 'Upload your resume in the Documents section. An updated profile greatly improves your skill matches. \nReady to see how well your skills align with top roles? \nClick finish button to upload your resume!',
    placement: 'bottom-right',
    positionOffset: { left: -50, top: -20 }
  }
];

  // UTILITY FUNCTIONS 
  const Utils = {
    isMobile: () => {
      return window.innerWidth < 768;
    },

    // test if the device is desktop
    isDesktop: () => {
      return window.innerWidth >= 768;
    },

    // get the filtered steps based on device type
    getFilteredSteps: () => {
      if (Utils.isDesktop()) {
        return STEPS.filter(step => !step.mobileOnly);
      }
      
      return STEPS;
    },


    getContainerRect: () => {
      const appElement = document.getElementById('app');
      if (appElement) {
        return appElement.getBoundingClientRect();
      }

      const phoneElement = document.querySelector('.phone');
      if (phoneElement) {
        return phoneElement.getBoundingClientRect();
      }
      return {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        right: window.innerWidth,
        bottom: window.innerHeight
      };
    },

    
    getPhoneRect: () => Utils.getContainerRect(),
    
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
      const containerRect = Utils.getContainerRect();
      
      // Get tooltip dimensions
      tooltipEl.classList.add('visible');
      const tooltipRect = tooltipEl.getBoundingClientRect();

      let left, top;

      // only for PC menu list
      const isDesktop = Utils.isDesktop();
      const sidebarWidth = isDesktop ? 250 : 0; 

      switch (placement) {
        case 'right':
          left = targetRect.right - containerRect.left + 15;
          top = targetRect.top - containerRect.top + (targetRect.height - tooltipRect.height) / 2;
          break;
        case 'bottom-right':
          left = targetRect.right - containerRect.left - tooltipRect.width + targetRect.width;
          top = targetRect.bottom - containerRect.top + 12;
          break;
        case 'bottom':
          left = targetRect.left - containerRect.left + (targetRect.width - tooltipRect.width) / 2;
          top = targetRect.bottom - containerRect.top + 12;
          break;
        case 'top':
          left = targetRect.left - containerRect.left + (targetRect.width - tooltipRect.width) / 2;
          top = targetRect.top - containerRect.top - tooltipRect.height - 12;
          break;
        case 'left':
          left = targetRect.left - containerRect.left - tooltipRect.width - 15;
          top = targetRect.top - containerRect.top + (targetRect.height - tooltipRect.height) / 2;
          break;
        default:
          left = targetRect.right - containerRect.left + 12;
          top = targetRect.top - containerRect.top + (targetRect.height - tooltipRect.height) / 2;
      }

      // Apply offsets
      if (offset.left) left += offset.left;
      if (offset.top) top += offset.top;

      
      if (isDesktop && left < sidebarWidth + 20) {
        left = sidebarWidth + 20;
      }

      // Boundary checks
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      
      left = Math.max(sidebarWidth + 12, Math.min(left, containerWidth - tooltipRect.width - 12));
      top = Math.max(12, Math.min(top, containerHeight - tooltipRect.height - 12));

      tooltipEl.style.left = `${left}px`;
      tooltipEl.style.top = `${top}px`;
    }
  }

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
    const containerRect = Utils.getContainerRect();

    // Calculate circle parameters
    const cx = rect.left - containerRect.left + rect.width / 2;
    const cy = rect.top - containerRect.top + rect.height / 2;
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
      const clickX = e.clientX - containerRect.left;
      const clickY = e.clientY - containerRect.top;
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

  //make sure the menu is visible before rendering the highlight
  async ensureMenuVisible(targetEl) {
    const mobileOverlay = document.querySelector('.mobile-overlay'); 
    const isMobile = Utils.isMobile();
    
    console.log('🔧 [FIX] Ensuring menu visibility for:', targetEl);
    console.log('🔧 [FIX] Is mobile:', isMobile);
    console.log('🔧 [FIX] Mobile overlay:', mobileOverlay);
    
    if (isMobile && mobileOverlay && !mobileOverlay.classList.contains('open')) { 
      console.log('🔧 [FIX] Mobile menu is hidden, opening it...');
      
     
      const hamburgerBtn = document.querySelector('.hamburger-btn');
      if (hamburgerBtn) {
        hamburgerBtn.click();
      }
      
      await new Promise(resolve => setTimeout(resolve, 350));
      
      console.log('🔧 [FIX] Menu animation completed');
    }
    return true;
  }

  async renderRectHighlight(targetEl) {
    console.log('[DEBUG] renderRectHighlight called for:', targetEl);
  
    await this.ensureMenuVisible(targetEl);
    const overlay = this.createOverlay();
    
    // reload target element to ensure it is visible
    const rect = targetEl.getBoundingClientRect();
    const containerRect = this.getCorrectContainerRect(targetEl);

    console.log(' [DEBUG] Target rect after menu adjustment:', rect);
    console.log(' [DEBUG] Container rect after menu adjustment:', containerRect);

    // Calculate relative position
    let left = rect.left - containerRect.left;
    let top = rect.top - containerRect.top;
    const width = rect.width;
    const height = rect.height;

    // soecial case:
    const isDesktop = Utils.isDesktop();
    const navMenu = document.querySelector('#nav-menu');
    const isInSidebar = isDesktop && navMenu && targetEl.closest('#nav-menu');
    
    if (isInSidebar) {
      console.log('🔧 [FIX] Desktop sidebar menu item detected');
      left = rect.left;
      top = rect.top;
    }

    console.log('🟦 [DEBUG] Final calculated position:', { left, top, width, height });

    if (width <= 0 || height <= 0) {
      console.error(' [ERROR] Invalid target dimensions:', { width, height });
      return;
    }

    // Create highlight rectangle
    this.highlightEl = document.createElement('div');
    this.highlightEl.className = 'highlight-rect';
    

    const padding = 4;
    const finalLeft = Math.max(0, left - padding);
    const finalTop = Math.max(0, top - padding);
    const finalWidth = width + (padding * 2);
    const finalHeight = height + (padding * 2);
    
    this.highlightEl.style.cssText = `
      position: ${isInSidebar ? 'fixed' : 'absolute'};
      left: ${finalLeft}px;
      top: ${finalTop}px;
      width: ${finalWidth}px;
      height: ${finalHeight}px;
      border: 4px solid #2563EB;
      background: rgba(37, 99, 235, 0.15);
      border-radius: 8px;
      box-sizing: border-box;
      pointer-events: none;
      z-index: 1003;
      animation: blue-pulse 2s infinite;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.4), 0 0 15px rgba(37, 99, 235, 0.3);
    `;
    
    console.log(' [DEBUG] Final highlight style:', this.highlightEl.style.cssText);
    if (isInSidebar) {
      document.body.appendChild(this.highlightEl);
    } else {
      this.container.appendChild(this.highlightEl);
    }
    
    // verify position after rendering
    setTimeout(() => {
      const highlightRect = this.highlightEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      
      console.log('🔍 [VERIFY] Position verification:');
      console.log('  - Target rect:', targetRect);
      console.log('  - Highlight rect:', highlightRect);
      console.log('  - Position match:', 
        Math.abs(highlightRect.left - targetRect.left) < 10 &&
        Math.abs(highlightRect.top - targetRect.top) < 10
      );
    }, 100);
    overlay.style.pointerEvents = 'none';
  }

  // get the correct container rect based on device type 
  getCorrectContainerRect(targetEl) {
    const isDesktop = Utils.isDesktop();
    const navMenu = document.querySelector('#nav-menu');
    const isInSidebar = isDesktop && navMenu && targetEl.closest('#nav-menu');
    
    if (isInSidebar) {
      return {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        right: window.innerWidth,
        bottom: window.innerHeight
      };
    } else {
      return Utils.getContainerRect();
    }
  }

  cleanup() {
    const allHighlights = this.container.querySelectorAll('.highlight-circle, .highlight-rect');
    allHighlights.forEach(highlight => {
      highlight.remove();
    });
    
    // clean up fixed highlights in body
    const bodyHighlights = document.body.querySelectorAll('.highlight-rect');
    bodyHighlights.forEach(highlight => {
      if (highlight.style.position === 'fixed') {
        highlight.remove();
      }
    });
    
    if (this.highlightEl) {
      if (this.highlightEl.parentNode) {
        this.highlightEl.parentNode.removeChild(this.highlightEl);
      }
      this.highlightEl = null;
    }
    
    if (this.overlay) {
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
      this.filteredSteps = []; 
      this.tip1Completed = false; 
    }

    init() {
      if (Utils.isOnboardingCompleted()) return;
      
      //according to device type, filter steps
      this.filteredSteps = Utils.getFilteredSteps();
      console.log(`📱 Device type: ${Utils.isMobile() ? 'Mobile' : 'Desktop'}`);
      console.log(`📝 Filtered steps:`, this.filteredSteps.map(s => s.name));
      
      // check if to start onboarding
      if (Utils.shouldStartOnboarding()) {
        this.waitForElements();
      }

      // Check localStorage flag to determine if onboarding should start
      const shouldStart = localStorage.getItem('shouldStartOnboarding') === 'true';
      if (shouldStart) {
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
      // PC: wait for the nav menu to be available, Mobile: wait for the hamburger button
      const firstStepSelector = this.filteredSteps.length > 0 ? this.filteredSteps[0].targetSelector : '#nav-menu a[href*="feed"]';
      
      Utils.waitForElement(firstStepSelector, (element) => {
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
      if (index < 0 || index >= this.filteredSteps.length) return;

      this.currentStep = index;
      const step = this.filteredSteps[index]; 
      const targetEl = document.querySelector(step.targetSelector);

      if (!targetEl) {
          console.log(` [ONBOARDING] Target element not found: ${step.targetSelector}`);
          
          if (index === 0) {
          setTimeout(() => this.renderStep(index), 2000);
          } else {
          console.log(` [ONBOARDING] Waiting for element: ${step.targetSelector}`);
          setTimeout(() => this.renderStep(index), 500);
          }
          return;
      }      
      
      console.log(` [ONBOARDING] Found target element for step ${index}:`, targetEl);
      
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
      
      const isMobileTip1 = step.name === 'tip1' && step.mobileOnly;
      
      if (isMobileTip1 && this.tip1Completed) {
          this.updateTooltipContent('Excellent! You opened the main menu, click Next to continue tutorial.');
          const nextBtn = this.tooltipEl.querySelector('.tooltip-next');
          nextBtn.disabled = false;
      } else {
          let displayText = step.text;
          if (Utils.isDesktop() && index === 0) {
              displayText = 'Welcome! Your navigation menu is already open on the left. Let\'s explore the key features of our platform.';
          }
          
          this.updateTooltipContent(displayText);
          
          if (step.isCircle && isMobileTip1) {
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
      
      prevBtn.style.display = index <= 0 ? 'none' : 'inline-block'; 
      nextBtn.textContent = index === this.filteredSteps.length - 1 ? 'Finish' : 'Next';
      
      // make sure the Next button is disabled for mobile tip1 until interaction
      const step = this.filteredSteps[index];
      const isMobileTip1 = step && step.name === 'tip1' && step.mobileOnly;
      
      if (isMobileTip1 && !this.tip1Completed) {
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
      if (this.currentStep < this.filteredSteps.length - 1) {
        this.goToStep(this.currentStep + 1);
      } else {
        this.finish();
      }
    }

    goToStep(index) {
      if (index < 0 || index >= this.filteredSteps.length) {
        return;
      }
    
      // tip1 special case: reset tip1Completed if going back to it
      const step = this.filteredSteps[index];
      if (step && step.name === 'tip1' && step.mobileOnly) {
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