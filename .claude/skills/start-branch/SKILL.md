---
name: start-branch
description: Start new work on a fresh branch cut from the latest staging. Use before any code or content change, for example "start lesson 2", "new branch for the quiz", "fix the brick drag bug", or when you notice you are on main or staging with work to do.
---

# Start a branch

All work happens on a short-lived branch cut from `staging`. Never work on `main` or `staging` directly. See `docs/workflow.md`.

## Steps

1. Make sure nothing is left uncommitted:

   ```bash
   git status --short
   ```

   If there are changes, stop and ask the user whether to commit them on their current branch, stash them, or bring them along.

2. Get the latest `staging`:

   ```bash
   git switch staging
   git pull --ff-only
   ```

3. Create the branch. Name it `type/short-kebab-name`:

   | Type | Use for | Example |
   | --- | --- | --- |
   | `feat/` | a new lesson or feature | `feat/lesson-02` |
   | `fix/` | a bug | `fix/brick-drag-on-ipad` |
   | `docs/` | docs only | `docs/storage-guide` |
   | `refactor/` | code change, same behavior | `refactor/slot-canvas` |
   | `chore/` | tooling, deps, CI | `chore/update-next` |

   ```bash
   git switch -c feat/lesson-02
   ```

4. Make sure the hooks are on (they are after `npm install`):

   ```bash
   git config core.hooksPath
   ```

   It should print `.githooks`. If not, run `npm run prepare`.

5. Tell the user the branch name, and that it will go to `staging` through a pull request (skill: `open-pr`).
