export function createHeader() {
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <button id="menu-toggle" class="hamburger-btn" aria-label="Open menu">☰</button>
      <span class="site-title">${document.title}</span>
    `;

    const nav = document.createElement('nav');
    nav.id = 'nav-menu';
    nav.className="nav-menu";
    [
        { path: '/source/pages/feed/feed.html',         label: 'Job Feed' },
        { path: '/source/pages/preferences/job-pref.html',   label: 'Job Preferences' },
        { path: '/source/pages/applications/view-app.html', label: 'View Applications' },
        { path: '/source/pages/documents/documents.html',         label: 'Your Documents' },
      ].forEach(({path,label}) => {
        const a = document.createElement('a');
        a.href = path;
        a.textContent = label;
        nav.append(a);
      });
      header.append(nav);
  
    // ── Mobile menu toggle ──
    const btn  = header.querySelector('#menu-toggle');
    const menu = header.querySelector('#nav-menu');
    btn.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('show');
      btn.classList.toggle('rotated', isOpen);
      if (isOpen) {
        btn.textContent = '✕';
        btn.setAttribute('aria-label', 'Close menu');
      } else {
        btn.textContent = '☰';
        btn.setAttribute('aria-label', 'Open menu');
      }
    });
  
    // ── Highlight “current” link based on filename ──
    const links = header.querySelectorAll('#nav-menu a');

    function highlightCurrent() {
      const currentPath = window.location.pathname; // e.g. "/pages/feed/feed.html"
      links.forEach(link => {
        // Build an absolute URL so pathname is normalized
        const linkPath = new URL(link.getAttribute('href'), window.location.origin).pathname;
        link.classList.toggle('active', linkPath === currentPath);
      });
    }
    
    // Run on initial load
    highlightCurrent();

    // ── Auto-close on link click ──
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // stop immediate navigation

        // Collapse menu
        menu.classList.remove('show');
        btn.classList.remove('rotated');
        btn.textContent = '☰';
        btn.setAttribute('aria-label', 'Open menu');

        // Delay navigation to allow animation
        const href = link.href;
        setTimeout(() => {
        window.location.href = href;
        }, 325);
    });
    });
  
    return header;
  }
  