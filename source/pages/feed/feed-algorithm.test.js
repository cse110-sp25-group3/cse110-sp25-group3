// __tests__/feed-algorithm.test.js
/** @jest-environment node */

import { runFeedAlgorithm } from "./feed-algorithm.js";

// Mock skillAssessment and computeJobScore to control outputs
jest.mock("../../functions/skill-assessment.js", () => ({
    skillAssessment: jest.fn()
}));
import { skillAssessment } from "../../functions/skill-assessment.js";

jest.mock("../../functions/score-heuristic.js", () => ({
     computeJobScore: jest.fn()
}));
import { computeJobScore } from "../../functions/score-heuristic.js";

describe("runFeedAlgorithm", () => {
    let jobs;
    let prefs;

    beforeEach(() => {
        jest.clearAllMocks();

        // Sample jobs with varying industries, skills, and relevantSkills
        jobs = [
        {
            id: "jobA",
            industry: "tech",
            location: "NY",
            role: "engineer",
            requiredSkills: ["JS", "HTML"],
            relevantSkills: ["JS", "CSS", "React"],
            companyLogo: "logoA.png",
            companyName: "Company A",
            jobRole: "Frontend Engineer",
            pay: "$90k",
            datePosted: "2025-05-01",
            companyInfo: "Tech Company A info",
            jobDescription: "Build UI",
            jobRequirements: ["JS", "HTML", "CSS"],
            applicationLink: "https://applyA.example.com"
        },
        {
            id: "jobB",
            industry: "finance",
            location: "SF",
            role: "analyst",
            requiredSkills: ["Excel", "SQL"],
            relevantSkills: ["Excel", "PowerBI"],
            companyLogo: "logoB.png",
            companyName: "Company B",
            jobRole: "Financial Analyst",
            pay: "$80k",
            datePosted: "2025-04-20",
            companyInfo: "Finance Company B info",
            jobDescription: "Analyze data",
            jobRequirements: ["Excel", "SQL"],
            applicationLink: "https://applyB.example.com"
        },
        {
            id: "jobC",
            industry: "tech",
            location: "LA",
            role: "designer",
            requiredSkills: ["Photoshop"],
            relevantSkills: ["Photoshop", "Illustrator"],
            companyLogo: "logoC.png",
            companyName: "Company C",
            jobRole: "UI Designer",
            pay: "$85k",
            datePosted: "2025-04-15",
            companyInfo: "Design Company C info",
            jobDescription: "Create designs",
            jobRequirements: ["Photoshop", "Illustrator"],
            applicationLink: "https://applyC.example.com"
        }
        ];

        // Default prefs: filter only by tech industry, prefer JS skill
        prefs = {
        userSkills: ["JS", "Photoshop"],
        industries: ["tech"],
        locations: [],     // not used by runFeedAlgorithm
        workModels: ["remote"],
        natures: ["full-time"],
        roles: ["engineer", "designer"]
        };
    });

    test("filters out jobs with non-matching industry", () => {
        // Arrange: only jobA and jobC should pass (industry: "tech")
        skillAssessment.mockReturnValue(50);
        computeJobScore.mockReturnValue(50);

        const result = runFeedAlgorithm(jobs, prefs);
        const returnedIds = result.map(j => j.id).sort();
        expect(returnedIds).toEqual(["jobA", "jobC"].sort());
        // Ensure jobB (finance) was filtered out
        expect(returnedIds).not.toContain("jobB");
    });

    test("returns all jobs when prefs.industries is empty", () => {
        prefs.industries = [];
        skillAssessment.mockReturnValue(10);
        computeJobScore.mockReturnValue(10);

        const result = runFeedAlgorithm(jobs, prefs);
        const returnedIds = result.map(j => j.id).sort();
        expect(returnedIds).toEqual(["jobA", "jobB", "jobC"].sort());
    });

    test("computes compositeScore and skillScore, and sorts by compositeScore descending", () => {
        prefs.industries = []; // no filtering
        // Give each job a distinct compositeScore
        computeJobScore.mockImplementation(job => {
        if (job.id === "jobA") return 30;
        if (job.id === "jobB") return 10;
        if (job.id === "jobC") return 20;
        return 0;
        });
        // Give each job a distinct skillScore
        skillAssessment.mockImplementation((userSkills, jobSkills) => {
        if (jobSkills.includes("JS")) return 60; // jobA
        if (jobSkills.includes("Excel")) return 20; // jobB
        if (jobSkills.includes("Photoshop")) return 40; // jobC
        return 0;
        });

        const result = runFeedAlgorithm(jobs, prefs);
        // Should be sorted: jobA (30), jobC (20), jobB (10)
        expect(result[0].id).toBe("jobA");
        expect(result[0].compositeScore).toBe(30);
        expect(result[0].skillScore).toBe(60);

        expect(result[1].id).toBe("jobC");
        expect(result[1].compositeScore).toBe(20);
        expect(result[1].skillScore).toBe(40);

        expect(result[2].id).toBe("jobB");
        expect(result[2].compositeScore).toBe(10);
        expect(result[2].skillScore).toBe(20);
    });

    test("populates matchedSkills and lostSkills correctly based on userSkills", () => {
        prefs.industries = ["tech"]; // filter to jobA and jobC
        skillAssessment.mockReturnValue(0);
        computeJobScore.mockReturnValue(0);

        const result = runFeedAlgorithm(jobs, prefs);
        // jobA relevantSkills: ["JS","CSS","React"], userSkills: ["JS","Photoshop"]
        expect(result[0].matchedSkills).toEqual(["JS"]);
        expect(result[0].lostSkills).toEqual(["CSS", "React"]);

        // jobC relevantSkills: ["Photoshop","Illustrator"]
        expect(result[1].matchedSkills).toEqual(["Photoshop"]);
        expect(result[1].lostSkills).toEqual(["Illustrator"]);
    });

    test("handles jobs with missing or non-array requiredSkills and relevantSkills", () => {
        const malformedJobs = [
        { id: "j1", industry: "tech" },                        // no skill arrays
        { id: "j2", industry: "tech", requiredSkills: "notArr", relevantSkills: null }
        ];
        prefs.industries = ["tech"];

        // Both computeJobScore and skillAssessment return 5 for any job
        computeJobScore.mockReturnValue(5);
        skillAssessment.mockReturnValue(5);

        const result = runFeedAlgorithm(malformedJobs, prefs);
        expect(result.length).toBe(2);

        // Even if requiredSkills/relevantSkills are missing, function should not crash:
        // matchedSkills and lostSkills should be empty arrays
        result.forEach(job => {
        expect(Array.isArray(job.matchedSkills)).toBe(true);
        expect(job.matchedSkills.length).toBe(0);
        expect(Array.isArray(job.lostSkills)).toBe(true);
        expect(job.lostSkills.length).toBe(0);

        // skillScore should be 5, compositeScore should be 5
        expect(job.skillScore).toBe(5);
        expect(job.compositeScore).toBe(5);
        });
    });

    test("returns empty array when input jobs list is empty", () => {
        computeJobScore.mockReturnValue(0);
        skillAssessment.mockReturnValue(0);

        const result = runFeedAlgorithm([], prefs);
        expect(result).toEqual([]);
    });

    test("filters nothing when prefs.industries is not an array or is undefined", () => {
        // If prefs.industries is undefined
        delete prefs.industries;
        skillAssessment.mockReturnValue(0);
        computeJobScore.mockReturnValue(0);

        const result1 = runFeedAlgorithm(jobs, prefs);
        expect(result1.length).toBe(3); // all jobs

        // If prefs.industries is not an array
        prefs.industries = "not-an-array";
        const result2 = runFeedAlgorithm(jobs, prefs);
        expect(result2.length).toBe(3); // all jobs
    });
});