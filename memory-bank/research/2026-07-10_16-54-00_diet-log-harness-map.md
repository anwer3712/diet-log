---
title: "diet-log – Harness Map"
phase: Research
date: "2026-07-10 16:54:00"
owner: "agent"
tags: [research, harness, diet-log]
---

## Summary

`diet-log` has **no mechanical harness**. There is no package manager, no test
runner, no linter, no formatter, no CI workflow, no architecture-boundary
tool, and no git hooks. The repository is five standalone HTML files plus one
shared JS module, deployed as-is to GitHub Pages. Every safeguard in this repo
is a **social/process control** (a doc a human is supposed to read), not a
mechanical gate a machine enforces.

## Canonical Entry Point

None exists. There is no `package.json`, `Makefile`, `justfile`, `pyproject.toml`,
or any task runner. `CONTRIBUTING.md:16-20` describes the only "process":

```
1. Fork the repository
2. Make your changes to `index.html` (single self-contained file — no build step)
3. Test in a mobile browser (primary target is smartphone use at bedside)
4. Open a pull request with a clear description
```

There is nothing to `run` — "test" here means a human opening the page in a
phone browser, not an automated check.

## Harness Layers (as implemented)

### Layer 1: Local checks
- **None.** No lint config (`.eslintrc*`, `.prettierrc*`), no `package.json`
  scripts, confirmed via full-repo search for config/dotfiles — none found
  besides `.git/`.

### Layer 2: Architecture boundaries
- **None.** No Import Linter / dependency-cruiser / module-boundary config.
  The "architecture" is simply: `care-tasks.js` is a shared module referenced
  by `admin.html` (`admin.html` uses `careTodayStr()` etc. from it); the four
  other HTML files (`index.html`, `admin-settings.html`, `anak.html`,
  `report.html`) are otherwise independent, self-contained pages with inline
  `<script>` blocks. Nothing enforces this split beyond convention.

### Layer 3: Structural rules
- **None.** No ast-grep/semgrep/custom lint rules found anywhere in the tree.

### Layer 4: Behavioral verification
- **None.** No test framework (`describe(`, `it(`, `test(`), no
  `console.assert` usage, no snapshot/golden directories. Verified by
  grepping all `*.html`/`*.js` files for common test/assert idioms — zero
  hits that were actual tests (only false-positive matches on `.test()`
  regex calls used for string validation, e.g. `index.html:407`,
  `report.html:171`, unrelated to a test framework).

### Layer 5: Docs ratchet
- **None.** No docs-link checker, nav validator, or frontmatter/allowlist
  check. `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` are free-form
  prose with no automated validation.

### Layer 6: CI matrix
- **None.** No `.github/workflows/`, no `.gitlab-ci.yml`, no other CI config
  anywhere in the repo. GitHub Pages presumably serves the repo's static
  files directly (per `README.md` "Hosting: GitHub Pages (free)"), with no
  build or gate step in between — a raw push to the default branch goes
  live.

### Layer 7: Evidence workflow
- **None.** No session logs, chunk docs, replay/diff playbooks, or evidence
  index directories. Git commit messages (bilingual, descriptive — see
  `git log --oneline`) are the only record of what changed and why.

### Layer 8: Operator surface
- **None** in the automation sense (no `AGENTS.md`, no `.codex/`, no
  repo-local skills/plugins). The closest analogue is `CONTRIBUTING.md`,
  which encodes five **design principles** a human contributor (or an
  agent) is expected to self-enforce, since nothing else will:
  1. Single file, zero build (self-hosting via fork)
  2. Mobile-first (bedside, one-handed use)
  3. Bilingual always (every user-facing string needs zh-Hant + Indonesian)
  4. **Safety warnings are non-negotiable** — medical alert logic (fluid
     limits, bowel-movement alerts, standing protocols) must never be
     weakened without medical justification
  5. Free forever (no paid-service dependencies)

  Principle 4 is the highest-stakes one: alert thresholds (e.g. the
  1,200 c.c. fluid-overload warning, the 60–72h constipation-alert window
  in `index.html`) are safety-critical and currently have zero test coverage
  protecting them from regression — the only guard is a human reviewer
  reading the diff.

## Source Index

- `README.md` — project description, tech stack (vanilla HTML/JS/Tailwind,
  Google Apps Script backend, GitHub Pages hosting), explicitly states
  "No frameworks. No build tools. No dependencies to install."
- `CONTRIBUTING.md:16-20` — the entire contribution "process" (fork, edit,
  manual mobile test, open PR)
- `CONTRIBUTING.md:22-28` — five design principles, the closest thing to
  enforced policy, but enforced only by human PR review
- `CONTRIBUTING.md:30-32` — medical disclaimer; alert thresholds are
  physician-guided for a specific patient and should not be presented as
  universal
- `CODE_OF_CONDUCT.md` — standard community conduct policy, unrelated to
  code correctness
- `index.html` (1296 lines) — main tracking app; contains the safety-critical
  alert logic (fluid overload, constipation warnings, urine-target algorithm)
  with no accompanying tests
- `care-tasks.js` (211 lines) — shared helpers (date formatting, reminder
  logic) consumed by `admin.html`
- `admin.html`, `admin-settings.html`, `anak.html`, `report.html` — other
  self-contained pages, each with their own inline `<script>`, no shared
  build or lint step tying them together
- `.git/hooks/` — only sample hooks present (`*.sample`), none installed/active

## Observed Command Chain

There is no command chain. Nothing runs automatically before a merge or
deploy. The full "gate" a change passes through today is:

1. A human edits an `.html`/`.js` file directly.
2. A human opens the page in a mobile browser and eyeballs it.
3. A human opens a PR with a description.
4. A human (maintainer) reads the diff and merges.
5. GitHub Pages serves whatever is on the default branch — no build step.

## Implication (not a recommendation, just the gap this map exposes)

Because there is no Layer 4 (behavioral verification), the safety-critical
logic called out by the project's own design principle #4 — fluid-overload
threshold, constipation-alert timing window, urine-target algorithm — has no
mechanical protection against silent regression. Any harness work here would
start from zero, not from hardening an existing layer.
