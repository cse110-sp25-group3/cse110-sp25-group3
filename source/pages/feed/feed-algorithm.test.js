// __tests__/feed-algorithm.test.js
/** @jest-environment node */

import { runFeedAlgorithm } from "./feed-algorithm.js";

jest.mock("../../functions/skill-assessment.js", () => ({
  skillAssessment: jest.fn()
}));
import { skillAssessment } from "../../functions/skill-assessment.js";

jest.mock("../../functions/score-heuristic.js", () => ({
  computeJobScore: jest.fn()
}));
import { computeJobScore } from "../../functions/score-heuristic.js";

describe("runFeedAlgorithm (with date freshness and composite scoring)", () => {
  let jobs;
  let prefs;
  const fakeNowDate = "2025-05-30T00:00:00Z";
  let fakeNow;

  beforeAll(() => {
    fakeNow = new Date(fakeNowDate).getTime();
    jest.spyOn(Date, "now").mockImplementation(() => fakeNow);
  });

  afterAll(() => {
    Date.now.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jobs = [
      { id: "job1", industry: "tech", datePosted: "2025-05-30", relevantSkills: ["JS","CSS"], requiredSkills: ["JS","CSS"], pay: "0" },
      { id: "job2", industry: "tech", datePosted: "2025-05-15", relevantSkills: ["HTML"],   requiredSkills: ["HTML"],   pay: "0" },
      { id: "job3", industry: "finance", datePosted: "2025-04-30", relevantSkills: ["Excel"], requiredSkills: ["Excel"], pay: "0" }
    ];
    prefs = {
      userSkills: ["JS"],
      industries: ["tech"],
      locations: [],
      workModels: [],
      natures: [],
      roles: [],
      salaryYearly: undefined
    };
  });

  test("filters out non-matching industry", () => {
    computeJobScore.mockReturnValue(10);
    skillAssessment.mockReturnValue(20);

    const result = runFeedAlgorithm(jobs, prefs);
    expect(result.map(j => j.id)).toEqual(["job1", "job2"]);
  });

  test("assigns correct dateScore for today and 15 days old", () => {
    computeJobScore.mockReturnValue(0);
    skillAssessment.mockReturnValue(0);

    const result = runFeedAlgorithm(jobs, prefs);
    const job1 = result.find(j => j.id === "job1");
    const job2 = result.find(j => j.id === "job2");
    expect(job1.dateScore).toBe(100);
    expect(job2.dateScore).toBe(50);
  });

  test("handles invalid datePosted and compositeScore includes neutral payScore", () => {
    const badJob = {
      id: "jobBad",
      industry: "tech",
      datePosted: "not-a-date",
      relevantSkills: [],
      requiredSkills: [],
      pay: "50k"
    };
    jobs.push(badJob);

    computeJobScore.mockReturnValue(10);
    skillAssessment.mockReturnValue(0);

    const result = runFeedAlgorithm(jobs, prefs);
    const jobBad = result.find(j => j.id === "jobBad");
    expect(jobBad.dateScore).toBe(0);
    // baseScore=10, dateScore=0, payScore(neutral)=50
    // composite = round(10*0.5 + 0*0.2 + 50*0.3) = round(5 + 0 + 15) = 20
    expect(jobBad.compositeScore).toBe(20);
  });

  test("calculates compositeScore with correct weights and neutral payScore", () => {
    computeJobScore.mockImplementation(job => (job.id === "job1" ? 80 : 60));
    skillAssessment.mockReturnValue(0);

    const result = runFeedAlgorithm(jobs, prefs);
    const job1 = result.find(j => j.id === "job1");
    const job2 = result.find(j => j.id === "job2");
    // job1: 80*0.5 + 100*0.2 + 50*0.3 = 40 + 20 + 15 = 75
    // job2: 60*0.5 +  50*0.2 + 50*0.3 = 30 + 10 + 15 = 55
    expect(job1.compositeScore).toBe(75);
    expect(job2.compositeScore).toBe(55);
  });

  test("returns jobs sorted by compositeScore descending", () => {
    computeJobScore.mockImplementation(job => (job.id === "job1" ? 80 : 60));
    skillAssessment.mockReturnValue(0);

    const result = runFeedAlgorithm(jobs, prefs);
    expect(result.map(j => j.id)).toEqual(["job1", "job2"]);
  });

  test("populates matchedSkills and lostSkills based on userSkills", () => {
    computeJobScore.mockReturnValue(0);
    skillAssessment.mockReturnValue(0);

    const result = runFeedAlgorithm(jobs, prefs);
    const job1 = result.find(j => j.id === "job1");
    expect(job1.matchedSkills).toEqual(["JS"]);
    expect(job1.lostSkills   ).toEqual(["CSS"]);

    const job2 = result.find(j => j.id === "job2");
    expect(job2.matchedSkills).toEqual([]);
    expect(job2.lostSkills   ).toEqual(["HTML"]);
  });

  test("filters nothing when prefs.industries is empty array", () => {
    prefs.industries = [];
    computeJobScore.mockReturnValue(10);
    skillAssessment.mockReturnValue(5);

    const result = runFeedAlgorithm(jobs, prefs);
    expect(result.map(j => j.id).sort())
      .toEqual(["job1","job2","job3"].sort());
  });

  test("filters nothing when prefs.industries is undefined", () => {
    delete prefs.industries;
    computeJobScore.mockReturnValue(10);
    skillAssessment.mockReturnValue(5);

    const result = runFeedAlgorithm(jobs, prefs);
    expect(result.map(j => j.id).sort())
      .toEqual(["job1","job2","job3"].sort());
  });
});

describe("pay parsing and scoring via runFeedAlgorithm", () => {
  let prefs;
  const commonJob = {
    industry: "tech",
    datePosted: "2025-05-30",
    relevantSkills: [],
    requiredSkills: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    computeJobScore.mockReturnValue(0);
    skillAssessment.mockReturnValue(0);
    prefs = {
      userSkills:   [],
      industries:   ["tech"],
      locations:    [],
      workModels:   [],
      natures:      [],
      roles:        [],
      salaryYearly: "50000"
    };
  });

  test.each([
    ["$80k",       100],
    ["70k-90k",    100],
    ["30k",         0],
    ["40k", Math.round(((40000 - (50000 * 0.72)) / (50000 - (50000 * 0.72))) * 100)],
    ["25.5/hr",    100],
    ["20/hr - 30/hr", 100],
    ["invalid",     0]
  ])("job.pay = '%s' yields payScore = %i", (payString, expected) => {
    const job = { id: payString, ...commonJob, pay: payString };
    const [res] = runFeedAlgorithm([job], prefs);
    expect(res.payScore).toBe(expected);
  });

  test("returns neutral payScore = 50 when no salary preference is set", () => {
    const job = { id: "noPref", ...commonJob, pay: "100k" };
    const noPref = { ...prefs };
    delete noPref.salaryYearly;
    const [res] = runFeedAlgorithm([job], noPref);
    expect(res.payScore).toBe(50);
  });
});
