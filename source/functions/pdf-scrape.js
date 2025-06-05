// Usage:

// Example for parse and get data back
// const resumeData = await parseSingleResume('./path/to/resume.pdf');
// console.log(resumeData);

// Example for parse and save to JSON file
// await parseSingleResume('./path/to/resume.pdf', './output/parsed_resume.json');

// Example for using the class directly
// const parser = new ResumeParser();
// const data = await parser.parseResume('./resume.pdf');

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

class ResumeParser {
    constructor() {
        // Section patterns
        this.sectionPatterns = {
            contact: /^(contact|personal\s+info|contact\s+info|personal\s+details)$/i,
            summary: /^(summary|profile|objective|about|personal\s+statement)$/i,
            experience: /^(experience|work\s+experience|employment|professional\s+experience|work\s+history)$/i,
            education: /^(education|academic\s+background|qualifications)$/i,
            skills: /^(skills|technical\s+skills|core\s+competencies|technologies|expertise)$/i,
            projects: /^(projects|personal\s+projects|key\s+projects)$/i,
            certifications: /^(certifications?|certificates?|credentials)$/i,
            languages: /^(languages?|language\s+skills)$/i,
            achievements: /^(achievements?|awards?|honors?|accomplishments?)$/i,
            interests: /^(interests|hobbies|activities)$/i
        };

        // Regex patterns
        this.emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        this.phonePattern = /(\+\d{1,3}[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
        this.urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
        
        // Date patterns
        this.datePattern = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\b\d{1,2}\/\d{4}|\b\d{4}\s*[-–—]\s*\d{4}|\b\d{4}\s*[-–—]\s*present|\bpresent\b|expected\s+\w+\s+\d{4}|\bstarting\s+\w+\s+\d{4}/gi;
        this.dateRangePattern = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\s*[-–—]\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|present))|(?:\d{4}\s*[-–—]\s*(?:\d{4}|present))|(?:expected\s+\w+\s+\d{4})|(?:starting\s+\w+\s+\d{4})/gi;
        
        // Skills keywords
        this.skillKeywords = [
            // Programming Languages
            'javascript', 'python', 'java', 'c++', 'c#', 'c', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust', 'matlab', 'sql', 'scheme', 'assembly',
            // Web Technologies
            'html', 'css', 'react', 'angular', 'vue', 'node.js', 'nodejs', 'express', 'django', 'flask', 'spring',
            // Databases
            'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sql server', 'sqlite',
            // Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'ci/cd',
            // Tools & Frameworks
            'tensorflow', 'pytorch', 'opencv', 'pandas', 'numpy', 'scikit-learn', 'keras', 'selenium', 'junit'
        ];

        // Company and title indicators
        this.companyIndicators = /\b(?:inc|llc|corp|corporation|company|technologies|tech|solutions|systems|institute|university|ltd|limited)\b/i;
        this.jobTitleIndicators = /\b(?:engineer|developer|manager|analyst|consultant|director|coordinator|specialist|intern|internship|lead|senior|junior|principal|associate|scientist|researcher)\b/i;
        
        // Location patterns
        this.locationPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2,3}\b/g;
        this.cityStatePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*(?:[A-Z]{2}|[A-Z][a-z]+|USA|UK)\b/g;
    }

    async parseResume(filePath) {
        try {
            console.log(`Parsing resume: ${filePath}`);
            
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            
            const text = pdfData.text;
            const lines = this.preprocessLines(text);
            
            const resumeData = {
                fileName: path.basename(filePath),
                totalPages: pdfData.numpages,
                contact: this.extractContactInfo(text, lines),
                sections: this.extractSections(lines),
                skills: this.extractSkills(text, lines),
                experience: this.extractExperience(lines, text),
                education: this.extractEducation(lines, text),
                projects: this.extractProjects(lines, text),
                certifications: this.extractCertifications(lines),
                languages: this.extractLanguages(lines),
                rawText: text,
                metadata: {
                    parsedAt: new Date().toISOString(),
                    wordCount: text.split(/\s+/).length,
                    lineCount: lines.length
                }
            };

            return resumeData;
            
        } catch (error) {
            throw new Error(`Failed to parse resume: ${error.message}`);
        }
    }

    preprocessLines(text) {
        if (!text || typeof text !== 'string') {
            return [];
        }
        
        return text
            .split('\n')
            .map(line => line ? line.trim() : '')
            .filter(line => line.length > 0)
            .map(line => line.replace(/\s+/g, ' ')); // Normalize whitespace
    }

    extractContactInfo(text, lines) {
        const contact = {
            name: null,
            email: null,
            phone: null,
            location: null,
            websites: [],
            socialProfiles: {}
        };

        if (!text) text = '';
        if (!lines || !Array.isArray(lines)) lines = [];

        // Extract email
        const emails = text.match(this.emailPattern);
        if (emails && emails.length > 0) {
            contact.email = emails[0];
        }

        // Extract phone
        const phones = text.match(this.phonePattern);
        if (phones && phones.length > 0) {
            contact.phone = phones[0];
        }

        // Extract URLs and social profiles
        const urls = text.match(this.urlPattern);
        if (urls && urls.length > 0) {
            urls.forEach(url => {
                if (url) {
                    const cleanUrl = url.toLowerCase().replace(/[.,;]$/, '');
                    if (cleanUrl.includes('linkedin')) {
                        contact.socialProfiles.linkedin = url;
                    } else if (cleanUrl.includes('github')) {
                        contact.socialProfiles.github = url;
                    } else if (cleanUrl.includes('twitter')) {
                        contact.socialProfiles.twitter = url;
                    } else if (cleanUrl.match(/^(https?:\/\/|www\.)/)) {
                        contact.websites.push(url);
                    }
                }
            });
        }

        // Extract name (first non-contact line that looks like a name)
        if (lines && lines.length > 0) {
            for (let i = 0; i < Math.min(3, lines.length); i++) {
                const line = lines[i];
                if (line && typeof line === 'string') {
                    if (!line.match(this.emailPattern) && 
                        !line.match(this.phonePattern) && 
                        !line.match(this.urlPattern) &&
                        !this.isLikelySectionHeader(line) &&
                        line.length < 50 && 
                        line.split(' ').length <= 4 &&
                        /^[A-Za-z\s]+$/.test(line) &&
                        !line.includes('|')) {
                        contact.name = line;
                        break;
                    }
                }
            }
        }

        // Extract location (look in contact header line (first line with pipe))
        if (lines && lines.length > 0) {
            // Look for the contact info line
            for (let i = 0; i < Math.min(5, lines.length); i++) {
                const line = lines[i];
                if (line && line.includes('|') && 
                    (line.includes('@') || line.match(this.phonePattern) || line.includes('www.'))) {
                    // Likely the contact header line
                    const parts = line.split('|').map(part => part.trim());
                    for (const part of parts) {
                        // Look for location pattern that's not email/phone/url
                        if (part.match(this.cityStatePattern) && 
                            !part.includes('@') && 
                            !part.match(this.phonePattern) &&
                            !part.includes('www.') &&
                            !part.includes('http')) {
                            contact.location = part;
                            break;
                        }
                    }
                    if (contact.location) break;
                }
            }
        }

        return contact;
    }

    extractSections(lines) {
        const sections = {};
        let currentSection = null;
        let currentSectionContent = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let isHeader = false;
            
            for (const [sectionName, pattern] of Object.entries(this.sectionPatterns)) {
                if (pattern.test(line.trim())) {
                    if (currentSection && currentSectionContent.length > 0) {
                        sections[currentSection] = currentSectionContent.join('\n');
                    }
                    
                    currentSection = sectionName;
                    currentSectionContent = [];
                    isHeader = true;
                    break;
                }
            }

            if (!isHeader && currentSection) {
                currentSectionContent.push(line);
            }
        }

        // Add the last section
        if (currentSection && currentSectionContent.length > 0) {
            sections[currentSection] = currentSectionContent.join('\n');
        }

        return sections;
    }

    extractSkills(text, lines) {
        const skills = new Set();
        
        if (!text || typeof text !== 'string') text = '';
        if (!lines || !Array.isArray(lines)) lines = [];
        
        // Find the skills section
        let skillsSection = '';
        let inSkillsSection = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line || typeof line !== 'string') continue;
            
            // Check for skills section header
            if (this.sectionPatterns.skills.test(line) || 
                /^technical\s+skills$/i.test(line)) {
                inSkillsSection = true;
                continue;
            }
            
            // Check if reached the next section
            if (inSkillsSection && this.isLikelySectionHeader(line)) {
                break;
            }
            
            if (inSkillsSection) {
                skillsSection += line + ' ';
            }
        }

        // Extract skills from the skills section with better parsing
        if (skillsSection) {
            // Look for colon-separated categories
            const lines = skillsSection.split(/Programming Languages:|Technologies\/Frameworks\/Libraries:|Tools:/gi);
            lines.forEach(section => {
                if (section.trim()) {
                    // Split by common delimiters
                    const extractedSkills = section
                        .split(/[,;]/)
                        .map(skill => skill.trim())
                        .filter(skill => skill && skill.length > 1 && skill.length < 30)
                        .filter(skill => !/^(and|or|the|a|an)$/i.test(skill));
                    
                    extractedSkills.forEach(skill => {
                        if (skill) skills.add(skill);
                    });
                }
            });
        }

        // Extract from predefined keywords
        const allText = text.toLowerCase();
        this.skillKeywords.forEach(skill => {
            if (skill && allText.includes(skill.toLowerCase())) {
                skills.add(skill);
            }
        });

        // Remove case-insensitive duplicates
        const skillsArray = Array.from(skills);
        const uniqueSkills = [];
        const seenSkills = new Set();
        
        skillsArray.forEach(skill => {
            const lowerSkill = skill.toLowerCase();
            if (!seenSkills.has(lowerSkill)) {
                seenSkills.add(lowerSkill);
                // Prefer the capitalized version
                const properCasedVersion = skillsArray.find(s => 
                    s.toLowerCase() === lowerSkill && 
                    /^[A-Z]/.test(s)
                );
                uniqueSkills.push(properCasedVersion || skill);
            }
        });

        return uniqueSkills;
    }

    extractExperience(lines, text) {
        const experiences = [];
        let inExperienceSection = false;
        let currentExperience = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line || typeof line !== 'string') continue;
            
            // Check for experience section
            if (this.sectionPatterns.experience.test(line)) {
                inExperienceSection = true;
                continue;
            }
            
            // Check if reached the next section
            if (inExperienceSection && this.isLikelySectionHeader(line)) {
                if (currentExperience) {
                    experiences.push(currentExperience);
                    currentExperience = null;
                }
                break;
            }
            
            if (inExperienceSection) {
                // Parsing for experience entries
                const pipePattern = /^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)(?:\s*\|\s*(.+?))?$/;
                const match = line.match(pipePattern);
                
                if (match && !line.startsWith('■')) {
                    // Save previous experience
                    if (currentExperience) {
                        experiences.push(currentExperience);
                    }
                    
                    const [, part1, part2, part3, part4] = match;
                    let company = '', title = '', duration = '', location = '';
                    
                    // First part is usually company
                    company = part1.trim();
                    
                    // Second part often contains title + duration combined
                    // Separate title from duration in part2
                    let titleDurationPart = part2.trim();
                    let locationPart = part3 ? part3.trim() : '';
                    
                    // Look for date patterns in the title/duration part
                    const dateMatches = titleDurationPart.match(/(starting\s+\w+\s+\d{4}|\w+\s+\d{4}\s*[-–—]\s*\w+\s+\d{4}|\w+\s+\d{4}\s*[-–—]\s*present|\d{4}\s*[-–—]\s*\d{4}|\d{4}\s*[-–—]\s*present)/gi);
                    
                    if (dateMatches && dateMatches.length > 0) {
                        // Found date pattern (split title and duration)
                        const datePattern = dateMatches[0];
                        duration = datePattern;
                        title = titleDurationPart.replace(datePattern, '').trim();
                    } else {
                        // No clear date pattern, treat whole thing as title
                        title = titleDurationPart;
                    }
                    
                    // Third part is usually location
                    if (this.cityStatePattern.test(locationPart) || 
                        /\b[A-Z][a-z]+,?\s*[A-Z]{2,3}\b/.test(locationPart)) {
                        location = locationPart;
                    }
                    
                    currentExperience = {
                        title: title,
                        company: company,
                        duration: duration,
                        location: location,
                        description: []
                    };
                } else if (currentExperience && line.startsWith('■')) {
                    currentExperience.description.push(line.substring(1).trim());
                } else if (currentExperience && line && !this.isLikelySectionHeader(line)) {
                    currentExperience.description.push(line);
                }
            }
        }
        
        // Add the last experience
        if (currentExperience) {
            experiences.push(currentExperience);
        }
        
        return experiences.map(exp => ({
            ...exp,
            description: exp.description.join(' ')
        }));
    }

    extractEducation(lines, text) {
        const education = [];
        let inEducationSection = false;
        let currentEducation = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line || typeof line !== 'string') continue;
            
            // Check for education section
            if (this.sectionPatterns.education.test(line)) {
                inEducationSection = true;
                continue;
            }
            
            // Check if reached the next section
            if (inEducationSection && this.isLikelySectionHeader(line)) {
                if (currentEducation) {
                    education.push(currentEducation);
                    currentEducation = null;
                }
                break;
            }
            
            if (inEducationSection) {
                // Education parsing
                const eduPattern = /^(.+?)\s*\|\s*(.+?)$/;
                const match = line.match(eduPattern);
                
                if (match && this.isLikelyInstitution(line)) {
                    // Save previous education
                    if (currentEducation) {
                        education.push(currentEducation);
                    }
                    
                    const [, institutionPart, locationPart] = match;
                    let institution = '', duration = '', location = locationPart.trim();
                    
                    // Look for date patterns in institution part
                    const dateMatches = institutionPart.match(/(expected\s+\w+\s+\d{4}|\w+\s+\d{4}\s*[-–—]\s*\w+\s+\d{4}|\w+\s+\d{4}\s*[-–—]\s*present|\d{4}\s*[-–—]\s*\d{4}|\d{4}\s*[-–—]\s*present)/gi);
                    if (dateMatches) {
                        duration = dateMatches[0];
                        institution = institutionPart.replace(dateMatches[0], '').trim();
                    } else {
                        institution = institutionPart.trim();
                    }
                    
                    currentEducation = {
                        institution: institution,
                        duration: duration,
                        location: location,
                        degree: '',
                        gpa: '',
                        details: []
                    };
                } else if (currentEducation && this.isLikelyDegree(line)) {
                    // Only set degree if it's not already set and this looks like a degree
                    if (!currentEducation.degree) {
                        currentEducation.degree = line.trim();
                    } else {
                        currentEducation.details.push(line);
                    }
                } else if (currentEducation && line.toLowerCase().includes('gpa')) {
                    const gpaMatch = line.match(/gpa:?\s*([0-9.]+)/i);
                    if (gpaMatch) {
                        currentEducation.gpa = gpaMatch[1];
                    }
                    currentEducation.details.push(line);
                } else if (currentEducation && line && !this.isLikelySectionHeader(line)) {
                    currentEducation.details.push(line);
                }
            }
        }
        
        // Add the last education
        if (currentEducation) {
            education.push(currentEducation);
        }
        
        return education.map(edu => ({
            ...edu,
            details: edu.details.join(' ')
        }));
    }

    extractProjects(lines, text) {
        const projects = [];
        let inProjectsSection = false;
        let currentProject = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line || typeof line !== 'string') continue;
            
            // Check for projects section
            if (this.sectionPatterns.projects.test(line)) {
                inProjectsSection = true;
                continue;
            }
            
            // Check if reached the next section
            if (inProjectsSection && this.isLikelySectionHeader(line)) {
                if (currentProject) {
                    projects.push(currentProject);
                    currentProject = null;
                }
                break;
            }
            
            if (inProjectsSection) {
                // Project parsing
                const projectPattern = /^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)(?:\s*\|\s*(.+?))?$/;
                const match = line.match(projectPattern);
                
                if (match && this.isLikelyProjectTitle(match[1])) {
                    // Save previous project
                    if (currentProject) {
                        projects.push(currentProject);
                    }
                    
                    const [, titlePart, techDurationPart, locationPart, fourthPart] = match;
                    
                    let title = titlePart.trim();
                    let technologies = [];
                    let duration = '';
                    let location = locationPart ? locationPart.trim() : '';
                    
                    // Parse the tech/duration part which often contains both
                    if (techDurationPart) {
                        const techDuration = techDurationPart.trim();
                        
                        // Look for date patterns
                        const dateMatches = techDuration.match(/(may\s+\d{4}\s*[-–—]\s*present|april\s+\d{4}|\w+\s+\d{4}\s*[-–—]\s*\w+\s+\d{4}|\w+\s+\d{4}\s*[-–—]\s*present|\d{4}\s*[-–—]\s*\d{4}|\d{4}\s*[-–—]\s*present)/gi);
                        
                        if (dateMatches && dateMatches.length > 0) {
                            // Found date pattern (extract it)
                            duration = dateMatches[0];
                            // Remove date from tech part and treat rest as technologies
                            const techPart = techDuration.replace(dateMatches[0], '').trim();
                            if (techPart) {
                                // Split technologies by common delimiters
                                technologies = techPart.split(/[,;]/)
                                    .map(t => t.trim())
                                    .filter(t => t && t.length > 0);
                            }
                        } else {
                            // No clear date pattern (might be all technologies)
                            technologies = techDuration.split(/[,;]/)
                                .map(t => t.trim())
                                .filter(t => t && t.length > 0);
                        }
                    }
                    
                    currentProject = {
                        title: title,
                        technologies: technologies,
                        duration: duration,
                        location: location,
                        description: []
                    };
                } else if (currentProject && line.startsWith('■')) {
                    currentProject.description.push(line.substring(1).trim());
                } else if (currentProject && line && !this.isLikelySectionHeader(line)) {
                    currentProject.description.push(line);
                }
            }
        }
        
        // Add the last project
        if (currentProject) {
            projects.push(currentProject);
        }
        
        return projects.map(project => ({
            ...project,
            description: project.description.join(' ')
        }));
    }

    extractCertifications(lines) {
        const certifications = [];
        let inCertSection = false;
        
        for (const line of lines) {
            if (this.sectionPatterns.certifications.test(line)) {
                inCertSection = true;
                continue;
            }
            
            if (inCertSection) {
                if (this.isLikelySectionHeader(line)) {
                    break;
                }
                
                if (line && line.trim().length > 0) {
                    certifications.push({
                        name: line,
                        issuer: '',
                        date: this.extractDateFromText(line)
                    });
                }
            }
        }
        
        return certifications;
    }

    extractLanguages(lines) {
        const languages = [];
        let inLanguageSection = false;
        
        for (const line of lines) {
            if (this.sectionPatterns.languages.test(line)) {
                inLanguageSection = true;
                continue;
            }
            
            if (inLanguageSection) {
                if (this.isLikelySectionHeader(line)) {
                    break;
                }
                
                if (line && line.trim().length > 0) {
                    const langMatch = line.match(/^(.+?)\s*[-–—:]\s*(.+)$/);
                    if (langMatch) {
                        languages.push({
                            language: langMatch[1].trim(),
                            proficiency: langMatch[2].trim()
                        });
                    } else {
                        languages.push({
                            language: line.trim(),
                            proficiency: ''
                        });
                    }
                }
            }
        }
        
        return languages;
    }

    // Helper methods
    containsDatePattern(text) {
        if (!text) return false;
        return this.datePattern.test(text) || 
               this.dateRangePattern.test(text) || 
               /\b(present|current|expected|starting)\b/i.test(text) ||
               /\b\d{4}\b/.test(text);
    }

    isLikelyInstitution(text) {
        const institutionKeywords = /\b(?:university|college|institute|school|academy)\b/i;
        return institutionKeywords.test(text);
    }

    isLikelyDegree(line) {
        const degreePatterns = [
            /\b(?:bachelor|master|phd|doctorate|associate|diploma)\b/i,
            /\b(?:b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|ph\.?d\.?)\b/i
        ];
        const courseworkPatterns = [
            /\b(?:relevant\s+coursework|coursework)\b/i,
            /\b(?:courses|classes)\b/i
        ];
        
        // Must match degree patterns and not match coursework patterns
        return degreePatterns.some(pattern => pattern.test(line)) && 
               !courseworkPatterns.some(pattern => pattern.test(line));
    }

    isLikelyProjectTitle(text) {
        return text.length < 100 && 
               text.length > 3 && 
               !text.includes('■') && 
               !text.startsWith('-') &&
               /^[A-Za-z0-9\s']+/.test(text) &&
               !this.isLikelySectionHeader(text);
    }

    isLikelySectionHeader(line) {
        if (!line || typeof line !== 'string') return false;
        const cleanLine = line.trim();
        return Object.values(this.sectionPatterns).some(pattern => pattern.test(cleanLine)) ||
               /^[A-Z][A-Z\s]*$/.test(cleanLine) && cleanLine.length < 30;
    }

    extractDateFromText(text) {
        if (!text || typeof text !== 'string') return '';
        const dates = text.match(this.datePattern);
        return dates && dates.length > 0 ? dates[0] : '';
    }
}

// Parse a single resume
async function parseSingleResume(resumePath, outputPath = null) {
    try {
        const parser = new ResumeParser();
        const resumeData = await parser.parseResume(resumePath);
        
        if (outputPath) {
            const fs = require('fs');
            fs.writeFileSync(outputPath, JSON.stringify(resumeData, null, 2));
            console.log(`Resume parsed and saved to: ${outputPath}`);
        }
        
        return resumeData;
    } catch (error) {
        console.error(`Failed to parse resume: ${error.message}`);
        throw error;
    }
}

module.exports = { ResumeParser, parseSingleResume };