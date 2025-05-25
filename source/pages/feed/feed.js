const userSkills = ['JavaScript', 'Node.js'];

let currentIndex = 0;
let jobs = [];

function createJobCardFront(job, userSkills, progress = 1, total = 10) {
  const matched = job.relevantSkills.filter(skill => userSkills.includes(skill));
  const lost = job.relevantSkills.filter(skill => !userSkills.includes(skill));
  const percent = Math.round((matched.length / job.relevantSkills.length) * 100);
  const degree = Math.round((matched.length / job.relevantSkills.length) * 360);

  const card = document.createElement('div');
  card.classList.add('job-card-front');

  card.innerHTML = `
    <div class="donut" style="background: conic-gradient(#8b7dff ${degree}deg, #eee 0deg);">
      <div class="donut-text">${percent}%</div>
    </div>

    <h3>Skill Match</h3>
    <div class="skills">
      <div class="match">${matched.map(s => `<p>✅ ${s}</p>`).join('')}</div>
      <div class="lost">${lost.map(s => `<p>❌ ${s}</p>`).join('')}</div>
    </div>

    <div class="actions">
      <button class="skip">❌</button>
      <button class="apply">✅</button>
    </div>

    <div class="progress-bar">
      <div class="filled" style="width: ${(progress / total) * 100}%"></div>
      <span class="progress-text">${progress}/${total}</span>
    </div>

  `;

  // Add listeners for skip and apply
  card.querySelector('.skip').addEventListener('click', () => {
    showNextCard();
  });
  card.querySelector('.apply').addEventListener('click', () => {
    // Later you can add auto-apply logic here
    showNextCard();
  });

  return card;
}

function showNextCard() {
  const contentDiv = document.querySelector('.content');
  contentDiv.innerHTML = '';

  if (currentIndex < jobs.length) {
    const card = createJobCardFront(jobs[currentIndex], userSkills, currentIndex + 1, jobs.length);
    contentDiv.appendChild(card);
    currentIndex++;
  } else {
    contentDiv.innerHTML = `<p>🎉 You've reached the end of the job feed!</p>`;
  }
}

export async function renderFeed(container) {
  console.log('renderFeed called');
  const contentDiv = container.querySelector('.content');
  contentDiv.innerHTML = '';

  const response = await fetch('../../assets/datasets/dummy_job_positions.json');
  jobs = await response.json();
  currentIndex = 0;

  showNextCard();
}
