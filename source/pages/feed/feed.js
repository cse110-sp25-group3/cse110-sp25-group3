import { fetchJobs } from '../../functions/fetch-jobs.js';

export async function renderFeed(container) {
  console.log('renderFeed called');
  // Clear container and add a title and a div for cards
  container.innerHTML = '<h2>Job Feed</h2><div id="job-cards-container"></div>';

  const jobCardsContainer = document.getElementById('job-cards-container');

  try {
    const jobs = await fetchJobs(); // Fetch real job data
    console.log('Fetched jobs:', jobs);

    jobs.forEach(job => {
      const card = document.createElement('div');
      card.className = 'job-card'; // Main card container

      // Define nature and work model for SVG paths and text
      const natureMap = { 1: 'Full-time', 2: 'Part-time', 3: 'Intern' };
      const workModelMap = { 1: 'Remote', 2: 'On-site', 3: 'Hybrid' };
      const workModelText = workModelMap[job.workModel] || 'Unknown';
      const workModelSvg = workModelText.replace(/\s/g, '-') + '.svg'; // For "On-site" -> "On-site.svg"


      card.innerHTML = `
        <div class="card-inner">
          <div class="card-face card-front">
            <button class="flip-toggle-button" data-side="back">View Details</button>
            <div class="skill-match-display">
                <div class="skill-match-score">92%</div>
                <div class="skill-match-text">Skill Match</div>
                <ul class="skill-list">
                    <li>✓ match skill 1</li>
                    <li>✕ lost skill 1</li>
                    <li>✓ match skill 2</li>
                    <li>✕ lost skill 2</li>
                </ul>
            </div>
            <div class="bottom-buttons">
                <button class="swipe-button skip-button" aria-label="Skip job">✕</button>
                <button class="swipe-button apply-button" aria-label="Apply for job">✓</button>
            </div>
          </div>
          <div class="card-face card-back">
            <button class="flip-toggle-button" data-side="front">View Skill Match</button>
            <div class="job-details-content">
                <header>
                    <div class="company-meta">
                        <img class="logo" src="${job.companyLogo}" alt="${job.companyName} logo">
                        <div class="text-info">
                            <span class="company-name">${job.companyName}</span>
                            <span class="industry">${job.industry}</span>
                        </div>
                    </div>
                </header>

                <h3 class="job-title-back">${job.jobRole}</h3>

                <div class="meta">
                    <div class="column">
                        <span><img src='assets/location.svg'>${job.location}</span>
                        <span><img src='assets/${workModelSvg}'>${workModelText}</span>
                    </div>
                    <div class="column">
                        <span><img src='assets/pay.svg'>${job.pay}</span>
                        <span>Posted ${job.datePosted}</span>
                    </div>
                </div>

                <section class="details">
                    <p><strong>About:</strong> ${job.companyInfo}</p>
                    <p><strong>Description:</strong> ${job.jobDescription}</p>
                    <p><strong>Requirements:</strong></p>
                    <ul>
                        ${job.jobRequirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                    <p><strong>Skills:</strong></p>
                    <div class="skills">
                        ${job.relevantSkills.map(skill => `<span class="skill">${skill}</span>`).join('')}
                    </div>
                    <a class="apply-link" href="${job.applicationLink}" target="_blank" rel="noopener">Link to Application</a>
                </section>
            </div>
            <div class="bottom-buttons">
                <button class="swipe-button skip-button" aria-label="Skip job">✕</button>
                <button class="swipe-button apply-button" aria-label="Apply for job">✓</button>
            </div>
          </div>
        </div>
      `;

      // Event listener for flipping the card
      card.querySelectorAll('.flip-toggle-button').forEach(button => {
        button.addEventListener('click', (event) => {
          event.stopPropagation(); // Prevent card from flipping if clicked directly
          card.classList.toggle('flipped');
        });
      });

      // Event listeners for skip/apply buttons
      card.querySelector('.skip-button').addEventListener('click', (event) => {
        event.stopPropagation();
        console.log('Job skipped:', job.jobRole);
        card.remove(); // Remove card from display
        // TODO: Implement logic to load next card
      });

      card.querySelector('.apply-button').addEventListener('click', (event) => {
        event.stopPropagation();
        console.log('Job applied:', job.jobRole);
        card.remove(); // Remove card from display
        // TODO: Implement logic to add to applications tracker and load next card
      });

      jobCardsContainer.appendChild(card);
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    jobCardsContainer.innerHTML += '<p>Failed to load job listings. Please try again later.</p>';
  }
}