// preferences.js
import { getUniqueValues } from "../../functions/fetch-jobs.js";

// ── Persistence setup ──
const STORAGE_KEY = 'jobPreferences';
const defaultPrefs = {
  skills:     [],
  locations:  [],
  industries: [],
  roles:      [],
  nature:     [],
  workModel:  [],
  salary:     '',       // numeric as string
  salaryUnit: 'year'    // 'year' or 'hour'
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
    // ← notify everyone that prefs have changed
    window.dispatchEvent(new CustomEvent('prefsUpdated', {
      detail: { ...savedPrefs }
    }));
  } catch {}
}

// ── Helpers ──
function generateTags(items, initialSelected = [], prefKey) {
  const selectedTags = [];
  const container = document.createElement('div');
  container.className = 'tag-selector';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type to add…';
  input.className = 'tag-input';
  container.append(input);

  const selectedContainer = document.createElement('div');
  selectedContainer.className = 'selected-tags';
  container.append(selectedContainer);

  const suggestedTag = document.createElement('div');
  suggestedTag.className = 'tag-suggestions';
  container.append(suggestedTag);

  function updateSuggestions() {
    const q = input.value.trim().toLowerCase();
    const list = q
      ? items.filter(t => !selectedTags.includes(t) && t.toLowerCase().startsWith(q)).slice(0,3)
      : items.filter(t => !selectedTags.includes(t)).sort(() => 0.5 - Math.random()).slice(0,3);
    suggestedTag.innerHTML = '';
    list.forEach(tag => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'tag-suggestion-pill';
      pill.textContent = `${tag} +`;
      pill.addEventListener('click', () => selectTag(tag));
      suggestedTag.append(pill);
    });
  }

  function selectTag(tag) {
    if (selectedTags.includes(tag)) return;
    selectedTags.unshift(tag);
    savedPrefs[prefKey] = [...selectedTags];
    savePrefs();

    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'tag-pill';
    pill.textContent = `${tag} –`;
    pill.addEventListener('click', () => {
      selectedTags.splice(selectedTags.indexOf(tag),1);
      selectedContainer.removeChild(pill);
      savedPrefs[prefKey] = [...selectedTags];
      savePrefs();
      updateSuggestions();
    });
    selectedContainer.prepend(pill);
    input.value = '';
    updateSuggestions();
  }

  input.addEventListener('input', updateSuggestions);
  (Array.isArray(initialSelected) ? initialSelected : []).forEach(tag => {
    if (items.includes(tag)) selectTag(tag);
  });
  updateSuggestions();

  return { element: container, getState: () => [...selectedTags] };
}

function generateCheckboxes(options, initialSelected = [], prefKey) {
  const container = document.createElement('div');
  container.className = 'checkbox-group';
  options.forEach(({value,label}) => {
    const id = `chk-${label.replace(/\s+/g,'-').toLowerCase()}`;
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-item';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = id;
    input.value = String(value);
    input.checked = Array.isArray(initialSelected) && initialSelected.includes(String(value));
    input.addEventListener('change', () => {
      const vals = Array.from(container.querySelectorAll('input:checked')).map(cb => cb.value);
      savedPrefs[prefKey] = vals;
      savePrefs();
    });
    const lbl = document.createElement('label');
    lbl.htmlFor = id;
    lbl.textContent = label;
    wrapper.append(input, lbl);
    container.append(wrapper);
  });
  return { element: container, getState: () => Array.from(container.querySelectorAll('input:checked')).map(cb => cb.value) };
}

function makeQuickMenu(key, controlEl, getState, title) {
  const quickMenu = document.createElement('div');
  quickMenu.className = 'quick-menu';
  quickMenu.dataset.section = key;
  const h3 = document.createElement('h3');
  h3.textContent = title;
  quickMenu.append(h3, controlEl);
  return { key, el: quickMenu, getState };
}

