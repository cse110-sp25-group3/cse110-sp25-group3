let resumeCounter = 0;
let resumeParser = null;
let isProcessing = false;
let processedFiles = new Set();

async function initializePDFParser() {
  try {
    if (typeof BrowserResumeParser === 'undefined') throw new Error('Parser unavailable');
    if (typeof pdfjsLib === 'undefined') await loadPDFJS();
    resumeParser = new BrowserResumeParser();
    return true;
  } catch {
    return false;
  }
}

function loadPDFJS() {
  return new Promise((resolve, reject) => {
    if (typeof pdfjsLib !== 'undefined') return resolve();
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve();
    };
    script.onerror = () => reject(new Error('PDF.js failed to load'));
    document.head.appendChild(script);
  });
}

export async function renderDocuments(container, jobSkills) {
  const initSuccess = await initializePDFParser();
  resumeCounter = 0;
  processedFiles.clear();

  container.innerHTML = `
    <div class="section">
      <h2 class="section-title">Manage Resumes</h2>
      ${!initSuccess ? `<div class="error-message">Resume parsing unavailable.</div>` : ''}
      <div class="upload-area">
        <input type="file" id="resume-input" accept=".pdf" hidden ${!initSuccess ? 'disabled' : ''}>
        <button id="upload-btn" class="btn btn-blue" ${!initSuccess ? 'disabled' : ''}>
          ${initSuccess ? 'Upload New Resume' : 'Upload Disabled'}
        </button>
      </div>
      <div id="upload-status" class="upload-status"></div>
      <div id="resume-list" class="resume-list"></div>
    </div>

    <hr class="divider">

    <div class="section">
      <h2 class="section-title">Personal Information</h2>
      <div id="auto-fill-status" class="auto-fill-status"></div>
      <form id="info-form" class="info-form">
        <label>First Name</label><input type="text" name="name" id="name-input" required>
        <label>Last Name</label><input type="text" name="lname" id="lname-input" required>
        <label>Date of Birth</label><input type="date" name="dob" id="dob-input">
        <label>Gender</label>
        <select name="gender" id="gender-input">
          <option value="">Select</option>
          <option>Male</option>
          <option>Female</option>
        </select>
        <label>Phone Number</label><input type="tel" name="phone" id="phone-input" required>
        <label>Email</label><input type="email" name="email" id="email-input" required>
        <label>Location</label><input type="text" name="location" id="location-input">
        <label>School / University</label><input type="text" name="school" id="school-input">
        <label>Degree</label><input type="text" name="degree" id="degree-input">
        <label>Graduation Year</label><input type="number" name="gradYear" id="gradYear-input" min="1900" max="2100">
        <label>Work History</label><textarea name="history" id="history-input" rows="3"></textarea>
        <label>Skills</label><input name="skills" id="skills-input" placeholder="Type or select a skill..." />
        <label>Certifications</label><textarea name="certifications" id="certifications-input" rows="2"></textarea>
        <label>Languages</label><textarea name="languages" id="languages-input" rows="2"></textarea>
        <hr class="divider">
        <label>LinkedIn</label><input type="text" name="linkedin" id="linkedin-input">
        <label>Are you Hispanic or Latinx?</label>
        <select name="hispanic" id="hispanic-input">
          <option value="">Select</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        <label>Race</label>
        <select name="race" id="race-input">
          <option value="">Select</option>
          <option>American Indian or Alaska Native</option>
          <option>Asian</option>
          <option>Black or African American</option>
          <option>Hispanic or Latino</option>
          <option>Native Hawaiian or Other Pacific Islander</option>
          <option>Two or more races</option>
          <option>I don't wish to answer</option>
        </select>
        <label>Protected Veteran Status</label>
        <select name="veteran" id="veteran-input">
          <option value="">Select</option>
          <option>I am one or more of the classifications of protected veterans</option>
          <option>I am not a Protected Veteran</option>
          <option>I don't wish to answer</option>
        </select>
        <label>Disability Status</label>
        <select name="disability" id="disability-input">
          <option value="">Select</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        <div class="button-group">
          <button type="submit" class="btn btn-green">Save Information</button>
          <button id="clear-form" type="button" class="btn btn-gray">Clear Form</button>
        </div>
      </form>
    </div>
  `;
  

  // References
  const uploadInput = container.querySelector("#resume-input");
  const uploadBtn = container.querySelector("#upload-btn");
  const resumeList = container.querySelector("#resume-list");
  const form = container.querySelector("#info-form");
  const clearBtn = container.querySelector("#clear-form");
  const autoFillStatus = container.querySelector("#auto-fill-status");
  const exportBtn = container.querySelector("#export-skills");

  const skillWhitelist = Array.isArray(jobSkills) ? jobSkills : [];
  const tagify = new window.Tagify(document.querySelector("#skills-input"), {
    whitelist: skillWhitelist,
    dropdown: {
      enabled: 0,
      fuzzySearch: true,
      position: "text",
      highlightFirst: true,
    },
  });

  // Resume handlers (unchanged)
  if (initSuccess) {
    const fileIn = uploadInput.cloneNode(true);
    const btn = uploadBtn.cloneNode(true);
    uploadInput.replaceWith(fileIn);
    uploadBtn.replaceWith(btn);
    btn.addEventListener("click", () => fileIn.click());
    fileIn.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file || file.type !== "application/pdf" || isProcessing) return;
      const sig = `${file.name}-${file.size}-${file.lastModified}`;
      if (processedFiles.has(sig)) return;
      processedFiles.add(sig);
      isProcessing = true;
      showUploadStatus("Processing…", "processing");
      const card = createResumeCard(file, `resume-${resumeCounter++}`);
      resumeList.append(card);
      card.originalFile = file;
      try {
        const data = await resumeParser.parseResumeFromFile(file);
        populateForm(data, skillWhitelist, tagify);
        card.dataset.resumeData = JSON.stringify(data);
        showUploadStatus("Done!", "success");
        showAutoFillStatus("Form updated from resume.", "success");
      } catch {
        processedFiles.delete(sig);
        card.remove();
        showUploadStatus("Error parsing.", "error");
      } finally {
        isProcessing = false;
        e.target.value = "";
      }
    });
  }

  // Auto-save logic
  function loadData() {
    try {
      return JSON.parse(localStorage.getItem("userData")) || {};
    } catch {
      return {};
    }
  }

  const saved = loadData();
  Object.entries(saved).forEach(([k, v]) => {
    if (form.elements[k]) form.elements[k].value = v;
  });

  form.querySelectorAll("[name]").forEach((el) =>
    el.addEventListener("input", () => {
      const data = Object.fromEntries(new FormData(form).entries());
      localStorage.setItem("userData", JSON.stringify(data));
      showAutoFillStatus("Auto-saved!", "info");
    })
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    localStorage.setItem("userData", JSON.stringify(data));
    showAutoFillStatus("Information saved!", "success");
  });

  clearBtn.addEventListener("click", () => {
    form.reset();
    localStorage.removeItem("userData");
    showAutoFillStatus("Form and data cleared.", "info");
  });
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const data = loadData();
      const skills = data.skills || "";
      const items = skills.split(/,\s*/).filter((s) => s);
      const blob = new Blob([items.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "skills.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}

function createResumeCard(file, resumeId) {
  const div = document.createElement("div");
  div.className = "resume-card";
  div.id = resumeId;

  div.innerHTML = `
    <div class="resume-info">
      <span class="resume-name">${file.name}</span>
      <span class="resume-size">${formatFileSize(file.size)}</span>
    </div>
    <div class="resume-actions">
      <button class="star-btn" title="Favorite">☆</button>
      <button class="reload-btn" title="Re-parse resume">🔄</button>
      <button class="view-btn" title="View original PDF">👁️</button>
      <button class="delete-btn" title="Delete">🗑️</button>
    </div>
  `;

  // Star button
  const starBtn = div.querySelector(".star-btn");
  starBtn.addEventListener("click", function () {
    this.classList.toggle("starred");
    this.textContent = this.classList.contains("starred") ? "★" : "☆";
  });

  // Reload/re-parse button
  const reloadBtn = div.querySelector(".reload-btn");
  reloadBtn.addEventListener("click", async function () {
    const resumeDataStr = div.dataset.resumeData;
    if (resumeDataStr) {
      try {
        const resumeData = JSON.parse(resumeDataStr);
        populateForm(resumeData, skillWhitelist, tagify);
        showAutoFillStatus("Form re-filled with resume data.", "success");
      } catch (error) {
        console.error("Error re-parsing resume:", error);
        showAutoFillStatus("Error re-loading resume data.", "error");
      }
    }
  });

  // View original PDF button
  const viewBtn = div.querySelector(".view-btn");
  viewBtn.addEventListener("click", function () {
    // Check if we have the original file stored
    if (div.originalFile) {
      try {
        // Create a blob URL for the PDF file
        const fileURL = URL.createObjectURL(div.originalFile);

        // Open the PDF in a new tab
        window.open(fileURL, "_blank");

        // Clean up the blob URL after a short delay to free memory
        setTimeout(() => {
          URL.revokeObjectURL(fileURL);
        }, 1000);
      } catch (error) {
        console.error("Error opening PDF:", error);
        showAutoFillStatus("Error opening PDF file", "error");
      }
    } else {
      console.error("Original file not found");
      showAutoFillStatus("PDF file not available", "error");
    }
  });

  // Delete Button
  const deleteBtn = div.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => {
    div.remove();
  });

  return div;
}

function populateForm(resumeData, skillWhitelist, tagify) {
  try {
    // Populate contact information
    if (resumeData.contact) {
      setInputValue(
        "name-input",
        resumeData.contact.name.split(" ").slice(0, -1).join(" ")
      );
      setInputValue(
        "lname-input",
        resumeData.contact.name.split(" ").slice(-1).join(" ")
      );
      setInputValue("email-input", resumeData.contact.email);
      setInputValue("phone-input", resumeData.contact.phone);
      setInputValue("location-input", resumeData.contact.location);
      setInputValue("linkedin-input", resumeData.contact.linkedin);
    }
    console.log("resumeData", resumeData);
    // Populate education information
    if (resumeData.education && resumeData.education.length > 0) {
      const firstEducation = resumeData.education[0];
      setInputValue("school-input", firstEducation.institution);
      setInputValue("degree-input", firstEducation.degree);
      setInputValue("gradYear-input", firstEducation.year);
    }

    // Populate work history (comprehensive)
    if (resumeData.experience && resumeData.experience.length > 0) {
      const workHistory = resumeData.experience
        .map((exp) => {
          const parts = [];
          if (exp.title) parts.push(exp.title);
          if (exp.company) parts.push(`at ${exp.company}`);
          if (exp.duration) parts.push(`(${exp.duration})`);
          if (exp.location) parts.push(`- ${exp.location}`);
          return parts.join(" ");
        })
        .join("\n");

      setInputValue("history-input", workHistory);
    }

    // Populate skills (comprehensive)
    if (resumeData.skills && resumeData.skills.length > 0) {
      const matchedSkills = findBestSkillMatches(
        resumeData.skills,
        skillWhitelist
      );
      tagify.removeAllTags();
      tagify.addTags(matchedSkills);
    }

    // Populate certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      const certificationsText = resumeData.certifications
        .map((cert) => {
          const parts = [cert.name];
          if (cert.issuer) parts.push(`(${cert.issuer})`);
          if (cert.date) parts.push(`- ${cert.date}`);
          return parts.join(" ");
        })
        .join("\n");

      setInputValue("certifications-input", certificationsText);
    }

    // Populate languages
    if (resumeData.languages && resumeData.languages.length > 0) {
      const languagesText = resumeData.languages
        .map((lang) => {
          const parts = [lang.language];
          if (lang.proficiency) parts.push(`(${lang.proficiency})`);
          return parts.join(" ");
        })
        .join(", ");

      setInputValue("languages-input", languagesText);
    }

    console.log("Form populated with comprehensive resume data");
  } catch (error) {
    console.error("Error populating form:", error);
    showAutoFillStatus("Error populating form with resume data.", "error");
  }
}

