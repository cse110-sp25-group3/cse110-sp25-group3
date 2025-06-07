let resumeCounter = 0;
let resumeParser = null;
let isProcessing = false; // Add flag to prevent multiple simultaneous uploads
let processedFiles = new Set(); // Track processed files to prevent duplicates

// Initialize PDF.js and parser when the module loads
async function initializePDFParser() {
  try {
    // Check if BrowserResumeParser is available
    if (typeof BrowserResumeParser === 'undefined') {
      console.error('BrowserResumeParser not found. Make sure ../functions/browser-resume-parser.js is loaded.');
      throw new Error('BrowserResumeParser class not available');
    }
    
    // Load PDF.js library if not already loaded
    if (typeof pdfjsLib === 'undefined') {
      console.log('Loading PDF.js...');
      await loadPDFJS();
    }
    
    // Initialize the resume parser with full sophistication
    resumeParser = new BrowserResumeParser();
    console.log('Complete resume parser initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize PDF parser:', error);
    return false;
  }
}

// Load PDF.js library dynamically
function loadPDFJS() {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof pdfjsLib !== 'undefined') {
      resolve();
      return;
    }
    
    console.log('Loading PDF.js from CDN...');
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      try {
        // Set worker path
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        console.log('PDF.js loaded successfully');
        resolve();
      } catch (error) {
        console.error('Error setting up PDF.js:', error);
        reject(error);
      }
    };
    script.onerror = (error) => {
      console.error('Failed to load PDF.js:', error);
      reject(new Error('Failed to load PDF.js library'));
    };
    document.head.appendChild(script);
  });
}

