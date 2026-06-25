# Lessons Archive

A growing knowledge base of problems solved in the Meridian 3PL codebase. Each
lesson documents one real problem we hit and worked through: what the symptom
was, how it was diagnosed, and how it was fixed.

The goal is not just to record the fix. It is to capture the **reasoning** — the
clues that pointed at the root cause, the mental model that made the bug make
sense, and the trade-offs of the solution — so that a future agent or developer
can learn from it and recognise the same class of problem faster next time.

## Naming convention

Each lesson lives in its own file named:

```
NNNN-short-kebab-title.md
```

- `NNNN` is a zero-padded, 4-digit sequence number starting at `0001`.
- The title is a short, kebab-cased description of the problem.

Example: `0001-scroll-resets-to-top-on-navigation.md`

## Required structure

Every lesson uses the same section headings, in this order:

- `# Lesson NNNN — <one-line title>`
- `## Problem` — the user-reported symptom, in plain terms.
- `## Environment` — the relevant stack, files, and context.
- `## Root Cause` — what was actually going wrong, explained clearly.
- `## Approach` — how the problem was diagnosed.
- `## Solution` — the change, ideally with BEFORE / AFTER code.
- `## Why It Works` — why the fix addresses the root cause.
- `## Gotchas / Notes` — caveats, trade-offs, and related pitfalls.
- `## Verification` — how to confirm the fix works.

## Index

| Number | Title | Area | Date |
| ------ | ----- | ---- | ---- |
| [0001](0001-scroll-resets-to-top-on-navigation.md) | New page keeps the previous page's scroll position | Navigation / Smooth scroll (Lenis + SvelteKit) | 2026-06-15 |
| [0002](0002-animating-form-rows-on-add-remove.md) | Animating form rows when fields are added or removed | Admin UI / List animation (slide + grid rows) | 2026-06-15 |

New lessons should be appended to the table above as they are written.
