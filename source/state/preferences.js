// state/preferences.js

// Central store for user preferences
export const preferences = {
  skills: [],
  locations: [],
  industries: [],
  roles: [],
  salary: null,
  nature: [],        // 1=full-time, 2=part-time, 3=intern
  workModel: []      // 1=remote, 2=on-site, 3=hybrid
};

/**
 * Update one of the array preference fields
 * @param {string} key - One of: 'skills', 'locations', 'industries', 'roles', 'nature', 'workModel'
 * @param {Array<string|number>} values - Array of selected values
 */
export function setPreference(key, values) {
  if (!preferences.hasOwnProperty(key)) {
    throw new Error(`Unknown preference key: ${key}`);
  }
  // Salary is special--handle elsewhere
  if (key !== 'salary' && !Array.isArray(values)) {
    throw new Error(`${key} must be an array`);
  }
  preferences[key] = Array.isArray(values) ? [...values] : values;
}

/**
 * Set the salary preference
 * @param {number|string} amount
 */
export function setSalary(amount) {
  preferences.salary = amount;
}

/**
 * Retrieve a snapshot of the current preferences
 * @returns {Object}
 */
export function getPreferences() {
  return {
    skills:    [...preferences.skills],
    locations: [...preferences.locations],
    industries:[...preferences.industries],
    roles:     [...preferences.roles],
    nature:    [...preferences.nature],
    workModel: [...preferences.workModel],
    salary:    preferences.salary
  };
}
