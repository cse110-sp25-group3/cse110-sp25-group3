// __tests__/feed-algorithm.test.js
/** @jest-environment node */

import { runFeedAlgorithm } from "./feed-algorithm.js";

// Mock skillAssessment and computeJobScore so we can control outputs
jest.mock("../../functions/skill-assessment.js", () => ({
    skillAssessment: jest.fn()
}));
import { skillAssessment } from "../../functions/skill-assessment.js";

jest.mock("../../functions/score-heuristic.js", () => ({
     computeJobScore: jest.fn()
}));
import { computeJobScore } from "../../functions/score-heuristic.js";

describe("runFeedAlgorithm (with date freshness)", () => {
    let jobs;
    let prefs;
    let fakeNow;

    beforeAll(() => {
        // Freeze time at 2025-05-30T00:00:00Z
        fakeNow = new Date("2025-05-30T00:00:00Z").getTime();
        jest.spyOn(Date, "now").mockImplementation(() => fakeNow);
    });

    afterAll(() => {
        Date.now.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();

        // Three sample jobs with varying datePosted and industries
        jobs = [
            {
                id: "job1",
                industry: "tech",
                datePosted: "2025-05-30", // same as fakeNow => age = 0 days => dateScore = 100
                relevantSkills: ["JS", "CSS"],
                requiredSkills: ["JS", "CSS"]
            },
            {
                id: "job2",
                industry: "tech",
                datePosted: "2025-05-15", // 15 days old => dateScore = ((30 - 15)/30)*100 = 50
                relevantSkills: ["HTML"],
                requiredSkills: ["HTML"]
            },
            {
                id: "job3",
                industry: "finance",
                datePosted: "2025-04-30", // 30 days old => dateScore = 0
                relevantSkills: ["Excel"],
                requiredSkills: ["Excel"]
            }
        ];

        // Preferences: only “tech” industry passes; userSkills include "JS" only
        prefs = {
            userSkills: ["JS"],
            industries: ["tech"],
            locations: [],
            workModels: [],
            natures: [],
            roles: []
        };
    });

    test("filters out non-matching industry", () => {
        computeJobScore.mockReturnValue(10);
        skillAssessment.mockReturnValue(20);

        const result = runFeedAlgorithm(jobs, prefs);

        // job3 (industry: "finance") should be filtered out
        const ids = result.map(j => j.id);
        expect(ids).toEqual(["job1", "job2"]);
    });

    test("assigns correct dateScore for today and 15 days old", () => {
        // We'll set computeJobScore to a constant so composite depends only on dateScore
        computeJobScore.mockReturnValue(0);
        skillAssessment.mockReturnValue(0);

        const result = runFeedAlgorithm(jobs, prefs);

        // job1.dateScore => 100, job2.dateScore => 50
        const job1 = result.find(j => j.id === "job1");
        const job2 = result.find(j => j.id === "job2");

        expect(job1.dateScore).toBe(100);
        expect(job2.dateScore).toBe(50);
    });

    test("handles invalid datePosted as dateScore = 0", () => {
        // Add a job with invalid date
        const badJob = {
            id: "jobBad",
            industry: "tech",
            datePosted: "not-a-date",
            relevantSkills: [],
            requiredSkills: []
        };
        jobs.push(badJob);

        computeJobScore.mockReturnValue(10);
        skillAssessment.mockReturnValue(0);

        const result = runFeedAlgorithm(jobs, prefs);
        const jobBad = result.find(j => j.id === "jobBad");

        expect(jobBad.dateScore).toBe(0);
        // baseScore = 10, W_BASE = 0.6 => composite = round(10 * 0.6 + 0 * 0.4) = 6
        expect(jobBad.compositeScore).toBe(6);
    });

    test("calculates compositeScore = 0.6*baseScore + 0.4*dateScore", () => {
        // Setup computeJobScore to return distinct baseScores
        computeJobScore.mockImplementation(job => {
            if (job.id === "job1") return 80;
            if (job.id === "job2") return 60;
            return 0;
        });
        skillAssessment.mockReturnValue(0);

        const result = runFeedAlgorithm(jobs, prefs);
        // job1: baseScore=80, dateScore=100 => composite = round(80*0.6 + 100*0.4) = round(48 + 40) = 88
        // job2: baseScore=60, dateScore=50  => composite = round(60*0.6 + 50*0.4) = round(36 + 20) = 56

        const job1 = result.find(j => j.id === "job1");
        const job2 = result.find(j => j.id === "job2");

        expect(job1.compositeScore).toBe(88);
        expect(job2.compositeScore).toBe(56);
    });

    test("returns jobs sorted by compositeScore descending", () => {
        // job1 => composite 88, job2 => 56
        computeJobScore.mockImplementation(job => (job.id === "job1" ? 80 : 60));
        skillAssessment.mockReturnValue(0);

        const result = runFeedAlgorithm(jobs, prefs);

        expect(result.map(j => j.id)).toEqual(["job1", "job2"]);
    });

    test("populates matchedSkills and lostSkills based on userSkills", () => {
        // For job1, relevantSkills ["JS","CSS"], userSkills ["JS"] => matched=["JS"], lost=["CSS"]
        computeJobScore.mockReturnValue(0);
        skillAssessment.mockReturnValue(0);

        const result = runFeedAlgorithm(jobs, prefs);
        const job1 = result.find(j => j.id === "job1");
        expect(job1.matchedSkills).toEqual(["JS"]);
        expect(job1.lostSkills).toEqual(["CSS"]);

        // For job2, relevantSkills ["HTML"], userSkills=["JS"] => matched=[], lost=["HTML"]
        const job2 = result.find(j => j.id === "job2");
        expect(job2.matchedSkills).toEqual([]);
        expect(job2.lostSkills).toEqual(["HTML"]);
    });

    test("filters nothing when prefs.industries is empty array", () => {
        prefs.industries = [];
        computeJobScore.mockReturnValue(10);
        skillAssessment.mockReturnValue(5);

        const result = runFeedAlgorithm(jobs, prefs);
        // Should include job1 and job2 and job3, but job3 loses matched unless we redefine userSkills
        const ids = result.map(j => j.id).sort();
        expect(ids).toEqual(["job1", "job2", "job3"].sort());
    });

    test("filters nothing when prefs.industries is undefined", () => {
        delete prefs.industries;
        computeJobScore.mockReturnValue(10);
        skillAssessment.mockReturnValue(5);

        const result = runFeedAlgorithm(jobs, prefs);
        const ids = result.map(j => j.id).sort();
        expect(ids).toEqual(["job1", "job2", "job3"].sort());
    });
});
