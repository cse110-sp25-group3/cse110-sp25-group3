
(function() {
  // 1. Configuration: images, titles, and descriptions for three pages
  const pages = [
    {
      imgSrc: './onboarding/job-search.png',
      title: 'Discover Your Dream Role',
      desc: 'Swiftly browse jobs tailored to your field and see your compatibility.'
    },
    {
      imgSrc: './onboarding/resume.png',
      title: 'One-Tap Apply, No Forms',
      desc: 'Like it? Tap the check button. Simplify applications and skip tedious steps.'
    },
    {
      imgSrc: './onboarding/applicant.png',
      title: 'Track Progress, Instantly',
      desc: 'Easily view all your application statuses and stay updated on your job search.'
    }
  ];

  let currentIndex = 0;
  let isFadingOut = false;

  const introContainer = document.getElementById('intro-container');

  // Check localStorage: if already viewed, hide and exit
  if (localStorage.getItem('hasSeenIntro') === 'true') {
    introContainer.style.display = 'none';
    return;
  }

  // 2. Build DOM for three pages
  const dotContainer = document.createElement('div');
  dotContainer.className = 'intro-dots';

  pages.forEach((page, idx) => {
    // Wrapper for each page
    const pageDiv = document.createElement('div');
    pageDiv.className = 'intro-page';
    pageDiv.dataset.index = idx;

    // Only make the first page (idx=0) visible initially
    if (idx === 0) {
      pageDiv.classList.add('active');
    }

    // Image
    const img = document.createElement('img');
    img.src = page.imgSrc;
    img.alt = page.title;
    pageDiv.appendChild(img);

    // Title
    const titleEl = document.createElement('div');
    titleEl.className = 'intro-title';
    titleEl.textContent = page.title;
    pageDiv.appendChild(titleEl);

    // Description
    const descEl = document.createElement('div');
    descEl.className = 'intro-desc';
    descEl.textContent = page.desc;
    pageDiv.appendChild(descEl);

    // On the third page: add "Get Started" button
    if (idx === pages.length - 1) {
      const button = document.createElement('button');
      button.id = 'intro-start-button';
      button.textContent = 'Get Started';
      // Clicking the button triggers fade-out
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        fadeOutIntro();
      });
      pageDiv.appendChild(button);
    }

    // Append to the container
    introContainer.appendChild(pageDiv);

    // Also create bottom dot indicators
    const dot = document.createElement('div');
    dot.className = 'intro-dot';
    if (idx === 0) dot.classList.add('active');
    dotContainer.appendChild(dot);
  });

  introContainer.appendChild(dotContainer);

  // 3. Show introContainer and disable page scrolling
  introContainer.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent page scrolling

  // 4. Click anywhere (except the "Get Started" button) to go to the next page
  introContainer.addEventListener('click', function(e) {
    if (isFadingOut) return;
    if (currentIndex >= pages.length - 1) return;
    goToPage(currentIndex + 1);
  });

  // 5. Method to switch pages
  function goToPage(newIndex) {
    // Remove active from the current page
    const prevPage = introContainer.querySelector(`.intro-page[data-index="${currentIndex}"]`);
    const prevDot = dotContainer.children[currentIndex];
    if (prevPage) prevPage.classList.remove('active');
    if (prevDot) prevDot.classList.remove('active');

    // Add active to the new page
    const nextPage = introContainer.querySelector(`.intro-page[data-index="${newIndex}"]`);
    const nextDot = dotContainer.children[newIndex];
    if (nextPage) nextPage.classList.add('active');
    if (nextDot) nextDot.classList.add('active');

    currentIndex = newIndex;
  }

  // 6. Fade out intro and start main app logic
  function fadeOutIntro() {
    isFadingOut = true;
    // Add fade-out transition, then hide and restore scrolling
    introContainer.style.transition = 'opacity 0.3s ease-in-out';
    introContainer.style.opacity = '0';
    setTimeout(() => {
      introContainer.style.display = 'none';
      introContainer.style.opacity = '1';
      introContainer.style.transition = '';
      document.body.style.overflow = '';
      localStorage.setItem('hasSeenIntro', 'true');
      if (typeof window.startOnboarding === 'function') {
        console.log('>> intro: calling startOnboarding()'); // debugging
        window.startOnboarding();
      } else {
        console.warn('>> intro: window.startOnboarding is not defined');
      }
    }, 300);
  }
})();
