// preferences.js
import { getUniqueValues } from "../../functions/fetch-jobs.js";

// ── Constants ──
const STORAGE_KEY = 'jobPreferences';
const CONSTANTS = {
  NATURE_MAP: { 1: 'Full-time', 2: 'Part-time', 3: 'Intern' },
  WORK_MODEL_MAP: { 1: 'Remote', 2: 'On-site', 3: 'Hybrid' },
  SECTION_TITLES: {
    skills: 'Preferred Skills',
    locations: 'Locations', 
    industries: 'Industries',
    roles: 'Roles',
    salary: 'Salary',
    nature: 'Employment Type',
    workModel: 'Work Model'
  }
};

const DEFAULT_PREFS = {
  skills: [],
  locations: [],
  industries: [],
  roles: [],
  nature: [],
  workModel: [],
  salaryHourly: '',
  salaryYearly: ''
};

// ── State Management ──
class PreferencesManager {
  constructor() {
    this.prefs = this.loadPrefs();
  }

  loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
    } catch {
      return { ...DEFAULT_PREFS };
    }
  }

  savePrefs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
      window.dispatchEvent(new CustomEvent('prefsUpdated', { detail: { ...this.prefs } }));
    } catch {}
  }

  updatePref(key, value) {
    this.prefs[key] = value;
    this.savePrefs();
  }

  getPref(key) {
    return this.prefs[key];
  }

  getAllPrefs() {
    return { ...this.prefs };
  }
}

const prefsManager = new PreferencesManager();

// ── Control Generators ──
class ControlGenerator {
  static createTagSelector(items, prefKey) {
    const selectedTags = [...(prefsManager.getPref(prefKey) || [])];
    const container = document.createElement('div');
    container.className = 'tag-selector';

    const elements = this.createTagElements(container);
    const handlers = this.createTagHandlers(items, selectedTags, prefKey, elements);
    
    this.setupTagEventListeners(elements, handlers);
    this.initializeSelectedTags(selectedTags, elements, handlers);
    handlers.updateSuggestions();

    return {
      element: container,
      getState: () => [...selectedTags]
    };
  }

  static createTagElements(container) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type to add…';
    input.className = 'tag-input';

    const selectedContainer = document.createElement('div');
    selectedContainer.className = 'selected-tags';

    const suggestedContainer = document.createElement('div');
    suggestedContainer.className = 'tag-suggestions';

    container.append(input, selectedContainer, suggestedContainer);

