# Contract X-Ray

This repository is the public front-end for Contract X-Ray, a tool from Nautilus Health Institute that scores pharmacy benefit manager (PBM) contracts against ten fiduciary-aligned standards. The site is served via GitHub Pages at contractxray.com.

## A note for reviewers

This repository holds the front-end only: the marketing site and the contract intake form. The analysis does not happen here. When a contract is submitted, the intake form posts to a webhook that triggers a hosted automation, and the scoring runs there against the Claude API. There is no server code in this repository because the back-end is a hosted pipeline, not a service run from this repo. The scoring methodology and the report generators live in a separate, private repository, `cxr-methodology`, available to named reviewers on request.

If you were looking for where the work happens, it is the webhook in the intake form and the architecture below, not a file in this repository.

## How it works

Contract X-Ray runs in two tiers.

### Quick Look (free)

A fast triage report. The flow:

```
Intake form (this repo, GitHub Pages)
    |
    |  webhook POST on submit
    v
Make.com automation
    |
    |-- PDF.co        extract text from the uploaded contract
    |-- Claude API    score the contract against the methodology
    |-- HTML to PDF   render the branded Quick Look report
    |-- Google Drive  store the report
    |-- Gmail         email the report to the submitter
    v
Delivered to the submitter in about 60 seconds
```

The scoring methodology is supplied to the Claude API as the system prompt. No custom server is involved. The automation is the processing engine, and its exported definition is in `make-blueprints/`.

### Full Assessment (paid)

An in-depth analysis producing the full report set: Scorecard, Negotiation Report, Executive Brief, Remediation Report, Data Sovereignty Score report, and, for repeat cycles, Comparison and Trajectory reports. The Premium path uses a Cloudflare Worker for intake and case-identifier generation, Stripe for payment, R2 for document storage, and a Claude Agent SDK runtime that performs the analysis and produces the reports. That infrastructure sits outside this repository.

## What is in this repository

```
index.html, samples.html, advisors.html,    The marketing site
  pbms.html, plan-sponsors.html,
  methodology.html, caa-2026.html,
  press.html, privacy.html, terms.html,
  acceptable-use.html
intake/                                      The multi-page contract intake form
assets/                                      Shared styles, scripts, images
make-blueprints/                             The Make.com automation export (the Quick Look engine)
CXR_*_SampleEmployer_v1.pdf                  Sample reports shown on the site
```

## Where the methodology lives

The scoring rules, the report generators, and the rendering pipeline are maintained in the nautilus-health `cxr-methodology` repository. That repository is the source of record for how Contract X-Ray scores a contract and how it produces a report. Reviewers who need to examine the methodology should request access there.

---

Nautilus Health Institute. Contact: info@nautilushealth.org
