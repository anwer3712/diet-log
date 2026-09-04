# English

Note: This file was machine-translated and needs human proofreading.

# Sunshine Care Log

> A free, open-source daily care tracking tool for elderly patients — built for family caregivers.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-rose)](https://anwer3712.github.io/diet-log/)

---

## What is this?

A bilingual (Traditional Chinese / Indonesian) web app to help family caregivers track daily health data for elderly patients at home, especially for conditions requiring fluid monitoring.

No installation required. Works in any smartphone browser. Data syncs to Google Sheets via Google Apps Script.

---

## Features

- Fluid intake tracking (water, medication drinks, supplements, meals) with daily target and progress
- Fluid output tracking (urine volume and color, bowel movements)
- Intelligent urine target algorithm adjusted for diuretics
- Fluid overload warning (alert when total intake exceeds 1,200 c.c.)
- Exercise logging, BP & heart rate measurements
- Constipation alert system with bilingual safety instructions
- Medication state tracking, time-based reminders, cloud sync to Google Sheets
- Optimistic UI and weekly cleaning reminders

---

## Who is this for?

Family caregivers, multi-caregiver households, and patients needing strict fluid monitoring (heart failure, dialysis, post-op recovery).

---

## Tech Stack

Frontend: Vanilla HTML + JavaScript + Tailwind CSS
Backend: Google Apps Script
Database: Google Sheets
Hosting: GitHub Pages

---

## Setup / Self-Hosting

1. Fork the repository
2. Deploy your own Google Apps Script backend (set GAS_URL in index.html)
3. Create a Google Sheet for data
4. Update GAS_URL and SPREADSHEET_URL in index.html
5. Enable GitHub Pages on your fork

---

## Screenshots

See live demo: https://anwer3712.github.io/diet-log/

---

## Motivation

Built because existing apps were too complex, English-only, or subscription-based. This aims to be simple, bilingual, and free.

---

## Roadmap

Planned improvements (open issues): AI-assisted analysis, AI caregiver Q&A, additional languages, offline mode, printable reports, multi-patient support.

---

## Contributing

Pull requests welcome. See CONTRIBUTING.md.

---

## Security

Report vulnerabilities privately via SECURITY.md. Do not include real patient data.

---

## License

MIT © 2026 anwer3712
