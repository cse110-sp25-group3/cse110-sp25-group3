/**
 * @jest-environment jsdom
 */

import {
  userSkills,
  getMatchedSkills,
  getLostSkills,
  getMatchPercent,
  getMatchDegree,
  createCardElement,
  saveJobToLocalStorage,
  renderCurrentCard,
  jobsData,
  resetFeedState
} from "./feed.js";

describe("skill‐matching helpers", () => {
  beforeEach(() => {
    userSkills.length = 0;
    userSkills.push("JS", "HTML");
  });

  test("getMatchedSkills picks only shared skills", () => {
    const job = { relevantSkills: ["JS","CSS","HTML"] };
    expect(getMatchedSkills(job)).toEqual(["JS","HTML"]);
  });

  test("getLostSkills picks only missing skills", () => {
    const job = { relevantSkills: ["JS","CSS","HTML"] };
    expect(getLostSkills(job)).toEqual(["CSS"]);
  });

  test("getMatchPercent returns 0 when no skills", () => {
    expect(getMatchPercent({ relevantSkills: [] })).toBe(0);
  });

  test("getMatchPercent computes correct percentage", () => {
    const job = { relevantSkills: ["JS","CSS","HTML"] };
    expect(getMatchPercent(job)).toBe(Math.round((2/3)*100));
  });

  test("getMatchDegree maps percent to 360°", () => {
    const job = { relevantSkills: ["JS","CSS","HTML"] };
    expect(getMatchDegree(job)).toBe(Math.round((getMatchPercent(job)/100)*360));
  });
});

describe("createCardElement", () => {
  beforeAll(() => {
    userSkills.length = 0;
    userSkills.push("JS");
  });

  test("renders a job-card with correct dataset.index and content", () => {
    const job = {
      relevantSkills: ["JS","CSS"],
      companyLogo: "logo.png",
      companyName: "Acme",
      industry: "tech",
      jobRole: "Dev",
      location: "Remote",
      workModel: 1,
      pay: "$100k",
      datePosted: "2025-06-01",
      jobDescription: "Desc",
      companyInfo: "Info",
      jobRequirements: ["R1","R2"],
      applicationLink: "http://apply"
    };

    const card = createCardElement(job, 2);
    expect(card.dataset.index).toBe("2");

    // front face shows skill % = 50%
    const donutText = card.querySelector(".donut-text").textContent;
    expect(donutText).toBe("50%");

    // back face has company name, pay, and date
    expect(card.innerHTML).toContain("Acme");
    expect(card.innerHTML).toContain("$100k");
    expect(card.innerHTML).toContain("Posted 2025-06-01");

    // matched / lost tags
    expect(card.querySelectorAll(".skill-tag.matched").length).toBe(1);
    expect(card.querySelectorAll(".skill-tag.lost").length).toBe(1);
  });
});

describe("saveJobToLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest
      .spyOn(Date.prototype, "toISOString")
      .mockReturnValue("2025-06-07T12:00:00.000Z");
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("writes one entry with dateSubmitted", () => {
    const job = { companyName: "A", jobRole: "X" };
    saveJobToLocalStorage(job);

    const stored = JSON.parse(localStorage.getItem("appliedJobs"));
    expect(stored).toHaveLength(1);
    expect(stored[0].companyName).toBe("A");
    expect(stored[0].jobRole).toBe("X");
    expect(stored[0].dateSubmitted).toBe("2025-06-07");
  });

  test("does not duplicate same job twice", () => {
    const job = { companyName: "A", jobRole: "X", dateSubmitted: "2025-06-07" };
    saveJobToLocalStorage(job);
    saveJobToLocalStorage(job);
    const stored = JSON.parse(localStorage.getItem("appliedJobs"));
    expect(stored).toHaveLength(1);
  });
});

describe("renderCurrentCard (smoke)", () => {
  let container;
  beforeEach(() => {
    document.body.innerHTML = `<div id="test"></div>`;
    container = document.getElementById("test");

    // wipe module state & push one dummy job
    resetFeedState();
    jobsData.push({
      relevantSkills: [], companyLogo:"", companyName:"", industry:"",
      jobRole:"", location:"", workModel:1, pay:"", datePosted:"",
      jobDescription:"", companyInfo:"", jobRequirements:[], applicationLink:""
    });
  });

  test("injects a behindCard and one job-card", () => {
    renderCurrentCard(container);
    expect(container.querySelectorAll(".behindCard")).toHaveLength(1);
    expect(container.querySelectorAll(".job-card")).toHaveLength(1);
  });
});
