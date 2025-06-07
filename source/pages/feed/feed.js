import { fetchJobs } from "../../functions/fetch-jobs.js";
import { loadUserPreferences } from "../preferences/job-preferences.js";
import { runFeedAlgorithm } from "./feed-algorithm.js";

let jobsData = [];
let currentJobIndex = 0;

let userSkills = [];

function getMatchedSkills(job) {
  return job.relevantSkills.filter((skill) => userSkills.includes(skill));
}

function getLostSkills(job) {
  return job.relevantSkills.filter((skill) => !userSkills.includes(skill));
}

function getMatchPercent(job) {
  const total = job.relevantSkills.length;
  const matched = getMatchedSkills(job).length;
  return total === 0 ? 0 : Math.round((matched / total) * 100);
}

function getMatchDegree(job) {
  const percent = getMatchPercent(job);
  return Math.round((percent / 100) * 360);
}

export async function renderFeed(container) {
  console.log("renderFeed called");
  container.innerHTML = '<div id="job-cards-container"></div>';

  const jobCardsContainer = document.getElementById("job-cards-container");

  try {
    // Fetch raw jobs
    const rawJobs = await fetchJobs();

    // Load prefs
    const prefs = loadUserPreferences();
    userSkills = Array.isArray(prefs.userSkills) ? prefs.userSkills : [];

    // the feed algorithm that do filter&score&sort
    jobsData = runFeedAlgorithm(rawJobs, {
      userSkills: prefs.userSkills,
      industries: prefs.industries,
      locations:  prefs.locations,
      workModels: prefs.workModels,
      natures: prefs.natures,
      roles: prefs.roles
    });

    // Reset index
    currentJobIndex = 0;

    createJobCards(jobCardsContainer);
    updateCardVisibility();
  } catch (error) {
    console.error("Error fetching jobs:", error);
    jobCardsContainer.innerHTML +=
      "<p>Failed to load job listings. Please try again later.</p>";
  }
}

function createJobCards(container) {
  jobsData.forEach((job, index) => {
    const card = document.createElement("div");
    card.className = "job-card";
    card.dataset.index = index;

    const workModelMap = { 1: "Remote", 2: "On-site", 3: "Hybrid" };
    const workModelText = workModelMap[job.workModel] || "Unknown";
    const workModelSvg = workModelText.replace(/\s/g, "-") + ".svg";

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front">
          <div class="skill-match-display">
            <div class="donut" style="background: conic-gradient(#8b7dff ${getMatchDegree(
              job
            )}deg, #eee 0deg);">
              <div class="donut-text">${getMatchPercent(job)}%</div>
            </div>
            <div class="skill-match-text">Skill Match</div>
            <div class="skills-2col">
            <div class="skills-left">
              ${getLostSkills(job)
                .map(
                  (skill) =>
                    `<p><span class="skill-icon red">✖</span> ${skill}</p>`
                )
                .join("")}
            </div>
            <div class="skills-right">
              ${getMatchedSkills(job)
                .map(
                  (skill) =>
                    `<p><span class="skill-icon green">✔</span> ${skill}</p>`
                )
                .join("")}
            </div>          
            </div>
          </div>
          <div class="bottom-buttons">
            <button class="swipe-button skip-button" aria-label="Skip job">✕</button>
            <button class="swipe-button  apply-button" aria-label="Apply for job">✓</button>
          </div>
        </div>
        <div class="card-face card-back">
          <div class="job-details-content">
            <header>
              <div class="company-meta">
                <img class="logo" src="${job.companyLogo}" alt="${
      job.companyName
    } logo">
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
            <section class="details">
              <p><strong>About:</strong> ${job.companyInfo}</p>
              <p><strong>Description:</strong> ${job.jobDescription}</p>
              <p><strong>Requirements:</strong></p>
              <ul>
                ${job.jobRequirements.map((req) => `<li>${req}</li>`).join("")}
              </ul>
              <p><strong>Skills:</strong></p>
              <div class="skills">
                ${job.relevantSkills
                  .map((skill) => `<span class="skill">${skill}</span>`)
                  .join("")}
              </div>
              <a class="apply-link" href="${
                job.applicationLink
              }" target="_blank" rel="noopener">Link to Application</a>
            </section>
          </div>
          <div class="bottom-buttons">
            <button class="swipe-button skip-button" aria-label="Skip job">✕</button>
            <button class="swipe-button  apply-button" aria-label="Apply for job">✓</button>
          </div>
        </div>
      </div>
    `;

    card.addEventListener("click", (event) => {
      if (
        event.target.classList.contains("swipe-button") ||
        event.target.classList.contains("apply-link")
      ) {
        return;
      }
      event.stopPropagation();
      card.classList.toggle("flipped");
    });

    const skipButtons = card.querySelectorAll(".skip-button");
    const applyButtons = card.querySelectorAll(".apply-button");

    skipButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        console.log("Job skipped:", job.jobRole);
        skipCurrentJob();
      });
    });

    applyButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        console.log("Job applied:", job.jobRole);
        applyToCurrentJob();
      });
    });

    container.appendChild(card);
  });
}

function updateCardVisibility() {
  const cards = document.querySelectorAll(".job-card");

  cards.forEach((card) => {
    card.classList.remove("active", "next", "prev");
    card.style.display = "none";
  });

  for (let i = 0; i < 3 && currentJobIndex + i < jobsData.length; i++) {
    const cardIndex = currentJobIndex + i;
    const card = cards[cardIndex];

    if (card) {
      card.style.display = "block";

      if (i === 0) card.classList.add("active");
      else if (i === 1) card.classList.add("next");
      else if (i === 2) card.classList.add("prev");
    }
  }

  if (currentJobIndex >= jobsData.length) {
    showEndMessage();
  }
}

function skipCurrentJob() {
  if (currentJobIndex < jobsData.length) {
    const currentCard = document.querySelector(".job-card.active");
    if (currentCard) {
      currentCard.classList.add("skip-animation");
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
    saveJobToLocalStorage(job);
    if (currentCard) {
      currentCard.classList.add("apply-animation");
      setTimeout(() => {
        currentJobIndex++;
        updateCardVisibility();
      }, 500);
    }
  }
}

function saveJobToLocalStorage(job) {
  const existing = JSON.parse(localStorage.getItem('appliedJobs')) || [];
  const isDuplicate = existing.some(
    (saved) =>
      saved.companyName === job.companyName &&
      saved.jobRole === job.jobRole &&
      saved.dateSubmitted === job.dateSubmitted
  );

  if (!isDuplicate) {
    const jobWithDate = {
      ...job,
      dateSubmitted: new Date().toISOString().split('T')[0]
    };

    existing.push(jobWithDate);
    localStorage.setItem('appliedJobs', JSON.stringify(existing));
  }
}

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
