# Contract X-Ray — Quick Look Pipeline

**Nautilus Health Institute**
Fiduciary-Aligned PBM Contract Standards

---

## Overview

Contract X-Ray Quick Look is an automated PBM contract analysis pipeline. Employers and brokers submit PDF contracts through a web intake form. The pipeline analyzes the contract against 10 fiduciary-aligned provisions and delivers a branded Quick Look report by email within 60-90 seconds.

**Components:**
- `ContractXRay_Intake_v5_10.html` — Web intake form (GitHub Pages)
- `make-blueprints/` — Make.com scenario blueprints (version controlled)
- Make.com scenario — Orchestration pipeline
- Claude API — Contract analysis engine
- PDF.co — Report generation
- Google Drive — Report storage
- Google Sheets — Submission tracking
- Gmail — Report and notification delivery

---

## Repository Structure

```
/
├── ContractXRay_Intake_v5_10.html        # Intake form — deployed via GitHub Pages
├── make-blueprints/
│   ├── CXR_QuickLook_prod_v25_2026-03-14.json     # Current production blueprint
│   └── CXR_QuickLook_staging_v25_2026-03-14.json  # Current staging blueprint
└── README.md
```

---

## Environments

| Environment | Make.com Scenario Name | Webhook | Form Branch |
|-------------|----------------------|---------|-------------|
| Production | `CXR_QuickLook_prod_v25_2026-03-14` | Production webhook URL | `main` |
| Staging | `CXR_QuickLook_staging_v25_2026-03-14` | Staging webhook URL | `staging` |

**Never test against the production scenario.** All development and testing happens in staging. Promote to production only when staging has been validated end-to-end.

---

## Blueprint Naming Convention

```
CXR_QuickLook_[env]_v[version]_[YYYY-MM-DD].json
```

Examples:
- `CXR_QuickLook_prod_v25_2026-03-14.json`
- `CXR_QuickLook_staging_v26_2026-03-20.json`

**Version number** is the Contract X-Ray build version — not Make.com's internal version counter. Increment the version number each time you promote a new blueprint to production. The date reflects the export date.

---

## Pipeline Architecture

```
Webhook (Module 1)
    Google Drive — Create Folder (Module 3)
    Google Drive — Upload File (Module 4)
    Gmail — Acknowledgment Email (Module 127)
    Set Variables (Module 96)
    Router (Module 100)
        Route 1: fileCount = 1
            Claude API (Module 16)
            Parse JSON (Module 38)
            Set Variables (Module 11, 12)
            PDF.co — Generate Report (Module 13)
            Google Drive — Upload Report (Module 14)
            Google Sheets — Log Row (Module 80, 81)
            Gmail — Send Report (Module 5)
        Route 2: fileCount > 1
            Claude API — Multi-file (Module 101)
            Parse JSON (Module 102)
            Set Variables (Module 103, 104)
            PDF.co — Generate Report (Module 105)
            Google Drive — Upload Report (Module 106)
            Google Sheets — Log Row (Module 107, 108)
            Gmail — Send Report (Module 109)
```

**Error handlers** on Modules 16 and 101 send internal failure alerts (Module 28/114) and submitter notifications (Module 29/115) when Claude API calls fail.

---

## Deployment: Staging to Production

### Prerequisites
- Blueprint exported from staging and committed to `make-blueprints/` in this repo
- End-to-end testing completed in staging (1-file and 2-file submissions validated)

### Step 1 — Export staging blueprint
1. Open the staging scenario in Make.com
2. Click the three-dot menu, select **Export Blueprint**
3. Save as `CXR_QuickLook_prod_v[version]_[YYYY-MM-DD].json`
4. Commit to `make-blueprints/` in this repo before importing to production

### Step 2 — Import to production
1. Open the production scenario in Make.com
2. Click the three-dot menu, select **Import Blueprint**
3. Select the exported file
4. Click **Save** to confirm the import

### Step 3 — Reconnect credentials
After import, Make.com will flag disconnected modules. Reconnect using the same accounts:

| Module | Service | Account |
|--------|---------|---------|
| 127 | Gmail | Nautilus send account |
| 5, 109 | Gmail | Nautilus send account |
| 29, 115 | Gmail | Nautilus send account |
| 28, 114 | Gmail | Nautilus send account |
| 3, 4, 14, 106 | Google Drive | Nautilus Drive account |
| 80, 81, 107, 108 | Google Sheets | Nautilus Sheets account |
| 13, 105 | PDF.co | Nautilus PDF.co account |

### Step 4 — Set router filters (REQUIRED — Make.com does not preserve these on import)

Click **Router 100** and set filters manually:

**Route 1 — "1 File":**
- Variable: `{{1.fileCount}}`
- Operator: **Equal to** (numeric)
- Value: `1`

**Route 2 — "2+ Files":**
- Variable: `{{1.fileCount}}`
- Operator: **Greater than** (numeric)
- Value: `1`

### Step 5 — Re-determine Module 1
1. Activate the scenario
2. Submit a test submission through the production intake form
3. Click **Run once** if the scenario does not auto-trigger
4. Click Module 1's output bubble and verify all expected fields are present:
   - `tier`, `contractCompany`, `contractPbm`
   - `submitterName`, `submitterEmail`, `submitterCompany`
   - `fileCount`, `fileName`, `fileNames`
   - `file_0` (binary), `file_1` (binary, 2-file submissions only)

### Step 6 — Validate end-to-end
Run both test cases before considering deployment complete:

- **1-file test:** Single PDF submission. Verify Module 16 runs, Module 101 shows "bundle did not pass through the filter," one report delivered by email.
- **2-file test:** Two PDF submission. Verify Module 101 runs, Module 16 shows "bundle did not pass through the filter," one combined report delivered by email.

---

## Development Workflow

### Setting up a new feature
1. Check out the `staging` branch
2. Make form changes against staging webhook URL
3. Make blueprint changes in Make.com staging scenario
4. Export updated staging blueprint and commit to `make-blueprints/`
5. Test end-to-end in staging
6. When ready: follow Deployment steps above

### Webhook URLs
Webhook URLs are hardcoded in the intake form. The `main` branch points to the production webhook. The `staging` branch points to the staging webhook. Never commit the staging webhook URL to the `main` branch.

---

## File Size Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Per-file maximum | 4MB | Enforced by intake form |
| Total per submission | 4MB | Make.com webhook limit |
| Claude API document limit | ~20MB | Not the binding constraint |

The intake form shows a running MB counter and blocks files that would exceed the 4MB total. A compression suggestion is shown when the limit is reached.

Typical real-world PBM contracts: 0.5-2MB per document. Two-document submissions (e.g., base contract + PSA) are well within the 4MB combined limit.

---

## Known Constraints

- **Router filters are not preserved on blueprint import.** Always set them manually after every import (Step 4 above).
- **Make.com blueprint export does not include connection credentials.** All service connections must be manually reconnected after import.
- **Module 1 must be re-determined after each import** to update the field mapping to the current webhook payload.
- **Staging and production share the same Google Drive, Sheets, and Gmail accounts.** Test submissions will appear in production Drive folders and Sheets logs. Tag test submissions clearly (e.g., use "TEST" as the company name).

---

## Support

Questions: support@nautilushealth.org
Nautilus Health Institute — nautilushealth.org
