# cse110-sp25-group3

# JobSwipe – CSE 110 SP25 Group 3

> A swipe-style job board that auto-fills Greenhouse application forms.

## ✨ Features

| Module                     | What it does                                                                              |
|----------------------------|-------------------------------------------------------------------------------------------|
| **Feed / Swipe**           | Tinder-like interface to quickly triage open positions.                                   |
| **Auto-Apply**             | One-click launch that opens the job’s Greenhouse page and fills all required fields using Selenium (name, email, phone, skills, EEO survey, etc.). |
| **Preferences & Documents**| Stores your résumé-parsed skills and job preferences in `localStorage` so they persist across sessions. |
| **Onboarding**             | A short intro wizard that tailors the feed to your profile.                              |

## 🛠 Tech Stack

- **Front-End:** Vanilla JS (ES Modules), Tagify, Tailwind CSS  
- **Back-End Helper:** Node.js 18, Express, Selenium WebDriver (Chrome)  
- **Data:** JSON datasets in `/source/assets/datasets`

## 🚀 Quick-Start (Local Development)

> **Prerequisites:** Node ≥ 18 and the Live Server VS Code extension.

1. **Clone & Install**

   ```bash
   git clone https://github.com/cse110-sp25-group3/cse110-sp25-group3.git
   cd cse110-sp25-group3
   npm I

2. **Launch the Selenium/Express autofill server**

```bash
node jobs.js
```

3. **Serve the front-end**
In VS Code’s Explorer, right-click source/index.html → Open with Live Server.

Your browser will open to something like:
http://127.0.0.1:5500/source/index.html

# 🐞 Troubleshooting

| Problem                                          | Fix                                                                                                                             |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| **Error: Chrome driver not found**               | Ensure Chrome is installed and matches your Selenium WebDriver version, or set `SELENIUM_BROWSER_PATH`.                         |
| **Fields stay blank on Greenhouse**              | Check the terminal running `node jobs.js` for “element not found” or iframe errors; update selectors in `applyGreenhouseJob()`. |
| **Live Server shows the repo README instead of the app** | Make sure you started Live Server from `source/index.html`, not the repo root.                                                  |


Our team page: [team page](/admin/team.md)

# Sprint 1 Video
https://www.youtube.com/watch?v=LzCrVnSijeY 
