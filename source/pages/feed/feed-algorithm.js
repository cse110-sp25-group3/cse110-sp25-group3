// feed-algorithm.js
import { skillAssessment } from "../../functions/skill-assessment.js";
import { computeJobScore }   from "../../functions/score-heuristic.js";

/**
 * Given:
 *   - jobs: Array of raw job objects (with .pay, requiredSkills, relevantSkills, etc.)
 *   - prefs (an object with a list of user pref): {
 *       userSkills, industries, locations, workModels, natures, roles,
 *       salaryYearly     // string
 *     }
 *
 * Returns enriched jobs, each with:
 *   - matchedSkills, lostSkills
 *   - skillScore, dateScore, payScore
 *   - compositeScore (including payScore)
 */
export function runFeedAlgorithm(jobs, prefs) {
  // 1) Filter
  const filtered = jobs.filter(job => {
    return !Array.isArray(prefs.industries) ||
           prefs.industries.length === 0 ||
           prefs.industries.includes(job.industry);
  });

  // 2) Score each job
  filtered.forEach(job => {
    // a) Base composite via your heuristic
    job.baseScore = computeJobScore(job, {
      userSkills: prefs.userSkills,
      workModels: prefs.workModels,
      natures:    prefs.natures,
      locations:  prefs.locations,
      roles:      prefs.roles
    });

    // b) Skill score
    job.skillScore = skillAssessment(
      prefs.userSkills,
      Array.isArray(job.requiredSkills) ? job.requiredSkills : []
    );

    // c) Freshness
    job.dateScore = datePostedScore(job.datePosted, 30);

    // d) Pay score
    // prefPay = an int that represents user's prefer minimum-max wage for the job - 
    // anything above this is perfect but below is also tolerable
    const prefPay = sanitizeSalary(prefs.salaryYearly); // verify the input and typecast to int
    const jobPay = parsePay(job.pay);
    job.payScore = payScore(jobPay, prefPay);

    // e) Matched/Lost skills
    const rel = Array.isArray(job.relevantSkills) ? job.relevantSkills : [];
    job.matchedSkills = rel.filter(s => prefs.userSkills.includes(s));
    job.lostSkills    = rel.filter(s => !prefs.userSkills.includes(s));
  });

  // 3) Combine scores
  const W_BASE = 0.5;
  const W_DATE = 0.2;
  const W_PAY  = 0.3;   // adjust to taste

  filtered.forEach(job => {
    job.compositeScore = Math.round(
      job.baseScore   * W_BASE +
      job.dateScore   * W_DATE +
      job.payScore    * W_PAY
    );
  });

  // 4) Sort descending
  filtered.sort((a, b) => b.compositeScore - a.compositeScore);

  return filtered;
}

/**
 * Take any input, strip out non‐digits, and return as a non‐negative integer.
 * @param {string} raw – the original prefs.salaryYearly string
 * @param {number} [defaultInput=0] – value to use if nothing parseable remains
 * @returns {number}
 */
function sanitizeSalary(raw, defaultInput = 0) {
  // if raw is not null, assign asStr with make sure to assign raw as String, otherwise empty string
  const asStr = (raw != null ? String(raw) : "");
  // strip out any non-digit character in the input
  const digitsOnly = asStr.replace(/\D/g, "");

  if (digitsOnly === '') return defaultInput;
  const n = Number(digitsOnly); //typecast the str to int
  return Number.isNaN(n) ? defaultInput : n; // if n is NaN, return 0, otherwise n
}

/**
 * parsePay()
 *
 * Attempts to turn a job.pay string (e.g. "$80k", "70k-90k", "$25/hr") into a
 * single annualized number like 80000 or 80000 (midpoint). Returns 0 on failure.
 */
function parsePay(payString) {
  if (typeof payString !== "string") return 0;
  // Remove any $ or commas and make lowercase for trailing info like year and hour
  let s = payString.trim().replace(/\$/g, "").replace(/,/g, "").toLowerCase();

  // Handle "80k", "70k-90k", "80000-90000"
	// Replace trailing 'k' with '000'
  s = s.replace(/k\b/, "000");

  // Handle hourly (e.g. "25/hr" or "25/hr - 30/hr")
  if (s.includes("/hr")) {
    const cleaned = s.replace(/\/hr/g, "");

    // split on any dash, sanitize each side (will become an array of 1 element if no dash)
    const parts = cleaned.split("-");
    const rates = parts.map(part => sanitizeSalary(part, 0)) // sanitize each part in the parts array
                      .filter(n => !Number.isNaN(n)); // Drops any resulting NaN values from the array.
    if (rates.length === 0) return 0;
    const avgHr = rates.reduce((sum, x) => sum + x, 0) / rates.length;
    return avgHr * 2080;
  }

  // If it’s a range with '-', take midpoint (for annual pay)
  if (s.includes("-")) {
    const parts = s.split("-")
    const nums = sanitizeSalary(parts);
    if (nums.length === 0) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }

  // Otherwise it’s a single number, e.g. “80000”
  const val = sanitizeSalary(s);
  return val;
}

function payScore(jobSalary, userMin = 0) {
  if (!userMin || userMin <= 0) return 50; // neutral
  if (jobSalary < userMin) return 0;
  if (jobSalary > userMax) return 100;
  return Math.round(((jobSalary - userMin) / (userMax - userMin)) * 100);
}

/**
 * datePostedScore()
 *
 * Given a string date (e.g. "2025-05-15"), returns a number 0–100 where:
 *   jobs posted today => 100
 *   jobs posted >= maxDays ago => 0
 */
function datePostedScore(dateString, maxDays = 30) {
  const postedTime = new Date(dateString).getTime(); // in milisecond
  if (isNaN(postedTime)) return 0; // invalid date => 0 freshness
  const ageDays = (Date.now() - postedTime) / (1000*60*60*24); // in days
  const raw = (maxDays - ageDays) / maxDays;
  // if older than maxDays, score = 0; if fresh (0 days), score = 100
  return raw <= 0 ? 0 : Math.round(Math.min(raw,1)*100);
}
