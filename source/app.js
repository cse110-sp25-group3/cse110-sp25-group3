// pages/app.js

import { createHeader }       from './components/header.js';
import { renderFeed }         from './pages/feed/feed.js';
import { renderApplications } from './pages/applications/view-applications.js';
import { renderPreferences }  from './pages/preferences/job-preferences.js'; 
import { renderDocuments }    from './pages/documents/documents.js';

// 1) Now using the **exact** pathname as keys
const pageMap = {
  '/source/pages/feed/feed.html':         { render: renderFeed,         title: 'Job Feed' },
  '/source/pages/applications/view-app.html': { render: renderApplications, title: 'Your Applications' },
  '/source/pages/preferences/job-pref.html':   { render: renderPreferences,  title: 'Job Preferences' },
  '/source/pages/documents/documents.html':    { render: renderDocuments,    title: 'Your Documents' },
};

function loadPage() {
  const fullPath = window.location.pathname;
  const fileName = fullPath.split('/').pop(); // filename from path
  
  console.log('Current path:', fullPath);
  console.log('File name:', fileName);

  // prioritize full path over file name
  let key;
  if (pageMap[fullPath]) {
    key = fullPath;
  } else if (pageMap[fileName]) {
    key = fileName;
  } else {
    // default to feed.html if no match found
    key = pageMap['/source/pages/feed/feed.html'] ? '/source/pages/feed/feed.html' : 'feed.html';
  }

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

//expose loadPage function for testing onboarding
window.loadPage = loadPage;


window.addEventListener('DOMContentLoaded', loadPage);
window.addEventListener('popstate', loadPage);