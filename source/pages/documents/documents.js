let resumeCounter = 0;

export function renderDocuments(container) {
  container.innerHTML = `
    <div class="section">
      <h2 class="section-title">Manage Resumes</h2>
      <div class="upload-area">
        <input type="file" id="resume-input" accept=".pdf,.doc,.docx" hidden>
        <button id="upload-btn" class="btn btn-blue">Upload New Resume</button>
      </div>
      <div id="resume-list" class="resume-list"></div>
    </div>

    <hr class="divider">

    <div class="section">
      <h2 class="section-title">Personal Information</h2>
      <form id="info-form" class="info-form">
        <label>Full Name</label>
        <input type="text" name="name" required>

        <label>Date of Birth</label>
        <input type="date" name="dob">

        <label>Phone Number</label>
        <input type="tel" name="phone" required>

        <label>Email</label>
        <input type="email" name="email" required>

        <label>School / University</label>
        <input type="text" name="school">

        <label>Degree</label>
        <input type="text" name="degree">

        <label>Graduation Year</label>
        <input type="number" name="gradYear" min="1900" max="2100">

        <label>Work History</label>
        <textarea name="history" rows="3"></textarea>

        <label>Skills</label>
        <textarea name="skills" rows="2"></textarea>

        <button type="submit" class="btn btn-green">Save Information</button>
      </form>
    </div>
  `;


  const uploadInput = container.querySelector('#resume-input');
  const uploadBtn = container.querySelector('#upload-btn');
  const resumeList = container.querySelector('#resume-list');

  uploadBtn.addEventListener('click', () => uploadInput.click());

  uploadInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const resumeId = `resume-${resumeCounter++}`;
    const div = document.createElement('div');
    div.className = "resume-card";
    div.id = resumeId;

    div.innerHTML = `
      <span>${file.name}</span>
      <div class="resume-actions">
        <button class="star-btn">☆</button>
        <button class="delete-btn">🗑️</button>
      </div>
    `;

    // Star button
    div.querySelector('.star-btn').addEventListener('click', function () {
      this.classList.toggle('starred');
      this.textContent = this.classList.contains('starred') ? '★' : '☆';
    });

    // Delete Button
    div.querySelector('.delete-btn').addEventListener('click', () => {
      div.remove();
    });

    resumeList.appendChild(div);
    event.target.value = '';
  });

  // Form submit
  const form = container.querySelector('#info-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Information saved!');
  });
}
