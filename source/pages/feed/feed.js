import { fetchJobs } from '../../functions/fetch-jobs.js';

let jobsData = [];
let currentJobIndex = 0;

export async function renderFeed(container) {
  console.log('renderFeed called');
  // Clear container and add only the div for cards (no title)
  container.innerHTML = '<div id="job-cards-container"></div>';

  const jobCardsContainer = document.getElementById('job-cards-container');

  try {
    jobsData = await fetchJobs(); // Fetch real job data
    console.log('Fetched jobs:', jobsData);

    // Create all cards but only show the first few
    createJobCards(jobCardsContainer);
    updateCardVisibility();

  } catch (error) {
    console.error('Error fetching jobs:', error);
    jobCardsContainer.innerHTML += '<p>Failed to load job listings. Please try again later.</p>';
  }
}

function createJobCards(container) {
  jobsData.forEach((job, index) => {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.dataset.index = index;

    // Define nature and work model for SVG paths and text
    const workModelMap = { 1: 'Remote', 2: 'On-site', 3: 'Hybrid' };
    const workModelText = workModelMap[job.workModel] || 'Unknown';
    const workModelSvg = workModelText.replace(/\s/g, '-') + '.svg';

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front">
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

    // Event listener for flipping the card - click anywhere on card
    card.addEventListener('click', (event) => {
      // Don't flip if clicking on buttons
      if (event.target.classList.contains('swipe-button') || 
          event.target.classList.contains('apply-link')) {
        return;
      }
      event.stopPropagation();
      card.classList.toggle('flipped');
    });

    // Prevent flip toggle buttons from double-flipping
    // (Removed since buttons are gone)

    // Event listeners for skip/apply buttons
    card.querySelector('.skip-button').addEventListener('click', (event) => {
      event.stopPropagation();
      console.log('Job skipped:', job.jobRole);
      skipCurrentJob();
    });

    card.querySelector('.apply-button').addEventListener('click', (event) => {
      event.stopPropagation();
      console.log('Job applied:', job.jobRole);
      applyToCurrentJob();
    });

    container.appendChild(card);
  });
}

function updateCardVisibility() {
  const cards = document.querySelectorAll('.job-card');
  
  // Hide all cards first
  cards.forEach(card => {
    card.classList.remove('active', 'next', 'prev');
    card.style.display = 'none';
  });

  // Show current card and next 2 cards in stack
  for (let i = 0; i < 3 && (currentJobIndex + i) < jobsData.length; i++) {
    const cardIndex = currentJobIndex + i;
    const card = cards[cardIndex];
    
    if (card) {
      card.style.display = 'block';
      
      if (i === 0) {
        card.classList.add('active');
      } else if (i === 1) {
        card.classList.add('next');
      } else if (i === 2) {
        card.classList.add('prev');
      }
    }
  }

  // Check if we've reached the end
  if (currentJobIndex >= jobsData.length) {
    showEndMessage();
  }
}

function skipCurrentJob() {
  if (currentJobIndex < jobsData.length) {
    const currentCard = document.querySelector('.job-card.active');
    if (currentCard) {
      currentCard.classList.add('skip-animation');
      setTimeout(() => {
        currentJobIndex++;
        updateCardVisibility();
      }, 500);
    }
  }
}

function applyToCurrentJob() {
  if (currentJobIndex < jobsData.length) {
    const currentCard = document.querySelector('.job-card.active');
    if (currentCard) {
      currentCard.classList.add('apply-animation');
      setTimeout(() => {
        currentJobIndex++;
        updateCardVisibility();
        // TODO: Add to applications tracker
      }, 500);
    }
  }
}

function showEndMessage() {
  const container = document.getElementById('job-cards-container');
  container.innerHTML = `
    <div class="end-message">
      <h3>No more jobs!</h3>
      <p>You've seen all available job listings.</p>
      <button onclick="location.reload()" class="reload-button">Refresh Feed</button>
    </div>
  `;
}