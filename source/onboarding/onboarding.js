(function() {
  // —— 1. Step configuration: 5 Tips —— //
  const steps = [
    {
      name: 'Tip1',
      targetSelector: '.hamburger-btn',
      text: 'Please click this button to open the main menu',
      placement: 'right',
      isCircle: true
    },
    {
      name: 'Tip2',
      targetSelector: '#nav-feed',
      text: 'The Job Feed page shows your skill match percentage for each position. Click "view detail" to see specific job and company information. Use the check mark at the bottom to apply for a job in one click, and click the X to quickly browse the next job.',
      placement: 'bottom-right'
    },
    {
      name: 'Tip3',
      targetSelector: '#nav-preferences',
      text: 'Set your job preferences here so the system can recommend more accurate positions for you',
      placement: 'bottom-right'
    },
    {
      name: 'Tip4',
      targetSelector: '#nav-applications',
      text: 'You can view the jobs you have applied to and track their status.',
      placement: 'bottom-right'
    },
    {
      name: 'Tip5',
      targetSelector: '#nav-documents',
      text: 'Upload your resume or job documents here to better match you with positions.',
      placement: 'bottom-right'
    }
  ];

  let currentStep = 0;
  let overlay = null;
  let highlightEl = null;
  let tooltipEl = null;
  let overlayClickHandler = null;

  // —— If the second phase is already completed, do nothing —— //
  if (localStorage.getItem('hasSeenOnboarding') === 'true') {
    return;
  }

  // —— If the first phase is skipped, start the second phase on DOMContentLoaded —— //
  if (
    localStorage.getItem('hasSeenIntro') === 'true' &&
    localStorage.getItem('hasSeenOnboarding') !== 'true'
  ) {
    window.addEventListener('DOMContentLoaded', startOnboarding);
  }

  // —— 2. Function to start the second phase —— //
  function startOnboarding() {
    const phoneEl = document.querySelector('.phone');
    phoneEl.style.position = 'relative';

    // Create the overlay layer
    overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    phoneEl.appendChild(overlay);

    // Create the tooltip
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'onboarding-tooltip';
    phoneEl.appendChild(tooltipEl);

    // Build tooltip inner structure
    const textContainer = document.createElement('div');
    textContainer.className = 'tooltip-text';
    tooltipEl.appendChild(textContainer);

    const btnContainer = document.createElement('div');
    btnContainer.className = 'tooltip-buttons';
    tooltipEl.appendChild(btnContainer);

    // "Previous" button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'tooltip-prev';
    prevBtn.textContent = 'Back';
    prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
    btnContainer.appendChild(prevBtn);

    // "Next/Finish" button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'tooltip-next';
    nextBtn.textContent = 'Previous';
    nextBtn.addEventListener('click', () => {
      if (currentStep < steps.length - 1) {
        goToStep(currentStep + 1);
      } else {
        finishOnboarding();
      }
    });
    btnContainer.appendChild(nextBtn);

    // Start step one
    renderStep(0);
  }

  // —— 3. Render a specific step —— //
  function renderStep(index) {
    currentStep = index;
    const step = steps[index];
    const targetEl = document.querySelector(step.targetSelector);

    if (!targetEl) {
      console.warn(`Cannot find element: ${step.targetSelector}`);
      return;
    }

    // Clean up old highlights and events
    cleanupHighlight();

    // Set button states
    const prevBtn = tooltipEl.querySelector('.tooltip-prev');
    const nextBtn = tooltipEl.querySelector('.tooltip-next');
    
    prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
    nextBtn.textContent = index === steps.length - 1 ? 'Finish' : 'Next';
    nextBtn.disabled = false;

    // Render based on step type
    if (step.isCircle) {
      renderCircleHighlight(targetEl);
    } else {
      renderRectHighlight(targetEl);
    }

    // Set tooltip content and position
    const textContainer = tooltipEl.querySelector('.tooltip-text');
    textContainer.textContent = step.text;
    positionTooltip(targetEl, step.placement);
    
    // Show tooltip
    tooltipEl.classList.add('visible');
  }

  // —— 4. Tip1: Circular highlight —— //
  function renderCircleHighlight(targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const phoneRect = document.querySelector('.phone').getBoundingClientRect();

    // Calculate center coordinates and radius
    const cx = rect.left - phoneRect.left + rect.width / 2;
    const cy = rect.top - phoneRect.top + rect.height / 2;
    const radius = Math.max(rect.width, rect.height) / 2 + 12;

    // Set the circular cutout on the overlay layer
    const cxPct = (cx / phoneRect.width) * 100;
    const cyPct = (cy / phoneRect.height) * 100;
    const radiusPct = (radius / Math.min(phoneRect.width, phoneRect.height)) * 100;

    overlay.style.setProperty('--circle-x', `${cxPct}%`);
    overlay.style.setProperty('--circle-y', `${cyPct}%`);
    overlay.style.setProperty('--circle-radius', `${radiusPct}%`);
    overlay.classList.add('circle-cutout');

    // Create highlight circle
    highlightEl = document.createElement('div');
    highlightEl.className = 'highlight-circle';
    
    // Set position and size
    highlightEl.style.left = `${cx - radius}px`;
    highlightEl.style.top = `${cy - radius}px`;
    highlightEl.style.width = `${radius * 2}px`;
    highlightEl.style.height = `${radius * 2}px`;
    
    document.querySelector('.phone').appendChild(highlightEl);

    // Tip1 special logic: disable Next button, set up click detection
    const nextBtn = tooltipEl.querySelector('.tooltip-next');
    nextBtn.disabled = true;

    // Create click detection handler
    overlayClickHandler = (e) => {
      const phoneRect = document.querySelector('.phone').getBoundingClientRect();
      const clickX = e.clientX - phoneRect.left;
      const clickY = e.clientY - phoneRect.top;
      const distance = Math.sqrt((clickX - cx) ** 2 + (clickY - cy) ** 2);
      
      if (distance <= radius) {
        // If click is inside the circle area, trigger the hamburger button click
        targetEl.click();
        
        // Enable the Next button
        nextBtn.disabled = false;
        
        // Delay transition to the next step
        setTimeout(() => {
          goToStep(1);
        }, 300);
        
        return;
      }
      
      // If click is outside the circle area, prevent event
      e.preventDefault();
      e.stopPropagation();
    };

    overlay.addEventListener('click', overlayClickHandler);
  }

  // —— 5. Tip2-5: Rectangular highlight —— //
  function renderRectHighlight(targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const phoneRect = document.querySelector('.phone').getBoundingClientRect();

    // Calculate relative position
    const left = rect.left - phoneRect.left;
    const top = rect.top - phoneRect.top;
    const width = rect.width;
    const height = rect.height;

    // Set the rectangular cutout on the overlay layer
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

    // Create highlight rectangle border
    highlightEl = document.createElement('div');
    highlightEl.className = 'highlight-rect';
    
    // Set position and size
    highlightEl.style.left = `${left}px`;
    highlightEl.style.top = `${top}px`;
    highlightEl.style.width = `${width}px`;
    highlightEl.style.height = `${height}px`;
    
    document.querySelector('.phone').appendChild(highlightEl);

    // Prevent interaction with other areas
    overlayClickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    overlay.addEventListener('click', overlayClickHandler);
  }

  // —— 6. Tooltip position calculation —— //
  function positionTooltip(targetEl, placement) {
    const rect = targetEl.getBoundingClientRect();
    const phoneRect = document.querySelector('.phone').getBoundingClientRect();

    // Temporarily display to get dimensions
    tooltipEl.style.visibility = 'hidden';
    tooltipEl.classList.add('visible');
    const tooltipRect = tooltipEl.getBoundingClientRect();
    tooltipEl.style.visibility = 'visible';

    let left, top;

    switch (placement) {
      case 'right':
        left = rect.right - phoneRect.left + 15;
        top = rect.top - phoneRect.top + (rect.height - tooltipRect.height) / 2;
        break;
      case 'bottom-right':
        left = rect.right - phoneRect.left - tooltipRect.width + rect.width;
        top = rect.bottom - phoneRect.top + 12;
        break;
      default:
        left = rect.right - phoneRect.left + 12;
        top = rect.top - phoneRect.top + (rect.height - tooltipRect.height) / 2;
    }

    // Boundary checks
    const phoneWidth = phoneRect.width;
    const phoneHeight = phoneRect.height;
    
    if (left + tooltipRect.width > phoneWidth - 12) {
      left = phoneWidth - tooltipRect.width - 12;
    }
    if (left < 12) {
      left = 12;
    }
    if (top + tooltipRect.height > phoneHeight - 12) {
      top = phoneHeight - tooltipRect.height - 12;
    }
    if (top < 12) {
      top = 12;
    }

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
  }

  // —— 7. Switch to specified step —— //
  function goToStep(index) {
    if (index < 0 || index >= steps.length) return;
    
    cleanupHighlight();
    renderStep(index);
  }

  // —— 8. Clean up highlight elements and events —— //
  function cleanupHighlight() {
    if (highlightEl) {
      highlightEl.remove();
      highlightEl = null;
    }
    
    if (overlay) {
      // Remove event listener
      if (overlayClickHandler) {
        overlay.removeEventListener('click', overlayClickHandler);
        overlayClickHandler = null;
      }
      
      // Reset style classes
      overlay.classList.remove('circle-cutout', 'rect-cutout');
    }
  }

  // —— 9. Finish second phase —— //
  function finishOnboarding() {
    cleanupHighlight();
    
    if (overlay) overlay.remove();
    if (tooltipEl) tooltipEl.remove();

    // Mark as completed
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.removeItem('currentOnboardingStep');
  }

  // —— 10. Mount to global scope —— //
  window.startOnboarding = startOnboarding;
})();
