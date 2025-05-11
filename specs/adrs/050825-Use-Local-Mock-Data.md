---
parent: Decisions
nav_order: 100
title: ADR Template
status: accepted
date: 2025-05-08
decision-makers: Daniel, Mehak, Ansh, Natalie, Yilin
consulted: Backend team
informed: Full team
---

# Use of Local Mock Data for Job Listings

## Context and Problem Statement

Initially, we considered scraping job listings from external sources like LinkedIn or Indeed. However, this posed significant complexity due to API limitations, legal restrictions, and variable data formats. For our MVP, we needed a simpler, faster, and more reliable data source to support the swipe interface and filtering features.

## Decision Drivers

* API scraping is time-consuming and error-prone
* External data sources require authentication and/or payment
* MVP must be functional without external dependencies
* Need to quickly prototype UI using consistent data format

## Considered Options

* Scrape real job listings from external sites
* Use a static JSON file with local mock data

## Decision Outcome

Chosen option: "Use a static JSON file with local mock data", because it removes external dependencies and allows immediate progress on UI and backend integration.

### Consequences

* Good, because development can proceed independently of external APIs
* Good, because data format is consistent and easy to debug
* Bad, because mock data does not reflect real-world job variety
* Bad, because application realism is limited

### Confirmation

The mock data JSON file has been committed to the repository and is being used by the swipe card UI and filtering components. Backend logic has been implemented to serve this data via internal endpoints or direct imports.

## Pros and Cons of the Options

### Scrape real job listings

* Good, because data is realistic
* Neutral, because scraping simulates actual product usage
* Bad, because scraping is legally risky and may break often
* Bad, because it slows down MVP development

### Local mock data

* Good, because it's stable and under our control
* Good, because it supports fast iteration
* Bad, because it lacks variability
* Bad, because it may not test all edge cases

## More Information

This decision was discussed in the April 24 meeting when the team decided on the Tinder-style job app idea. The notes mention avoiding "complex backend" and API scraping issues. The mock data supports job cards with essential fields like title, company, and location.
