---
name: open-pr
description: Open a pull request from a feature branch into staging once the work is committed and pushed. Use when the user says "open a PR", "merge this", "send it to staging", or a feature branch is ready for review.
---

# Open a pull request into staging

Feature branches always go into `staging`, never straight into `main`.

## Steps

1. Make sure the branch is ready:

   ```bash
   git branch --show-current     # must be feat/..., fix/..., etc. Not main or staging.
   git status --short            # must be empty
   npm run check                 # lint, typecheck, tests, build
   ```

2. Bring in the latest `staging` so the pull request is clean:

   ```bash
   git fetch origin
   git merge origin/staging
   ```

   Resolve any conflicts, run `npm run check` again, and commit the merge.

3. Push:

   ```bash
   git push -u origin HEAD
   ```

4. Open the pull request with base `staging`.

   With the GitHub CLI (`gh`):

   ```bash
   gh pr create --base staging --fill
   ```

   Without it, give the user this link to open it in the browser (replace the branch name):

   ```
   https://github.com/drSabine/personal-student-catechist/compare/staging...feat/lesson-02?expand=1
   ```

   Fill in the template: what changed, why, and the checklist.

5. Wait for the four CI checks (Lint, Typecheck, Test, Build) to pass. Vercel also posts a preview link for the branch; check it on a phone width and a laptop width.

6. Merge with **Squash and merge**, so each feature is one clean commit on `staging`. The squash title must follow the commit format, for example `feat(lesson-02): add the sharing circle activity`. Then delete the branch.

7. Locally, go back to an up to date `staging`:

   ```bash
   git switch staging
   git pull --ff-only
   git branch -d feat/lesson-02
   ```
