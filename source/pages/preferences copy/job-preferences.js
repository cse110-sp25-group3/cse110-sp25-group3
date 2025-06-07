// pages/job-preferences/job-preferences.js
import { getUniqueValues } from "../../functions/fetch-jobs.js";

// ── Persistence setup ──
const STORAGE_KEY = 'jobPreferences';
const defaultPrefs = {
  skills:    [],
  locations: [],
  industries:[],
  roles:     [],
  nature:    [],
  workModel: [],
  salary:    ''
};

let savedPrefs;
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  savedPrefs = raw ? JSON.parse(raw) : { ...defaultPrefs };
} catch {
  savedPrefs = { ...defaultPrefs };
}

function savePrefs() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPrefs));
  } catch {}
}

//helper for making tag html elements
function generateTags(items, initialSelected = [], prefKey) {
  const selectedTags = [];
  
  //tag container
  const container = document.createElement('div');
  container.className = 'tag-selector';

  //container for selected tags 
  const selectedContainer = document.createElement('div');
  selectedContainer.className = 'selected-tags';
  container.append(selectedContainer);

  //add button (show text input)
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.textContent = '+ add';
  addBtn.className = 'add-button';
  container.append(addBtn);

  //text input (hidden on default)
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type to add…';
  input.className = 'tag-input hidden';
  container.append(input);

  //tag suggestions (also hidden on default)
  const suggestedTag = document.createElement('div');
  suggestedTag.className = 'tag-suggestions hidden';
  container.append(suggestedTag);

  // Helpers ------------------------------------------------

  //helper function for suggesting tags 
  function updateSuggestions() {
    //matching according to input 
    const q = input.value.trim().toLowerCase();
    let list = q
      ? items.filter(t =>
          //excluding tags that were already selected
          !selectedTags.includes(t) &&
          //filtering by query/text input 
          t.toLowerCase().startsWith(q)
        )
        .slice(0, 3) //only take the first three matches 
      //when there's no query
      : items.filter(t => !selectedTags.includes(t))
        .sort(() => 0.5 - Math.random()) //three random tags 
        .slice(0, 3);

    //generating the html element for each tag 
    suggestedTag.innerHTML = '';
    list.forEach(tag => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'tag-suggestion-pill';
      pill.textContent = tag + ' +';
      pill.addEventListener('click', () => selectTag(tag));
      suggestedTag.append(pill);
    });
    
    suggestedTag.classList.toggle('hidden', list.length === 0);
  }

  //function for selecting a tag 
  function selectTag(tag) {
    if (selectedTags.includes(tag)) return; //if already has tag, skip
    selectedTags.unshift(tag); //add tag to the top of the list 

    // update persistence
    savedPrefs[prefKey] = [...selectedTags];
    savePrefs();

    //creating html ele for the tag 
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'tag-pill';
    pill.textContent = tag + ' –';
    pill.addEventListener('click', () => {
      //can remove tag by clicking 
      selectedTags.splice(selectedTags.indexOf(tag), 1);
      selectedContainer.removeChild(pill);
      // update persistence
      savedPrefs[prefKey] = [...selectedTags];
      savePrefs();
    });

    selectedContainer.prepend(pill);

    //after tag has been added, rehide the text input and suggestions 
    input.value = '';
    suggestedTag.innerHTML = '';
    input.classList.add('hidden');
    suggestedTag.classList.add('hidden');
    addBtn.classList.remove('hidden');
  }

  // Event wiring ------------------------------------------

  // show input when "+add" clicked
  addBtn.addEventListener('click', () => {
    addBtn.classList.add('hidden');
    input.classList.remove('hidden');
    suggestedTag.classList.remove('hidden');
    input.focus();
    updateSuggestions();
  });

  // on each keystroke, update suggestions
  input.addEventListener('input', updateSuggestions);

  // clicking outside closes input/suggestions
  document.addEventListener('click', e => {
    if (!container.contains(e.target)) {
      input.classList.add('hidden');
      suggestedTag.classList.add('hidden');
      addBtn.classList.remove('hidden');
    }
  });

  // pre-select any saved tags
  initialSelected.forEach(tag => {
    if (items.includes(tag)) selectTag(tag);
  });

  return {
    element: container,
    getSelectedTags: () => [...selectedTags]
  };
}

