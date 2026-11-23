# IT0035 OS Learning Hub

An offline-first React + TypeScript learning website for Applied Operating Systems Modules 1–4. It includes short lessons, tested computation engines, interactive simulators, quizzes, a mistake notebook, progress analytics, achievements, and local-only persistence.

## Open the website - no installation required

Double-click the repository's root `index.html`. The production CSS and JavaScript are embedded in that single file, so no Node.js, npm, terminal, local server, or internet connection is needed. Keep the `course-materials/` folder beside `index.html` so the PDF links continue to work.

GitHub Pages can publish the same root files using **Deploy from a branch → main → /(root)**. The included GitHub Actions workflow also publishes the committed `docs/` copy directly; it does not install dependencies or build the site online.

## Course sources

The four supplied module PDFs are mapped to lesson and question page ranges in `src/data/content.ts`. They are organized with web-safe filenames in `public/course-materials/`, included in the GitHub Pages build, and linked from the website's **Course PDFs** page. Content that extends beyond explicit PDF coverage is labeled **supplementary** and makes no page claim.

One course-slide nuance is surfaced transparently: Module 2 PDF page 40 uses `waiting = start - arrival` for a non-preemptive FCFS example. That shortcut is valid for the example, but it does not generalize to preempted processes. The simulator uses the standard single-CPU-burst identity `WT = TAT - BT` throughout.

## Run locally

Requirements: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Publish on GitHub Pages

This project is configured as a static GitHub Pages website. It has no backend and uses relative production asset paths, so it works at either `username.github.io` or `username.github.io/repository-name/`.

### Easiest method: manual upload and `docs` folder

If you upload files through GitHub's website instead of using Git commands:

1. Generate the ready-to-publish folder locally:

   ```bash
   npm install
   npm run build:github
   ```

2. Upload the whole project again, including the generated `docs/` folder.
3. In the GitHub repository, open **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select branch **main**, folder **/docs**, and click **Save**.

Do not select the repository root as the Pages folder. The root `index.html` is Vite source code and must be built first; serving it directly results in a blank page.

### Automatic method: GitHub Actions

1. Create an empty GitHub repository and make its default branch `main`.
2. From this project folder, run:

   ```bash
   git init
   git add .
   git commit -m "Build IT0035 OS Learning Hub"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```

3. On GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Open the repository's **Actions** tab. The included `Deploy website to GitHub Pages` workflow tests, builds, and publishes the `dist` folder automatically.

Every later push to `main` runs the same deployment. Study progress is stored per browser and domain, so progress on `localhost` does not automatically transfer to the published GitHub Pages address.

## Verify

```bash
npm test
npm run build
```

The automated tests cover FCFS, SJF, SRTF, priority direction, Round Robin, idle gaps, ties, FIFO, LRU, Optimal, allocation, paging, invalid input, and the required 20-reference page-replacement fixture (FIFO 15, Optimal 9, LRU 12).

## Data and privacy

There is no backend, login, API key, database, or telemetry. Progress, settings, quiz history, mistakes, and XP safeguards use browser `localStorage`. Use **Settings → Reset all progress** to clear the app's local study data.

## Computation rules

- Scheduling ties use arrival time and then natural PID order. Preemptive ties retain the running process.
- Priority direction is configurable.
- Round Robin boundary arrivals enter the ready queue before the just-expired process is requeued.
- `CT` is the completion timestamp, `TAT = CT − AT`, and `WT = TAT − BT`.
- Paging examples use byte addressing and zero-based page, frame, and offset indexing.
- FIFO hits do not change insertion order; LRU hits update recency; Optimal uses deterministic lowest-frame-index ties.

## Project structure

- `src/algorithms/` — pure TypeScript solvers and tests
- `src/components/` — simulator and learning UI
- `src/data/` — lessons, questions, and formula content
- `src/storage.ts` — validated local progress persistence
- `public/course-materials/` — PDFs copied unchanged with web-safe filenames
- `.github/workflows/` — automated test, build, and GitHub Pages deployment
