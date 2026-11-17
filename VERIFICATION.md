# Verification report

Verified locally on 16 November 2026 using Node 22.17, Java 21, Firebase CLI 15.36, Firestore emulator 1.22 and headless Chromium.

| Check | Actual result |
| --- | --- |
| Production build | Passed. Static output in `dist/`; relative asset paths. Vite reports the Firestore SDK chunk is slightly above its 500 kB advisory threshold (about 138 kB gzip). |
| Question bank and scoring | 5 unit tests passed: exactly 15 questions, exactly 300 possible points, all 15 supplied correct answers individually verified, incorrect/blank answers score zero, numeric normalization, deadline cutoffs, stable option IDs, ties and QR repository URLs. |
| Firestore security and realtime behavior | 8 emulator tests passed, none skipped in the explicit emulator run. |
| Browser checks | 6 Chromium tests passed, including layouts at 360, 390, 768 and 1440 px, local answer/position recovery, shuffled option recovery, review/navigation, final-confirmation cancellation/acceptance and configuration-gated login. |
| GitHub Pages subpath | Built app loaded and refreshed under `/seminar/#/demo` with relative assets. QR URL unit test preserves full repository path and session ID. |
| Seed privacy | Production HTTP requests for both seed files returned 404; bundled JavaScript contained neither the checked scored question text nor private explanation text. Seed files are outside the complete production import graph. |
| Visual review | Desktop landing page and 390 px quiz screenshots inspected. Mobile question card comes before the navigation map, with a sticky timer. |

The emulator checks exercise atomic session/question/key creation; UID allowlist protection; unauthorized teacher actions; two separate UIDs with identical names; immutable participant names; realtime joined-name counts; both participant session listeners receiving Start; new joins blocked after start; participant reconnect reads; questions hidden during waiting and from nonparticipants; private-key and other-student answer restrictions; invalid question/option IDs; valid drafts; atomic final submission and subsequent write rejection; server deadline rejection without a teacher browser; early closure; teacher-only result publication; hidden results before release; publication notification; and separate explanation release. Repeated direct Start writes cannot reset the timestamp. The application additionally uses a transaction to make repeated Start clicks no-ops.

`npm test` alone reports 5 passed and 8 skipped because no emulator is running. `npm run test:rules` is the separate run that passed all 8 emulator cases. Browser tests run against the local preview and built frontend, not a live Firebase account.

Not verified: real Firebase email/password or anonymous sign-in, deployed authorized-domain behavior, a complete teacher-and-phones browser workflow against the user's cloud project, actual camera QR scanning, a deployed GitHub Pages URL, real phone hardware, internet-loss/reconnection against cloud Firestore, CSV opening in Excel, seminar-scale load or Spark quota capacity. No Firebase configuration or teacher credentials were supplied, and no external deployment was authorized. Those checks remain in the setup/runbook rehearsal.

The lockfile currently includes npm audit findings in Firebase's Node-side SDK/development tooling dependency tree (last audit after updating Firebase CLI: 14 moderate and 5 high). No production Node server is used. Audit remediation that changes transitive major versions was not forced. Review these dependencies before distributing the development tooling.
