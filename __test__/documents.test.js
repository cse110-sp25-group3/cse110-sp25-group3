/**
 * @jest-environment jsdom
 */

import {    formatFileSize,
            setInputValue,
            populateForm,
            createResumeCard,
            renderDocuments } from '../source/pages/documents/documents.js';

jest.useFakeTimers();

describe('formatFileSize', () => {
  test('returns 0 Bytes for 0 input', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  test('formats kilobytes correctly', () => {
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  test('formats megabytes correctly', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
  });
});

describe('setInputValue', () => {
  beforeEach(() => {
    document.body.innerHTML = '<input id="test-input" />';
  });

  test('sets input value and adds auto-filled class', () => {
    setInputValue('test-input', 'Example');

    const input = document.getElementById('test-input');
    expect(input.value).toBe('Example');
    expect(input.classList.contains('auto-filled')).toBe(true);

    jest.advanceTimersByTime(3000);
    expect(input.classList.contains('auto-filled')).toBe(false);
  });

  test('does nothing if input not found', () => {
    expect(() => setInputValue('non-existent', 'Hello')).not.toThrow();
  });
});

describe('populateForm', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="name-input">
      <input id="lname-input">
      <input id="email-input">
      <input id="phone-input">
      <input id="location-input">
      <input id="linkedin-input">
      <input id="school-input">
      <input id="degree-input">
      <input id="gradYear-input">
      <textarea id="history-input"></textarea>
      <textarea id="skills-input"></textarea>
      <textarea id="certifications-input"></textarea>
      <textarea id="languages-input"></textarea>
    `;
  });

  test('fills the form with parsed resume data', () => {
    const { populateForm } = require('../source/pages/documents/documents.js');
    const sampleResumeData = {
      contact: {
        name: 'Jane Doe', email: 'jane@example.com', phone: '1234567890', location: 'City', linkedin: 'linkedin.com/jane'
      },
      education: [{ institution: 'UCSD', degree: 'BS Computer Science', year: '2025' }],
      experience: [{ title: 'Intern', company: 'Google', duration: '2023', location: 'CA' }],
      skills: ['JavaScript', 'HTML'],
      certifications: [{ name: 'AWS', issuer: 'Amazon', date: '2022' }],
      languages: [{ language: 'English', proficiency: 'Fluent' }]
    };
    populateForm(sampleResumeData);
    expect(document.getElementById('name-input').value).toBe('Jane');
    expect(document.getElementById('lname-input').value).toBe('Doe');
    expect(document.getElementById('email-input').value).toBe('jane@example.com');
    expect(document.getElementById('school-input').value).toBe('UCSD');
    expect(document.getElementById('skills-input').value).toContain('JavaScript');
    expect(document.getElementById('languages-input').value).toContain('English');
  });

  test('handles malformed resume data gracefully', () => {
    const badData = { contact: null };
    expect(() => populateForm(badData)).not.toThrow();
  });
});

describe('createResumeCard star button', () => {
  test('toggles star class and symbol', () => {
    const { createResumeCard } = require('../source/pages/documents/documents.js');
    const dummyFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
    const card = createResumeCard(dummyFile, 'resume-0');

    const starBtn = card.querySelector('.star-btn');
    expect(starBtn.textContent).toBe('☆');
    starBtn.click();
    expect(starBtn.textContent).toBe('★');
    expect(starBtn.classList.contains('starred')).toBe(true);
    starBtn.click();
    expect(starBtn.textContent).toBe('☆');
    expect(starBtn.classList.contains('starred')).toBe(false);
  });

  test('deletes resume card on delete button click', () => {
    const { createResumeCard } = require('../source/pages/documents/documents.js');
    const dummyFile = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
    const card = createResumeCard(dummyFile, 'resume-1');
    document.body.appendChild(card);

    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.click();

    expect(document.body.contains(card)).toBe(false);
  });
});

describe('showUploadStatus', () => {
  test('shows status message with correct class', () => {
    const { showUploadStatus } = require('../source/pages/documents/documents.js');
    document.body.innerHTML = '<div id="upload-status"></div>';
    showUploadStatus('Processing…', 'processing');

    const status = document.getElementById('upload-status');
    expect(status.textContent).toBe('Processing…');
    expect(status.className).toContain('processing');
  });
});
