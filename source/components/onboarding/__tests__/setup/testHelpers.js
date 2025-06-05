// __tests__/setup/testHelpers.js

/**
 * Shared test setup helpers
 * Used for DOM initialization across all test files
 */

export function setupDOM() {
  // 1. Clear document.body
  document.body.innerHTML = '';

  // 2. Create phone container
  const phoneDiv = document.createElement('div');
  phoneDiv.className = 'phone';
  phoneDiv.style.cssText = 'position: relative; width: 375px; height: 667px;';
  document.body.appendChild(phoneDiv);

  // 3. Create onboarding container
  const onboardingContainer = document.createElement('div');
  onboardingContainer.id = 'onboarding-container';
  onboardingContainer.style.cssText = 'position:absolute; top:0; left:0; width:375px; height:667px;';
  document.body.appendChild(onboardingContainer);

  // 4. Create hamburger button
  const hamburgerBtn = document.createElement('button');
  hamburgerBtn.className = 'hamburger-btn';
  hamburgerBtn.style.cssText = 'position:absolute; left:20px; top:20px; width:40px; height:40px;';
  document.body.appendChild(hamburgerBtn);

  // 5. Create navigation links
  const navLinks = [
    { id: 'nav-feed', text: 'Feed' },
    { id: 'nav-preferences', text: 'Preferences' },
    { id: 'nav-applications', text: 'Applications' },
    { id: 'nav-documents', text: 'Documents' }
  ];

  const nav = document.createElement('nav');
  nav.style.cssText = 'position:absolute; left:20px; top:100px;';
  
  navLinks.forEach((link, index) => {
    const a = document.createElement('a');
    a.id = link.id;
    a.textContent = link.text;
    a.href = '#';
    a.style.cssText = `display:block; margin:10px 0; padding:10px; width:120px;`;
    nav.appendChild(a);
  });
  
  document.body.appendChild(nav);

  return {
    phoneDiv,
    onboardingContainer,
    hamburgerBtn,
    nav
  };
}

/**
 * Creates a mock getBoundingClientRect
 */
export function mockGetBoundingClientRect(element, rect) {
  Object.defineProperty(element, 'getBoundingClientRect', {
    value: () => ({
      left: rect.left || 0,
      top: rect.top || 0,
      width: rect.width || 100,
      height: rect.height || 50,
      right: (rect.left || 0) + (rect.width || 100),
      bottom: (rect.top || 0) + (rect.height || 50)
    }),
    configurable: true
  });
}

/**
 * Cleanup function
 */
export function cleanupDOM() {
  document.body.innerHTML = '';
  localStorage.clear();
}

/**
 * Wait function (for asynchronous tests)
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}