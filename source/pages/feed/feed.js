// feed.js
import { fetchJobs } from "../../functions/fetch-jobs.js";
import { loadUserPreferences, renderFeedPreferences } from "../preferences/job-preferences.js";
import { runFeedAlgorithm } from "./feed-algorithm.js";

let jobsData = [];
let currentJobIndex = 0;
let userSkills = [];

// Helpers for matching calculation
function getMatchedSkills(job) {
  return job.relevantSkills.filter(skill => userSkills.includes(skill));
}
function getLostSkills(job) {
  return job.relevantSkills.filter(skill => !userSkills.includes(skill));
}
function getMatchPercent(job) {
  const total = job.relevantSkills.length;
  return total === 0 ? 0 : Math.round((getMatchedSkills(job).length / total) * 100);
}
function getMatchDegree(job) {
  return Math.round((getMatchPercent(job) / 100) * 360);
}

// Create the card element (no event listeners here)
function createCardElement(job, index) {
  const card = document.createElement("div");
  card.className = "job-card active";
  card.dataset.index = index;

  const workModelMap = { 1: "Remote", 2: "On-site", 3: "Hybrid" };
  const workModelText = workModelMap[job.workModel] || "Unknown";
  const workModelSvg = workModelText.replace(/\s/g, "-") + ".svg";

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-front">
        <div class="skill-match-display">
          <div class="donut" style="background: conic-gradient(
            #6C9AFF 0deg,
rgb(112, 242, 235) ${getMatchDegree(job)}deg,
            #eee ${getMatchDegree(job)}deg
          );">
            <div class="donut-text">${getMatchPercent(job)}%</div>
          </div>
          <div class="skill-match-text">Skill Match</div>
          <div class="skills-container">
            ${getMatchedSkills(job)
              .map(skill => 
                `<div class="skill-tag matched">
                  <span class="skill-icon">✔</span>${skill}
                </div>`
              ).join("")}
            ${getLostSkills(job)
              .map(skill => 
                `<div class="skill-tag lost">
                  <span class="skill-icon">✖</span>${skill}
                </div>`
              ).join("")}
          </div>
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
              <span><img src='../applications/assets/location.svg'>${job.location}</span>
              <span><img src='../applications/assets/${workModelSvg}'>${workModelText}</span>
            </div>
            <div class="column">
              <span><img src='../applications/assets/pay.svg'>${job.pay}</span>
              <span><img src='../applications/assets/check.svg'>Posted ${job.datePosted}</span>
            </div>
          </div>
          <section class="summary">
            <p class="job-description"><strong>Description:</strong> <p>${job.jobDescription}</p></p>
            <button class="toggle-details">View more details</button>
          </section>
          <section class="extra-details">
            <p style = "margin-top: 12px"><strong>About:</strong> <p>${job.companyInfo}</p>
            <p style = "margin-top: 12px"><strong>Requirements:</strong></p>
            <ul>
              ${job.jobRequirements.map(req => `<li>${req}</li>`).join("")}
            </ul>
            <p style = "margin-top: 12px"><strong>Skills:</strong></p>
            <div class="skills">
              ${job.relevantSkills.map(skill => `<span class="skill">${skill}</span>`).join("")}
            </div>
            <a class="apply-link" href="${job.applicationLink}" target="_blank" rel="noopener">Link to Application</a>
          </section>
        </div>
      </div>
    </div>
    <div class="buttonContainer">
      <div class="bottom-buttons">
        <button class="swipe-button skip-button" aria-label="Skip job">✕</button>
        <button class="swipe-button apply-button" aria-label="Apply for job">✓</button>
      </div>
    </div>
  `;

  return card;
}

// Attach all interactions (flip, skip, apply) to a rendered card
function attachCardListeners(card, container) {
  const inner = card.querySelector(".card-inner");
  const toggleBtn = card.querySelector(".toggle-details");
  const extra = card.querySelector(".extra-details");

  // Flip and reset toggle button when showing back face
  card.addEventListener("click", e => {
    if (e.target.closest(".swipe-button, .apply-link, .toggle-details")) return;
    const isNowFlipped = card.classList.toggle("flipped");
    if (isNowFlipped) {
      // Just turned to back: reset details state
      extra.classList.remove("open");
      toggleBtn.style.display = "";
      toggleBtn.textContent = "View more details";
    }
  });

  // Toggle extra details and hide button
  toggleBtn.addEventListener("click", e => {
    e.stopPropagation();
    extra.classList.toggle("open");
    toggleBtn.style.display = "none";
  });

  // Helper to disable both buttons
  function disableButtons() {
    card.querySelectorAll("button").forEach(b => b.disabled = true);
  }

  // Advance to next card
  function nextCard() {
    currentJobIndex++;
    renderCurrentCard(container);
  }

  // updates the visible card after a skip or apply animation completes 
  function updateCardVisibility() {
    const container = document.getElementById("job-cards-container");
    if (!container) return;
    renderCurrentCard(container);
  }

  function skipCurrentJob() {
    if (currentJobIndex < jobsData.length) {
      const currentCard = document.querySelector(".job-card.active");
      if (currentCard) {
        setTimeout(() => {
          currentJobIndex++;
          updateCardVisibility();
        }, 500);
      }
    }
  }

  function applyToCurrentJob() {
    if (currentJobIndex < jobsData.length) {
      const currentCard = document.querySelector(".job-card.active");
      const job = jobsData[currentJobIndex];
      const data = localStorage.getItem('userData');
      const jobs = encodeURIComponent(JSON.stringify(job));
      // Encode data to safely pass via URL
      const encodedData = encodeURIComponent(data);
      const newWindow = window.open(`http://localhost:3000/?data=${encodedData}&jobs=${jobs}`, '_blank', 'width=600,height=400');
      // Wait 3 seconds, then close the new window
      setTimeout(() => {
          if (newWindow && !newWindow.closed) {
            newWindow.close();
          }
        },1500);
      if (currentCard) {
        setTimeout(() => {
          currentJobIndex++;
          updateCardVisibility();
        }, 500);
      }
  }
}
  // Skip button
  card.querySelector(".skip-button").addEventListener("click", e => {
    e.stopPropagation();
    disableButtons();
    inner.classList.add("swipe-out-left");
    inner.addEventListener("animationend", () => nextCard(), { once: true });
    skipCurrentJob();
  });

  // Apply button
  card.querySelector(".apply-button").addEventListener("click", e => {
    e.stopPropagation();
    saveJobToLocalStorage(jobsData[currentJobIndex]);
    disableButtons();
    inner.classList.add("swipe-out-right");
    inner.addEventListener("animationend", () => nextCard(), { once: true });
    applyToCurrentJob();
  });
}

