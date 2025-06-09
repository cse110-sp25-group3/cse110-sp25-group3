export function createHeader(){    
    const navData = [
        { path: '/source/pages/feed/feed.html', label: 'Job Feed', icon: '📋' },
        { path: '/source/pages/preferences/job-pref.html', label: 'Job Preferences', icon: '⚙️' },
        { path: '/source/pages/applications/view-app.html', label: 'View Applications', icon: '📄' },
        { path: '/source/pages/documents/documents.html', label: 'Your Documents', icon: '📁' },
    ];

    let isDesktop = window.innerWidth >= 768;
    let mobileMenuOpened = false;
    let activeLink = '';

    // Create desktop sidebar
    const desktopSidebar = document.createElement('nav');
    desktopSidebar.className = 'desktop-sidebar';

    // Desktop header with logo
    const desktopHeader = document.createElement('div');
    desktopHeader.className = 'desktop-header';
    desktopHeader.innerHTML = `<span class="desktop-title">JobSwipe</span>`;

    // Desktop main navigation
    const desktopMain = document.createElement('div');
    desktopMain.className = 'desktop-main';

    desktopSidebar.appendChild(desktopHeader);
    desktopSidebar.appendChild(desktopMain);

    // Create mobile header
    const mobileHeader = document.createElement('div');
    mobileHeader.className = 'mobile-header';
    if (!isDesktop) mobileHeader.classList.add('visible');

    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger-btn';
    hamburger.innerHTML = '☰';
    hamburger.setAttribute('aria-label', 'Open menu');

    const mobileTitle = document.createElement('span');
    mobileTitle.className = 'mobile-title';
    mobileTitle.textContent = 'JobSwipe';

    mobileHeader.appendChild(hamburger);
    mobileHeader.appendChild(mobileTitle);

    // Create mobile overlay menu
    const mobileOverlay = document.createElement('nav');
    mobileOverlay.className = 'mobile-overlay';
    if (!isDesktop) mobileOverlay.classList.add('visible');

    const mobileMain = document.createElement('div');
    mobileMain.className = 'mobile-main';

    mobileOverlay.appendChild(mobileMain);

    // Create navigation links
    function createNavLink(item, isMobile = false) {
        const link = document.createElement('a');
        link.href = item.path;
        link.className = 'nav-link';
        link.setAttribute('data-path', item.path);
        link.setAttribute('data-label', item.label);
        link.innerHTML = `<span class="nav-icon">${item.icon}</span><span>${item.label}</span>`;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active state immediately
            setActiveLink(item.label);
            
            // Close mobile menu if open
            if (!isDesktop && mobileMenuOpened) {
                closeMobileMenu();
            }
            
            // Navigate after animation
            setTimeout(() => {
                window.location.href = item.path;
            }, isDesktop ? 0 : 325);
        });
        
        return link;
    }

    // Populate navigation links
    function populateNavigation() {
        // Clear existing links
        desktopMain.innerHTML = '';
        mobileMain.innerHTML = '';
        
        navData.forEach(item => {
            desktopMain.appendChild(createNavLink(item, false));
            mobileMain.appendChild(createNavLink(item, true));
        });
        
        // Highlight current page after populating
        setTimeout(() => highlightCurrent(), 0);
    }

    // Enhanced active link setting
    function setActiveLink(label) {
        activeLink = label;
        
        // Remove active class from all links
        const allNavLinks = document.querySelectorAll('.nav-link');
        allNavLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to matching links
        const activeLinks = document.querySelectorAll(`[data-label="${label}"]`);
        activeLinks.forEach(link => {
            link.classList.add('active');
        });
        
        console.log(`Active link set to: ${label}`); // Debug log
    }

    // Enhanced current page highlighting
    function highlightCurrent() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        const fullCurrentPath = currentPath + currentHash;
        
        console.log(`Current path: ${currentPath}`); // Debug log
        console.log(`Full current path: ${fullCurrentPath}`); // Debug log
        
        // First try exact path match
        let matchedItem = navData.find(item => {
            const linkPath = new URL(item.path, window.location.origin).pathname;
            return linkPath === currentPath;
        });
        
        // If no exact match, try filename matching
        if (!matchedItem) {
            const currentFile = currentPath.split('/').pop() || 'index.html';
            matchedItem = navData.find(item => {
                const itemFile = item.path.split('/').pop();
                return itemFile === currentFile;
            });
        }
        
        // If still no match, try partial path matching
        if (!matchedItem) {
            matchedItem = navData.find(item => {
                const itemPathParts = item.path.split('/');
                const currentPathParts = currentPath.split('/');
                
                // Check if current path contains the key parts of the nav item path
                return itemPathParts.some(part => 
                    part && currentPathParts.includes(part)
                );
            });
        }
        
        // If still no match, try matching by keywords in path
        if (!matchedItem) {
            const pathKeywords = currentPath.toLowerCase();
            matchedItem = navData.find(item => {
                const itemKeywords = item.path.toLowerCase();
                const labelKeywords = item.label.toLowerCase();
                
                return pathKeywords.includes('feed') && (itemKeywords.includes('feed') || labelKeywords.includes('feed')) ||
                       pathKeywords.includes('preference') && (itemKeywords.includes('preference') || labelKeywords.includes('preference')) ||
                       pathKeywords.includes('application') && (itemKeywords.includes('application') || labelKeywords.includes('application')) ||
                       pathKeywords.includes('document') && (itemKeywords.includes('document') || labelKeywords.includes('document'));
            });
        }
        
        if (matchedItem) {
            console.log(`Matched item: ${matchedItem.label}`); // Debug log
            setActiveLink(matchedItem.label);
        } else {
            console.log('No matching navigation item found'); // Debug log
            // Clear all active states if no match
            const allNavLinks = document.querySelectorAll('.nav-link');
            allNavLinks.forEach(link => {
                link.classList.remove('active');
            });
        }
    }

    // Mobile menu functions
    function openMobileMenu() {
        mobileMenuOpened = true;
        mobileOverlay.classList.add('open');
        hamburger.innerHTML = '✕';
        hamburger.setAttribute('aria-label', 'Close menu');
        hamburger.style.transform = 'rotate(90deg)';
    }

    function closeMobileMenu() {
        mobileMenuOpened = false;
        mobileOverlay.classList.remove('open');
        hamburger.innerHTML = '☰';
        hamburger.setAttribute('aria-label', 'Open menu');
        hamburger.style.transform = 'rotate(0deg)';
    }

    // Handle hamburger click
    hamburger.addEventListener('click', () => {
        if (mobileMenuOpened) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Handle window resize
    function handleResize() {
        const wasDesktop = isDesktop;
        isDesktop = window.innerWidth >= 768;
        
        if (wasDesktop !== isDesktop) {
            // Update mobile header visibility
            mobileHeader.classList.toggle('visible', !isDesktop);
            mobileOverlay.classList.toggle('visible', !isDesktop);
            
            // Close mobile menu when switching to desktop
            if (isDesktop && mobileMenuOpened) {
                closeMobileMenu();
            }
            
            // Re-highlight current page after layout change
            setTimeout(() => highlightCurrent(), 100);
        }
    }

    // Enhanced navigation detection
    function setupNavigationDetection() {
        // Listen for page navigation
        window.addEventListener('popstate', () => {
            setTimeout(() => highlightCurrent(), 100);
        });
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            setTimeout(() => highlightCurrent(), 100);
        });
        
        // Periodic check for navigation changes (fallback)
        let lastPath = window.location.pathname;
        let lastHash = window.location.hash;
        
        setInterval(() => {
            const currentPath = window.location.pathname;
            const currentHash = window.location.hash;
            
            if (currentPath !== lastPath || currentHash !== lastHash) {
                lastPath = currentPath;
                lastHash = currentHash;
                highlightCurrent();
            }
        }, 500);
        
        // Also check when the page becomes visible (handles back/forward navigation)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                setTimeout(() => highlightCurrent(), 100);
            }
        });
    }

    // Setup resize listener
    window.addEventListener('resize', handleResize);

    // Create container
    const container = document.createElement('div');
    container.className = 'header-container';
    
    // Initialize everything
    populateNavigation();
    setupNavigationDetection();
    
    // Initial highlighting with delay to ensure DOM is ready
    setTimeout(() => {
        highlightCurrent();
    }, 200);
    
    container.appendChild(desktopSidebar);
    container.appendChild(mobileHeader);
    container.appendChild(mobileOverlay);
    
    // Expose methods for external use if needed
    container.highlightCurrent = highlightCurrent;
    container.setActiveLink = setActiveLink;
    
    return container;
}