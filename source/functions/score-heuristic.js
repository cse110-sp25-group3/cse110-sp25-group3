// score-heuristic.js
import { skillAssessment } from './skill-assessment.js';
/**
 * Compute a composite score for a job based on:
 *  - location match   (0 or 1)
 *  - skill match       (0–100)
 *  - work model match  (0 or 1)
 *  - nature match      (0 or 1)
 *  - role match       (0 or 1)
 * This is diffrent from skillAssessment function in skill-assessment.js
 * That function focused purely on matching skills
 * This one contains the heuristic for "how exactly this job fits the user"
 *
 * @param {Object} job
 * @param {string[]} job.relevantSkills
 * @param {string} job.workModel
 * @param {string} job.nature
 * @param {string} job.location
 * @param {string} job.role
 *
 * @param {Object} prefs
 * @param {string[]} prefs.userSkills
 * @param {string[]} prefs.workModels
 * @param {string[]} prefs.natures
 * @param {string[]} prefs.locations
 * @param {string[]} prefs.roles
 *
 * @returns {number} 0–100 composite score
 */
export function computeJobScore(job, prefs) {
	// Skill match
	const skillScore = skillAssessment(prefs.userSkills, job.relevantSkills);

	// location match
	let locationScore;
	if (prefs.locations.length === 0){
		// if no preference, treat as full match
		locationScore = 1;
	} else if (prefs.locations.includes(job.location)) {
		locationScore = 1;
	} else {
		locationScore = 0;
	}

	// workmodel match
	let workModelScore;
	if (prefs.workModels.length === 0) {
		// if no preference, treat as full match
		workModelScore = 1;
	} else if (prefs.workModels.includes(job.workModel)) {
		workModelScore = 1;
	} else {
		workModelScore = 0;
	}

	// nature match
	let natureScore;
	if (prefs.natures.length === 0) {
		natureScore = 1;
	} else if (prefs.natures.includes(job.nature)) {
		natureScore = 1;
	} else {
		natureScore = 0;
	}

	// role match
	let roleScore;
	if (prefs.roles.length === 0){
		roleScore = 1;
	} else if (prefs.roles.includes(job.role)) {
		roleScore = 1;
	} else {
		roleScore = 0;
	}

	// Combine with weights
	const WEIGHTS = {
		location: 0.4,
		skill: 0.2,
		workModel: 0.3,
		nature: 0.05,
		role: 0.05
	};

	const composite =
		locationScore * 100 * WEIGHTS.location +
		skillScore * WEIGHTS.skill +
		workModelScore * 100 * WEIGHTS.workModel +
		natureScore * 100 * WEIGHTS.nature +
		roleScore * 100 * WEIGHTS.role;

	// should return an int between 0-100
	return Math.round(composite);
}