// Render one card (and behindCard) at a time
function renderCurrentCard(container) {
  container.innerHTML = "";
  if (currentJobIndex >= jobsData.length) {
    showEndMessage();
    return;
  }

  // Decorative backdrop
  const behindCard = document.createElement("div");
  behindCard.className = "behindCard";
  container.appendChild(behindCard);

    // Main card
  const card = createCardElement(jobsData[currentJobIndex], currentJobIndex);
  container.appendChild(card);
  attachCardListeners(card, container);

  // Animate from a 7° tilt into place
  const inner = card.querySelector(".card-inner");
  inner.classList.add("draw-in");
  inner.addEventListener("animationend", () => inner.classList.remove("draw-in"), { once: true });
}

// Entry point
export async function renderFeed(container) {
  // Clear
  container.innerHTML = ""; 

  // Render preferences header (which wires showOverlay/removeOverlay)
  renderFeedPreferences(container);

  // Append job cards container
  const jobCardsContainer = document.createElement("div");
  jobCardsContainer.id = "job-cards-container";
  container.appendChild(jobCardsContainer);

  // Fetch, filter, and render first card
  try {
    const rawJobs = await fetchJobs();
    const prefs   = loadUserPreferences();
    userSkills    = Array.isArray(prefs.userSkills) ? prefs.userSkills : [];
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs')) || [];

    const filteredJobs = rawJobs.filter(job =>
      !appliedJobs.some(applied =>
        applied.companyName === job.companyName &&
        applied.jobRole === job.jobRole
      )
    );
    jobsData      = runFeedAlgorithm(filteredJobs, prefs);
    currentJobIndex = 0;
    renderCurrentCard(jobCardsContainer);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    jobCardsContainer.innerHTML = "<p>Failed to load job listings. Please try again later.</p>";
  }
}

// Persist applied jobs
function saveJobToLocalStorage(job) {
  const existing = JSON.parse(localStorage.getItem("appliedJobs")) || [];
  const isDup = existing.some(
    s => s.companyName === job.companyName &&
         s.jobRole === job.jobRole &&
         s.dateSubmitted === job.dateSubmitted
  );
  if (!isDup) {
    existing.push({ ...job, dateSubmitted: new Date().toISOString().split('T')[0] });
    localStorage.setItem("appliedJobs", JSON.stringify(existing));
  }
}

// End-of-feed message
function showEndMessage() {
  const container = document.getElementById("job-cards-container");
  container.innerHTML = `
    <div class="end-message">
      <h3>No more jobs!</h3>
      <p>You've seen all available job listings.</p>
      <button onclick="location.reload()" class="reload-button">Refresh Feed</button>
    </div>
  `;
}

/**
 * Reset the feed’s internal state.
 * Tests should call this before pushing test jobs.
 */
export function resetFeedState() {
  jobsData.length = 0;
  currentJobIndex = 0;
}

export {
  getMatchedSkills,
  getLostSkills,
  getMatchPercent,
  getMatchDegree,
  createCardElement,
  saveJobToLocalStorage,
  renderCurrentCard,
  // for testing renderCurrentCard
  jobsData,
  userSkills,
  currentJobIndex
};