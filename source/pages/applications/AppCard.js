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

        // TODO
        style.textContent = ``;

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
                    <div>LOGO</div>
                    <div class="text-info">
                        <span class="name">${data.companyName}</span>
                        <span class="industry">${data.industry}</span>
                    </div>
                </div>

                <button class="toggle" id="toggle-${detailId}" aria-expanded="false" aria-controls="${detailId}">
                    View details
                </button>
            <header>

            <h2 class="job-title">${data.jobRole}</h2>

            <div class="meta">
                <span>📍 ${data.location}</span>
                <span>💲 ${data.pay}</span>
                <span>✅ Applied on <time datetime="${data.submittedDate}">${data.submittedDate}</time></span>
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