function setInputValue(inputId, value) {
  const input = document.getElementById(inputId);
  if (input && value) {
    input.value = value;
    // Add a visual indicator that the field was auto-filled
    input.classList.add("auto-filled");

    // Remove the indicator after a few seconds
    setTimeout(() => {
      input.classList.remove("auto-filled");
    }, 3000);
  }
}

function showUploadStatus(message, type) {
  const statusDiv = document.querySelector("#upload-status");
  if (statusDiv) {
    statusDiv.textContent = message;
    statusDiv.className = `upload-status ${type}`;

    if (type === "success" || type === "error") {
      setTimeout(() => {
        statusDiv.textContent = "";
        statusDiv.className = "upload-status";
      }, 5000);
    }
  }
}

function showAutoFillStatus(message, type) {
  const statusDiv = document.querySelector("#auto-fill-status");
  if (statusDiv) {
    statusDiv.textContent = message;
    statusDiv.className = `auto-fill-status ${type}`;

    if (type === "success" || type === "error" || type === "info") {
      setTimeout(() => {
        statusDiv.textContent = "";
        statusDiv.className = "auto-fill-status";
      }, 5000);
    }
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function findBestSkillMatches(parsedSkills, knownSkills, threshold = 0.5) {
  function similarity(a, b) {
    const aWords = a.toLowerCase().split(/\s+/);
    const bWords = b.toLowerCase().split(/\s+/);
    const matchCount = aWords.filter((word) => bWords.includes(word)).length;
    return matchCount / Math.max(aWords.length, bWords.length);
  }

  return parsedSkills
    .map((ps) => {
      let best = null;
      let bestScore = 0;
      for (const known of knownSkills) {
        const score = similarity(ps, known);
        if (score > bestScore && score >= threshold) {
          best = known;
          bestScore = score;
        }
      }
      return best;
    })
    .filter(Boolean); // Remove nulls
}
