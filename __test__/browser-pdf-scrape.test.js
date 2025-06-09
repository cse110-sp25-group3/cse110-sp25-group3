// BrowserResumeParser.test.js

// Mock browser environment
global.window = {};

// Mock PDF.js for testing with more complete mock
global.pdfjsLib = {
    getDocument: jest.fn().mockImplementation(() => ({
        promise: Promise.resolve({
            numPages: 1,
            getPage: jest.fn().mockResolvedValue({
                getTextContent: jest.fn().mockResolvedValue({
                    items: [
                        { str: 'Test', transform: [1, 0, 0, 1, 0, 100], width: 20 }
                    ]
                })
            })
        })
    }))
};

// Import the file - this will set window.BrowserResumeParser
require('../source/functions/browser-pdf-scrape');

// Get the class from window
const BrowserResumeParser = global.window.BrowserResumeParser;

describe('BrowserResumeParser', () => {
    let parser;

    beforeEach(() => {
        parser = new BrowserResumeParser();
        jest.clearAllMocks();
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with all required patterns and keywords', () => {
            const actual = {
                patterns: parser.patterns,
                keywords: parser.keywords,
                sectionPatterns: parser.sectionPatterns,
                extractedDataType: parser.extractedData.constructor.name
            };
            
            const expected = {
                patterns: expect.any(Object),
                keywords: expect.any(Object),
                sectionPatterns: expect.any(Object),
                extractedDataType: 'Set'
            };
            
            expect(actual).toEqual(expected);
        });

        test('should have phone pattern that matches valid phone numbers', () => {
            const testPhones = [
                '(555) 123-4567',
                '555-123-4567',
                '+1 555 123 4567',
                '5551234567'
            ];
            
            testPhones.forEach(phone => {
                parser.patterns.phone.lastIndex = 0; // Reset regex state
                const actual = parser.patterns.phone.test(phone);
                const expected = true;
                expect(actual).toBe(expected);
            });
        });
    });

    describe('Text Preprocessing', () => {
        test('should fix broken words across lines', () => {
            const input = 'develop-\nment experience';
            const actual = parser.preprocessText(input);
            const expected = 'development experience';
            expect(actual).toBe(expected);
        });

        test('should fix broken emails', () => {
            const input = 'email@domain\n.com';
            const actual = parser.preprocessText(input);
            const expected = 'email@domain.com';
            expect(actual).toBe(expected);
        });

        test('should handle empty or null input', () => {
            const testCases = [
                { input: '', expected: '' },
                { input: null, expected: '' },
                { input: undefined, expected: '' }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.preprocessText(input);
                expect(actual).toBe(expected);
            });
        });
    });

    describe('Line Classification', () => {
        test('should identify section headers correctly', () => {
            const testCases = [
                { line: 'WORK EXPERIENCE', expected: 'experience' },
                { line: 'Education', expected: 'education' },
                { line: 'Technical Skills', expected: 'skills' },
                { line: 'CERTIFICATIONS', expected: 'certifications' },
                { line: 'Contact Information', expected: 'contact' }
            ];

            testCases.forEach(({ line, expected }) => {
                const actual = parser.identifySectionType(line);
                expect(actual).toBe(expected);
            });
        });

        test('should identify headers by formatting', () => {
            const testCases = [
                { line: 'EXPERIENCE', index: 5, expected: true },
                { line: 'Skills:', index: 3, expected: true },
                { line: 'This is a very long line that should not be considered a header because it exceeds the character limit', index: 2, expected: false }
            ];

            testCases.forEach(({ line, index, expected }) => {
                const actual = parser.looksLikeHeader(line, index);
                expect(actual).toBe(expected);
            });
        });
    });

    describe('Contact Information Extraction', () => {
        test('should extract email from text', () => {
            const text = 'John Doe\njohn.doe@example.com\n(555) 123-4567';
            const lines = parser.splitIntoLines(text);
            const contact = parser.extractContactInfo(text, lines);
            
            const actual = contact.email;
            const expected = 'john.doe@example.com';
            expect(actual).toBe(expected);
        });

        test('should extract and normalize phone number', () => {
            const text = 'Contact: 5551234567';
            const lines = parser.splitIntoLines(text);
            const contact = parser.extractContactInfo(text, lines);
            
            const actual = contact.phone;
            const expected = '(555) 123-4567';
            expect(actual).toBe(expected);
        });

        test('should extract LinkedIn profile', () => {
            const text = 'linkedin.com/in/johndoe';
            const lines = parser.splitIntoLines(text);
            const contact = parser.extractContactInfo(text, lines);
            
            const actual = contact.linkedin;
            const expected = 'https://linkedin.com/in/johndoe';
            expect(actual).toBe(expected);
        });

        test('should extract GitHub profile', () => {
            const text = 'github.com/johndoe';
            const lines = parser.splitIntoLines(text);
            const contact = parser.extractContactInfo(text, lines);
            
            const actual = contact.github;
            const expected = 'https://github.com/johndoe';
            expect(actual).toBe(expected);
        });
    });

    describe('Name Extraction', () => {
        test('should reject non-name patterns', () => {
            const testCases = [
                { input: 'john.doe@email.com', expected: false },
                { input: '555-123-4567', expected: false },
                { input: 'WORK EXPERIENCE', expected: false },
                { input: '', expected: false }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.isLikelyName(input);
                expect(actual).toBe(expected);
            });
        });
    });

    describe('Phone Number Normalization', () => {
        test('should normalize 10-digit phone numbers', () => {
            const testCases = [
                { input: '5551234567', expected: '(555) 123-4567' },
                { input: '555.123.4567', expected: '(555) 123-4567' },
                { input: '555-123-4567', expected: '(555) 123-4567' }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.normalizePhone(input);
                expect(actual).toBe(expected);
            });
        });

        test('should normalize 11-digit phone numbers with country code', () => {
            const testCases = [
                { input: '15551234567', expected: '+1 (555) 123-4567' },
                { input: '+1 555 123 4567', expected: '+1 (555) 123-4567' }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.normalizePhone(input);
                expect(actual).toBe(expected);
            });
        });

        test('should return original format for invalid phone numbers', () => {
            const testCases = [
                { input: '123', expected: '123' },
                { input: 'invalid', expected: 'invalid' }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.normalizePhone(input);
                expect(actual).toBe(expected);
            });
        });
    });

    describe('Experience Extraction', () => {
        test('should parse experience header components', () => {
            const line = 'Senior Software Engineer | Google Inc | Mountain View, CA | 2020-2023';
            const experience = parser.parseExperienceHeader(line);
            
            const actual = {
                titleContainsEngineer: experience.title.includes('Engineer'),
                companyContainsGoogle: experience.company.includes('Google'),
                duration: experience.duration
            };
            
            const expected = {
                titleContainsEngineer: true,
                companyContainsGoogle: true,
                duration: '2020-2023'
            };
            expect(actual).toEqual(expected);
        });

        test('should handle "at Company" format', () => {
            const line = 'Software Engineer at Microsoft | 2021-Present';
            const experience = parser.parseExperienceHeader(line);
            
            const actual = {
                title: experience.title,
                company: experience.company,
                duration: experience.duration
            };
            
            const expected = {
                title: 'Software Engineer',
                company: 'Microsoft',
                duration: '2021-Present'
            };
            
            expect(actual).toEqual(expected);
        });

        test('should clean title from date fragments', () => {
            const input = 'Software Engineer starting Jan 2023';
            const actual = parser.cleanTitleFromDateFragments(input);
            const expected = 'Software Engineer';
            expect(actual).toBe(expected);
        });
    });

    describe('Education Extraction', () => {
        test('should identify education headers', () => {
            const testCases = [
                'Bachelor of Science in Computer Science | MIT | 2016-2020',
                'Master of Business Administration | Harvard University | 2020-2022',
                'Ph.D. in Engineering | Stanford | Expected 2025'
            ];

            testCases.forEach(line => {
                const actual = parser.isEducationHeader(line);
                const expected = true;
                expect(actual).toBe(expected);
            });
        });

        test('should parse education header components', () => {
            const line = 'Bachelor of Science | University of California | Berkeley, CA | 2016-2020';
            const education = parser.parseEducationHeader(line);
            
            const actual = {
                degreeContainsBachelor: education.degree.includes('Bachelor'),
                institutionContainsUniversity: education.institution.includes('University'),
                year: education.year
            };
            
            const expected = {
                degreeContainsBachelor: true,
                institutionContainsUniversity: true,
                year: '2020'
            };
            
            expect(actual).toEqual(expected);
        });

        test('should extract year from date string', () => {
            const testCases = [
                { input: '2020-2024', expected: '2024' },
                { input: 'Jan 2020 - Dec 2024', expected: '2024' },
                { input: 'Expected 2025', expected: '2025' }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.extractYearFromDate(input);
                expect(actual).toBe(expected);
            });
        });

        test('should identify degree patterns', () => {
            const testCases = [
                { input: 'Bachelor of Science in Computer Science', expected: true },
                { input: 'M.S. in Data Science', expected: true },
                { input: 'Relevant Coursework: Algorithm Design', expected: false }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.looksLikeDegree(input);
                expect(actual).toBe(expected);
            });
        });
    });

    describe('Skills Extraction', () => {
        test('should validate skills correctly', () => {
            const testCases = [
                { input: 'JavaScript', expected: true },
                { input: 'Python', expected: true },
                { input: 'React.js', expected: true }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.isValidSkill(input);
                expect(actual).toBe(expected);
            });
        });

        test('should reject invalid skills', () => {
            const testCases = [
                { input: 'skills', expected: false },
                { input: 'Technical Skills:', expected: false },
                { input: '', expected: false },
                { input: 'a', expected: false },
                { input: 'This is way too long to be a valid skill name', expected: false }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.isValidSkill(input);
                expect(actual).toBe(expected);
            });
        });

        test('should format skills with special cases', () => {
            const testCases = [
                { input: 'javascript', expected: 'JavaScript' },
                { input: 'nodejs', expected: 'Node.js' },
                { input: 'css', expected: 'CSS' },
                { input: 'python', expected: 'python' } // No special case
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.formatSkill(input);
                expect(actual).toBe(expected);
            });
        });

        test('should deduplicate skills case-insensitively', () => {
            const skills = ['JavaScript', 'javascript', 'Python', 'PYTHON', 'React'];
            const actual = parser.deduplicateSkills(skills);
            
            const expectedLength = 3;
            const expectedToContain = ['JavaScript', 'Python', 'React']; // Prefers capitalized
            
            expect(actual.length).toBe(expectedLength);
            expectedToContain.forEach(skill => {
                expect(actual).toContain(skill);
            });
        });

        test('should identify category headers', () => {
            const testCases = [
                { input: 'Programming Languages:', expected: true },
                { input: 'Technical Skills', expected: true },
                { input: 'JavaScript', expected: false }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.isCategoryHeader(input);
                expect(actual).toBe(expected);
            });
        });
    });

    describe('Date Extraction', () => {
        test('should extract dates from lines', () => {
            const testCases = [
                { line: 'Software Engineer | 2020-2023', expected: '2020-2023' },
                { line: 'Started Jan 2021 - Present', expected: 'Jan 2021 - Present' },
                { line: 'Bachelor Degree | 2016-2020', expected: '2016-2020' },
                { line: 'Expected March 2025', expected: 'Expected March 2025' }
            ];

            testCases.forEach(({ line, expected }) => {
                const actual = parser.extractDateFromLine(line);
                expect(actual).toBe(expected);
            });
        });
    });

    describe('Location Extraction', () => {
        test('should detect education keywords in lines', () => {
            const testCases = [
                { input: 'Stanford University', expected: true },
                { input: 'Bachelor of Science', expected: true },
                { input: 'Software Engineer', expected: false }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.containsEducationKeywords(input);
                expect(actual).toBe(expected);
            });
        });

        test('should detect experience keywords in lines', () => {
            const testCases = [
                { input: 'Work Experience', expected: true },
                { input: 'Google Inc.', expected: true },
                { input: 'Education', expected: false }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.containsExperienceKeywords(input);
                expect(actual).toBe(expected);
            });
        });
    });

    describe('Extracted Data Tracking', () => {
        test('should track extracted data to prevent duplicates', () => {
            parser.markAsExtracted('john.doe@example.com');
            
            const actualUpperCase = parser.isAlreadyExtracted('JOHN.DOE@EXAMPLE.COM');
            const actualOriginal = parser.isAlreadyExtracted('john.doe@example.com');
            const expected = true;
            
            expect(actualOriginal).toBe(expected);
            expect(actualUpperCase).toBe(expected);
        });

        test('should handle null/undefined data gracefully', () => {
            parser.markAsExtracted(null);
            parser.markAsExtracted(undefined);
            parser.markAsExtracted('');
            
            const actualNull = parser.isAlreadyExtracted(null);
            const actualUndefined = parser.isAlreadyExtracted(undefined);
            const expected = false;
            
            expect(actualNull).toBe(expected);
            expect(actualUndefined).toBe(expected);
        });
    });

    describe('Confidence Calculation', () => {
        test('should calculate confidence score based on extracted data', () => {
            const resumeData = {
                contact: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '555-1234'
                },
                experience: [{ title: 'Engineer', company: 'Tech Corp' }],
                education: [{ degree: 'BS', institution: 'University' }],
                skills: ['JavaScript', 'Python'],
                summary: 'Experienced developer'
            };

            const actual = parser.calculateConfidence(resumeData);
            const expectedMinimum = 70;
            const expectedMaximum = 100;
            
            expect(actual).toBeGreaterThan(expectedMinimum);
            expect(actual).toBeLessThanOrEqual(expectedMaximum);
        });

        test('should return low confidence for minimal data', () => {
            const resumeData = {
                contact: {},
                experience: [],
                education: [],
                skills: [],
                summary: ''
            };

            const actual = parser.calculateConfidence(resumeData);
            const expectedMaximum = 20;
            
            expect(actual).toBeLessThan(expectedMaximum);
        });
    });

    describe('Section Processing', () => {
        test('should identify sections from lines', () => {
            const lines = [
                'John Doe',
                'WORK EXPERIENCE',
                'Software Engineer at Google',
                'EDUCATION',
                'BS Computer Science',
                'SKILLS',
                'JavaScript, Python'
            ];

            const actual = parser.identifySections(lines);
            const expectedProperties = ['experience', 'education', 'skills'];
            
            expectedProperties.forEach(property => {
                expect(actual).toHaveProperty(property);
            });
        });

        test('should handle unknown sections', () => {
            const lines = ['Random content without section headers'];
            const actual = parser.identifySections(lines);
            const expectedProperty = 'unknown';
            
            expect(actual).toHaveProperty(expectedProperty);
        });
    });

    describe('Cleanup and Finalization', () => {
        test('should clean up overlaps in resume data', () => {
            const resumeData = {
                contact: {
                    email: 'john@example.com',
                    websites: ['example.com', 'github.com/john']
                },
                skills: ['JavaScript', 'javascript', 'Python']
            };

            parser.cleanupOverlaps(resumeData);
            
            const actualWebsites = resumeData.contact.websites;
            const expectedNotToContain = 'example.com';
            
            expect(actualWebsites).not.toContain(expectedNotToContain);
        });

        test('should finalize experience objects', () => {
            const experience = {
                title: 'Software Engineer',
                company: 'Tech Corp',
                location: 'San Francisco',
                duration: '2020-2023'
            };

            const actual = parser.finalizeExperience(experience);
            const expected = experience;
            
            expect(actual).toEqual(expected);
        });

        test('should finalize education objects with details', () => {
            const education = {
                degree: 'BS Computer Science',
                institution: 'MIT',
                details: ['Relevant coursework', 'Dean\'s list']
            };

            const actual = parser.finalizeEducation(education);
            const expectedDetails = 'Relevant coursework Dean\'s list';
            
            expect(actual.details).toBe(expectedDetails);
        });
    });

    describe('URL and Domain Extraction', () => {
        test('should extract domain from URL', () => {
            const testCases = [
                { input: 'https://www.github.com/user', expected: 'github.com' },
                { input: 'www.linkedin.com/in/user', expected: 'linkedin.com' },
                { input: 'example.com/path', expected: 'example.com' }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.extractDomainFromUrl(input);
                expect(actual).toBe(expected);
            });
        });

        test('should handle malformed URLs gracefully', () => {
            const testCases = [
                { input: 'not-a-url', expected: 'not-a-url' },
                { input: '', expected: '' }
            ];

            testCases.forEach(({ input, expected }) => {
                const actual = parser.extractDomainFromUrl(input);
                expect(actual).toBe(expected);
            });
        });
    });

    describe('Error Handling', () => {
        test('should handle parseResumeFromFile errors gracefully', async () => {
            const mockFile = {
                name: 'test.pdf',
                arrayBuffer: jest.fn().mockRejectedValue(new Error('File read error'))
            };

            const actualPromise = parser.parseResumeFromFile(mockFile);
            
            await expect(actualPromise).rejects.toThrow(/Failed to parse resume/);
        });
    });

    describe('Integration Tests', () => {
        test('should process a complete resume structure', () => {
            const mockSections = {
                experience: [
                    'Senior Software Engineer | Google Inc | Mountain View, CA | 2020-2023',
                    '• Developed scalable web applications'
                ],
                education: [
                    'Bachelor of Science in Computer Science | Stanford University | 2016-2020',
                    'GPA: 3.8'
                ],
                skills: [
                    'Programming Languages: JavaScript, Python, Java',
                    'Frameworks: React, Node.js, Django'
                ]
            };

            const experience = parser.extractExperience(mockSections);
            const education = parser.extractEducation(mockSections);
            const skills = parser.extractSkills(mockSections, '');

            const actual = {
                experienceLength: experience.length,
                experienceTitleContainsEngineer: experience.length > 0 && experience[0].title.includes('Engineer'),
                educationLength: education.length,
                educationInstitutionContainsStanford: education.length > 0 && education[0].institution.includes('Stanford'),
                skillsHasItems: skills.length > 0
            };

            const expected = {
                experienceLength: 1,
                experienceTitleContainsEngineer: true,
                educationLength: 1,
                educationInstitutionContainsStanford: true,
                skillsHasItems: true
            };

            expect(actual).toEqual(expected);
        });
    });
});