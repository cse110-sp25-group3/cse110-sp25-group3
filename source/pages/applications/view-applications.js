import './AppCard.js';

export function renderApplications(container) {

    // Array of job application objects
    const jobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];
    console.log('WORKS');

    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="end-message">
                <h3>No applications yet!</h3>
                <p>Let's get applying!</p>
                <button id='noapp'><a href='../../pages/feed/feed.html'>Job Feed</a></button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <h2>Your Applications</h2>
        <div style="margin-bottom: 1em;">
            <button id="expand-all" class="toggle-all">Show All Details</button>
            <button id="collapse-all" class="toggle-all">Hide All Details</button>
        </div>
    `;

    //for loop through all applied jobs or shown jobs
    //use widget to construct element for each
    for (const job of jobs) {
        const card = document.createElement('app-card');
        card.data = job;
        container.appendChild(card);
    }

    document.getElementById('expand-all').addEventListener('click', () => {
        document.querySelectorAll('app-card').forEach(card => {
            const shadow = card.shadowRoot;
            const section = shadow.querySelector('.details');
            const button = shadow.querySelector('.toggle');
        
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            if (!isExpanded) {
                section.classList.add('expanded');
                button.setAttribute('aria-expanded', 'true');
                button.textContent = 'Hide';
            }
        });
    });

    document.getElementById('collapse-all').addEventListener('click', () => {
        document.querySelectorAll('app-card').forEach(card => {
            const shadow = card.shadowRoot;
            const section = shadow.querySelector('.details');
            const button = shadow.querySelector('.toggle');
        
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
            section.classList.remove('expanded');
            button.setAttribute('aria-expanded', 'false');
            button.textContent = 'Details';
            }
        });
    });
}