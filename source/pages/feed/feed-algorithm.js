// feed-algorithm.js
import { skillAssessment } from "../../functions/skill-assessment.js";
import { computeJobScore }   from "../../functions/score-heuristic.js";

/**
 * Given:
 *   - jobs: Array of raw job objects (with .pay, requiredSkills, relevantSkills, etc.)
 *   - prefs: {
 *       userSkills, industries, locations, workModels, natures, roles,
 *       salaryHourly,    // string or number
 *       salaryYearly     // string or number
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

  // Prep user salary range (annualized)
  const userMin = (() => {
    if (prefs.salaryYearly)  return parseFloat(prefs.salaryYearly);
    if (prefs.salaryHourly)  return parseFloat(prefs.salaryHourly) * 2080;
    return 0;
  })();
  const userMax = userMin; // exact or midpoint only

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
    const annualPay = parsePay(job.pay);
    job.payScore = payScore(annualPay, userMin, userMax);

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

// -- parsePay, payScore, datePostedScore unchanged except import datePostedScore --
function parsePay(payString) {
  if (typeof payString !== "string") return NaN;
  let s = payString.trim().replace(/\$/g, "").replace(/,/g, "").toLowerCase();

  if (s.includes("/hr")) {
    // e.g. "25/hr-30/hr"
    const nums = s.split("/hr")
                  .map(p => p.replace(/\D+/g, ""))
                  .filter(Boolean)
                  .map(n => parseFloat(n));
    if (!nums.length) return NaN;
    const avg = nums.reduce((a,b)=>a+b,0) / nums.length;
    return avg * 2080;
  }

  s = s.replace(/k\b/, "000");
  if (s.includes("-")) {
    const parts = s.split("-").map(p => parseFloat(p)).filter(n => !isNaN(n));
    if (!parts.length) return NaN;
    return parts.reduce((a,b)=>a+b,0) / parts.length;
  }

  const val = parseFloat(s);
  return isNaN(val) ? NaN : val;
}

function payScore(jobSalary, userMin = 0, userMax = 0) {
  if (!userMin || userMin <= 0) return 50; // neutral
  if (jobSalary < userMin) return 0;
  if (jobSalary > userMax) return 100;
  return Math.round(((jobSalary - userMin) / (userMax - userMin)) * 100);
}

function datePostedScore(dateString, maxDays = 30) {
  const postedTime = new Date(dateString).getTime();
  if (isNaN(postedTime)) return 0;
  const ageDays = (Date.now() - postedTime) / (1000*60*60*24);
  const raw = (maxDays - ageDays) / maxDays;
  return raw <= 0 ? 0 : Math.round(Math.min(raw,1)*100);
}
