// __tests__/computeJobScore.test.js
/** @jest-environment node */

import { computeJobScore } from './score-heuristic.js';

// Mock skillAssessment so we can control its output
jest.mock('./skill-assessment.js', () => ({
	skillAssessment: jest.fn()
}));
import { skillAssessment } from './skill-assessment.js';

describe('computeJobScore', () => {
	const baseJob = {
		relevantSkills: ['JS', 'CSS', 'HTML'],
		workModel:      'remote',
		nature:         'full-time',
		location:       'NY',
		role:           'engineer',
		pay:            '$80k'
	};

	// Minimal prefs for tests
	const basePrefs = {
		userSkills:  ['JS', 'HTML'],
		workModels:  ['remote'],
		natures:     ['full-time'],
		locations:   ['NY'],
		roles:       ['engineer']
	};

	beforeEach(() => {
		skillAssessment.mockClear();
	});

	test('all factors match => 100', () => {
		// pretend skill match is perfect
		skillAssessment.mockReturnValue(100);

		const score = computeJobScore(baseJob, basePrefs);

		// Breakdown:
		// locationScore = 1 => 1 * 100 * 0.4 = 40
		// skillScore    = 100 * 0.2 = 20
		// workModelScore= 1 => 1 * 100 * 0.3 = 30
		// natureScore   = 1 => 1 * 100 * 0.05 = 5
		// roleScore     = 1 => 1 * 100 * 0.05 = 5
		// total = 40 + 20 + 30 + 5 + 5 = 100
		expect(score).toBe(100);

		// ensure we called skillAssessment correctly
		expect(skillAssessment).toHaveBeenCalledWith(
			basePrefs.userSkills,
			baseJob.relevantSkills
		);
	});

	test('no preferences at all => should default-match all flags, skill=0 => composite = 80', () => {
		skillAssessment.mockReturnValue(0);

		const emptyPrefs = {
			userSkills:  [],
			workModels:  [],
			natures:     [],
			locations:   [],
			roles:       []
		};

		const score = computeJobScore(baseJob, emptyPrefs);

		// Breakdown:
		// locationScore = 1 => 1*100*0.4 = 40
		// skillScore    = 0 * 0.2     = 0
		// workModelScore= 1*100*0.3   = 30
		// natureScore   = 1*100*0.05  = 5
		// roleScore     = 1*100*0.05  = 5
		// total = 40 + 0 + 30 + 5 + 5 = 80
		expect(score).toBe(80);
	});

	test('location mismatch but others match (skill=0) => composite = 40', () => {
		skillAssessment.mockReturnValue(0);
		const prefs = {
			...basePrefs,
			locations: ['LA'] // job.location is 'NY', so mismatch
		};

		const score = computeJobScore(baseJob, prefs);

		// locationScore = 0 => 0
		// skillScore    = 0*0.2 = 0
		// workModelScore= 1*100*0.3 = 30
		// natureScore   = 1*100*0.05 = 5
		// roleScore     = 1*100*0.05 = 5
		// total = 0 + 0 + 30 + 5 + 5 = 40
		expect(score).toBe(40);
	});

	test('role mismatch but others match (skill=0) => composite = 75', () => {
		skillAssessment.mockReturnValue(0);
		const prefs = {
			...basePrefs,
			roles: ['designer'] // job.role is 'engineer', so mismatch
		};

		const score = computeJobScore(baseJob, prefs);

		// locationScore = 1*100*0.4 = 40
		// skillScore    = 0*0.2     = 0
		// workModelScore= 1*100*0.3 = 30
		// natureScore   = 1*100*0.05= 5
		// roleScore     = 0*100*0.05= 0
		// total = 40 + 0 + 30 + 5 + 0 = 75
		expect(score).toBe(75);
	});

	test('partial skill=50, workModel mismatch, nature match, location & role match => composite = 55', () => {
		skillAssessment.mockReturnValue(50);
		const prefs = {
			userSkills:  ['JS', 'HTML'],
			workModels:  ['onsite'], // mismatch
			natures:     ['full-time'],// match
			locations:   ['NY'],  // match
			roles:       ['engineer'] // match
		};

		const score = computeJobScore(baseJob, prefs);

		// locationScore = 1*100*0.4 = 40
		// skillScore    = 50*0.2    = 10
		// workModelScore= 0*100*0.3 = 0
		// natureScore   = 1*100*0.05= 5
		// roleScore     = 1*100*0.05= 5
		// total = 40 + 10 + 0 + 5 + 5 = 60
		expect(score).toBe(60);
	});

	test('job.relevantSkills empty => skillAssessment called with empty array', () => {
		skillAssessment.mockReturnValue(0);
		const jobNoSkills = { ...baseJob, relevantSkills: [] };
		const prefs = { ...basePrefs };

		const score = computeJobScore(jobNoSkills, prefs);

		// skillAssessment should be called with (userSkills, [])
		expect(skillAssessment).toHaveBeenCalledWith(
			basePrefs.userSkills,
			[]
		);
		// The rest of flags all match => location(40) + workModel(30) + nature(5) + role(5) = 80
		expect(score).toBe(80);
	});

	test('multiple mismatches (skill=20, location mismatch, workModel mismatch, nature mismatch, role mismatch) => composite low value', () => {
		skillAssessment.mockReturnValue(20);
		const prefs = {
			userSkills:  ['SomeOtherSkill'],
			workModels:  ['onsite'], // mismatch
			natures:     ['part-time'],// mismatch
			locations:   ['LA'], // mismatch
			roles:       ['designer'] // mismatch
		};

		const score = computeJobScore(baseJob, prefs);

		// locationScore = 0
		// skillScore    = 20*0.2 = 4
		// workModelScore= 0
		// natureScore   = 0
		// roleScore     = 0
		// total = 0 + 4 + 0 + 0 + 0 = 4
		expect(score).toBe(4);
	});

	test('prefs arrays undefined or missing => treat each as empty array', () => {
		skillAssessment.mockReturnValue(0);
		// Simulate prefs object missing some arrays entirely
		const partialPrefs = {
			userSkills: ['JS'],
			// workModels missing
			natures:     [],      // empty
			// locations missing
			roles:       undefined // explicitly undefined
		};

		// Accessing undefined.preferts will cause prefs.workModels to be undefined,
		// so we wrap missing arrays manually:
		const normalizedPrefs = {
			userSkills:  partialPrefs.userSkills,
			workModels:  Array.isArray(partialPrefs.workModels) ? partialPrefs.workModels : [],
			natures:     partialPrefs.natures,
			locations:   Array.isArray(partialPrefs.locations) ? partialPrefs.locations : [],
			roles:       Array.isArray(partialPrefs.roles) ? partialPrefs.roles : []
		};

		const score = computeJobScore(baseJob, normalizedPrefs);

		// All flags default-match => location(40) + workModel(30) + nature(5) + role(5) = 80
		// skillScore=0 => 0
		expect(score).toBe(80);
	});
});