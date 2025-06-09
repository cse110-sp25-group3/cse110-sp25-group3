/**
 * @jest-environment jsdom
 */

import '../source/pages/applications/AppCard.js';

describe('<app-card> component', () => {
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
    }

    let saved = null;

    beforeAll(() => {
        saved = localStorage.getItem('appliedJobs');
    });

    afterAll(() => {
        if (saved != null) localStorage.setItem('appliedJobs', saved);
        else localStorage.removeItem('appliedJobs');
    });

    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = '';
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders style + article in shadow DOM', () => {
        const c = document.createElement('app-card');
        expect(c.shadowRoot.children.length).toBe(2);
        expect(c.shadowRoot.children[0].tagName).toBe('STYLE');
        expect(c.shadowRoot.children[1].tagName).toBe('ARTICLE');
    });

    it('injects all fields into its template', () => {
        const c = document.createElement('app-card');
        c.data = mockJob;
        const art = c.shadowRoot.querySelector('article');

        // header info
        expect(art.textContent).toContain('Bright Minds Academy');
        expect(art.textContent).toContain('Education');

        // role, location, pay, nature, date
        expect(art.textContent).toContain('Elementary School Teacher');
        expect(art.textContent).toContain('Seattle, WA');
        expect(art.textContent).toContain('$55,000/year');
        expect(art.textContent).toContain('On-site');
        expect(art.textContent).toContain('Applied on');

        // requirements count
        expect(art.querySelectorAll('ul li')).toHaveLength(3);

        // skills count
        expect(art.querySelectorAll('.details .skill')).toHaveLength(3);

        // apply link
        expect(art.querySelector('a.apply-link').href)
            .toBe(mockJob.applicationLink);
    });

    it('toggles the details section open/closed', async () => {
        const c = document.createElement('app-card');
        document.body.appendChild(c);
        c.data = mockJob;
    
        const btn = c.shadowRoot.querySelector('.toggle');
        const detail = c.shadowRoot.querySelector('.details');
    
        expect(btn).not.toBeNull();
        expect(detail).not.toBeNull();
    
        btn.click();
        expect(detail.classList.contains('expanded')).toBe(true);
        expect(btn.textContent).toBe('Hide');
    
        btn.click();
        expect(detail.classList.contains('expanded')).toBe(false);
        expect(btn.textContent).toBe('Details');
    });

    it('removes app after confirmation + plays shrink animation', () => {
        const c = document.createElement('app-card');
        c.data = mockJob;
        document.body.append(c);

        const modal = c.shadowRoot.querySelector('dialog');
        const art = c.shadowRoot.querySelector('article');

        // mock showModal
        modal.showModal = jest.fn();

        // click remove -> showModal
        c.shadowRoot.querySelector('.remove-app').click();
        expect(modal.showModal).toHaveBeenCalled();

        // simulate dialog close with 'confirm';
        modal.returnValue = 'confirm';
        modal.dispatchEvent(new Event('close'));

        // Card should shrink immediately
        expect(art.classList.contains('shrink-out')).toBe(true);

        // wait for removal event
        const handler = jest.fn();
        c.addEventListener('remove-app', handler);

        // Simulate 1s timer
        jest.advanceTimersByTime(1000);

        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({ detail: mockJob })
        );
    });

    it('closes modal on clicking outside + triggers shrinkOut animation', () => {
        const c = document.createElement('app-card');
        c.data = mockJob;
        document.body.appendChild(c);
      
        const modal = c.shadowRoot.querySelector('dialog');
        const content = modal.querySelector('.modal-content');
      
        // Mock dialog methods (JSDOM does not implement them)
        modal.showModal = jest.fn();
        modal.close = jest.fn();
      
        // Open the modal
        c.shadowRoot.querySelector('.remove-app').click();
        expect(modal.showModal).toHaveBeenCalled();
      
        // Simulate clicking on the backdrop (dialog itself, not content)
        modal.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
      
        // Ensure animation is triggered
        expect(content.style.animation).toBe('shrinkOut 0.2s forwards');
      
        // Advance time for setTimeout
        jest.advanceTimersByTime(200);
        expect(modal.close).toHaveBeenCalledWith('cancel');
    });      
});