//helper for generating text box entries 
function generateCheckboxes(options, initialSelected = [], prefKey) {
  //html container for the checkboxes
  const container = document.createElement('div');
  container.className = 'checkbox-group';

  //for each option (in parameter array), generate a checkbox and label
  options.forEach(({ value, label }) => {
    const id = `chk-${label.replace(/\s+/g, '-').toLowerCase()}`;

    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-item';

    const input = document.createElement('input');
    input.type  = 'checkbox';
    input.id    = id;
    input.value = String(value);

    // set initial checked state
    input.checked = initialSelected.includes(String(value));
    // auto-save on change
    input.addEventListener('change', () => {
      const vals = Array.from(container.querySelectorAll('input:checked'))
                        .map(cb => cb.value);
      savedPrefs[prefKey] = vals;
      savePrefs();
    });

    const lbl = document.createElement('label');
    lbl.htmlFor = id;
    lbl.textContent = label;

    wrapper.append(input, lbl);
    container.append(wrapper);
  });

  return {
    element: container,
    getSelectedValues: () =>
      Array.from(container.querySelectorAll('input:checked'))
           .map(cb => cb.value)
  };
}

//renderer 
export async function renderPreferences(container) {
  //clear old content and add your section title
  container.innerHTML = ``;

  //all the cols we need preferences for 
  const skills     = await getUniqueValues('relevantSkills', { flatten: true });
  const locations  = await getUniqueValues('location');
  const industries = await getUniqueValues('industry');
  const roles      = await getUniqueValues('jobRole');

  //building the tag selectors, using savedPrefs
  const { element: skillsEl, getSelectedTags: getSkills     } =
    generateTags(skills,     savedPrefs.skills,     'skills');
  const { element: locEl,    getSelectedTags: getLocations  } =
    generateTags(locations,  savedPrefs.locations,  'locations');
  const { element: indEl,    getSelectedTags: getIndustries} =
    generateTags(industries, savedPrefs.industries, 'industries');
  const { element: roleEl,   getSelectedTags: getRoles      } =
    generateTags(roles,      savedPrefs.roles,      'roles');

  // Preferred salary input
  const salaryInput = document.createElement('input');
  salaryInput.type        = 'number';
  salaryInput.placeholder = 'Preferred salary';
  salaryInput.value       = savedPrefs.salary;
  // auto-save salary on input
  salaryInput.addEventListener('input', () => {
    savedPrefs.salary = salaryInput.value;
    savePrefs();
  });

  // checkbox vocabularies
  const natureMap = {
    1: 'Full-time',
    2: 'Part-time',
    3: 'Intern'
  };
  const workModelMap = {
    1: 'Remote',
    2: 'On-site',
    3: 'Hybrid'
  };

  const natureOptions = Object.entries(natureMap)
    .map(([value, label]) => ({ value, label }));
  const workModelOptions = Object.entries(workModelMap)
    .map(([value, label]) => ({ value, label }));
  
  const { element: natureEl, getSelectedValues: getNatures     } =
    generateCheckboxes(natureOptions,   savedPrefs.nature,    'nature');
  const { element: workEl,   getSelectedValues: getWorkModels } =
    generateCheckboxes(workModelOptions, savedPrefs.workModel, 'workModel');

  // helper to wrap sections
  const makeSection = (title, el) => {
    const sec = document.createElement('section');
    sec.className = 'pref-section';
    sec.innerHTML = `<h3>${title}</h3>`;
    sec.append(el);
    return sec;
  };

  // append all your preference controls (no save button needed)
  container.append(
    makeSection('Preferred Skills',      skillsEl),
    makeSection('Preferred Locations',   locEl),
    makeSection('Preferred Industries',  indEl),
    makeSection('Preferred Roles',       roleEl),
    makeSection('Preferred Salary',      salaryInput),
    makeSection('Employment Type',       natureEl),
    makeSection('Work Model',            workEl)
  );
}

/**
 * loadUserPreferences()
 *
 * Reads from `savedPrefs` (which was initialized from localStorage)
 * and returns an object keyed exactly for CardDeck’s constructor:
 *   {
 *     userSkills:  [...],
 *     industries:  [...],
 *     locations:   [...],
 *     workModels:  [...],
 *     natures:     [...],
 *     roles:       [...]
 *   }
 *
 * (We ignore `salary` here because CardDeck doesn’t use it.)
 */
export function loadUserPreferences() {
  return {
    userSkills:  Array.isArray(savedPrefs.skills)     ? savedPrefs.skills     : [],
    industries:  Array.isArray(savedPrefs.industries) ? savedPrefs.industries : [],
    locations:   Array.isArray(savedPrefs.locations)  ? savedPrefs.locations  : [],
    workModels:  Array.isArray(savedPrefs.workModel)  ? savedPrefs.workModel  : [],
    natures:     Array.isArray(savedPrefs.nature)     ? savedPrefs.nature     : [],
    roles:       Array.isArray(savedPrefs.roles)      ? savedPrefs.roles      : []
  };
}