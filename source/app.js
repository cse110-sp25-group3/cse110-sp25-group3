// pages/app.js

import { createHeader }       from './components/header.js';
import { renderFeed }         from './pages/feed/feed.js';
import { renderApplications } from './pages/applications/view-applications.js';
import { renderPreferences }  from './pages/preferences/job-preferences.js'; 
import { renderDocuments }    from './pages/documents/documents.js';

const pageMap = {
  'feed.html':              { render: renderFeed,         title: 'Job Feed' },
  'view-app.html': { render: renderApplications, title: 'Your Applications' },
  'job-pref.html':   { render: renderPreferences,  title: 'Job Preferences' },
  'documents.html':         { render: renderDocuments,    title: 'Documents' },
};
window.loadPage= function() {
  //const path = window.location.pathname;
  const path = window.location.pathname.split('/').pop(); // Get the last part of the path
  console.log('Current path:', path);

  // find the first key that the path ends with
  const key = Object
    .keys(pageMap)
    .find(k => path.endsWith(k))
    || 'feed.html';

  console.log('Matched key:', key);

  const { render, title } = pageMap[key];

  const app = document.getElementById('app');
  app.innerHTML = '';
  app.prepend(createHeader(title));

  const content = document.createElement('div');
  content.id = 'content';
  content.style.margin = '25px';
  app.append(content);

  console.log(`Calling render for ${key}`);
  render(content);

// Second phase of Onboarding will be automatically triggered in onboarding.js
window.addEventListener('popstate', () => {
  // If the user navigates forward/backward, still render the new page
  window.loadPage();
});
// ================================
// After rendering the current page, start Onboarding (if the user hasn't seen it yet)
// ================================
// if (typeof startOnboardingIfNeeded === 'function') {
  // startOnboardingIfNeeded will internally check localStorage;
  // it only shows up on the first visit or after clearing records
  // startOnboardingIfNeeded();
// }
}




window.addEventListener('DOMContentLoaded', loadPage);
window.addEventListener('popstate', loadPage);

