/**
 * Intro Carousel System - Welcome screens before onboarding
 * 
 * Responsibilities:
 * - Display three intro pages with images and descriptions
 * - Handle page navigation (click to advance)
 * - Manage pagination dots
 * - Transition to onboarding system
 */

(function() {
  'use strict';

  // CONFIGURATION 
  const CONFIG = {
    CONTAINER_ID: 'intro-container',
    STORAGE_KEY: 'hasSeenIntro',
    FADE_DURATION: 300
  };

  const PAGES = [
    {
      imgSrc: './components/onboarding/job-search.png',
      title: 'Discover Your Dream Role',
      desc: 'Welcome to JobSwipe! Dive into your Job Feed to quickly browse opportunities perfectly tailored to your skills, complete with a clear compatibility score for each role.'
    },
    {
      imgSrc: './components/onboarding/resume.png',
      title: 'Effortless One-Tap Applications',
      desc: 'Found a job you love? Just tap the checkmark to apply instantly. Say goodbye to lengthy forms and tedious steps.'
    },
    {
      imgSrc: './components/onboarding/applicant.png',
      title: 'Monitor Your Applications in Real-Time',
      desc: 'Keep tabs on your career journey. Easily view the status of all your applications and stay updated every step of the way.'
    }
  ];

  // INTRO MANAGER
  class IntroManager {
    constructor() {
      this.currentIndex = 0;
      this.isFadingOut = false;
      this.container = document.getElementById(CONFIG.CONTAINER_ID);
      this.dotContainer = null;
    }

    init() {
      if (!this.container) {
        return;
      }

      if (this.isCompleted()) {
        this.container.style.display = 'none';
        return;
      }

      this.buildPages();
      this.setupEventListeners();
      this.show();
    }

    isCompleted() {
      return localStorage.getItem(CONFIG.STORAGE_KEY) === 'true';
    }

    buildPages() {
      this.dotContainer = document.createElement('div');
      this.dotContainer.className = 'intro-dots';

      PAGES.forEach((page, index) => {
        this.createPage(page, index);
        this.createDot(index);
      });

      this.container.appendChild(this.dotContainer);
    }

    createPage(page, index) {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'intro-page';
      pageDiv.dataset.index = index;
      
      if (index === 0) {
        pageDiv.classList.add('active');
      }

      pageDiv.innerHTML = `
        <img src="${page.imgSrc}" alt="${page.title}">
        <div class="intro-title">${page.title}</div>
        <div class="intro-desc">${page.desc}</div>
        ${index === PAGES.length - 1 ? '<button id="intro-start-button">Get Started</button>' : ''}
      `;

      this.container.appendChild(pageDiv);

      // Add start button event listener
      if (index === PAGES.length - 1) {
        const startBtn = pageDiv.querySelector('#intro-start-button');
        startBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.finish();
        });
      }
    }

    createDot(index) {
      const dot = document.createElement('div');
      dot.className = 'intro-dot';
      if (index === 0) dot.classList.add('active');
      this.dotContainer.appendChild(dot);
    }

    setupEventListeners() {
      this.container.addEventListener('click', (e) => {
        if (this.isFadingOut || this.currentIndex >= PAGES.length - 1) return;
        this.goToPage(this.currentIndex + 1);
      });
    }

    goToPage(newIndex) {
      if (newIndex < 0 || newIndex >= PAGES.length) return;

      // Update previous page and dot
      const prevPage = this.container.querySelector(`[data-index="${this.currentIndex}"]`);
      const prevDot = this.dotContainer.children[this.currentIndex];
      if (prevPage) prevPage.classList.remove('active');
      if (prevDot) prevDot.classList.remove('active');

      // Update new page and dot
      const nextPage = this.container.querySelector(`[data-index="${newIndex}"]`);
      const nextDot = this.dotContainer.children[newIndex];
      if (nextPage) nextPage.classList.add('active');
      if (nextDot) nextDot.classList.add('active');

      this.currentIndex = newIndex;
    }

    show() {
      this.container.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }

    finish() {
      this.isFadingOut = true;
      this.container.classList.add('fade-out');

      setTimeout(() => {
        this.container.style.display = 'none';
        this.container.style.opacity = '1';
        this.container.style.transition = '';
        document.body.style.overflow = '';
        
        localStorage.setItem(CONFIG.STORAGE_KEY, 'true');
        this.startOnboarding();
      }, CONFIG.FADE_DURATION);
    }

    startOnboarding() {
     localStorage.setItem('shouldStartOnboarding', 'true');//new
    window.location.href = '/source/pages/feed/feed.html';

    //if (typeof window.startOnboarding === 'function') {
    //  window.startOnboarding();//old
    //} 
    }
  }

  // =================== INITIALIZATION ===================
  const introManager = new IntroManager();
  introManager.init();

  // =================== TEST EXPORTS ===================
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      IntroManager,
      CONFIG,
      PAGES
    };
  }

})();