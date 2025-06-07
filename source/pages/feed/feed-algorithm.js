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
  // strip out any characters that are NOT digits or dot (so 25.50 doesn't become 2,550)
  let cleaned = asStr.replace(/[^0-9.]/g, "");

  // If there's more than one dot, keep only the first
  const [head, ...rest] = cleaned.split(".");
  cleaned = head + (rest.length ? "." + rest.join("") : "");

  if (cleaned === '') return defaultInput;
  
  const n = Number(cleaned); //typecast the str to int
  return Number.isNaN(n) ? defaultInput : Math.round(n); // if n is NaN, return 0, otherwise return rounded n
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
  s = s.replace(/k\b/g, "000");

  // Handle hourly (e.g. "25/hr" or "25/hr - 30/hr")
  if (s.includes("/hr")) {
    const cleaned = s.replace(/\/hr/g, "");

    // split on any dash, sanitize each side (will become an array of 1 element if no dash)
    const parts = cleaned.split("-");
    const rates = parts.map(part => sanitizeSalary(part, 0)); // sanitize each part in the parts array
    if (rates.length === 0) return 0;
    const avgHr = rates.reduce((a, b) => a + b, 0) / rates.length;
    return avgHr * 2080;
  }

  // For annaul case:
  // If it’s a range with '-', take midpoint
  if (s.includes("-")) {
    const parts = s.split("-")
    const nums = parts.map(part => sanitizeSalary(part, 0));
    if (nums.length === 0) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }

  // Otherwise it’s a single number for annual pay, e.g. “80000”
  const pay = sanitizeSalary(s);
  return pay;
}

/**
 * payScore()
 *
 * Given a numeric jobSalary (e.g. 80000) and a user preference salary (the satisfy-point salary),
 * returns a 0–100 score:
 *   If prefSalary is undefined or zero => return 50 (neutral)
 *   If jobSalary > prefSalary => 100
 *   intolerable point = 0.72 (my personal take) // anything below this score a 0
 *   If (intolerable point < jobSalary < satisfy point) => I use ((jobSalary - intolerable) / (satisfy - intolerable)) * 100
 */
function payScore(jobSalary, prefSalary = 0) {
  if (!prefSalary || prefSalary <= 0) return 50; // neutral
  if (jobSalary > prefSalary) return 100;
  if (jobSalary < prefSalary * 0.72) return 0; // intolerable point for a job 
  return Math.round(((jobSalary - (prefSalary * 0.72)) / (prefSalary - (prefSalary * 0.72))) * 100);
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
