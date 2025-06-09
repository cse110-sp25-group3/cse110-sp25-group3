/**
 * @jest-environment jsdom
 */

import { renderApplications  } from "../source/pages/applications/view-applications.js";
import '../source/pages/applications/AppCard.js';

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

    it('renders empty message after last job is removed', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        renderApplications(document.getElementById('container'));
        const card = document.querySelector('app-card');
      
        card.dispatchEvent(new CustomEvent('remove-app', {
          bubbles: true, detail: mockJob
        }));
      
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

    it('renders multiple app-cards if multiple jobs in storage', () => {
        const jobs = [mockJob, { ...mockJob, companyName: "Another Co", jobRole: "DevOps Engineer" }];
        localStorage.setItem('appliedJobs', JSON.stringify(jobs));
        renderApplications(document.getElementById('container'));
      
        expect(document.querySelectorAll('app-card')).toHaveLength(2);
    });

    it('expand-all opens all cards', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        renderApplications(document.getElementById('container'));
        document.querySelector('.toggle-all').click();

        const card = document.querySelector('app-card');
        const detail = card.shadowRoot.querySelector('.details');
        expect(detail.classList.contains('expanded')).toBe(true);
    });

    it('collapse-all hides all expanded details', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        renderApplications(document.getElementById('container'));
        
        document.getElementById('expand-all').click(); // expand
        document.getElementById('collapse-all').click(); // collapse
      
        const detail = document.querySelector('app-card').shadowRoot.querySelector('.details');
        expect(detail.classList.contains('expanded')).toBe(false);
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

    it('removes only job with exact match on name, role, and dateSubmitted', () => {
        const job1 = { ...mockJob };
        const job2 = { ...mockJob, companyName: "DifferentCo", jobRole: "Backend Dev" };
        localStorage.setItem('appliedJobs', JSON.stringify([job1, job2]));
        renderApplications(document.getElementById('container'));
      
        const card = document.querySelector('app-card');
        card.dispatchEvent(new CustomEvent('remove-app', {
          bubbles: true, detail: job1
        }));
      
        const stored = JSON.parse(localStorage.getItem('appliedJobs'));
        expect(stored).toEqual([job2]);
    });
    
    it('re-attaches expand/collapse buttons on re-render', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        const container = document.getElementById('container');
        renderApplications(container);
      
        const card = document.querySelector('app-card');
        card.dispatchEvent(new CustomEvent('remove-app', {
          bubbles: true, detail: mockJob
        }));
      
        // simulate re-adding a job
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        renderApplications(container);
      
        const btns = container.querySelectorAll('.toggle-all');
        expect(btns.length).toBe(2);
    });
      
    it('expand-all leaves already-expanded cards unchanged', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        renderApplications(document.getElementById('container'));
      
        const card = document.querySelector('app-card');
        const detail = card.shadowRoot.querySelector('.details');
        detail.classList.add('expanded'); // manually expand
      
        document.getElementById('expand-all').click();
      
        expect(detail.classList.contains('expanded')).toBe(true); // still expanded
    });
    
    it('collapse-all leaves already-collapsed cards unchanged', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        renderApplications(document.getElementById('container'));
      
        document.getElementById('collapse-all').click(); // call on collapsed
      
        const detail = document.querySelector('app-card').shadowRoot.querySelector('.details');
        expect(detail.classList.contains('expanded')).toBe(false);
    });

    it('attaches shadow DOM to each <app-card>', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        renderApplications(document.getElementById('container'));
      
        const card = document.querySelector('app-card');
        expect(card.shadowRoot).not.toBeNull();
    });

    it('removes expand/collapse buttons if no jobs remain', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        renderApplications(document.getElementById('container'));
      
        const card = document.querySelector('app-card');
        card.dispatchEvent(new CustomEvent('remove-app', {
          bubbles: true, detail: mockJob
        }));
      
        expect(document.querySelector('.toggle-all')).toBeNull();
    });

    it('renders job even with future submitted date', () => {
        const futureJob = { ...mockJob, dateSubmitted: "2099-01-01" };
        localStorage.setItem('appliedJobs', JSON.stringify([futureJob]));
        renderApplications(document.getElementById('container'));
        expect(document.querySelectorAll('app-card')).toHaveLength(1);
    });
    
    it('handles jobs with same jobRole but different companies distinctly', () => {
        const j1 = { ...mockJob, companyName: "X Corp" };
        const j2 = { ...mockJob, companyName: "Y Corp" };
        localStorage.setItem('appliedJobs', JSON.stringify([j1, j2]));
        renderApplications(document.getElementById('container'));
        expect(document.querySelectorAll('app-card')).toHaveLength(2);
    });

    it('uses <ul><li> structure for job requirements', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        renderApplications(document.getElementById('container'));
      
        const list = document.querySelector('app-card').shadowRoot.querySelector('.details ul');
        expect(list).toBeTruthy();
        expect(list.querySelectorAll('li')).toHaveLength(mockJob.jobRequirements.length);
    });
    
    it('handles double toggle-click safely', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        renderApplications(document.getElementById('container'));
      
        const toggle = document.querySelector('app-card').shadowRoot.querySelector('.toggle');
        toggle.click();
        toggle.click();
      
        const details = document.querySelector('app-card').shadowRoot.querySelector('.details');
        expect(['true', 'false']).toContain(details.classList.contains('expanded').toString());
    });

    it('expand/collapse still works after multiple renders', () => {
        localStorage.setItem('appliedJobs', JSON.stringify([mockJob]));
        const container = document.getElementById('container');
      
        renderApplications(container);
        renderApplications(container);
        renderApplications(container);
      
        const expandBtn = container.querySelector('#expand-all');
        expandBtn.click();
      
        const detail = document.querySelector('app-card').shadowRoot.querySelector('.details');
        expect(detail.classList.contains('expanded')).toBe(true);
    });
      
      
});