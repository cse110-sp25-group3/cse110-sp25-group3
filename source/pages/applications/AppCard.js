// AppCard.js

/**
 * A custom HTML element representing a job application card in the
 * View Applications Page. It uses the Shadow DOM for style encapsulation and
 * accepts a `data` object to populate the content. The card displays a company
 * (logo, name, industry), job title, location, pay, date of application with
 * an option to view more details about the company and skill assessment.
 */
class AppCard extends HTMLElement {
    /**
     * Constructor for the AppCard component.
     * Initialized the Shadow DOM, adds styling, and create an <article> to
     * hold the card content.
     */
    constructor() {
        super(); // Inherit everything from HTMLElement
        
        // Attach the shadow DOM (open so JS outside can access it if needed)
        let shadow = this.attachShadow({ mode: 'open' });

        // Create root container for component's visual content
        this.article = document.createElement('article');

        // Create a <style> tag to encapsulate component-specific styles
        let style = document.createElement('style');

        // Add styles to the <style> tag
        style.textContent = `
            article {
                border: 1px solid #ddd;
                border-radius: 1em;
                background: white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.05);
                margin-bottom: 1.2em;
                max-height: 1000px;
                overflow: hidden;
                transition: all 1s ease;
                padding: 16px;
                opacity: 1;
            }

            
            /* Header styles */
            header{
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .text-info {
                display: flex;
                flex-direction: column;
                margin-right: 0%
                width: 10px;
            }

            .company-meta {
                display: flex;
                align-items: center;
                gap: 1em;
                margin-right: 0%;
                padding-right: 0%;
                max-width: 75%;
            }

            img {
                max-width: 15%;
            }

            .name {
                color: var(--color-dark-blue-outline);
                font-weight: medium;
                font-size: 1.1em;
                flex: none;
            }
            
            button {
                background: var(--color-light-blue-fill);
                border: 1px solid var(--color-light-blue-outline);
                box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
                border-radius: 0.5em;
                max-width: 30%;
                padding: 0.3em 0.8em;
                font-size: 0.8em;
                transition: all 0.3s ease;
                color: var(--color-dark-blue-outline);
            }
            
            button:hover {
                background: var(--color-dark-blue-fill);
                border-color: rgba(196, 199, 254, 0.1);
                cursor: pointer;
            }

            /* Job title styles */
            h2 {
                font-size: 1.1em;
            }

            /* Meta styling */
            .meta {
                display: flex;
                flex-direction: row;
                gap: 1em;
                font-size: 0.7em;
            }

            .meta .column {
                gap: 20%;
                align-items: center;
                display: flex;
                flex-direction: column;
            }

            .meta span {
                display: flex;
                align-items: center;
                gap: 0.5rem; /* or 1rem if you want more spacing */
            }


            span img {
                width: 16px;
                height: 16px;
            }

            /* Details section */
            .details {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.4s ease;
            }

            .details.expanded {
                max-height: 1000px; /* large enough to show content */
            }
            
            .details {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.4s ease, opacity 0.3s ease;
                opacity: 0;
                margin-top: 1em;
                font-size: 0.85em;
                line-height: 1.5;
                color: #333;
            }

            .details.expanded {
                max-height: 1000px;
                opacity: 1;
            }

            /* Section spacing */
            .details p {
                margin: 0.6em 0;
            }

            .details strong {
                font-weight: 600;
                color: var(--color-dark-blue-outline);
            }

            /* Requirement list */
            .details ul {
                padding-left: 1.2em;
                margin: 0.4em 0 1em;
            }

            .details ul li {
                margin-bottom: 0.3em;
                list-style: disc;
            }

            .details ul li::marker {
                color: var(--color-dark-blue-outline); /* Or any specific color like #1d4ed8 */
            } 

            /* Skills */
            .skills {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5em;
                margin-top: 0.5em;
            }

            .skill {
                background: var(--color-light-blue-fill);
                color: var(--color-dark-blue-outline);
                padding: 0.3em 0.7em;
                border-radius: 0.5em;
                font-size: 0.75em;
                white-space: nowrap;
            }

            .buttons {
                display: flex;
                justify-content: space-between;
            }

            /* Application link */
            a.apply-link, button.remove-app, button.confirm-remove, button.cancel-remove {
                display: inline-block;
                margin-top: 1em;
                padding: 0.5em 1em;
                background: var(--color-dark-blue-outline);
                color: white;
                text-decoration: none;
                border-radius: 0.5em;
                font-weight: bold;
                font-size: 0.85em;
                transition: opacity 0.3s ease;
            }

            a.apply-link:hover {
                // background: var(--color-dark-blue-fill);
                opacity: 0.8;
            }

            /* Remove Application Button */
            button.remove-app, button.confirm-remove {
                background: #ff4d4f;
                border: 1px solid #ff4d4f;
                padding: 0.6em 1em;
                box-sizing: border-box;
            }

            button.remove-app:hover, button.confirm-remove:hover, button.cancel-remove:hover {
                opacity: 0.8;
                cursor: pointer;
            }

            .shrink-out {
                transition: all 0.5s ease;
                overflow: hidden;
                max-height: 0;
                opacity: 0;
                padding-top: 0;
                padding-bottom: 0;
                margin-top: 0;
                margin-bottom: 0;
            }
            
            /* Delete Confirmation Dialog */
            dialog {
                position: fixed;
                inset: 0;
                margin: auto;
                padding: 0;
                border: none;
                border-radius: 20px;
                background: transparent;
                z-index: 1000;
            }
            
            fieldset {
                border: none;
            }


            .modal-content {
                background: white;
                padding: 1.5em;
                border-radius: 20px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
                text-align: center;
                width: 90%;
                max-width: 400px;
                transform: scale(0.8);
                opacity: 0;
                animation: growIn 0.3s forwards;
            }

            .modal-content h3 {
                font-size: 1.2em;
                color: var(--color-dark-blue-outline);
                margin: auto;
            }
            
            form p {
                max-width: 70%;
                justify-self: center;
                font-weight: medium;
            }

            .modal-buttons {
                display: flex;
                margin-top: 1.5em;
                gap: 3em;
                justify-content: center;
            }

            .modal-buttons button {
                padding: 0.5em 1.2em;
                border-radius: 0.5em;
                font-weight: bold;
                border: none;
                cursor: pointer;
                font-size: 0.85em;
            }

            /* Keyframes */
            @keyframes growIn {
                from {
                    transform: scale(0.8);
                    opacity: 0;
                }
                to {
                    transform: scale(1);
                    opacity: 1;
                }
            }

            @keyframes shrinkOut {
                from {
                    transform: scale(1);
                    opacity: 1;
                }
                to {
                    transform: scale(0.8);
                    opacity: 0;
                }
            }

            .meta column {
                    display: flex;
                    gap: 20%;
                    // align-items: center;
                    flex-direction: column;
                }

                .meta span {
                    display: flex;
                    // align-items: center;
                    gap: 0.5em;
                    margin-bottom: 0.7em;
                }
            /* Media Query for screens at least 850px */
            @media (min-width: 850px) {
                html {
                    font-size: 16px; /* 1rem = 16px */
                }

                article {
                    padding: 1rem;
                }

                .name {
                    font-size: 1.4rem; /* Larger font for desktop */
                }

                button {
                    padding: 0.5rem 1rem;
                    font-size: 1rem; /* Larger button font */
                }

                h2 {
                    font-size: 1.4rem; /* Larger font for job title */
                }

                .meta {
                    flex-direction: row;
                    font-size: 1rem;
                    gap: 0.4rem; /* More space between meta info */
                    
                }

                .meta .column {
                    flex-direction: row;  /* Arrange items within each column horizontally */
                    gap: 1rem;  /* Space between items within each column */
                    align-items: center;
                    justify-content: center;
                    align-content: center;
                }

                /* Ensure text doesn't overflow */
                .meta span {
                    white-space: nowrap;  /* Prevent text from wrapping */
                    margin: 0;
                    gap: 0.4rem;
                }

                .details {
                    font-size: 1rem;
                    margin-top: 1.2rem;
                }

                .details ul {
                    padding-left: 1.5rem;
                    margin: 1rem 0;
                }

                .skills {
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .skill {
                    font-size: 1rem;
                }

                .buttons a.apply-link, .buttons button.remove-app {
                    padding: 1rem 2rem;
                    font-size: 1.1rem;
                }

                .modal-content h3 {
                    font-size: 1.6rem;
                }

                .modal-buttons button {
                    font-size: 1.1rem;
                }
            }
            
            @media (max-width: 1070px) {
                .meta .column {
                    display: flex;
                    flex-direction: column;
                    gap: 0.7rem;
                    align-items: flex-start; /* Align items to the left instead of center */
                }

                .meta span {
                    display: flex;
                    align-items: center;
                    gap: 0.5em;
                    margin-bottom: 0.4em;
                }
            }


            /* Media Query for screens at least 850px */
            @media (min-width: 1070px) {
                html {
                    font-size: 16px; /* 1rem = 16px */
                }

                article {
                    padding: 1rem;
                }

                .name {
                    font-size: 1.4rem; /* Larger font for desktop */
                }

                button {
                    padding: 0.5rem 1rem;
                    font-size: 1rem; /* Larger button font */
                }

                h2 {
                    font-size: 1.4rem; /* Larger font for job title */
                }

                .meta {
                    flex-direction: row;
                    font-size: 1rem;
                    gap: 0.4rem; /* More space between meta info */
                    
                }

                .meta .column {
                    flex-direction: row;  /* Arrange items within each column horizontally */
                    gap: 1rem;  /* Space between items within each column */
                    align-items: center;
                    justify-content: center;
                    align-content: center;
                }

                /* Ensure text doesn't overflow */
                .meta span {
                    white-space: nowrap;  /* Prevent text from wrapping */
                    margin: 0;
                    gap: 0.4rem;
                }

                .details {
                    font-size: 1rem;
                    margin-top: 1.2rem;
                }

                .details ul {
                    padding-left: 1.5rem;
                    margin: 1rem 0;
                }

                .skills {
                    gap: 1rem;
                    margin-top: 1rem;
                }

                .skill {
                    font-size: 1rem;
                }

                .buttons a.apply-link, .buttons button.remove-app {
                    padding: 1rem 2rem;
                    font-size: 1.1rem;
                }

                .modal-content h3 {
                    font-size: 1.6rem;
                }

                .modal-buttons button {
                    font-size: 1.1rem;
                }
            }
        `;

        // Append the <style> and <article> elements to the shadow DOM
        this.shadowRoot.append(style);
        this.shadowRoot.appendChild(this.article);
    }

