import './AppCard.js';

export function renderApplications(container) {

    // Array of job application objects
    const jobs = [
        {
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
        },
        {
            companyName: "Figma",
            companyLogo: "https://placehold.co/100x50?text=Figma",
            industry: "Design & Collaboration",
            jobRole: "UX Designer",
            nature: 1,
            workModel: 2,
            location: "New York, NY",
            pay: "$105,000/year",
            datePosted: "2025-05-10",
            submittedDate: "2025-05-22",
            companyInfo: "Figma helps teams design and build better products together.",
            jobDescription: "Create user flows, wireframes, and interactive prototypes.",
            jobRequirements: [
                "Bachelor's degree in Design or HCI",
                "Strong UX/UI portfolio",
                "Fluency in Figma"
            ],
            relevantSkills: ["UX Design", "Figma", "Prototyping"],
            applicationLink: "https://example.com/apply/figma-ux-designer",
            htmlFile: "figma-ux-designer.html"
        },
        {
            companyName: "FinSight Analytics",
            companyLogo: "https://placehold.co/100x50?text=FinSight",
            industry: "Finance",
            jobRole: "Data Analyst",
            nature: 1,
            workModel: 1,
            location: "Remote",
            pay: "$85,000/year",
            datePosted: "2025-04-25",
            submittedDate: "2025-05-18",
            companyInfo: "FinSight provides predictive analytics for financial institutions.",
            jobDescription: "Analyze financial datasets and generate actionable insights.",
            jobRequirements: [
                "Bachelor’s in Statistics, Math, or related field",
                "Proficiency in SQL and Python",
                "Experience with data visualization tools"
            ],
            relevantSkills: ["SQL", "Python", "Power BI"],
            applicationLink: "https://example.com/apply/finsight-data-analyst",
            htmlFile: "finsight-data-analyst.html"
        },
        {
            companyName: "GreenLoop",
            companyLogo: "https://placehold.co/100x50?text=GreenLoop",
            industry: "Sustainability",
            jobRole: "Marketing Coordinator",
            nature: 2,
            workModel: 2,
            location: "Austin, TX",
            pay: "$30/hour",
            datePosted: "2025-05-05",
            submittedDate: "2025-05-21",
            companyInfo: "GreenLoop promotes sustainable living through education and outreach.",
            jobDescription: "Coordinate social media, email campaigns, and events.",
            jobRequirements: [
                "Excellent communication skills",
                "Experience with digital marketing",
                "Familiarity with social media tools"
            ],
            relevantSkills: ["Marketing", "Social Media", "Event Planning"],
            applicationLink: "https://example.com/apply/greenloop-marketing-coordinator",
            htmlFile: "greenloop-marketing-coordinator.html"
        },
        {
            companyName: "CloudSync Inc.",
            companyLogo: "https://placehold.co/100x50?text=CloudSync",
            industry: "Cloud Infrastructure",
            jobRole: "DevOps Engineer Intern",
            nature: 3,
            workModel: 3,
            location: "Seattle, WA",
            pay: "$25/hour",
            datePosted: "2025-04-30",
            submittedDate: "2025-05-19",
            companyInfo: "CloudSync helps enterprises scale and automate cloud infrastructure.",
            jobDescription: "Support CI/CD pipelines and automate cloud deployments.",
            jobRequirements: [
                "Currently pursuing a CS or IT degree",
                "Familiarity with Docker and CI/CD tools",
                "Interest in cloud technologies"
            ],
            relevantSkills: ["CI/CD", "Docker", "AWS"],
            applicationLink: "https://example.com/apply/cloudsync-devops-intern",
            htmlFile: "cloudsync-devops-intern.html"
        }
    ];

    container.innerHTML = `
        <h2>Your Applications</h2>
        `;

    //for loop through all applied jobs or shown jobs
    //use widget to construct element for each
    for (const job of jobs) {
        const card = document.createElement('app-card');
        card.data = job;
        container.appendChild(card);
    }
}