export async function renderDocuments(container) {
  // Initialize PDF parser first
  const initSuccess = await initializePDFParser();
  
  // Reset counter when page is rendered to prevent accumulation
  resumeCounter = 0;
  processedFiles.clear();
  
  container.innerHTML = `
    <div class="section">
      <h2 class="section-title">Manage Resumes</h2>
      ${!initSuccess ? `
        <div class="error-message">
          ⚠️ Resume parsing is not available. Please check that all required files are loaded properly.
          <br><small>Check the browser console for detailed error information.</small>
        </div>
      ` : ''}
      <div class="upload-area">
        <input type="file" id="resume-input" accept=".pdf" hidden ${!initSuccess ? 'disabled' : ''}>
        <button id="upload-btn" class="btn btn-blue" ${!initSuccess ? 'disabled' : ''}>
          ${initSuccess ? 'Upload New Resume' : 'Upload Disabled'}
        </button>
        <div id="upload-status" class="upload-status"></div>
      </div>
      <div id="resume-list" class="resume-list"></div>
    </div>

    <hr class="divider">

    <div class="section">
      <h2 class="section-title">Personal Information</h2>
      <div id="auto-fill-status" class="auto-fill-status"></div>
      <form id="info-form" class="info-form">
        <label>First Name</label>
        <input type="text" name="name" id="name-input" required>
        <label>Last Name</label>
        <input type="text" name="lname" id="lname-input" required>

        <label>Date of Birth</label>
        <input type="date" name="dob" id="dob-input">

        <label>Gender</label>
        <select name="dob" id="dob-input">
        <option value="">Select</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        </select>

        <label>Phone Number</label>
        <input type="tel" name="phone" id="phone-input" required>

        <label>Email</label>
        <input type="email" name="email" id="email-input" required>
        <label>Location</label>
        <input type="text" name="location" id="location-input">

        <label>School / University</label>
        <input type="text" name="school" id="school-input">

        <label>Degree</label>
        <input type="text" name="degree" id="degree-input">

        <label>Graduation Year</label>
        <input type="number" name="gradYear" id="gradYear-input" min="1900" max="2100">

        <label>Work History</label>
        <textarea name="history" id="history-input" rows="3"></textarea>

        <label>Skills</label>
        <textarea name="skills" id="skills-input" rows="2"></textarea>

        <label>Certifications</label>
        <textarea name="certifications" id="certifications-input" rows="2"></textarea>

        <label>Languages</label>
        <textarea name="languages" id="languages-input" rows="2"></textarea>
        <hr class="divider">
        <label>Linkedin</label>
        <input type="text" name="linkedin" id="linkedin-input">

        <label>Are you Hispanic or Latinx?</label>
        <select name="hispanic" id="hispanic-input">
        <option value="">Select</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
        </select>

        <label>Race</label>
        <select name="race" id="race-input">
        <option value="">Select</option>
        <option value="American Indian or Alaska Native">American Indian or Alaska Native</option>
        <option value="Asian">Asian</option>
        <option value="Black or African American">Black or African American</option>
        <option value="Hispanic or Latino">Hispanic or Latino</option>
        <option value="Native Hawaiian or Other Pacific Islander">Native Hawaiian or Other Pacific Islander</option>
        <option value="Two or more races">Two or more races</option>
        <option value="I don't wish to answer">I don't wish to answer</option>
        </select>

        <label>Protected Veteran Status</label>
        <select name="veteran" id="veteran-input">
        <option value="">Select</option>
        <option value="I am one or more of the classifications of protected veterans">I am one or more of the classifications of protected veterans</option>
        <option value="I am not a Protected Veteran">I am not a Protected Veteran</option>
        <option value="I don't wish to answer">I don't wish to answer</option>
        </select>

        <label>Disability Status</label>
        <select name="disability" id="disability-input">
        <option value="">Select</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
        </select>

        <button type="submit" class="btn btn-green">Save Information</button>
        <button type="button" id="clear-form" class="btn btn-gray">Clear Form</button>
      </form>
    </div>
  `;

  const uploadInput = container.querySelector('#resume-input');
  const uploadBtn = container.querySelector('#upload-btn');
  const uploadStatus = container.querySelector('#upload-status');
  const autoFillStatus = container.querySelector('#auto-fill-status');
  const resumeList = container.querySelector('#resume-list');
  const form = container.querySelector('#info-form');
  const clearBtn = container.querySelector('#clear-form');

  // Only add upload functionality if parser is initialized
  if (initSuccess && uploadBtn && uploadInput) {
    // Remove any existing event listeners by cloning the element
    const newUploadInput = uploadInput.cloneNode(true);
    const newUploadBtn = uploadBtn.cloneNode(true);
    
    uploadInput.parentNode.replaceChild(newUploadInput, uploadInput);
    uploadBtn.parentNode.replaceChild(newUploadBtn, uploadBtn);
    
    // Add event listeners to clean elements
    newUploadBtn.addEventListener('click', () => newUploadInput.click());

    newUploadInput.addEventListener('change', async function (event) {
      const file = event.target.files[0];
      if (!file) return;

      // Create unique file signature
      const fileSignature = `${file.name}-${file.size}-${file.lastModified}`;
      
      // Check if this exact file has already been processed
      if (processedFiles.has(fileSignature)) {
        event.target.value = ''; // Clear input
        return;
      }

      // Prevent multiple simultaneous uploads
      if (isProcessing) {
        event.target.value = ''; // Clear input
        return;
      }

      // Check if it's a PDF
      if (file.type !== 'application/pdf') {
        showUploadStatus('Please upload a PDF file.', 'error');
        event.target.value = ''; // Clear input
        return;
      }

      // Mark this file as being processed
      processedFiles.add(fileSignature);

      const resumeId = `resume-${resumeCounter++}`;
      
      try {
        isProcessing = true; // Set processing flag
        
        // Show processing status
        showUploadStatus('Processing resume with advanced parsing...', 'processing');
        showAutoFillStatus('Extracting comprehensive information from resume...', 'processing');
        
        // Create resume card first
        const resumeCard = createResumeCard(file, resumeId);
        resumeList.appendChild(resumeCard);
        
        // Store the original file for viewing
        resumeCard.originalFile = file;
        
        // Parse the PDF using the complete sophisticated parser
        if (!resumeParser) {
          throw new Error('Resume parser not initialized');
        }
        
        const resumeData = await resumeParser.parseResumeFromFile(file);
        console.log('Parsed resume data:', resumeData);
        
        // Auto-fill the form with extracted data
        populateForm(resumeData);
        
        showUploadStatus('Resume processed successfully!', 'success');
        showAutoFillStatus('Form auto-filled with comprehensive resume data. Please review and edit as needed.', 'success');
        
        // Store parsed data with the resume card for future reference
        resumeCard.dataset.resumeData = JSON.stringify(resumeData);
        
      } catch (error) {
        console.error('Error processing resume:', error);
        showUploadStatus('Error processing resume. Please try again.', 'error');
        showAutoFillStatus('', '');
        
        // Remove from processed files set since it failed
        processedFiles.delete(fileSignature);
        
        // Remove the card if processing failed
        const cardToRemove = document.getElementById(resumeId);
        if (cardToRemove) {
          cardToRemove.remove();
        }
      } finally {
        isProcessing = false; // Clear processing flag
        event.target.value = ''; // Clear file input
      }
    });
  } else if (!initSuccess) {
    console.warn('Resume parsing functionality disabled due to initialization failure');
  }

  // Form submit handler
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      localStorage.setItem('userData', JSON.stringify(data))  
      console.log('Saved form data:', data);
      showAutoFillStatus('Information saved successfully!', 'success');
    });
  }

  // Clear form button handler
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      if (form) {
        form.reset();
        showAutoFillStatus('Form cleared.', 'info');
      }
    });
  }
}

