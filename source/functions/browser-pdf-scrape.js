class BrowserResumeParser {
    constructor() {
        this.initializePatterns();
        this.initializeKeywords();
        this.initializeClassifiers();
        this.extractedData = new Set(); // Track extracted information to prevent duplicates
    }

    initializePatterns() {
        this.patterns = {
            email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
            phone: /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})(?:\s?(?:ext|x|extension)\.?\s?(\d+))?/g,
            url: /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|io|co|me|us|uk|ca|de|fr|au)(?:\/[^\s]*)?)/gi,
            linkedin: /(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)[A-Za-z0-9\-_%]+/gi,
            github: /(?:github\.com\/)[A-Za-z0-9\-_]+(?:\/[A-Za-z0-9\-_]+)*/gi,
            gender:/^(male|female)$/i,
            // Date patterns
            dates: {
                // Year ranges: 2023-2024, 2023-present, etc.
                yearRange: /\b(19|20)\d{2}\s*[-–—]\s*(?:(19|20)\d{2}|present|current)\b/gi,
                // Month year ranges: Jan 2023 - Dec 2024, March 2024 - present
                monthYearRange: /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(19|20)\d{2}\s*[-–—]\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(19|20)\d{2}|present|current)\b/gi,
                // Month range with year: May - August, 2015
                monthRangeWithYear: /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*[-–—]\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s+(19|20)\d{2}\b/gi,
                // Single month year: January 2024, Aug 2023, etc.
                monthYear: /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(19|20)\d{2}\b/gi,
                // Starting/Expected patterns: Starting June 2025, Expected March 2024
                startingExpected: /\b(?:starting|expected|beginning)\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(19|20)\d{2}\b/gi,
                // Full date: January 15, 2024
                fullDate: /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+(19|20)\d{2}\b/gi,
                // Just year: 2024
                year: /\b(19|20)\d{2}\b/g,
                // Present indicators
                present: /\b(?:present|current|ongoing|now)\b/gi
            },
            
            // Bullet point patterns
            bullets: /^[\s]*[•·▪▫▸▹◦‣⁃▴▾□■◇◆○●→⮚\-\*\+➤➢]\s*/,
            
            // Location patterns
            location: /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
            
            // GPA pattern - more comprehensive
            gpa: /\bgpa:?\s*(\d+\.?\d*)\s*(?:\/\s*(\d+\.?\d*)|out of \d+\.?\d*)?\b/gi
        };
    }

    initializeKeywords() {
        this.keywords = {
            jobTitles: [
                'engineer', 'developer', 'programmer', 'architect', 'manager', 'director', 
                'lead', 'senior', 'junior', 'analyst', 'consultant', 'specialist',
                'coordinator', 'supervisor', 'administrator', 'designer', 'scientist',
                'researcher', 'intern', 'associate', 'principal', 'executive', 'officer',
                'president', 'founder', 'owner', 'head', 'chief', 'vice', 'assistant'
            ],
            
            companies: [
                'inc', 'incorporated', 'llc', 'corp', 'corporation', 'company', 'co',
                'ltd', 'limited', 'technologies', 'tech', 'solutions', 'systems',
                'software', 'services', 'consulting', 'group', 'partners', 'associates', 'pvt ltd'
            ],
            
            degrees: [
                'bachelor', 'master', 'phd', 'doctorate', 'associate', 'diploma',
                'certificate', 'degree', 'bs', 'ba', 'ms', 'ma', 'mba', 'md', 'jd',
                'b.s.', 'm.s.', 'b.a.', 'm.a.', 'ph.d.', 'b.sc.', 'm.sc.,mca,bca'
            ],
            
            institutions: [
                'university', 'college', 'school', 'institute', 'academy', 'polytechnic'
            ],
            
            skills: {
                programming: [
                    'javascript', 'python', 'java', 'c++', 'c#', 'typescript', 'go', 
                    'rust', 'swift', 'kotlin', 'ruby', 'php', 'scala', 'r', 'matlab',
                    'sql', 'html', 'css', 'shell', 'bash', 'powershell', 'c', 'perl'
                ],
                frameworks: [
                    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
                    'spring', 'laravel', 'jquery', 'bootstrap', 'tensorflow', 'pytorch',
                    'hadoop', 'maven'
                ],
                databases: [
                    'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sqlite',
                    'elasticsearch', 'cassandra', 'dynamodb'
                ],
                tools: [
                    'git', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'gcp',
                    'terraform', 'ansible', 'gitlab', 'github', 'jira', 'confluence',
                    'dkpro', 'cytoscape'
                ],
                methodologies: [
                    'agile', 'scrum', 'devops', 'ci/cd', 'tdd', 'bdd', 'kanban'
                ]
            }
        };
    }

    initializeClassifiers() {
        this.sectionPatterns = {
            contact: [
                /^(?:contact|personal)\s+(?:information|details)$/i,
                /^contact$/i
            ],
            summary: [
                /^(?:professional\s+)?(?:summary|profile|overview|objective)$/i,
                /^(?:career\s+)?(?:summary|profile|overview)$/i,
                /^about\s+(?:me)?$/i,
                /^executive\s+summary$/i
            ],
            experience: [
                /^(?:professional\s+)?(?:work\s+)?experience$/i,
                /^(?:employment\s+)?(?:history|background)$/i,
                /^(?:professional\s+)?(?:career|background)$/i,
                /^work$/i,
                /^relevant\s+experience$/i
            ],
            education: [
                /^education(?:al\s+background)?$/i,
                /^academic\s+(?:background|qualifications|history)$/i,
                /^qualifications$/i,
                /^degrees?$/i
            ],
            skills: [
                /^(?:technical\s+)?skills$/i,
                /^(?:core\s+)?competencies$/i,
                /^technologies$/i,
                /^expertise$/i,
                /^proficiencies$/i,
                /^programming\s+languages?$/i
            ],

            certifications: [
                /^certifications?$/i,
                /^certificates?$/i,
                /^licenses?$/i,
                /^credentials$/i
            ],
            achievements: [
                /^(?:awards?|honors?|achievements?|accomplishments?)$/i,
                /^recognition$/i
            ],
            languages: [
                /^languages?$/i,
                /^(?:foreign\s+)?languages?\s+(?:spoken|known)?$/i
            ]
        };
    }

    async parseResumeFromFile(file) {
        try {
            console.log(`Parsing resume: ${file.name}`);
            
            // Reset extracted data tracker for new resume
            this.extractedData = new Set();
            
            // Extract raw text from PDF using PDF.js (browser compatible)
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
            
            let rawText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                // Better text reconstruction with positioning
                let pageText = '';
                let lastY = null;
                let lastX = null;
                
                for (const item of textContent.items) {
                    const y = item.transform[5];  // Y position
                    const x = item.transform[4];  // X position
                    
                    if (lastY !== null && Math.abs(y - lastY) > 5) {
                        // New line detected
                        pageText += '\n';
                    } else if (lastX !== null && (x - lastX) > 10) {
                        // Significant horizontal gap - add space
                        pageText += ' ';
                    }
                    
                    pageText += item.str;
                    lastY = y;
                    lastX = x + (item.width || 0);
                }
                
                rawText += pageText + '\n';
            }
            
            // Preprocess text
            const cleanText = this.preprocessText(rawText);
            const lines = this.splitIntoLines(cleanText);
            
            // Extract sections
            const sections = this.identifySections(lines);
            
            // Extract all information with priority order to prevent overlaps
            const resumeData = {
                metadata: {
                    filename: file.name,
                    totalPages: pdf.numPages,
                    parseDate: new Date().toISOString(),
                    wordCount: cleanText.split(/\s+/).length,
                    lineCount: lines.length
                },
                contact: this.extractContactInfo(cleanText, lines), // Extract first to establish what's taken
                summary: this.extractSummary(sections),
                experience: this.extractExperience(sections),
                education: this.extractEducation(sections),
                skills: this.extractSkills(sections, cleanText),
                certifications: this.extractCertifications(sections),
                achievements: this.extractAchievements(sections),
                languages: this.extractLanguages(sections),
                sections: Object.keys(sections),
                rawText: rawText.substring(0, 2000) + '...'
            };
            
            // Final cleanup to remove any remaining overlaps 
            this.cleanupOverlaps(resumeData);
            
            // Calculate confidence score 
            resumeData.metadata.confidenceScore = this.calculateConfidence(resumeData);
            
            return resumeData;
            
        } catch (error) {
            console.error(`Failed to parse resume: ${error.message}`);
            throw new Error(`Failed to parse resume: ${error.message}`);
        }
    }

    markAsExtracted(data) {
        if (data && typeof data === 'string' && data.trim().length > 0) {
            this.extractedData.add(data.toLowerCase().trim());
        }
    }

    isAlreadyExtracted(data) {
        if (!data || typeof data !== 'string') return false;
        return this.extractedData.has(data.toLowerCase().trim());
    }

    preprocessText(text) {
        if (!text) return '';
        
        return text
            // Normalize line endings and whitespace
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\u00A0/g, ' ') // Non-breaking spaces
            .replace(/\t/g, ' ')     // Tabs to spaces
            
            // Fix broken words across lines
            .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
            
            // Fix broken emails and URLs
            .replace(/(\w+@\w+)\s*\n\s*(\.\w+)/g, '$1$2')
            .replace(/(https?:\/\/\w+)\s*\n\s*(\S+)/g, '$1$2')
            
            // Fix broken phone numbers
            .replace(/(\d{3})\s*\n\s*(\d{3})\s*\n\s*(\d{4})/g, '$1-$2-$3')
            
            // Normalize multiple spaces/lines
            .replace(/[ \t]+/g, ' ')
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .trim();
    }

    splitIntoLines(text) {
        return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    }

    identifySections(lines) {
        const sections = {};
        let currentSection = 'unknown';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const sectionType = this.classifyLine(line, i, lines);
            
            if (sectionType && sectionType !== 'content') {
                currentSection = sectionType;
                if (!sections[currentSection]) {
                    sections[currentSection] = [];
                }
            } else {
                if (!sections[currentSection]) {
                    sections[currentSection] = [];
                }
                sections[currentSection].push(line);
            }
        }
        
        return sections;
    }
 
    classifyLine(line, index, allLines) {
        if (!line || line.length === 0) return null;
        
        const trimmed = line.trim();
        
        // Check if it's a section header
        const sectionType = this.identifySectionType(trimmed);
        if (sectionType) return sectionType;
        
        // Check formatting clues for headers
        if (this.looksLikeHeader(trimmed, index)) {
            return this.identifySectionType(trimmed) || 'header';
        }
        
        return 'content';
    }

    looksLikeHeader(line, index) {
        if (!line || line.length > 60) return false;
        
        // Check various header indicators
        const isAllCaps = line === line.toUpperCase() && line.length > 2;
        const hasColonOrDash = /[:–—-]\s*$/.test(line);
        const isShortAndCentered = line.length < 30 && index < 20;
        const hasUnderline = line.includes('_') || line.includes('-');
        
        return isAllCaps || hasColonOrDash || isShortAndCentered || hasUnderline;
    }

    identifySectionType(line) {
        const text = line.toLowerCase().replace(/[^\w\s]/g, '').trim();
        
        for (const [sectionType, patterns] of Object.entries(this.sectionPatterns)) {
            if (patterns.some(pattern => pattern.test(text))) {
                return sectionType;
            }
        }
        
        return null;
    }

    extractContactInfo(text, lines) {
        const contact = {
            name: null,
            email: null,
            gender:null,
            phone: null,
            location: null,
            linkedin: null,
            github: null,
            websites: []
        };

        // Extract name first (highest priority)
        contact.name = this.extractName(lines);
        if (contact.name) {
            this.markAsExtracted(contact.name);
        }

        // Extract email (second priority)
        const emailMatches = text.match(this.patterns.email);
        if (emailMatches && emailMatches.length > 0) {
            contact.email = emailMatches[0];
            this.markAsExtracted(contact.email);
            // Mark the domain to prevent it from appearing in websites
            const domain = contact.email.split('@')[1];
            if (domain) {
                this.markAsExtracted(domain);
            }
        }

        // Extract phone (third priority)
        const phoneMatches = text.match(this.patterns.phone);
        if (phoneMatches && phoneMatches.length > 0) {
            contact.phone = this.normalizePhone(phoneMatches[0]);
            this.markAsExtracted(contact.phone);
            this.markAsExtracted(phoneMatches[0]); // Mark original format too
        }

        // Extract LinkedIn (fourth priority)
        const linkedinMatches = text.match(this.patterns.linkedin);
        if (linkedinMatches && linkedinMatches.length > 0) {
            contact.linkedin = 'https://' + linkedinMatches[0];
            this.markAsExtracted(linkedinMatches[0]);
        }

        // Extract GitHub (fifth priority)
        const githubMatches = text.match(this.patterns.github);
        if (githubMatches && githubMatches.length > 0) {
            contact.github = 'https://' + githubMatches[0];
            this.markAsExtracted(githubMatches[0]);
        }

        // Extract location (sixth priority) - ONLY from contact header area
        contact.location = this.extractContactLocation(lines);
        if (contact.location) {
            this.markAsExtracted(contact.location);
        }
        contact.gender = this.extractName(lines);
        if (contact.gender) {
            this.markAsExtracted(contact.gender);
        }

        // Extract other websites (lowest priority) - exclude already extracted domains
        const urlMatches = text.match(this.patterns.url) || [];
        for (const url of urlMatches) {
            if (!this.isAlreadyExtracted(url) && 
                !url.includes('linkedin.com') && 
                !url.includes('github.com')) {
                
                // Check if domain is already extracted (from email)
                const urlDomain = this.extractDomainFromUrl(url);
                if (!this.isAlreadyExtracted(urlDomain)) {
                    contact.websites.push(url);
                    this.markAsExtracted(url);
                }
            }
        }

        return contact;
    }

    extractContactLocation(lines) {
        // Only look for location in the first 10 lines (contact header area)
        const headerLines = lines.slice(0, 10);
        
        for (let i = 0; i < headerLines.length; i++) {
            const line = headerLines[i];
            
            // Skip if this line looks like a section header
            if (this.looksLikeHeader(line, i)) {
                continue;
            }
            
            // Skip if this line contains education keywords (avoid university locations)
            if (this.containsEducationKeywords(line)) {
                continue;
            }
            
            // Skip if this line contains experience keywords
            if (this.containsExperienceKeywords(line)) {
                continue;
            }
            
            // Look for location patterns in this line
            const locationMatches = line.match(this.patterns.location);
            if (locationMatches && locationMatches.length > 0) {
                for (const location of locationMatches) {
                    // Additional checks to ensure this is personal location, not institutional
                    if (!this.isAlreadyExtracted(location) && 
                        !this.containsInstitutionName(location) &&
                        !this.containsCompanyName(location)) {
                        return location;
                    }
                }
            }
            
            // Also check for simpler city, state patterns in contact area
            const simpleCityState = line.match(/\b[A-Z][a-z]+,?\s*[A-Z]{2}\b/g);
            if (simpleCityState && simpleCityState.length > 0) {
                for (const location of simpleCityState) {
                    if (!this.isAlreadyExtracted(location) && 
                        !this.containsInstitutionName(location) &&
                        !this.containsCompanyName(location)) {
                        return location;
                    }
                }
            }
        }
        
        return null;
    }

    containsEducationKeywords(line) {
        const educationKeywords = [
            'university', 'college', 'school', 'institute', 'academy', 'polytechnic',
            'bachelor', 'master', 'phd', 'degree', 'education', 'graduated'
        ];
        
        const lowerLine = line.toLowerCase();
        return educationKeywords.some(keyword => lowerLine.includes(keyword));
    }
 
    containsExperienceKeywords(line) {
        const experienceKeywords = [
            'experience', 'work', 'employment', 'career', 'professional',
            'company', 'corporation', 'inc', 'llc', 'ltd'
        ];
        
        const lowerLine = line.toLowerCase();
        return experienceKeywords.some(keyword => lowerLine.includes(keyword));
    }
 
    containsInstitutionName(location) {
        // Check if location contains common institution indicators
        const institutionIndicators = [
            'university', 'college', 'school', 'institute', 'academy',
            'tech', 'state', 'community'
        ];
        
        const lowerLocation = location.toLowerCase();
        return institutionIndicators.some(indicator => lowerLocation.includes(indicator));
    }
 
    containsCompanyName(location) {
        // Check if location contains common company indicators
        const companyIndicators = [
            'inc', 'corp', 'llc', 'ltd', 'company', 'technologies',
            'solutions', 'systems', 'services'
        ];
        
        const lowerLocation = location.toLowerCase();
        return companyIndicators.some(indicator => lowerLocation.includes(indicator));
    }
 
    extractDomainFromUrl(url) {
        try {
            const cleaned = url.replace(/^(https?:\/\/)?(www\.)?/, '');
            const domain = cleaned.split('/')[0];
            return domain;
        } catch (error) {
            return '';
        }
    }
 
    extractName(lines) {
        // Look for name in first 5 lines
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i];
            if (this.isLikelyName(line) && !this.isAlreadyExtracted(line)) {
                return line.trim();
            }
        }
        
        // Fallback to first line if no clear name found and not already extracted
        if (lines[0] && !this.isAlreadyExtracted(lines[0])) {
            return lines[0];
        }
        
        return null;
    }
 
    isLikelyName(line) {
        if (!line || line.length > 60 || line.length < 2) return false;
        
        const words = line.trim().split(/\s+/);
        if (words.length < 1 || words.length > 4) return false;
        
        // Check for common non-name patterns
        const excludePatterns = [
            /resume|cv|curriculum/i,
            /phone|email|address/i,
            /objective|summary/i,
            /@|\.com|\.org/,
            /\d{3}[-.\s]\d{3}/,
            /experience|education|skills/i
        ];
        
        if (excludePatterns.some(pattern => pattern.test(line))) return false;
        
        // Should be mostly letters with proper capitalization
        const isValidFormat = /^[A-Z][a-z]+(?:\s+[A-Z][a-z]*)*[.]?$/.test(line.trim());
        
        return isValidFormat;
    }
 
    normalizePhone(phone) {
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 10) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else if (digits.length === 11 && digits.startsWith('1')) {
            return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        }
        return phone;
    }
 
    extractSummary(sections) {
        const summaryContent = sections.summary || sections.objective || sections.profile || [];
        return summaryContent.join(' ').trim();
    }
 
    extractExperience(sections) {
        const experienceLines = sections.experience || sections.work || [];
        if (experienceLines.length === 0) return [];

        const experiences = [];
        let currentExperience = null;

        for (const line of experienceLines) {
            if (this.isExperienceHeader(line)) {
                if (currentExperience) {
                    experiences.push(this.finalizeExperience(currentExperience));
                }
                currentExperience = this.parseExperienceHeader(line);
            }
            // Skip processing bullets and descriptions - we only want header info
        }

        if (currentExperience) {
            experiences.push(this.finalizeExperience(currentExperience));
        }

        // Mark experience data as extracted to prevent duplication
        experiences.forEach(exp => {
            this.markAsExtracted(exp.title);
            this.markAsExtracted(exp.company);
            this.markAsExtracted(exp.location);
        });

        return experiences;
    }
 
    cleanTitleFromDateFragments(title) {
        if (!title) return title;
        
        return title
            // Remove common date fragments that might be left over
            .replace(/\b(starting|expected|beginning)\b/gi, '')
            .replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}?\b/gi, '')
            .replace(/\b(19|20)\d{2}\b/g, '')
            .replace(/\b(present|current)\b/gi, '')
            // Remove trailing/leading dashes and clean up
            .replace(/[-–—]+\s*$/g, '')
            .replace(/^\s*[-–—]+/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
 
    isExperienceHeader(line) {
        const hasJobTitle = this.keywords.jobTitles.some(title => 
            line.toLowerCase().includes(title.toLowerCase())
        );
        
        // Check for any of the date patterns
        const hasDatePattern = this.patterns.dates.yearRange.test(line) || 
                              this.patterns.dates.monthYearRange.test(line) ||
                              this.patterns.dates.monthYear.test(line) ||
                              this.patterns.dates.startingExpected.test(line) ||
                              this.patterns.dates.fullDate.test(line) ||
                              this.patterns.dates.monthRangeWithYear.test(line);
        
        const hasDelimiters = /[|–—]/.test(line);
        
        const hasCompanyIndicators = this.keywords.companies.some(company => 
            line.toLowerCase().includes(company.toLowerCase())
        );

        // Also check for "at Company" pattern which is common
        const hasAtPattern = /\s+at\s+\w/i.test(line);

        return (hasJobTitle || hasCompanyIndicators || hasAtPattern) && (hasDatePattern || hasDelimiters);
    }
 
    parseExperienceHeader(line) {
        const experience = {
            title: '',
            company: '',
            location: '',
            duration: ''
        };

        let cleanedLine = line;
        
        // Extract dates using multiple patterns (in priority order)
        const datePatterns = [
            this.patterns.dates.monthRangeWithYear,
            this.patterns.dates.monthYearRange,
            this.patterns.dates.yearRange,
            this.patterns.dates.startingExpected,
            this.patterns.dates.fullDate,
            this.patterns.dates.monthYear
        ];
        
        for (const pattern of datePatterns) {
            const dateMatch = cleanedLine.match(pattern);
            if (dateMatch && dateMatch.length > 0) {
                experience.duration = dateMatch[0];
                cleanedLine = cleanedLine.replace(dateMatch[0], '').trim();
                break;
            }
        }
        
        // Clean up remaining fragments after date removal
        cleanedLine = cleanedLine
            .replace(/\b(starting|expected|beginning)\b/gi, '') // Remove orphaned starting words
            .replace(/[-–—]+\s*$/, '') // Remove trailing dashes
            .replace(/^\s*[-–—]+/, '') // Remove leading dashes
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();

        // Split by common delimiters
        const parts = cleanedLine.split(/[|–—]/).map(p => p.trim()).filter(p => p.length > 0);

        // Parse parts intelligently
        if (parts.length === 1) {
            // Single part - likely just title or title with embedded info
            const singlePart = parts[0];
            
            // Check if it looks like "Title at Company" format
            const atMatch = singlePart.match(/^(.+?)\s+at\s+(.+)$/i);
            if (atMatch) {
                experience.title = atMatch[1].trim();
                experience.company = atMatch[2].trim();
            } else {
                // Assume it's the title
                experience.title = singlePart;
            }
        } else if (parts.length >= 2) {
            // Multiple parts - parse in order of likelihood
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                
                if (!this.isAlreadyExtracted(part)) {
                    if (!experience.title && this.looksLikeJobTitle(part)) {
                        experience.title = part;
                    } else if (!experience.company && this.looksLikeCompany(part)) {
                        experience.company = part;
                    } else if (!experience.location && this.looksLikeLocation(part)) {
                        experience.location = part;
                    } else if (!experience.title) {
                        // First unassigned part becomes title
                        experience.title = part;
                    } else if (!experience.company) {
                        // Second unassigned part becomes company
                        experience.company = part;
                    } else if (!experience.location) {
                        // Third unassigned part becomes location
                        experience.location = part;
                    }
                }
            }
        }

        // Fallback: if we still don't have title, use the first part
        if (!experience.title && parts.length > 0) {
            experience.title = parts[0];
        }

        // Clean up titles that might still have date fragments
        if (experience.title) {
            experience.title = this.cleanTitleFromDateFragments(experience.title);
        }

        return experience;
    }
 
    looksLikeJobTitle(text) {
        return this.keywords.jobTitles.some(title => 
            text.toLowerCase().includes(title.toLowerCase())
        );
    }
 
    looksLikeCompany(text) {
        return this.keywords.companies.some(company => 
            text.toLowerCase().includes(company.toLowerCase())
        ) || /\b(inc|corp|llc|ltd|co)\b/i.test(text);
    }
 
    looksLikeLocation(text) {
        return this.patterns.location.test(text) && text.length < 50;
    }
 
    finalizeExperience(experience) {
        return experience;
    }
 
    cleanInstitutionFromDateFragments(institution) {
        if (!institution) return institution;
        
        return institution
            // Remove common date fragments that might be left over
            .replace(/\b(expected|graduating|graduation|class of)\b/gi, '')
            .replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}?\b/gi, '')
            .replace(/\b(19|20)\d{2}\b/g, '')
            // Remove trailing/leading dashes and clean up
            .replace(/[-–—]+\s*$/g, '')
            .replace(/^\s*[-–—]+/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
 
    extractYearFromDate(dateString) {
        // Extract the most recent/relevant year from date string
        const years = dateString.match(/\b(19|20)\d{2}\b/g);
        if (years && years.length > 0) {
            // Return the last year found (usually graduation year)
            return years[years.length - 1];
        }
        return '';
    }
 
    extractEducation(sections) {
        const educationLines = sections.education || [];
        if (educationLines.length === 0) return [];

        const educationEntries = [];
        let currentEducation = null;

        for (const line of educationLines) {
            if (this.isEducationHeader(line)) {
                if (currentEducation) {
                    educationEntries.push(this.finalizeEducation(currentEducation));
                }
                currentEducation = this.parseEducationHeader(line);
            } else if (currentEducation && line.trim()) {
                // Check for GPA first
                const gpaMatch = line.match(this.patterns.gpa);
                if (gpaMatch && !currentEducation.gpa) {
                    currentEducation.gpa = gpaMatch[1];
                    // Don't add GPA line to details if we extracted it
                    continue;
                }
                
                // Check if this line looks like a degree (and we don't have one yet)
                if (!currentEducation.degree && this.looksLikeDegree(line)) {
                    currentEducation.degree = line.trim();
                } else if (line.trim()) {
                    // Add other content to details
                    currentEducation.details.push(line.trim());
                }
            }
        }

        if (currentEducation) {
            educationEntries.push(this.finalizeEducation(currentEducation));
        }

        // Mark education data as extracted
        educationEntries.forEach(edu => {
            this.markAsExtracted(edu.institution);
            this.markAsExtracted(edu.degree);
            this.markAsExtracted(edu.location);
        });

        return educationEntries;
    }
 
    finalizeEducation(education) {
        return {
            ...education,
            details: education.details.join(' ').trim()
        };
    }
 
    looksLikeDegree(line) {
        const degreePatterns = [
            /\b(?:bachelor|master|phd|doctorate|associate|diploma)\b/i,
            /\b(?:b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|ph\.?d\.?|b\.?sc\.?|m\.?sc\.?)\b/i,
            /\b(?:degree|major|minor)\b/i
        ];
        
        const courseworkPatterns = [
            /\b(?:relevant\s+coursework|coursework)\b/i,
            /\b(?:courses|classes)\b/i
        ];
        
        // Must match degree patterns and not match coursework patterns
        const matchesDegree = degreePatterns.some(pattern => pattern.test(line));
        const isCoursework = courseworkPatterns.some(pattern => pattern.test(line));
        
        return matchesDegree && !isCoursework;
    }
 
    isEducationHeader(line) {
        const hasDegree = this.keywords.degrees.some(degree => 
            line.toLowerCase().includes(degree.toLowerCase())
        );
        
        const hasInstitution = this.keywords.institutions.some(inst => 
            line.toLowerCase().includes(inst.toLowerCase())
        );
        
        // Check for any of the date patterns
        const hasDate = this.patterns.dates.yearRange.test(line) ||
                       this.patterns.dates.monthYearRange.test(line) ||
                       this.patterns.dates.monthYear.test(line) ||
                       this.patterns.dates.startingExpected.test(line) ||
                       this.patterns.dates.year.test(line);

        return (hasDegree || hasInstitution) && hasDate;
    }
 
    parseEducationHeader(line) {
        const education = {
            degree: '',
            institution: '',
            location: '',
            year: '',
            gpa: '',
            details: []
        };

        let cleanedLine = line;
        
        // Extract dates using multiple patterns (in priority order)
        const datePatterns = [
            this.patterns.dates.monthRangeWithYear,
            this.patterns.dates.monthYearRange,
            this.patterns.dates.yearRange,
            this.patterns.dates.startingExpected,
            this.patterns.dates.fullDate,
            this.patterns.dates.monthYear,
            this.patterns.dates.year
        ];
        
        for (const pattern of datePatterns) {
            const dateMatch = cleanedLine.match(pattern);
            if (dateMatch && dateMatch.length > 0) {
                education.year = this.extractYearFromDate(dateMatch[0]);
                cleanedLine = cleanedLine.replace(dateMatch[0], '').trim();
                break;
            }
        }
        
        // Clean up remaining fragments after date removal
        cleanedLine = cleanedLine
            .replace(/\b(expected|graduating|graduation)\b/gi, '') // Remove orphaned expected words
            .replace(/[-–—]+\s*$/, '') // Remove trailing dashes
            .replace(/^\s*[-–—]+/, '') // Remove leading dashes
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();

        // Split by common delimiters
        const parts = cleanedLine.split(/[|–—]/).map(p => p.trim()).filter(p => p.length > 0);

        // Parse parts intelligently
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            if (!this.isAlreadyExtracted(part)) {
                if (!education.institution && this.containsInstitution(part)) {
                    education.institution = this.cleanInstitutionFromDateFragments(part);
                } else if (!education.degree && this.containsDegree(part)) {
                    education.degree = part;
                } else if (!education.location && this.looksLikeLocation(part)) {
                    education.location = part;
                } else if (!education.institution) {
                    // First unassigned part likely institution
                    education.institution = this.cleanInstitutionFromDateFragments(part);
                } else if (!education.degree) {
                    // Second unassigned part likely degree
                    education.degree = part;
                } else if (!education.location) {
                    // Third unassigned part likely location
                    education.location = part;
                }
            }
        }

        // Fallback: if we still don't have institution, use the first part
        if (!education.institution && parts.length > 0) {
            education.institution = this.cleanInstitutionFromDateFragments(parts[0]);
        }

        return education;
    }
 
    containsDegree(text) {
        return this.keywords.degrees.some(degree => 
            text.toLowerCase().includes(degree.toLowerCase())
        );
    }
 
    containsInstitution(text) {
        return this.keywords.institutions.some(inst => 
            text.toLowerCase().includes(inst.toLowerCase())
        );
    }
 
    extractSkills(sections, text) {
        const skillsLines = sections.skills || sections.technical || sections.competencies || [];
        const skills = new Set();

        // Extract from skills section
        if (skillsLines.length > 0) {
            const skillsText = skillsLines.join('\n');
            this.parseSkillsFromText(skillsText, skills);
        }

        // Extract from entire document using keyword matching
        this.extractContextualSkills(text, skills);

        // Convert to array and handle case-insensitive duplicates
        const skillsArray = this.deduplicateSkills(Array.from(skills))
            .filter(skill => this.isValidSkill(skill));
        
        // Mark skills as extracted to prevent duplication
        skillsArray.forEach(skill => this.markAsExtracted(skill));
        
        return skillsArray;
    }
 
    parseSkillsFromText(text, skills) {
        // Handle the specific format: "Programming/Scripting Languages: (Proficient) Java; (Familiar) Python, C, SQL"
        
        // Split by category lines (lines ending with colon)
        const lines = text.split('\n');
        
        for (const line of lines) {
            if (line.includes(':')) {
                const [category, skillsText] = line.split(':', 2);
                if (skillsText) {
                    this.extractSkillsFromCategorizedText(skillsText.trim(), skills);
                }
            } else {
                // Handle non-categorized skills
                this.extractSkillsFromCategorizedText(line, skills);
            }
        }
    }
 
    extractSkillsFromCategorizedText(text, skills) {
        // Remove proficiency indicators like "(Proficient)", "(Familiar)"
        let cleanText = text.replace(/\([^)]*\)/g, '');
        
        // Split by semicolons first, then commas
        const groups = cleanText.split(';');
        
        for (const group of groups) {
            const items = group.split(',').map(item => item.trim());
            
            for (const item of items) {
                const cleanItem = item.replace(/^\W+|\W+$/g, '').trim();
                
                if (this.isValidSkill(cleanItem) && !this.isAlreadyExtracted(cleanItem)) {
                    skills.add(cleanItem);
                }
            }
        }
    }
 
    isCategoryHeader(text) {
        if (!text || text.length === 0) return true;
        
        const categoryPatterns = [
            // Common category headers
            /^(programming\s+)?languages?$/i,
            /^technical\s+skills?$/i,
            /^tools?$/i,
            /^frameworks?$/i,
            /^databases?$/i,
            /^libraries?$/i,
            /^technologies?$/i,
            /^methodologies?$/i,
            /^software$/i,
            /^platforms?$/i,
            /^operating\s+systems?$/i,
            /^core\s+competencies?$/i,
            /^expertise$/i,
            /^proficiencies?$/i,
            /^skills?$/i,
            /^competencies$/i,
            
            // Patterns that include category names with skills
            /^programming\s+languages?\s*:?\s+/i,
            /^technical\s+skills?\s*:?\s+/i,
            /^tools?\s*:?\s+/i,
            /^frameworks?\s*:?\s+/i,
            
            // Any text ending with a colon (likely a category)
            /:\s*$/,
            
            // Very short words that are likely not skills
            /^(and|or|with|in|of|the|a|an)$/i
        ];
        
        return categoryPatterns.some(pattern => pattern.test(text));
    }
 
    extractContextualSkills(text, skills) {
        // Look for skills mentioned in context, but be more selective
        const allSkills = Object.values(this.keywords.skills).flat();
        
        for (const skill of allSkills) {
            // Create a more precise regex that looks for skill as a complete word
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            const matches = text.match(regex);
            
            if (matches && !this.isAlreadyExtracted(skill)) {
                // Additional validation: make sure it's not part of a category header
                let isValid = true;
                
                // Check each match to see if it's in a category header context
                for (const match of matches) {
                    const matchIndex = text.indexOf(match);
                    const contextBefore = text.substring(Math.max(0, matchIndex - 30), matchIndex);
                    const contextAfter = text.substring(matchIndex, Math.min(text.length, matchIndex + match.length + 10));
                    
                    // Skip if this appears to be in a category header
                    if (/(?:programming\s+languages?|technical\s+skills?|tools?|frameworks?)\s*:?\s*$/i.test(contextBefore) ||
                        /^\s*:/.test(contextAfter)) {
                        isValid = false;
                        break;
                    }
                }
                
                if (isValid) {
                    skills.add(this.formatSkill(skill));
                }
            }
        }
    }
 
    deduplicateSkills(skills) {
        const uniqueSkills = [];
        const seenSkills = new Map(); // Store lowercase -> preferred case mapping
        
        for (const skill of skills) {
            const lowerSkill = skill.toLowerCase();
            
            if (!seenSkills.has(lowerSkill)) {
                // First time seeing this skill
                seenSkills.set(lowerSkill, skill);
                uniqueSkills.push(skill);
            } else {
                // We've seen this skill before, check which version to keep
                const existingSkill = seenSkills.get(lowerSkill);
                const existingIndex = uniqueSkills.indexOf(existingSkill);
                
                // Prefer properly capitalized version (starts with uppercase)
                if (/^[A-Z]/.test(skill) && !/^[A-Z]/.test(existingSkill)) {
                    seenSkills.set(lowerSkill, skill);
                    uniqueSkills[existingIndex] = skill;
                }
                // If both are capitalized or both lowercase, keep the first one
            }
        }
        
        return uniqueSkills;
    }
 
    isValidSkill(skill) {
        if (!skill || skill.length < 2 || skill.length > 30) return false; // Reduced max length
        
        // Enhanced blacklist
        const blacklist = [
            // Common non-skill words
            'skills', 'technical', 'programming', 'languages', 'technologies',
            'tools', 'software', 'experience', 'knowledge', 'proficient',
            'and', 'or', 'with', 'in', 'of', 'the', 'a', 'an',
            
            // Section headers and categories that shouldn't be skills
            'programming languages', 'tools', 'framework', 'frameworks', 
            'libraries', 'library', 'technologies', 'competencies',
            'technical skills', 'core competencies', 'expertise',
            'proficiencies', 'methodologies', 'databases', 'database',
            'platforms', 'platform', 'software', 'operating systems',
            
            // Category headers with colons
            'programming languages:', 'technical skills:', 'tools:', 'frameworks:',
            'databases:', 'libraries:', 'technologies:', 'methodologies:',
            'software:', 'platforms:', 'expertise:', 'proficiencies:',
            'core competencies:', 'competencies:', 'skills:',
            
            // Common filler words
            'used', 'utilizing', 'working', 'familiar', 'competent',
            'advanced', 'beginner', 'intermediate', 'expert',
            
            // Empty or whitespace-only
            '', ' ', '  ', '   '
        ];
        
        const lowerSkill = skill.toLowerCase().trim();
        
        // Check against blacklist (exact match and contains)
        if (blacklist.includes(lowerSkill)) return false;
        
        // Check if it's a category header
        if (this.isCategoryHeader(skill)) return false;
        
        // Reject skills that contain multiple category words (like "Technologies/Frameworks")
        const categoryWords = ['technologies', 'frameworks', 'tools', 'languages', 'databases', 'libraries', 'platforms', 'methodologies'];
        const categoryCount = categoryWords.filter(word => lowerSkill.includes(word)).length;
        if (categoryCount > 1) return false;
        
        // Reject strings that look like paths or have multiple slashes
        if ((skill.match(/\//g) || []).length > 1) return false;
        
        // Reject strings with too many words (likely category headers or descriptions)
        const wordCount = skill.split(/\s+/).length;
        if (wordCount > 4) return false;
        
        // Don't allow just numbers
        if (/^\d+$/.test(skill)) return false;
        
        // Don't allow skills that are just punctuation
        if (/^[^\w\s]+$/.test(skill)) return false;
        
        // Must contain some alphanumeric characters
        if (!/[a-zA-Z0-9]/.test(skill)) return false;
        
        // Don't allow skills that are just single characters
        if (skill.length === 1) return false;
        
        // Don't allow skills that end with colons (category headers)
        if (skill.endsWith(':')) return false;
        
        // Don't allow skills that are just common words
        const commonWords = ['the', 'and', 'or', 'but', 'for', 'with', 'from', 'to', 'at', 'by'];
        if (commonWords.includes(lowerSkill)) return false;
        
        // Reject strings that contain multiple technologies smashed together
        if (/\w+\s+\w+\s+\w+\/\w+/.test(skill)) return false;
        
        return true;
    }
 
    formatSkill(skill) {
        const specialCases = {
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'nodejs': 'Node.js',
            'reactjs': 'React.js',
            'css': 'CSS',
            'html': 'HTML',
            'sql': 'SQL',
            'aws': 'AWS',
            'gcp': 'GCP'
        };
        
        return specialCases[skill.toLowerCase()] || skill;
    }
 
    extractCertifications(sections) {
        const certLines = sections.certifications || sections.certificates || sections.licenses || [];
        const certifications = certLines.map(line => {
            const cleanLine = line.replace(this.patterns.bullets, '').trim();
            if (cleanLine && !this.isAlreadyExtracted(cleanLine)) {
                this.markAsExtracted(cleanLine);
                return {
                    name: cleanLine,
                    issuer: '',
                    date: this.extractDateFromLine(line)
                };
            }
            return null;
        }).filter(cert => cert !== null);

        return certifications;
    }
 
    extractAchievements(sections) {
        const achievementLines = sections.achievements || sections.awards || sections.honors || [];
        const achievements = achievementLines.map(line => {
            const cleanLine = line.replace(this.patterns.bullets, '').trim();
            if (cleanLine && !this.isAlreadyExtracted(cleanLine)) {
                this.markAsExtracted(cleanLine);
                return {
                    title: cleanLine,
                    date: this.extractDateFromLine(line),
                    description: ''
                };
            }
            return null;
        }).filter(achievement => achievement !== null);

        return achievements;
    }
 
    extractLanguages(sections) {
        const languageLines = sections.languages || [];
        const languages = languageLines.map(line => {
            const cleanLine = line.replace(this.patterns.bullets, '').trim();
            if (cleanLine && !this.isAlreadyExtracted(cleanLine)) {
                const parts = cleanLine.split(/[,-]/).map(p => p.trim());
                
                this.markAsExtracted(cleanLine);
                return {
                    language: parts[0] || cleanLine,
                    proficiency: parts[1] || ''
                };
            }
            return null;
        }).filter(lang => lang !== null);

        return languages;
    }
 
    extractDateFromLine(line) {
        // Try different date patterns in order of preference
        const datePatterns = [
            this.patterns.dates.monthRangeWithYear,
            this.patterns.dates.monthYearRange,
            this.patterns.dates.yearRange,
            this.patterns.dates.startingExpected,
            this.patterns.dates.fullDate,
            this.patterns.dates.monthYear,
            this.patterns.dates.year
        ];
        
        for (const pattern of datePatterns) {
            const dateMatch = line.match(pattern);
            if (dateMatch && dateMatch.length > 0) {
                return dateMatch[0];
            }
        }
        
        return '';
    }
 
    cleanupOverlaps(resumeData) {
        // Additional cleanup to remove any remaining overlaps
        
        // Remove websites that are substrings of other contact info
        if (resumeData.contact.websites) {
            resumeData.contact.websites = resumeData.contact.websites.filter(website => {
                return !resumeData.contact.email || !resumeData.contact.email.includes(website);
            });
        }
        
        // Remove any duplicate skills (final cleanup)
        if (resumeData.skills && Array.isArray(resumeData.skills)) {
            resumeData.skills = this.deduplicateSkills(resumeData.skills);
        }
    }
 
    calculateConfidence(resumeData) {
        let score = 0;
        
        // Contact information (40 points)
        if (resumeData.contact.name) score += 15;
        if (resumeData.contact.email) score += 15;
        if (resumeData.contact.phone) score += 10;
        
        // Core sections (55 points)
        if (resumeData.experience.length > 0) score += 30;
        if (resumeData.education.length > 0) score += 15;
        if (resumeData.skills.length > 0) score += 10;
        
        // Additional content (5 points)
        if (resumeData.summary) score += 5;
        
        return Math.min(100, score);
    }
}

// Export for browser use
window.BrowserResumeParser = BrowserResumeParser;