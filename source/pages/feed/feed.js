export function renderFeed(container) {
  console.log('renderFeed called');
  container.innerHTML = '<h2>Job Feed</h2><div id="card-container"></div>';

  const jobs = [
    {
      company: "OpenAI",
      title: "Software Engineer",
      location: "Remote",
      description: "Work on LLMs, fine-tuning, and deployment."
    },
    {
      company: "Google",
      title: "Frontend Intern",
      location: "Mountain View, CA",
      description: "Help build dashboards and UI tools using HTML/CSS/JS."
    }
  ];

  const cardContainer = document.getElementById('card-container');

  jobs.forEach(job => {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <h2>${job.title}</h2>
          <p>${job.company}</p>
          <p class="location">${job.location}</p>
        </div>
        <div class="card-back">
          <h3>Job Description</h3>
          <p>${job.description}</p>
        </div>
      </div>
    `;
    card.onclick = () => card.classList.toggle('flipped');
    cardContainer.appendChild(card);
  });
}
