# Contract X-Ray repo restructure — deploy notes

**What this is:** A restructure of the `scditto/contractxray-intake` repo so that
`contractxray.com` serves the hero at root, the multi-page intake at `/intake/`,
and the sample reports page at `/samples.html`. After this deploys, the hero
becomes the front door and its "Analyze your contract" button routes into the
multi-page intake that's already wired to the production Quick Look webhook.

---

## What's in this zip

```
index.html                          (hero — was contractxray_hero_v9.html, links updated)
samples.html                        (sample reports — v4 with all links updated)
intake/
  index.html                        (step 1, Multi-Employer Programs card removed)
  details.html                      (unchanged)
  upload.html                       (unchanged, webhook already correct)
  confirmation.html                 (unchanged)
  success.html                      (unchanged)
_SNIPPET_multi_employer_programs_card.html   (parked markup for future relocation)
README.md                           (this file — do NOT upload to the repo)
```

---

## What changed in each file

**index.html (hero)**
- Renamed from `contractxray_hero_v9.html`
- "Analyze your contract" button: now points to `/intake/`
- "View sample reports" button: now points to `/samples.html`
- Footer Product links: same updates

**samples.html**
- Renamed from `contractxray_sample_reports_v3.html` (v4 content from earlier this session)
- Brand link and breadcrumb: now point to `/`
- Footer Product links: now point to `/intake/` and `/samples.html`

**intake/index.html**
- Moved from repo root
- Multi-Employer Programs tier card removed
- "Not sure which fits?" decision note updated to two-option text
- Enterprise modal markup left in place (unreferenced) so it's available if you
  ever decide to restore the card

**intake/{details,upload,confirmation,success}.html**
- Moved from repo root, otherwise unchanged
- All cross-page navigation uses relative paths, which continue to work after the move

---

## Deploy steps (web UI only, no terminal)

Recommended order minimizes the window where the site is in a half-deployed
state. Do steps 1 and 2 first — these create new URLs without breaking
anything. Step 3 is the moment the front door flips.

### Step 1: Add the `/intake/` folder

1. Unzip on your computer.
2. Go to `github.com/scditto/contractxray-intake`.
3. Click **Add file** → **Upload files**.
4. Drag the entire `intake` folder (not the files inside it — the folder
   itself) onto the upload area. GitHub creates the `/intake/` path
   automatically and uploads all five files inside it.
5. Scroll down, write a commit message like "Add multi-page intake under /intake/",
   click **Commit changes**.

After this commits, `contractxray.com/intake/` will work but nothing on the
site links to it yet. Safe to verify in your browser before continuing.

### Step 2: Add `samples.html`

1. Same repo page, **Add file** → **Upload files**.
2. Drag `samples.html` from the unzipped folder.
3. Commit message: "Add samples.html at repo root", **Commit changes**.

Verify `contractxray.com/samples.html` loads correctly.

### Step 3: Move the assets folder

The intake pages reference `assets/styles.css`, `assets/shared.js`, and
several image files. These currently live at `/assets/` at the repo root.
They need to move to `/intake/assets/` so the intake pages can find them.

Do this in the GitHub web UI:

1. Open `github.com/scditto/contractxray-intake` in the browser.
2. Click into the `assets` folder.
3. For each file inside: open it, click the pencil icon (Edit this file),
   then in the filename field at the top, change the path from
   `assets/styles.css` to `intake/assets/styles.css` (and so on for each
   file). Click **Commit changes** for each.

That's slow if there are a lot of files in `assets/`. Faster alternative if
you have a friend or contractor comfortable with `git`: ask them to run
`git mv assets intake/assets` once and push. Either way works.

**After step 3, verify** `contractxray.com/intake/` displays correctly with
all styling and the page rendering as intended.

### Step 4: Flip the front door

This is the one moment where the site changes for visitors. Until this
step, `contractxray.com` still serves the old intake step 1 at root.

1. Same repo page, **Add file** → **Upload files**.
2. Drag `index.html` from the unzipped folder.
3. GitHub will prompt that a file with this name already exists and ask if
   you want to replace it. Confirm.
4. Commit message: "Replace root index with hero page", **Commit changes**.

Within a minute or two, `contractxray.com/` now serves the hero. The full
funnel is live: hero → "Analyze your contract" → intake → Quick Look PDF.

### Step 5: Delete the old files

Once you've verified the new front door works, clean up the old files. For
each file below: open it on github.com, click the trash-can icon (top right
of the file viewer), commit the deletion.

- `contractxray_hero_v9.html`
- `contractxray_sample_reports_v3.html`
- `contractxray_sample_reports_v4.html` (if you uploaded the v4 file
  separately earlier — it's now superseded by `samples.html`)
- `intake 04-30-26.html`
- `details.html` at repo root (the copy in `/intake/` is the live one)
- `upload.html` at repo root (same)
- `confirmation.html` at repo root (same)
- `success.html` at repo root (same)

---

## After deploy — verify

Click through this exact path to confirm everything wired up:

1. Visit `contractxray.com/` — should see the hero.
2. Click "View sample reports" — should land on `/samples.html`.
3. From samples, click the brand link or breadcrumb — should return to `/`.
4. From samples, click "Analyze your contract" in footer — should land on `/intake/`.
5. From hero, click "Analyze your contract" — should land on `/intake/`.
6. On `/intake/`, click Quick Look — should navigate to `/intake/details.html`.
7. Fill in any junk details, continue to upload, drop a small test PDF,
   submit. Confirm you receive the Quick Look email within ~30 minutes (the
   production Make.com scenario timing).

---

## Known minor items (not blocking)

- The intake pages reference some sample-thumbnail images via absolute URLs
  like `https://scditto.github.io/contractxray-intake/QuickLook-Sample-Thumbnail.jpg`.
  These still resolve correctly because the same GitHub Pages site backs
  both URLs, but they could be cleaned up to relative paths in a future
  pass.

- The intake pages still use Playfair Display + DM Sans while the hero and
  samples pages use Fraunces + Inter. This is the "Phase 2" alignment work
  we deferred. Doing it cleanly requires editing `intake/assets/styles.css`,
  which isn't in this zip.

- The Multi-Employer Programs card markup is in
  `_SNIPPET_multi_employer_programs_card.html`. When the future advisors or
  partners page is built, paste the card markup back into that page's tier
  grid. The Enterprise modal is still in `intake/index.html` so the
  openModal('enterprise') handler will still work if the card is ever
  restored to the intake page.

---

## If something goes wrong

The fastest rollback is to re-upload the original `index.html` (the intake
step 1) to repo root, which restores the previous front-door behaviour
within a couple of minutes. Everything else you've deployed (`/intake/`,
`/samples.html`) keeps working in parallel.
