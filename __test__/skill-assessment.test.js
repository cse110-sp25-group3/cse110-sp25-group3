// skill-assessment.test.js
import { skillAssessment } from '../source/functions/skill-assessment.js';

test('perfect match', () => {
    expect(skillAssessment(['A','B','C'], ['A','B','C'])).toBe(100);
});
test('partial match', () => {
    expect(skillAssessment(['A','X'], ['A','B','C'])).toBe(33);
});
test('partial match - caseSensitive & location', () => {
    expect(skillAssessment(['A','X'], ['a','x','X'])).toBe(33);
});
test('no match', () => {
    expect(skillAssessment(['A','X'], [])).toBe(0);
});
test('no match - with skill', () => {
    expect(skillAssessment(['A','X'], ['C', 'a'])).toBe(0);
});
test('jobSkills not an array', () => {
    expect(skillAssessment(['A','X'], '9')).toBe(0);
})