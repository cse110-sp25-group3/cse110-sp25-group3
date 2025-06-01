// feed-algorithm.js
import { skillAssessment } from "../../functions/skill-assessment.js";
import { computeJobScore }   from "../../functions/score-heuristic.js";
import { parse } from "@babel/core";

/**
 * Given:
 *   - jobs: Array of raw job objects (each with requiredSkills, relevantSkills, etc.)
 *   - prefs: { userSkills, industries, locations, workModels, natures, roles }
 *
 * Returns a new array of “enriched” job objects that have been:
 *   1. filtered by industry/location/role,
 *   2. scored (skillScore + compositeScore),
 *   3. sorted descending by compositeScore.
 *
 * Each returned job will also have .matchedSkills and .lostSkills arrays.
 */
export function runFeedAlgorithm(jobs, prefs) {
    // filter out the irrelevant job
    const filtered = jobs.filter(job => {
        const industryOK =
        !Array.isArray(prefs.industries) ||
        prefs.industries.length === 0 ||
        prefs.industries.includes(job.industry);
        
        return industryOK;
    });

    // compute scores + matched/lost lists
    filtered.forEach(job => {
        // compute compositeScore
        job.compositeScore = computeJobScore(job, {
            userSkills: prefs.userSkills,
            workModels: prefs.workModels,
            natures:    prefs.natures,
            locations:  prefs.locations,
            roles:      prefs.roles
        });

        // get the skillScore
        job.skillScore = skillAssessment(
            prefs.userSkills,
            Array.isArray(job.requiredSkills) ? job.requiredSkills : []
        );

        

        // get the matchedSkills / lostSkills
        const rel = Array.isArray(job.relevantSkills) ? job.relevantSkills : [];
        job.matchedSkills = rel.filter(s => prefs.userSkills.includes(s));
        job.lostSkills    = rel.filter(s => !prefs.userSkills.includes(s));
    });

    // sort in descending order by compositeScore
    filtered.sort((a, b) => b.compositeScore - a.compositeScore);

    return filtered;
}


/**
 * parsePay()
 *
 * Attempts to turn a job.pay string (e.g. "$80k", "70k-90k", "$25/hr") into a
 * single annualized number like 80000 or 80000 (midpoint). Returns NaN on failure.
 */
function parsePay(payString) {
	if (typeof payString !== "string") return NaN;

	// Remove any $ or commas and make lowercase
	let s = payString.trim().replace(/\$/g, "").replace(/,/g, "").toLowerCase();

	// Handle hourly (e.g. "25/hr" or "25/hr - 30/hr")
	if (s.includes("/hr")) {
		// extract numeric: e.g. "25/hr-30/hr" => ["25", "30"]
		const nums = s.split("/hr").map(p => p.replace(/\D+/g, "")).filter(Boolean);
		if (nums.length === 0) return NaN;
		// convert first number to annual: assume 40 hours/week × 52 weeks = 2080 hours
		const hourlyRates = nums.map(n => parseFloat(n));
		const avgHourly = hourlyRates.reduce((a,b) => a+b, 0) / hourlyRates.length;
		return avgHourly * 2080; 
	}

	// Handle "80k", "70k-90k", "80000-90000"
	// Replace trailing 'k' with '000'
	s = s.replace(/k\b/, "000");

	// If it’s a range with '-', take midpoint
	if (s.includes("-")) {
		const parts = s.split("-");
		const nums = parts.map(p => parseFloat(p)).filter(n => !isNaN(n));
		if (nums.length === 0) return NaN;
		return nums.reduce((a, b) => a + b, 0) / nums.length;
	}

	// Otherwise, parse single number
	const val = parseFloat(s);
	return isNaN(val) ? NaN : val;
}

/**
 * payScore()
 *
 * Given a numeric jobSalary (e.g. 80000) and a user preference range [min, max],
 * returns a 0–100 score:
 *   • If userMin is undefined or zero → return 50 (neutral)
 *   • If jobSalary < userMin => 0
 *   • If jobSalary > userMax => 100
 *   • If min < jobSalary < max => I use ((jobSalary - userMin) / (userMax - userMin)) * 100
 */
function payScore(jobSalary, userMin = 0, userMax = 0) {
  if (!userMin || userMin <= 0) {
    // no preference → neutral
    return 50;
  }
  if (jobSalary < userMin) return 0;
  if (jobSalary > userMax) return 100;

  return Math.round(((jobSalary - userMin) / (userMax - userMin)) * 100);
}