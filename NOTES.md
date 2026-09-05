# NOTES.md — teaching scratchpad

## User preferences
- Wants to understand the actual Koso codebase, not toy examples.
- Asked for a plain-language explanation of "everything I did" — favours a readable walkthrough over abstract theory.
- Learning works best grounded in real files he can open.

## Working understanding
- Backend: NestJS + Supabase (+ Paystack for payments).
- Frontend is Vue + shadcn-vue (per Koso spec). Backend is the NestJS server here.
- Two layers: legacy `controllers/` vs live `src/`.

## Open questions for future sessions
- Does the user know NestJS DI details, or is that "magic" to them? (Lesson 1 assumed minimal.)
- Does the user want to learn Supabase query details next, or the payment integration, or how to add a new endpoint hands-on?
- Should we clean up the legacy `controllers/` layer? (Not yet — user hasn't asked.)