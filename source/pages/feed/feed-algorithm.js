// feed-algorithm.js
import { skillAssessment } from "../../functions/skill-assessment.js";
import { computeJobScore }   from "../../functions/score-heuristic.js";

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
