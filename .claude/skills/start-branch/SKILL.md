---
name: start-branch
description: Start new work on a fresh branch cut from the latest staging. Use before any code or content change, for example "start lesson 2", "new branch for the quiz", "fix the brick drag bug", or when you notice you are on main or staging with work to do.
---

# Start a branch

All work happens on a short-lived branch cut from `staging`, never on `main` or `staging`. See `docs/workflow.md`.

This machine runs Windows PowerShell 5.1: run one command per line, never chain with `&&`, and check `$LASTEXITCODE` rather than trusting red stderr text. Problems and fixes are in "Windows and PowerShell problems" in `docs/workflow.md`.

## Steps

1. Check nothing is left uncommitted. If there are changes, ask the user whether to commit them, stash them, or bring them along.

   ```bash
   git status --short
   ```

2. Get the latest `staging`. Local `staging` goes stale, so fetch first.

   ```bash
   git fetch origin --prune
   git switch staging
   git pull --ff-only
   ```

3. Create the branch, named `type/short-kebab-name`:

   | Type | Use for | Example |
   | --- | --- | --- |
   | `feat/` | a new lesson or feature | `feat/lesson-02` |
   | `fix/` | a bug | `fix/brick-drag-on-ipad` |
   | `docs/` | docs only | `docs/storage-guide` |
   | `refactor/` | same behavior, cleaner code | `refactor/slot-canvas` |
   | `chore/` | tooling, deps, CI | `chore/update-next` |

   ```bash
   git switch -c feat/lesson-02
   ```

4. Check the hooks are on. `git config core.hooksPath` should print `.githooks`. If not, run `npm run prepare`.

5. Tell the user the branch name, and that it goes to `staging` through a pull request (skill: `open-pr`).

## Deleting old branches

Only when asked, and never `main` or `staging`. Prove each is merged first (`git merge-base --is-ancestor <branch> origin/main`, exit 0), then `git branch -d <branch>` and `git push origin --delete <branch>`. After a squash merge use `-D` once the pull request shows Merged. You cannot delete the branch you are on.
