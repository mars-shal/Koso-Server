# Mission: Understand my Koso backend

## Why
Marshall has a functional NestJS + Supabase server for Koso (his personal operations tool), but it was written with help. He wants to actually understand how it's put together so he can maintain, extend, and debug it himself — instead of treating it as a black box.

## Success looks like
- Marshall can explain the difference between `controllers/` and `src/` and why they exist
- Marshall can trace how a request flows: route → controller → service → Supabase table
- Marshall can add a new endpoint to an existing module without asking for help
- Marshall can read a DTO and a service and say what each piece does
- Marshall can explain what the `Database` class wraps and why a "read" returns the DB object's result

## Constraints
- Workspace is the actual `koso_server` codebase — teaching happens against real code, not toy examples
- User learns best through concrete walkthroughs tied to files he can open
- Single session so far; lessons (preferable local file) and one interactive quiz are the deliverable

## Out of scope
- Deep TypeScript language features (generics, etc.) beyond what the code uses
- NestJS beyond this project (no testing, DI deep dives)
- The frontend / payment gateway internals (Paystack API specifics) in detail — that's a later session
- AI/LLM features (PRD generation, resume builder) — phase two per the spec