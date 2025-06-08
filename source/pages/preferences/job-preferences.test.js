/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { renderPreferences, loadUserPreferences } from "./job-preferences.js";

// ✅ CORRECT PATH: mocks the getUniqueValues function from source/functions/fetch-jobs.js
jest.mock("../../functions/fetch-jobs.js", () => ({
  getUniqueValues: async (key) => {
    const mockData = {
      relevantSkills: ["JS", "HTML", "CSS"],
      location: ["Remote", "NYC"],
      industry: ["Tech", "Finance"],
      jobRole: ["Developer", "Designer"],
    };
    return mockData[key] || [];
  },
}));

describe("Job Preferences Page", () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    container = document.getElementById("app");
    localStorage.clear();
  });

  test("loads default preferences on first run", () => {
    const prefs = loadUserPreferences();
    expect(prefs.userSkills).toEqual([]);
    expect(prefs.salaryHourly).toBe("");
    expect(prefs.salaryYearly).toBe("");
  });

  test("renders all preference sections", async () => {
    await renderPreferences(container);
    const sectionTitles = Array.from(
      container.querySelectorAll("section h3")
    ).map((h) => h.textContent.trim());

    expect(sectionTitles).toEqual(
      expect.arrayContaining([
        "Preferred Skills",
        "Locations",
        "Industries",
        "Roles",
        "Salary",
        "Employment Type",
        "Work Model",
      ])
    );
  });

  test("tag input adds and removes a skill", async () => {
    await renderPreferences(container);

    const input = container.querySelector(".tag-input");
    input.value = "JS";
    input.dispatchEvent(new Event("input"));

    const suggestion = container.querySelector(".tag-suggestion-pill");
    expect(suggestion).toBeInTheDocument();
    suggestion.click();

    const pills = container.querySelectorAll(".tag-pill");
    expect(pills.length).toBe(1);
    expect(pills[0].textContent).toContain("JS");

    pills[0].click(); // remove tag
    expect(container.querySelector(".tag-pill")).toBeNull();
  });

  test("checkbox selection updates preferences", async () => {
    await renderPreferences(container);
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();

    checkbox.click(); // check it
    const prefs = loadUserPreferences();
    const selected = [...prefs.natures, ...prefs.workModels];

    expect(selected).toContain(checkbox.value);
  });

  test("salary inputs save values correctly", async () => {
    await renderPreferences(container);

    const salaryInputs = container.querySelectorAll(".salary-input");
    expect(salaryInputs.length).toBe(2);

    salaryInputs[0].value = "25";
    salaryInputs[0].dispatchEvent(new Event("input"));

    salaryInputs[1].value = "70000";
    salaryInputs[1].dispatchEvent(new Event("input"));

    const prefs = loadUserPreferences();
    expect(prefs.salaryHourly).toBe("25");
    expect(prefs.salaryYearly).toBe("70000");
  });
});
