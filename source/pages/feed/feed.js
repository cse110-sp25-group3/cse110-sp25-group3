const userSkills = ["JavaScript", "Node.js"];

let currentIndex = 0;
let jobs = [];

function createJobCardFront(job, userSkills, progress = 1, total = 10) {
  const matched = job.relevantSkills.filter((skill) =>
    userSkills.includes(skill)
  );
  const lost = job.relevantSkills.filter(
    (skill) => !userSkills.includes(skill)
  );
  const percent = Math.round(
    (matched.length / job.relevantSkills.length) * 100
  );
  const degree = Math.round((matched.length / job.relevantSkills.length) * 360);

  const container = document.createElement("div");
  container.classList.add("card-container");

  container.innerHTML = `
    <div class="job-card-front">
      <div class="donut" style="--degree: ${degree}deg;">
        <div class="donut-text">${percent}%</div>
      </div>

      <h3>Skill Match</h3>
      <div class="skills-2col">
        <div class="skills-left">
          ${lost.map((s) => `<p>❌ ${s}</p>`).join("")}
        </div>
        <div class="skills-right">
          ${matched.map((s) => `<p>✅ ${s}</p>`).join("")}
        </div>
      </div>
    </div>

    <div class="button-row">
      <button class="skip">❌</button>
      <button class="apply">✅</button>
    </div>

    <div class="progress-row">
      <div class="progress-bar">
        <div class="filled" style="width: ${(progress / total) * 100}%"></div>
      </div>
      <span class="progress-text">${progress}/${total}</span>
    </div>
  `;

  // Add listeners for skip and apply
  container.querySelector(".skip").addEventListener("click", () => {
    showNextCard();
  });

  container.querySelector(".apply").addEventListener("click", () => {
    // future logic for apply
    showNextCard();
  });

  return container;
}

function showNextCard() {
  const contentDiv = document.querySelector(".content");
  contentDiv.innerHTML = "";

  if (currentIndex < jobs.length) {
    const card = createJobCardFront(
      jobs[currentIndex],
      userSkills,
      currentIndex + 1,
      jobs.length
    );
    contentDiv.appendChild(card);
    currentIndex++;
  } else {
    contentDiv.innerHTML = `<p>🎉 You've reached the end of the job feed!</p>`;
  }
}

export async function renderFeed(container) {
  console.log("renderFeed called");
  const contentDiv = container.querySelector(".content");
  contentDiv.innerHTML = "";

  const response = await fetch(
    "../../assets/datasets/dummy_job_positions.json"
  );
  jobs = await response.json();
  currentIndex = 0;

  showNextCard();
}
