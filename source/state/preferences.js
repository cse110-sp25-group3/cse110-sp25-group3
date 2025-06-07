// state/preferences.js
const STORAGE_KEY = 'jobPreferences';

const defaultPrefs = {
  skills:        [],
  locations:     [],
  industries:    [],
  roles:         [],
  nature:        [],
  workModel:     [],
  salaryHourly:  '',   // new
  salaryYearly:  ''    // new
};

// load or fallback
let preferences;
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  preferences = raw ? JSON.parse(raw) : { ...defaultPrefs };
} catch {
  preferences = { ...defaultPrefs };
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {}
}

export function setPreference(key, values) {
  if (!(key in preferences)) throw new Error(`Unknown pref ${key}`);
  preferences[key] = Array.isArray(values) ? values : [values];
  save();
}

// replace setSalary() with two setters:
export function setSalaryHourly(val) {
  preferences.salaryHourly = String(val);
  save();
}

export function setSalaryYearly(val) {
  preferences.salaryYearly = String(val);
  save();
}

export function getPreferences() {
  // return a copy
  return {
    skills:        [...preferences.skills],
    locations:     [...preferences.locations],
    industries:    [...preferences.industries],
    roles:         [...preferences.roles],
    nature:        [...preferences.nature],
    workModel:     [...preferences.workModel],
    salaryHourly:  preferences.salaryHourly,
    salaryYearly:  preferences.salaryYearly
  };
}