    return { input, selectedContainer, suggestedContainer };
  }

  static createTagHandlers(items, selectedTags, prefKey, elements) {
    const { input, selectedContainer, suggestedContainer } = elements;

    const updateSuggestions = () => {
      const query = input.value.trim().toLowerCase();
      const available = items.filter(item => !selectedTags.includes(item));
      const filtered = query 
        ? available.filter(item => item.toLowerCase().startsWith(query))
        : available.sort(() => 0.5 - Math.random());
      
      this.renderSuggestions(filtered.slice(0, 3), suggestedContainer, selectTag);
    };

    const selectTag = (tag) => {
      if (selectedTags.includes(tag)) return;
      
      selectedTags.unshift(tag);
      prefsManager.updatePref(prefKey, [...selectedTags]);
      
      this.renderSelectedTag(tag, selectedContainer, () => removeTag(tag));
      input.value = '';
      updateSuggestions();
    };

    const removeTag = (tag) => {
      const index = selectedTags.indexOf(tag);
      if (index > -1) {
        selectedTags.splice(index, 1);
        prefsManager.updatePref(prefKey, [...selectedTags]);
        updateSuggestions();
      }
    };

    return { updateSuggestions, selectTag, removeTag };
  }

  static renderSuggestions(suggestions, container, onSelect) {
    container.innerHTML = '';
    suggestions.forEach(tag => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'tag-suggestion-pill';
      pill.textContent = `${tag} +`;
      pill.addEventListener('click', () => onSelect(tag));
      container.append(pill);
    });
  }

  static renderSelectedTag(tag, container, onRemove) {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'tag-pill';
    pill.textContent = `${tag} –`;
    pill.addEventListener('click', () => {
      container.removeChild(pill);
      onRemove();
    });
    container.prepend(pill);
  }

  static setupTagEventListeners(elements, handlers) {
    elements.input.addEventListener('input', handlers.updateSuggestions);
  }

  static initializeSelectedTags(selectedTags, elements, handlers) {
    selectedTags.forEach(tag => {
      this.renderSelectedTag(tag, elements.selectedContainer, () => handlers.removeTag(tag));
    });
  }

  static createCheckboxGroup(options, prefKey) {
    const container = document.createElement('div');
    container.className = 'checkbox-group';
    const initialSelected = prefsManager.getPref(prefKey) || [];

    const updatePrefs = () => {
      const selected = Array.from(container.querySelectorAll('input:checked')).map(cb => cb.value);
      prefsManager.updatePref(prefKey, selected);
    };

    options.forEach(({ value, label }) => {
      const wrapper = this.createCheckboxItem(value, label, initialSelected.includes(String(value)), updatePrefs);
      container.append(wrapper);
    });

    return {
      element: container,
      getState: () => Array.from(container.querySelectorAll('input:checked')).map(cb => cb.value)
    };
  }

  static createCheckboxItem(value, label, checked, onChange) {
    const id = `chk-${label.replace(/\s+/g, '-').toLowerCase()}`;
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-item';

    const input = document.createElement('input');
    Object.assign(input, {
      type: 'checkbox',
      id,
      value: String(value),
      checked
    });
    input.addEventListener('change', onChange);

    const labelEl = document.createElement('label');
    labelEl.htmlFor = id;
    labelEl.textContent = label;

    wrapper.append(input, labelEl);
    return wrapper;
  }

  static createSalaryControl() {
    const wrapper = document.createElement('div');
    wrapper.className = 'salary-wrapper';

    const createSalaryInput = (type, placeholder) => {
      const input = document.createElement('input');
      Object.assign(input, {
        className: 'salary-input',
        type: 'number',
        placeholder,
        value: prefsManager.getPref(`salary${type}`) || ''
      });
      
      input.addEventListener('input', () => {
        prefsManager.updatePref(`salary${type}`, input.value);
      });
      
      return input;
    };

    const hourInput = createSalaryInput('Hourly', '0');
    const yearInput = createSalaryInput('Yearly', '0');

   const hourSpan = document.createElement('span');
    hourSpan.append(this.createLabel('$'), hourInput, this.createLabel('/hour'));

    const yearSpan = document.createElement('span');
    yearSpan.append(this.createLabel('$'), yearInput, this.createLabel('/year'));

    wrapper.append(hourSpan, yearSpan);

    return {
      element: wrapper,
      getState: () => {
        const states = [];
        const hourly = prefsManager.getPref('salaryHourly');
        const yearly = prefsManager.getPref('salaryYearly');
        if (hourly) states.push(`$${hourly}/hour`);
        if (yearly) states.push(`$${yearly}/year`);
        return states;
      }
    };
  }

  static createLabel(text) {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
  }
}

// ── Section Management ──
class SectionManager {
  static async createSections() {
    const data = await this.fetchSectionData();
    const options = this.createSectionOptions();
    
    return [
      { key: 'skills', control: ControlGenerator.createTagSelector(data.skills, 'skills') },
      { key: 'locations', control: ControlGenerator.createTagSelector(data.locations, 'locations') },
      { key: 'industries', control: ControlGenerator.createTagSelector(data.industries, 'industries') },
      { key: 'roles', control: ControlGenerator.createTagSelector(data.roles, 'roles') },
      { key: 'salary', control: ControlGenerator.createSalaryControl() },
      { key: 'nature', control: ControlGenerator.createCheckboxGroup(options.nature, 'nature') },
      { key: 'workModel', control: ControlGenerator.createCheckboxGroup(options.workModel, 'workModel') }
    ];
  }

  static async fetchSectionData() {
    const [skills, locations, industries, roles] = await Promise.all([
      getUniqueValues('relevantSkills', { flatten: true }),
      getUniqueValues('location'),
      getUniqueValues('industry'),
      getUniqueValues('jobRole')
    ]);
    
    return { skills, locations, industries, roles };
  }

  static createSectionOptions() {
    const mapToOptions = (map) => Object.entries(map).map(([value, label]) => ({ value, label }));
    
    return {
      nature: mapToOptions(CONSTANTS.NATURE_MAP),
      workModel: mapToOptions(CONSTANTS.WORK_MODEL_MAP)
    };
  }

  static createSection(title, element) {
    const section = document.createElement('section');
    section.className = 'pref-section';
    section.innerHTML = `<h3>${title}</h3>`;
    section.append(element);
    return section;
  }