// ── Salary Control (two radio + two inputs) ──
function createSalaryControl() {
  const wrapper = document.createElement('div');
  wrapper.className = 'salary-wrapper';

  // Hourly input
  const hourInput = document.createElement('input');
  hourInput.className = 'salary-input';
  hourInput.type = 'number';
  hourInput.placeholder = 'Hourly';
  hourInput.value = savedPrefs.salaryHourly;
  hourInput.addEventListener('input', () => {
    savedPrefs.salaryHourly = hourInput.value;
    savePrefs();
  });

  const hourLabel = document.createElement('span');
  hourLabel.textContent = '/hour';

  // Yearly input
  const yearInput = document.createElement('input');
  yearInput.className = 'salary-input';
  yearInput.type = 'number';
  yearInput.placeholder = 'Yearly';
  yearInput.value = savedPrefs.salaryYearly;
  yearInput.addEventListener('input', () => {
    savedPrefs.salaryYearly = yearInput.value;
    savePrefs();
  });

  const yearLabel = document.createElement('span');
  yearLabel.textContent = '/year';

  wrapper.append(hourInput, hourLabel, yearInput, yearLabel);

  return {
    element: wrapper,
    getState: () => {
      const states = [];
      if (savedPrefs.salaryHourly)  states.push(`$${savedPrefs.salaryHourly}/hour`);
      if (savedPrefs.salaryYearly)  states.push(`$${savedPrefs.salaryYearly}/year`);
      return states;
    }
  };
}

// ── Header Renderer ──
export async function renderFeedPreferences(container) {
  container.innerHTML = '';
  const skills     = await getUniqueValues('relevantSkills', { flatten: true });
  const locations  = await getUniqueValues('location');
  const industries = await getUniqueValues('industry');
  const roles      = await getUniqueValues('jobRole');

  const salaryControl = createSalaryControl();

  const natureMap    = {1:'Full-time',2:'Part-time',3:'Intern'};
  const workModelMap = {1:'Remote',2:'On-site',3:'Hybrid'};
  const sectionTitles = {
    skills:     'Preferred Skills',
    locations:  'Locations',
    industries: 'Industries',
    roles:      'Roles',
    salary:     'Salary',
    nature:     'Employment Type',
    workModel:  'Work Model'
  };

  const natureOpts = Object.entries(natureMap).map(([v,l]) => ({ value: v, label: l }));
  const workOpts   = Object.entries(workModelMap).map(([v,l]) => ({ value: v, label: l }));

  const sections = [
    { key:'skills',     control: generateTags(skills,     savedPrefs.skills,     'skills') },
    { key:'locations',  control: generateTags(locations,  savedPrefs.locations,  'locations') },
    { key:'industries', control: generateTags(industries, savedPrefs.industries, 'industries') },
    { key:'roles',      control: generateTags(roles,      savedPrefs.roles,      'roles') },
    { key:'salary',     control: salaryControl },
    { key:'nature',     control: generateCheckboxes(natureOpts, savedPrefs.nature,     'nature') },
    { key:'workModel',  control: generateCheckboxes(workOpts,   savedPrefs.workModel,  'workModel') }
  ];

  const menus = sections.map(({ key, control }) =>
    makeQuickMenu(key, control.element, control.getState, sectionTitles[key])
  );

  const header = document.createElement('div');
  header.className = 'preferences-header';
  Object.assign(header.style, { display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap', gap: '8px', cursor: 'grab' });

  // drag-scroll logic 
  let isDown=false, startX, scrollLeft;
  header.addEventListener('mousedown', e => { isDown=true; startX=e.pageX-header.offsetLeft; scrollLeft=header.scrollLeft; });
  ['mouseleave','mouseup'].forEach(evt => header.addEventListener(evt, () => isDown=false));
  header.addEventListener('mousemove', e => { if(!isDown) return; e.preventDefault(); header.scrollLeft=scrollLeft-(e.pageX-header.offsetLeft-startX); });
  Object.assign(header.style, { display: 'flex', overflowX: 'auto', whiteSpace: 'nowrap', gap: '8px', cursor: 'grab' });



  menus.forEach(menu => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'section-btn';

    const updateLabel = () => {
    const vals = menu.getState();
    let preview;
    if (vals.length === 0) {
      preview = sectionTitles[menu.key];
    } else {
      // for checkbox‐type menus, values are strings like "1","2","3"
      if (menu.key === 'nature') {
        // map “1”→“Full‐time”, etc.
        preview = natureMap[+vals[0]];
      } else if (menu.key === 'workModel') {
        preview = workModelMap[+vals[0]];
      } else {
        // tags and salary just show the tag text
        preview = vals[0];
      }
      if (vals.length > 1) preview += ` +${vals.length - 1}`;
    }
    btn.textContent = `${preview} ▼`;
  };

    btn.addEventListener('click', () => {
      menus.forEach(m => m.el.classList.remove('open'));
      menu.el.classList.toggle('open');
    });

    updateLabel();
    window.addEventListener('prefsUpdated', updateLabel);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-menu';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => {
      menu.el.classList.remove('open');
      window.location.reload();
    });
    menu.el.prepend(closeBtn);

    header.append(btn);
    container.append(menu.el);
  });

  container.append(header);
}

