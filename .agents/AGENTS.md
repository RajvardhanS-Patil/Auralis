# Auralis Agent Rules

## Commit & Push Policy
- **Always commit and push after meaningful changes.** Do not wait for the user to remind you.
- Commit messages must follow the format: `type(scope): description`
- Push to the remote `origin` on branch `main` after every batch of related changes.

## Code Quality Rules
- Before writing any code, consult `docs/aac/RULES.md` and ask yourself the checklist questions.
- Prefer existing libraries over custom implementations. Check npm first.
- Every function must have a JSDoc comment.
- No `console.log` in production code. Use a proper logger or remove before commit.

## Documentation Rules
- If a code change affects behavior, update the corresponding `.md` file in `docs/aac/`.
- Keep documentation in sync with code — stale docs are worse than no docs.

## Architecture Rules
- All AI inference (MediaPipe) must run in a Web Worker, never on the main thread.
- All user data must stay in IndexedDB on the device. Never transmit video frames.
- All timing constants must come from the user's calibration profile, not hardcoded values.
