import './AppCard.js';

export function renderApplications(container) {

    // Example data (can later be looped over from a JSON list)
    const job = {
        companyName: "Innovatech Solutions",
        companyLogo: "https://placehold.co/100x50?text=Innovatech",
        industry: "Technology",
        jobRole: "Software Engineer",
        nature: 1,
        workModel: 3,
        location: "San Francisco, CA",
        pay: "$120,000/year",
        datePosted: "2025-05-15",
        submittedDate: "2025-05-20",
        companyInfo: "Leading provider of cloud and AI solutions.",
        jobDescription: "Develop and maintain web applications.",
        jobRequirements: [
        "Bachelor's degree in Computer Science",
        "2+ years with JavaScript/React",
        "Experience with REST APIs"
        ],
        relevantSkills: ["JavaScript", "React", "Node.js"],
        applicationLink: "https://example.com/apply/innovatech-software-engineer",
        htmlFile: "innovatech-software-engineer.html"
    };

    container.innerHTML = `
        <h2>Your Applications</h2>
        `;

    //for loop through all applied jobs or shown jobs
    //use widget to construct element for each
    const card = document.createElement('app-card');
    card.data = job;
    container.appendChild(card);
}