/**
 * @jest-environment jsdom
 */

import { renderApplications  } from "./view-applications";
import './AppCard.js';

describe('renderApplications()', () => {
    const mockJob = {
        "companyName": "Bright Minds Academy",
        "companyLogo": "https://placehold.co/100x50?text=Bright+Minds",
        "industry": "Education",
        "jobRole": "Elementary School Teacher",
        "nature": 1,
        "workModel": 2,
        "location": "Seattle, WA",
        "pay": "$55,000/year",
        "datePosted": "2025-05-18",
        "companyInfo": "Bright Minds Academy is dedicated to innovative K-5 education.",
        "jobDescription": "Teach and develop curriculum for elementary students.",
        "jobRequirements": [
            "Teaching credential",
            "Classroom management experience",
            "Lesson planning skills"
        ],
        "relevantSkills": [
            "Lesson Planning",
            "Classroom Management",
            "Curriculum Development"
        ],
        "htmlFile": "brightminds-elementary-teacher.html",
        "applicationLink": "https://job-boards.greenhouse.io/doordashusa/jobs/6247016",
        "baseScore": 80,
        "skillScore": 0,
        "dateScore": 27,
        "payScore": 50,
        "matchedSkills": [],
        "lostSkills": [
            "Lesson Planning",
            "Classroom Management",
            "Curriculum Development"
        ],
        "compositeScore": 60,
        "dateSubmitted": "2025-06-08"
    };

    let saved = null;

    beforeAll(() => {
        saved = localStorage.getItem('appliedJobs');
    });

    afterAll(() => {
        if (saved != null) localStorage.setItem('appliedJobs', saved);
        else localStorage.removeItem('appliedJobs');
    });

    beforeEach(() => {
        localStorage.clear()
        document.body.innerHTML = `<div id="container"></div>`;
    });

    it('renders empty state when no data', () => {
        renderApplications(document.getElementById('container'));
        expect(document.querySelector('.end-message')).toBeTruthy();
    });

    it('renders one <app-card> per stored job and show/hide buttons', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        renderApplications(document.getElementById('container'));

        expect(document.querySelectorAll('app-card')).toHaveLength(1);
        const btns = document.querySelectorAll('.toggle-all');
        expect(btns.length).toBe(2);
        expect(btns[0].id).toBe('expand-all');
    });

    it('expand-all opens all cards', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        renderApplications(document.getElementById('container'));
        document.querySelector('.toggle-all').click();

        const card = document.querySelector('app-card');
        const detail = card.shadowRoot.querySelector('.details');
        expect(detail.classList.contains('expanded')).toBe(true);
    });

    it('remove-app listener removes card & updates storage', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        renderApplications(document.getElementById('container'));
        const card = document.querySelector('app-card');

        // dispatch removal
        card.dispatchEvent(new CustomEvent('remove-app', {
        bubbles: true, detail: mockJob
        }));

        expect(document.querySelectorAll('app-card')).toHaveLength(0);
        const stored = JSON.parse(localStorage.getItem('appliedJobs'));
        expect(stored).toEqual([]);
    });
});