    /**
     * Sets application and card data. Called when the .data property is
     * set on this element.
     * 
     * @param {Object} data - The data to pass into the <app-card> must be of
     *                        following format:
     * {
     *   "companyName": "string",               // Name of the company
     *   "companyLogo": "string",               // URL to the company logo image
     *   "industry": "string",                  // Industry sector of company
     *   "jobRole": "string",                   // Job title
     *   "nature": number,                      // 1 = Full-time, 2 = Part-time, 3 = Intern
     *   "workModel": number                    // 1 = Remote, 2 = On-site, 3 = Hybrid
     *   "location": "string",                  // Job location
     *   "pay": "string",                       // Pay information
     *   "datePosted": "string",                // Date the job was posted
     *   "dateSubmitted": "string",             // Date the application was submitted
     *   "companyInfo": "string",               // Date the user applied
     *   "jobDescription": "string"             // Overview of job responsibilities
     *   "jobRequirements": [ "string", ... ],  // Array of job requirements
     *   "relevantSkills": [ "string", ... ],   // Array of relevant skills
     *   "applicationLink": "string"            // External link to apply to job
     *   "htmlFile": "string"                   // (Optional) HTML file name for internal routing
     * }
     */
    set data(data) {
        if (!data) return;

        const natureMap = { 1: 'Full-time', 2: 'Part-time', 3: 'Intern' };
        const workModelMap = { 1: 'Remote', 2: 'On-site', 3: 'Hybrid'};

        const nature = natureMap[data.nature] || 'Unknown';
        const workModel = workModelMap[data.workModel] || 'Unknown';
        const detailId = `details-${Math.random().toString(36).substring(2, 9)}`;

        this.article.innerHTML = `
            <header>
                <div class="company-meta">
                    <img class="logo" src="${data.companyLogo}" alt="${data.companyName} logo">
                    <div class="text-info">
                        <span class="name">${data.companyName}</span>
                        <span class="industry">${data.industry}</span>
                    </div>
                </div>

                <button class="toggle" id="toggle-${detailId}" aria-expanded="false" aria-controls="${detailId}">
                    Details
                </button>
            </header>

            <h2 class="job-title">${data.jobRole}</h2>

            <div class="meta">
                <div class="column">
                    <span><img src='assets/location.svg'>${data.location}</span>
                    <span><img src='assets/${workModelMap[data.workModel]}.svg'>${workModelMap[data.workModel]}</span>
                </div>
                <div class="column">
                    <span><img src='assets/pay.svg'>${data.pay}</span>
                    <span><img src='assets/check.svg'>Applied on <time datetime="${data.dateSubmitted}">${data.dateSubmitted}</time></span>
                </div>
            </div>

            <section class="details" id="${detailId}">
                <p><strong>About:</strong> ${data.companyInfo}</p>
                <p><strong>Description:</strong> ${data.jobDescription}</p>
                <p><strong>Requirements:</strong></p>
                <ul>
                    ${data.jobRequirements.map(req => `<li>${req}</li>`).join('')}
                </ul>
                <p><strong>Skills:</strong></p>
                <div class="skills">
                    ${data.relevantSkills.map(skill => `<span class="skill">${skill}</span>`).join('')}
                </div>
                <div class="buttons">
                    <a class="apply-link" href="${data.applicationLink}" target="_blank" rel="noopener">Link to Application</a>
                    <button class="remove-app">Remove</button>
                </div>
            </section>
            <dialog id="confirm-modal">
                <form method="dialog" class="modal-content">
                    <fieldset>
                    <legend><h3>Confirm Removal</h3></legend>
                    <p>Are you sure you want to remove this application?</p>
                    <div class="modal-buttons">
                        <button type="submit" value="cancel" class="cancel-remove">Cancel</button>
                        <button type="submit" value="confirm" class="confirm-remove">Confirm</button>
                    </div>
                    </fieldset>
                </form>
            </dialog>
        `;

        const toggleBtn = this.article.querySelector(`#toggle-${detailId}`);
        const detailSection = this.article.querySelector(`#${detailId}`);

        toggleBtn.addEventListener('click', () => {
            const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';

            detailSection.classList.toggle('expanded', !isExpanded);
            toggleBtn.setAttribute('aria-expanded', !isExpanded);
            toggleBtn.textContent = isExpanded ? 'Details' : 'Hide';
        });

        const removeBtn = this.article.querySelector('.remove-app');
        const modal = this.article.querySelector('#confirm-modal');
        const form = modal.querySelector('form');

        const cancelBtn = form.querySelector('.cancel-remove');
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent immediate dialog close
            const content = modal.querySelector('.modal-content');
            content.style.animation = 'shrinkOut 0.2s forwards';
            setTimeout(() => modal.close('cancel'), 200);
        });


        removeBtn.addEventListener('click', () => {
            modal.showModal();
            const content = modal.querySelector('.modal-content');
            content.style.animation = 'growIn 0.3s forwards';
        });

        modal.addEventListener('close', () => {
            if (modal.returnValue === 'confirm') {
                this.article.classList.add('shrink-out');
        
                setTimeout(() => {
                    const event = new CustomEvent('remove-app', {
                        bubbles: true,
                        detail: data
                    });
                    this.dispatchEvent(event);
                }, 1000);
            }
        });


        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                const content = modal.querySelector('.modal-content');
                content.style.animation = 'shrinkOut 0.2s forwards';
                setTimeout(() => modal.close('cancel'), 200);
            }
        });
    }
}

customElements.define('app-card', AppCard);