# ගණිත රහස් මෙහෙයුම 🧩

A Sinhala Grade 11 seminar game: 15 questions, three rounds, 300 points, one shared 20-minute deadline. Vanilla JavaScript, Vite, Firebase Auth and Firestore. No production server. A clearly labelled local preview works without Firebase; live play requires the setup below.

## Run locally

Use Node 22+ and npm. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

```sh
npm ci
cp .env.example .env
npm run dev
```

Open the printed URL. The home page offers a local, ungraded preview. Preview data stays in that browser and never joins a live session.

## Firebase setup

1. Create a Firebase project on Spark. This application uses Authentication and Cloud Firestore only.
2. In Authentication, enable Email/Password. Create each teacher account in the Firebase console; there is no public registration page.
3. Enable Anonymous authentication for students.
4. Create Cloud Firestore. Choose an appropriate region before creating the database.
5. Copy frontend web-app configuration into `.env` using the four keys in `.env.example`. These client identifiers are public configuration, not service-account credentials.
6. Add localhost and your GitHub Pages hostname to Authentication authorized domains where required. The repository path is not part of the domain.
7. Copy the teacher's Authentication UID. In the Firestore console, create `teachers/THAT_UID` with a boolean field `enabled: true`. Client rules prohibit all writes to this allowlist, including from teachers. A signed-in account without this document receives no teacher permissions.
8. Sign in at `#/teacher`. Select both `seed/questions.json` and `private/answer-key.json` using the authenticated import control, then create a game. Its batch imports the public question content and private key into separate Firestore documents. Select both seed files again when creating another game. To edit content, change `seed/questions.json` and the private JSON before the seminar, rebuild, and create a new session.
9. Deploy the rules: `npx firebase deploy --only firestore:rules --project YOUR_PROJECT_ID`. Deploy rules before allowing participants to join. The import page requires these rules to exist, so perform this deployment before the first import if starting from a locked database.
10. Run `npm run build` and deploy **only `dist/`** to GitHub Pages. Configure Pages to use GitHub Actions, add the four `VITE_FIREBASE_*` values as repository Actions variables, then manually run the supplied workflow after authorizing publication. Nothing has been published by this implementation.

Never put a service-account key in the frontend. `private/answer-key.json` is outside Vite's import graph and outside `public/`, so it is not served in a production build. **If you commit this file to a public repository, its answers are readable in that repository.** For a real contest keep the source repository private, or provision the key separately and remove it from repository history before making the repository public. The public question seed has no answers or explanations. Both seed files stay outside the production import graph. Actual scored question text is fetched from Firestore only after joining and starting; the local preview uses separate sample exercises.

## Operation and data

- Teacher: `#/teacher`; projector: `#/host/SESSION_ID`; student: `#/join/SESSION_ID`.
- QR URLs use the current complete deployment URL, preserving the repository subpath. No server rewrite is needed because routing uses hashes; Vite's base is relative.
- Students anonymously authenticate and supply only a trimmed, 2–50 character name. Duplicate names are permitted; UID document IDs keep their records separate. Browser authentication persists across refreshes. A different browser/profile is a different participant; the teacher can exclude accidental duplicate records with a reason.
- Waiting has no countdown. A transaction starts a session once with a server timestamp. The security rules independently prohibit resetting it and block joins after start. Student session listeners move waiting students into the quiz automatically.
- Question order is fixed; each student's option order is generated once at joining and stored in their private answer document. Stable option IDs determine correctness. Answers and current position also persist locally.
- Answer edits save locally immediately, then debounce a Firestore write for 800 ms. Navigation flushes the pending snapshot. The interface distinguishes local changes from server-acknowledged saves. Final submission writes the complete answer map and a server submission timestamp together. Rules lock further edits after acknowledgement.
- Unsynced local drafts do not earn credit. A closed/expired game uses the last accepted server answer map, even if no final-submission write exists. Offline clients cannot bypass the deadline; rules use `request.time`. The browser does not need to write a finalization record at expiry.
- The display initially estimates elapsed time from the **resolved server start timestamp** and browser wall clock, then uses `performance.now()` for monotonic countdown updates. Server/network delay, suspended tabs, a wrong initial phone clock, and refresh can affect display precision; the countdown is not an authoritative time service. Clock changes after anchoring do not reset it. Firestore server time always enforces the actual 1,200-second deadline. A teacher closing early records a server timestamp; the effective cutoff is the earlier of that and the ordinary deadline.
- Grading fetches server snapshots in the authenticated teacher browser after expiry/closure. It gives 10/20/30 points per round with no penalties or speed bonus. Score first, then earlier server final-submission time; unfinished entries share the cutoff time. Identical values share competition rank (for example 1, 1, 3). A supervised tie-break value is used only after both ordinary criteria tie, with a required recorded reason. Exclusions and tie-breaks are editable before publication. Recalculate after edits.
- Results are written in batches before a separate publication flag exposes them. Student results update through listeners. Explanations have a separate release flag and control, available after results publication. Published results and participant adjustments are locked to preserve the published outcome.
- CSV contains nonexcluded leaderboard entries, timestamps, tie-break values and reasons; a UTF-8 BOM helps spreadsheet Sinhala rendering. Formula-leading names are escaped.
- Creating another game preserves prior sessions. No deletion or retention automation is included. Remove old participant data through the console according to your seminar's retention policy.

Firestore paths: `teachers/{uid}`; `sessions/{id}`; session subcollections `participants/{uid}`, `answers/{uid}`, `questions/{qid}`, `keys/main`, `results/{uid}`. Only teachers can list participant/answer records. Students read their own private answers, and public results only after publication. Joined students can read scored questions only after start and answer keys only after release.

Spark quotas still apply: listeners incur document reads, and drafts incur writes. The names list is a realtime teacher listener; the student listens to their session and own records. Debouncing reduces writes, but does not guarantee a large seminar fits free quotas. Test your expected participant count before the event.

## Verification

```sh
npm test
npm run build
npm run test:rules
npm run test:browser
```

Rules tests require Java 21+, Firebase CLI dependencies and its Firestore emulator download. They use `demo-ganitha`, isolated from production, and seed timestamps directly to test expiry without changing the production duration. `npm test` skips emulator tests unless `FIRESTORE_EMULATOR_HOST` is set; the explicit `test:rules` command runs them. No app UI connects to emulators: this emulator configuration is for rules verification only.

Browser tests require Chromium: run `npx playwright install chromium` once if it is not already installed. Build before running browser tests; they check both the development UI and the production build mounted at `/seminar/`. Their small Node static-file helper is a local test tool only.

See `VERIFICATION.md` for actual results and limitations, and `RUNBOOK.md` for seminar operation.
