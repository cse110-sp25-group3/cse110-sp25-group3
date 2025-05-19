# Sprint Retrospective – 5/18/2025

## Attendees
- Ansh
- Aaron
- Daniel
- Sanggeon
- Yilin
- Natalie

## Team thoughts about the sprint:
- Set expectations too low – only took 20 minutes to do everything
- Didn’t get a lot of work done
- More stressful work for front end, but it got completed
- Difficult to divide the work equally / ensure everyone was contributing

## Problem:
- Poor division and organization of work
- Expectations/goals were set too low for the group size

## Solution:
- More explicit task assignments
- Improved communication between group members
  - Current issues: conflicting schedules, inability to meet regularly
  - Missed messages over Slack delayed collaboration
- Ansh’s suggestion:
  - Meet in-person after class on Tuesdays/Thursdays to work on code together
  - Easier Git coordination
  - Helps get everyone in sync with responsibilities
  - Plan: spend ~1 hour together to orient, then continue independently

## Function Discussions:

### Job Preference Tags:
- Extract most common phrases from “job title” in dataset
- For listings with non-matching titles, fall back to the job field and assign an associated tag
  - Example: "Growth Engineering" → treated as "Software Engineer" if both are in the Computer Science field

### Card Flip Feature:
- Daniel suggested a more unique experience --> you see your skills assessment (your skills vs the skills wanted by the job) first and then the job description after
- **Front of Card:**
  - Skills assessment animation (0–100% match)
  - Optionally use GenAI or manual skill selection
- **Back of Card:**
  - Job description and title

### Manage Documents:
- PDFs previewable in the app (fallback: open in new tab)

### Email Function:
- Dummy email system for demo

### Job Listings Source:
- Pull from Ansh’s LinkedIn Premium (for real-world listings)
