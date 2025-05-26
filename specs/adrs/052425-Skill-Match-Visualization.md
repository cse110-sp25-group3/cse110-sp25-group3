---
parent: Decisions
nav_order: 100
title: ADR Template
status: accepted
date: 2025-05-24
decision-makers: Ansh, Sanggeon, Daniel, Yilin
consulted: Frontend team
informed: Design and backend teams
---

# Skill Match Visualization on Swipe Cards

## Context and Problem Statement

To enhance the user experience of job discovery, we wanted to provide an immediate sense of how well a job matched the user's skillset. We considered various ways to visualize this but needed something intuitive, appealing, and compatible with the swipe card format.

## Decision Drivers

* Users benefit from quick feedback on skill-job fit
* Visual feedback increases interactivity and engagement
* Simplicity of implementation within MVP constraints
* Need for fallback if resume parsing is not implemented

## Considered Options

* Match user skills from resume using AI/GenAI
* Allow users to manually select skills and calculate match
* Omit skill matching visualization entirely

## Decision Outcome

Chosen option: "Allow users to manually select skills and calculate match", because it simplifies implementation while maintaining useful feedback for the user.

### Consequences

* Good, because we can use predefined job tags and user-selected skills
* Good, because it’s easier to animate and show as a percentage bar
* Bad, because it doesn’t use actual resume data and may be less accurate

### Confirmation

The card UI design was updated with a flip feature—front side shows skill match percent with an animated progress bar, back side shows job description. This design was discussed and approved during the 5/18 design review.

## Pros and Cons of the Options

### GenAI resume parsing

* Good, because it reflects real resume-job matching
* Neutral, because it’s future-facing
* Bad, because it’s technically challenging and out of MVP scope
* Bad, because resume formats vary widely

### Manual skill selection + tag match

* Good, because it’s simple to implement
* Good, because users can personalize their matches
* Bad, because it introduces extra user input
* Bad, because matching accuracy is limited

## More Information

This solution was agreed upon in the 5/18 design discussion. It balances MVP simplicity with UX richness. Future iterations may enhance accuracy using NLP or resume parsing.
