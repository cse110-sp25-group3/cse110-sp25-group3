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
                padding: 16px;
                background: white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.05);
                transition: all 0.3s ease;
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
                color: rgba(19, 25, 192, 0.5);
                cursor: pointer;
            }

            /* Job title styles */
            h2 {
                font-size: 1.1em;
            }

            /* Meta styling */
            .meta {
                display: flex;
                gap: 1em;
                margin: 0.5em 0;
                font-size: 0.7em;
            }
            .meta span {
                display: flex;
                align-items: center;
                font-size: 0.3em;
                gap: 1em;
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
                <span><img src='assets/location.svg'>${data.location}</span>
                <span><img src='assets/pay.svg'>${data.pay}</span>
                <span><img src='assets/check.svg'> Applied on <time datetime="${data.submittedDate}">${data.submittedDate}</time></span>
            </div>

            <section class="details" id="${detailId}" hidden>
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
                <a class="apply-link" href="${data.applicationLink}" target="_blank" rel="noopener">Link to Application</a>
            </section>
            </section>
        `;
    }
}

customElements.define('app-card', AppCard);