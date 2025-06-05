// skill-assessment.js
/**
 * Compute how well a user's skills match a job's requirements.
 * User skills are retrieved from jobPreferences.js
 *
 * @param {string[]} userSkills  – list of skills the user has
 * @param {string[]} jobSkills   – list of skills the job requires
 * @returns {number}             – match percentage (0–100)
 */
export function skillAssessment(userSkills, jobSkills){
    if (!Array.isArray(jobSkills) || jobSkills.length === 0){ // if jobSkills array does not meet the requirement
        return 0;
    }
    
    // We could probably optimize this to O(n+m) complexity? but we currently only has like 20 elements to compare
    // so I don't think it's neccessary because that would require more memory to be used
    let matches = 0; // keep track of how many skills matched
    for (const skill of jobSkills) {
        if (userSkills.includes(skill)){
            matches++;
        }
    }

    const assessment = Math.round((matches / jobSkills.length) * 100);
    return assessment;
}