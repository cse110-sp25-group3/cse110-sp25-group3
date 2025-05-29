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
function loadPage() {
  const path = window.location.pathname;  
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
  content.style.paddingTop = '40px';
  app.append(content);

  console.log(`Calling render for ${key}`);
  render(content);
}

window.addEventListener('DOMContentLoaded', loadPage);