// ── Original Page Renderer ──
export async function renderPreferences(container) {
  container.innerHTML = '';
  const skills     = await getUniqueValues('relevantSkills', { flatten: true });
  const locations  = await getUniqueValues('location');
  const industries = await getUniqueValues('industry');
  const roles      = await getUniqueValues('jobRole');

  const { element: skillsEl } = generateTags(skills,     savedPrefs.skills,     'skills');
  const { element: locEl    } = generateTags(locations,  savedPrefs.locations,  'locations');
  const { element: indEl    } = generateTags(industries, savedPrefs.industries, 'industries');
  const { element: roleEl   } = generateTags(roles,      savedPrefs.roles,      'roles');

  const salaryControl = createSalaryControl();

  const natureMap    = {1:'Full-time',2:'Part-time',3:'Intern'};
  const workModelMap = {1:'Remote',2:'On-site',3:'Hybrid'};
  const natureEl = generateCheckboxes(Object.entries(natureMap).map(([v,l])=>({value:v,label:l})), savedPrefs.nature,'nature').element;
  const workEl   = generateCheckboxes(Object.entries(workModelMap).map(([v,l])=>({value:v,label:l})), savedPrefs.workModel,'workModel').element;

  const makeSection = (title, el) => { const sec=document.createElement('section'); sec.className='pref-section'; sec.innerHTML=`<h3>${title}</h3>`; sec.append(el); return sec; };

  container.append(
    makeSection('Preferred Skills', skillsEl),
    makeSection('Preferred Locations', locEl),
    makeSection('Preferred Industries', indEl),
    makeSection('Preferred Roles', roleEl),
    makeSection('Preferred Salary', salaryControl.element),
    makeSection('Employment Type', natureEl),
    makeSection('Work Model', workEl)
  );
}

// ── Loader ──
export function loadUserPreferences() {
  return {
    userSkills:   Array.isArray(savedPrefs.skills)? savedPrefs.skills:[],
    industries:   Array.isArray(savedPrefs.industries)? savedPrefs.industries:[],
    locations:    Array.isArray(savedPrefs.locations)? savedPrefs.locations:[],
    workModels:   Array.isArray(savedPrefs.workModel)? savedPrefs.workModel:[],
    natures:      Array.isArray(savedPrefs.nature)? savedPrefs.nature:[],
    roles:        Array.isArray(savedPrefs.roles)? savedPrefs.roles:[],
    salaryHourly: savedPrefs.salaryHourly,
    salaryYearly: savedPrefs.salaryYearly
  };
}