  static createQuickMenu(key, controlEl, getState) {
    const quickMenu = document.createElement('div');
    quickMenu.className = 'quick-menu';
    quickMenu.dataset.section = key;
    
    const h3 = document.createElement('h3');
    h3.textContent = CONSTANTS.SECTION_TITLES[key];
    quickMenu.append(h3, controlEl);
    
    return { key, el: quickMenu, getState };
  }
}

class HeaderManager {
  static createHeader(menus, container) {
    const header = document.createElement('div');
    header.className = 'preferences-header';
    Object.assign(header.style, {
      display: 'flex',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      gap: '8px',
      cursor: 'grab'
    });

    this.setupDragScroll(header);
    this.createMenuButtons(menus, header, container);
    
    return header;
  }

  static setupDragScroll(header) {
    let isDown = false, startX, scrollLeft;
    
    header.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX - header.offsetLeft;
      scrollLeft = header.scrollLeft;
    });

    ['mouseleave', 'mouseup'].forEach(event => 
      header.addEventListener(event, () => isDown = false)
    );

    header.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      header.scrollLeft = scrollLeft - (e.pageX - header.offsetLeft - startX);
    });
  }

  static createMenuButtons(menus, header, container) {
    menus.forEach(menu => {
      const btn = this.createMenuButton(menu, menus);
      const closeBtn = this.createCloseButton(menu);
      
      menu.el.prepend(closeBtn);
      header.append(btn);
      container.append(menu.el);
    });
  }

  static createMenuButton(menu, allMenus) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'section-btn';

    const updateLabel = () => {
      const vals = menu.getState();
      const preview = this.getPreviewText(menu.key, vals);
      btn.textContent = `${preview} ▼`;
    };

    btn.addEventListener('click', () => {
      allMenus.forEach(m => m.el.classList.remove('open'));

      // Determine if it's a desktop or mobile view
      const isDesktop = window.innerWidth >= 768;
      if (isDesktop) {
        // Center menu on desktop
        menu.el.style.transition = 'none'; // Remove animation for smooth transition
        menu.el.classList.toggle('open');
        menu.el.style.transform = 'translate(-50%, -50%)'; // Centered on desktop
      } else {
        // Apply sliding effect on mobile
        menu.el.style.transition = 'transform 0.3s ease-out'; // Slide animation
        menu.el.classList.toggle('open');
        if (menu.el.classList.contains('open')) {
          menu.el.style.transform = 'translateY(0)'; // Slide up when opening
        } else {
          menu.el.style.transform = 'translateY(100%)'; // Slide down when closing
        }
      }
    });

    updateLabel();
    window.addEventListener('prefsUpdated', updateLabel);
    
    return btn;
  }

  static getPreviewText(key, values) {
    if (values.length === 0) {
      return CONSTANTS.SECTION_TITLES[key];
    }

    let preview;
    if (key === 'nature') {
      preview = CONSTANTS.NATURE_MAP[+values[0]];
    } else if (key === 'workModel') {
      preview = CONSTANTS.WORK_MODEL_MAP[+values[0]];
    } else {
      preview = values[0];
    }

    return values.length > 1 ? `${preview} +${values.length - 1}` : preview;
  }

  static createCloseButton(menu) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-menu';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => {
      menu.el.classList.remove('open');
      window.location.reload();
    });
    return closeBtn;
  }
}


// ── Public API ──
export async function renderFeedPreferences(container) {
  container.innerHTML = '';
  
  const sections = await SectionManager.createSections();
  const menus = sections.map(({ key, control }) =>
    SectionManager.createQuickMenu(key, control.element, control.getState)
  );
  
  const header = HeaderManager.createHeader(menus, container);
  container.append(header);
}

export async function renderPreferences(container) {
  container.innerHTML = '';
  
  const sections = await SectionManager.createSections();
  
  sections.forEach(({ key, control }) => {
    const section = SectionManager.createSection(
      CONSTANTS.SECTION_TITLES[key],
      control.element
    );
    container.append(section);
  });
}

export function loadUserPreferences() {
  const prefs = prefsManager.getAllPrefs();
  
  return {
    userSkills: Array.isArray(prefs.skills) ? prefs.skills : [],
    industries: Array.isArray(prefs.industries) ? prefs.industries : [],
    locations: Array.isArray(prefs.locations) ? prefs.locations : [],
    workModels: Array.isArray(prefs.workModel) ? prefs.workModel : [],
    natures: Array.isArray(prefs.nature) ? prefs.nature : [],
    roles: Array.isArray(prefs.roles) ? prefs.roles : [],
    salaryHourly: prefs.salaryHourly,
    salaryYearly: prefs.salaryYearly
  };
}