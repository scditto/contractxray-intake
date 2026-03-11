# Contract X-Ray
**AI-Powered PBM Contract Analysis | Nautilus Health Institute**

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20It-navy)](https://scditto.github.io/contractxray-intake/)
[![Nautilus Health](https://img.shields.io/badge/Nautilus-Health%20Institute-1B365D)](https://nautilushealth.org)

---

## What This Is

Contract X-Ray is an AI-powered contract analysis platform that scores pharmacy benefit manager (PBM) contracts against 29 fiduciary-aligned standards across 10 core provisions, on a 0–100 scale. It is designed for employer plan administrators, public sector benefits officers, and benefits advisors who need to understand what their PBM contract actually says — without $10,000–$50,000 in legal fees.

A contract submitted through the intake form is analyzed by Claude (Anthropic's AI) using an encoded scoring methodology developed from decades of PBM contracting expertise. The analysis returns a scored Quick Look report in under 60 seconds.

**[Try it live →](https://scditto.github.io/contractxray-intake/)**

---

## Why This Matters

24 million U.S. government employees have health plans governed by PBM contracts. Most plan administrators — school district benefits officers, county HR directors, municipal finance staff — have never had the tools to evaluate what those contracts say relative to their fiduciary obligations. The provisions that matter most (audit rights, rebate pass-through, data ownership, carve-out rights) are the ones most likely to be absent, buried, or actively restricted.

Contract X-Ray makes that evaluation available to anyone, at no cost, in minutes.

---

## What Is in This Repository

This repository contains the open-source components of the Contract X-Ray system. They are published as civic infrastructure — free to use, adapt, and extend.

### `Index.html`
The public-facing intake form. A self-contained HTML file with embedded CSS and JavaScript that collects a contract PDF, PBM name, and plan sponsor name, then sends a webhook to trigger the Make.com automation pipeline.

- No framework dependencies
- Drag-and-drop file upload
- Client-side validation (file type, file size, required fields)
- Accessible and mobile-responsive
- Embeds directly into any web host — currently deployed on GitHub Pages

### `Contract_XRay_Scoring_Rubric_v5_1.md`
The complete scoring rubric governing all Contract X-Ray analyses. This is the methodology document — the encoded expertise that makes the AI analysis defensible, consistent, and reproducible.

Contains:
- All 10 provisions and 35 scored issues
- 0–5 score definitions for every issue, with explicit criteria for each level
- Calibration rules for edge cases (silence vs. active disclaimer, referenced document handling, government employer adaptation)
- Amendment history documenting every methodology change and the rationale

This document is what separates Contract X-Ray from generic AI contract review. The rubric can be applied manually by any human analyst using the same criteria the AI uses. It is the ground truth.

### `generate_quick_look.js`
The Node.js report generator that converts a scored workpaper (YAML format) into a formatted Word document Quick Look report.

- Reads YAML data block from a markdown workpaper file
- Generates a 3-zone report: category summary, flags table (Concern + Red Flag provisions only), conditional call to action
- Applies Nautilus brand standards (navy/teal/gold color scheme)
- Outputs `.docx` via the `docx` npm library
- No proprietary dependencies — runs with `npm install docx js-yaml`

**To run:**
```bash
npm install docx js-yaml
node generate_quick_look.js path/to/workpaper.md output.docx
```

---

## System Architecture

The full Contract X-Ray pipeline has six stages:

```
Intake Form (GitHub Pages)
    ↓  webhook
Make.com Automation Pipeline
    ↓  HTTP request
Claude API (Anthropic)
    → System prompt encodes scoring methodology
    → Contract PDF analyzed against 10 provisions
    → Returns structured JSON (37 fields)
    ↓  JSON parsed + variables mapped
HTML Report Template
    → 37 variables populated
    ↓
PDF.co (HTML → PDF)
    ↓
Google Drive (storage + logging)
    ↓
Email delivery to submitter
```

**Total pipeline time:** ~60 seconds  
**Marginal cost per analysis:** ~$0.20 (Claude API tokens)  
**Infrastructure:** Make.com, Anthropic API, PDF.co, Google Drive, Google Sheets, Gmail — all connected via webhook and HTTP modules. No custom server infrastructure required.

---

## Scoring Framework

Ten provisions. Thirty-five issues. Zero to one hundred.

| # | Provision | Core Question |
|---|-----------|---------------|
| P1 | Fiduciary Loyalty Commitment | Does the PBM commit to support the plan sponsor's fiduciary obligations? |
| P2 | Pass-Through Pricing Integrity | Are pharmacy discounts passed through at cost with no spread? |
| P3 | Rebate & Manufacturer Revenue | Are 100% of manufacturer revenues passed through? |
| P4 | Data Ownership & Access | Does the employer own its claims data? |
| P5 | Audit Rights & Verification | Can the employer audit all financial arrangements independently? |
| P6 | Conflict of Interest & Network | Are PBM-affiliated pharmacies disclosed? |
| P7 | Carve-Out & Vendor Rights | Can the employer redirect drugs outside the PBM network? |
| P8 | Lowest Net Cost & Clinical | Is the formulary governed by lowest net cost, not rebate maximization? |
| P9 | Termination & Clean Exit | Can the employer exit cleanly with data and no penalty? |
| P10 | Administrative Fee Transparency | Are all fees disclosed with CAA 2026 attestation? |

**Rating bands:**
- 90–100: Excellent
- 75–89: Good
- 60–74: Fair
- 45–59: Concern
- 0–44: Red Flag

**Calibration principle:** Silence = Red Flag. If a contract does not explicitly address a provision, it scores as if the provision is absent. Business model reputation and marketing claims do not count. Only explicit contract language receives credit.

---

## What Is Not in This Repository

The Claude API system prompt — the encoded scoring methodology that instructs the AI how to analyze contracts — is the core intellectual asset of Contract X-Ray and is not published here. It is the product of years of expert calibration and is what makes AI analysis defensible and consistent at scale.

The open components in this repository are sufficient to:
- Understand the full system architecture
- Reproduce the scoring framework manually using the rubric
- Deploy your own intake form
- Build compatible integrations with the methodology
- Generate Quick Look reports from scored workpapers

---

## The AI Component

Contract X-Ray uses Claude (Anthropic) via the Messages API with the following key design choices:

**Methodology-locked system prompt.** The system prompt encodes all 10 provision definitions, bucket criteria, calibration rules, and edge case handling before any contract text is analyzed. The AI executes the methodology — it does not interpret it.

**Evidence requirement.** Every finding must cite a specific contract section. The model cannot score a provision without a direct contract quote. Silence defaults to Red Flag.

**Structured JSON output.** The model returns a validated 37-field JSON object. No natural language parsing required downstream. The pipeline fails gracefully if output is malformed.

**Referenced document detection.** Before scoring, the model identifies any external agreements incorporated by reference but not submitted. Missing referenced documents are flagged and their dependent provisions scored Red Flag — a structural gap most contract review tools miss entirely.

---

## Roadmap

| Phase | Timeline | Status |
|-------|----------|--------|
| Essential Tier (free, automated) | March 2026 | In Progress — launch blocker items |
| PBM Accountability Index | Late March 2026 | In Progress |
| Premium Tier (full report suite) | April 2026 | Planned |
| TPA Contract Expansion | May–June 2026 | Planned |
| RosettaFest Public Launch | July 2026 | Planned |
| Government Plan Dataset (Mozilla) | 2026–2027 | Planned |

---

## Using This for Government Plan Analysis

Contract X-Ray is designed to analyze government employer health plan contracts. Key implementation notes:

- The scoring rubric includes a government employer adaptation: where ERISA does not apply (municipal, county, state, school district plans), fiduciary language references "applicable law" rather than ERISA. Scoring criteria are unchanged.
- CAA 2026 transparency requirements apply to government plans through the No Surprises Act and related provisions. The P10 provision (Administrative Fee Transparency) specifically evaluates CAA 2026 alignment.
- Government contracts obtained through FOIA or public records requests are fully compatible with the intake pipeline. Upload the contract PDF exactly as received.

---

## Contributing

Contract X-Ray is a civic infrastructure project. Contributions that improve the scoring rubric, extend coverage to additional contract types (TPA, ASO, stop-loss), or improve accessibility for non-specialist users are welcome.

**To contribute:**
1. Open an issue describing the proposed change and its rationale
2. For rubric changes, cite specific contract language that motivates the update
3. For code changes, include a brief description of how the change was tested

All contributions are reviewed by the Nautilus Health Institute team before merging.

---

## About Nautilus Health Institute

Nautilus Health Institute is a nonprofit organization focused on transparency and fiduciary accountability. Contract X-Ray is one component of a broader standards and ratings infrastructure that includes the PBM Accountability Index — an independent, Morningstar-style public ratings system for PBM contracts — and the Nautilus Standards Library, an open repository of fiduciary-aligned model contract language.

**Website:** [nautilushealth.org](https://nautilushealth.org)  
**Live Demo:** [scditto.github.io/contractxray-intake](https://scditto.github.io/contractxray-intake/)

---

## License

MIT License. See [LICENSE](LICENSE) for details.

The scoring rubric and methodology documents are published under Creative Commons Attribution 4.0 (CC BY 4.0). You may use, adapt, and redistribute them with attribution to Nautilus Health Institute.

---

*Contract X-Ray™ is a service of Nautilus Health Institute. Scores reflect contract documents, not PBM performance, service quality, or business practices.*