function createResumeCard(file, resumeId) {
  const div = document.createElement('div');
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
  const starBtn = div.querySelector('.star-btn');
  starBtn.addEventListener('click', function () {
    this.classList.toggle('starred');
    this.textContent = this.classList.contains('starred') ? '★' : '☆';
  });

  // Reload/re-parse button
  const reloadBtn = div.querySelector('.reload-btn');
  reloadBtn.addEventListener('click', async function() {
    const resumeDataStr = div.dataset.resumeData;
    if (resumeDataStr) {
      try {
        const resumeData = JSON.parse(resumeDataStr);
        populateForm(resumeData);
        showAutoFillStatus('Form re-filled with resume data.', 'success');
      } catch (error) {
        console.error('Error re-parsing resume:', error);
        showAutoFillStatus('Error re-loading resume data.', 'error');
      }
    }
  });

  // View original PDF button
  const viewBtn = div.querySelector('.view-btn');
  viewBtn.addEventListener('click', function() {
    // Check if we have the original file stored
    if (div.originalFile) {
      try {
        // Create a blob URL for the PDF file
        const fileURL = URL.createObjectURL(div.originalFile);
        
        // Open the PDF in a new tab
        window.open(fileURL, '_blank');
        
        // Clean up the blob URL after a short delay to free memory
        setTimeout(() => {
          URL.revokeObjectURL(fileURL);
        }, 1000);
        
      } catch (error) {
        console.error('Error opening PDF:', error);
        showAutoFillStatus('Error opening PDF file', 'error');
      }
    } else {
      console.error('Original file not found');
      showAutoFillStatus('PDF file not available', 'error');
    }
  });

  // Delete Button
  const deleteBtn = div.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    div.remove();
  });

  return div;
}

function populateForm(resumeData) {
  try {
    // Populate contact information
    if (resumeData.contact) {
      setInputValue('name-input', (resumeData.contact.name).split(' ').slice(0, -1).join(' '));
      setInputValue('lname-input', (resumeData.contact.name).split(' ').slice(-1).join(' '));
      setInputValue('email-input', resumeData.contact.email);
      setInputValue('phone-input', resumeData.contact.phone);
      setInputValue('location-input', resumeData.contact.location);
      setInputValue('linkedin-input', resumeData.contact.linkedin);
    }
    console.log("resumeData",resumeData)
    // Populate education information
    if (resumeData.education && resumeData.education.length > 0) {
      const firstEducation = resumeData.education[0];
      setInputValue('school-input', firstEducation.institution);
      setInputValue('degree-input', firstEducation.degree);
      setInputValue('gradYear-input', firstEducation.year);
    }

    // Populate work history (comprehensive)
    if (resumeData.experience && resumeData.experience.length > 0) {
      const workHistory = resumeData.experience.map(exp => {
        const parts = [];
        if (exp.title) parts.push(exp.title);
        if (exp.company) parts.push(`at ${exp.company}`);
        if (exp.duration) parts.push(`(${exp.duration})`);
        if (exp.location) parts.push(`- ${exp.location}`);
        return parts.join(' ');
      }).join('\n');
      
      setInputValue('history-input', workHistory);
    }

    // Populate skills (comprehensive)
    if (resumeData.skills && resumeData.skills.length > 0) {
      const skillsText = resumeData.skills.join(', ');
      setInputValue('skills-input', skillsText);
    }

    // Populate certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      const certificationsText = resumeData.certifications.map(cert => {
        const parts = [cert.name];
        if (cert.issuer) parts.push(`(${cert.issuer})`);
        if (cert.date) parts.push(`- ${cert.date}`);
        return parts.join(' ');
      }).join('\n');
      
      setInputValue('certifications-input', certificationsText);
    }

    // Populate languages
    if (resumeData.languages && resumeData.languages.length > 0) {
      const languagesText = resumeData.languages.map(lang => {
        const parts = [lang.language];
        if (lang.proficiency) parts.push(`(${lang.proficiency})`);
        return parts.join(' ');
      }).join(', ');
      
      setInputValue('languages-input', languagesText);
    }

    console.log('Form populated with comprehensive resume data');
  } catch (error) {
    console.error('Error populating form:', error);
    showAutoFillStatus('Error populating form with resume data.', 'error');
  }
}

function setInputValue(inputId, value) {
  const input = document.getElementById(inputId);
  if (input && value) {
    input.value = value;
    // Add a visual indicator that the field was auto-filled
    input.classList.add('auto-filled');
    
    // Remove the indicator after a few seconds
    setTimeout(() => {
      input.classList.remove('auto-filled');
    }, 3000);
  }
}

function showUploadStatus(message, type) {
  const statusDiv = document.querySelector('#upload-status');
  if (statusDiv) {
    statusDiv.textContent = message;
    statusDiv.className = `upload-status ${type}`;
    
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'upload-status';
      }, 5000);
    }
  }
}

function showAutoFillStatus(message, type) {
  const statusDiv = document.querySelector('#auto-fill-status');
  if (statusDiv) {
    statusDiv.textContent = message;
    statusDiv.className = `auto-fill-status ${type}`;
    
    if (type === 'success' || type === 'error' || type === 'info') {
      setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'auto-fill-status';
      }, 5000);
    }
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}