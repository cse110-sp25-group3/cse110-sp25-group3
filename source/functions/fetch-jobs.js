// functions/fetch-jobs.js

let jobsPromise = null;

/**
 * Fetches and caches the full jobs array.
 * @returns {Promise<Array<Object>>}
 */
export function fetchJobs() {
  if (!jobsPromise) {
    jobsPromise = fetch('/source/assets/datasets/dummy_job_positions.json')
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load jobs: ${res.status}`);
        return res.json();
      });
  }
  return jobsPromise;
}

/**
 * Extracts a column of values from the jobs.
 * @param {string} columnName – the key in each job object
 * @param {Object} [opts]
 * @param {boolean} [opts.flatten=false] – if true, will flatten one level (useful for array-columns)
 * @returns {Promise<Array>}
 */
export async function getColumnValues(columnName, { flatten = false } = {}) {
  const jobs = await fetchJobs();
  let values = jobs.map(job => job[columnName]);

  if (flatten) {
    // flatten one level
    values = values.reduce(
      (acc, v) => acc.concat(Array.isArray(v) ? v : v),
      []
    );
  }

  return values;
}

/**
 * Same as getColumnValues, but returns only unique entries.
 * @param {string} columnName
 * @param {Object} [opts]
 * @param {boolean} [opts.flatten=false]
 * @returns {Promise<Array>}
 */
export async function getUniqueValues(columnName, { flatten = false } = {}) {
  const vals = await getColumnValues(columnName, { flatten });
  return [...new Set(vals)];
}
