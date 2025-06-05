// pages/app.js
import { createHeader }       from './components/header.js';
import { renderFeed }         from './pages/feed/feed.js';
import { renderApplications } from './pages/applications/view-applications.js';
import { renderPreferences }  from './pages/preferences/job-preferences.js'; 
import { renderDocuments }    from './pages/documents/documents.js';

//1) Now using the **exact** pathname as keys
const pageMap = {
  '/source/pages/feed/feed.html':         { render: renderFeed,         title: 'Job Feed' },
  '/source/pages/applications/view-app.html': { render: renderApplications, title: 'Your Applications' },
  '/source/pages/preferences/job-pref.html':   { render: renderPreferences,  title: 'Job Preferences' },
  '/source/pages/documents/documents.html':    { render: renderDocuments,    title: 'Your Documents' },
};

function loadPage() {
  const path = window.location.pathname;  
  console.log('Current path:', path);
  
  // 2) Special handling for index.html - redirect to feed if onboarding is complete
  if (path === '/source/index.html' || path.endsWith('index.html')) {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro') === 'true';
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
    
    if (hasSeenIntro && hasSeenOnboarding) {
      // Redirect to feed page instead of rendering in-place
      console.log('Redirecting completed user to feed page');
      window.location.href = '/source/pages/feed/feed.html';
      return;
    }
    
    // For users in onboarding process, don't render anything
    // Let onboarding system handle the UI
    console.log('User in onboarding process, skipping page render');
    return;
  }
  
  // 3) Look up the exact pathname in pageMap; fallback to feed
  const key = pageMap[path] ? path : '/source/pages/feed/feed.html';
  
  console.log('Matched key:', key);
  const { render, title } = pageMap[key];
  
  const app = document.getElementById('app');
  app.innerHTML = '';
  app.prepend(createHeader(title));
  
  const content = document.createElement('div');
  content.id = 'content';
  content.style.margin = '25px';
  content.style.paddingTop = '40px';
  app.append(content);
  
  console.log(`Calling render for ${key}`);
  render(content);
  
  checkAndStartOnboarding();
}

function checkAndStartOnboarding() {
  const shouldStart = localStorage.getItem('shouldStartOnboarding') === 'true';
  const hasSeenIntro = localStorage.getItem('hasSeenIntro') === 'true';
  const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
  
  if (shouldStart && hasSeenIntro && !hasSeenOnboarding) {
    localStorage.removeItem('shouldStartOnboarding');
    
    // wait for the page to fully load before starting onboarding
    setTimeout(() => {
      if (typeof window.startOnboarding === 'function') {
        console.log('Starting onboarding after page load');
        window.startOnboarding();
      }
    }, 500); 
  }
}

// Expose loadPage function for onboarding system
window.loadPage = loadPage;

window.addEventListener('DOMContentLoaded', loadPage);
window.addEventListener('popstate', loadPage);