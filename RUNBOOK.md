# Seminar runbook

Before the event, finish Firebase setup in README, deploy rules and `dist/`, and test the deployed URL on two separate phones. Keep an authorized teacher account and the private key file ready. Students need internet access and a browser; no account form is shown.

1. Sign in as teacher. Import both the public question seed and private key and create a new game.
2. Project the lobby in fullscreen. Scan the QR from a phone to verify the complete URL, including any repository subpath.
3. Ask students to enter only their names. Confirm that names and the participant count appear live. The timer stays stopped until you start.
4. When everyone has joined, press **ක්‍රීඩාව ආරම්භ කරන්න** once. All joined phones enter the quiz. No new participants can join this game. Existing participants may refresh and resume with the same browser.
5. Students have 20 minutes for all 15 questions. They may skip, revisit and review. Encourage checking the online save status before submitting. A final submission is irreversible.
6. After expiry, select **ප්‍රතිඵල ගණනය කරන්න**. If the event must stop earlier, use the confirmed early-close control first. The last server-accepted answers count; offline drafts cannot be recovered into a closed game.
7. Review the leaderboard. Exclude accidental duplicate records with a reason if needed. Leave genuine ties as ties, or conduct a supervised extra challenge and enter its tie-break value and reason. Calculate again after adjustments.
8. Select **ජයග්‍රාහකයන් පෙන්වන්න**. Project the winners; phones receive scores and ranks automatically. Select the separate explanations control when ready to discuss the solutions.
9. Export CSV. Return to the dashboard to create another game; old results remain stored.

If a phone disconnects, keep it in the same browser and reconnect. Local-only save status means the draft has not reached Firestore. If a student clears browser data or switches devices, their anonymous UID changes; after start a new UID cannot join. Use a supervised offline contingency rather than promising cross-device recovery.

If teacher login is denied, verify the UID's `teachers/{uid}` document has `enabled: true`. If every live action fails, check Firebase configuration, authorized domains, rules deployment, network access and Firestore quota status. The local preview does not test the live connection.
