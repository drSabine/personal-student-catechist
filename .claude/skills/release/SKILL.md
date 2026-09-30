---
name: release
description: Release staging to production by merging staging into main, which Vercel deploys. Use when the user says "release", "deploy", "ship it", "push to prod", or "merge staging to main".
---

# Release staging to main

`main` is production. Vercel deploys every change on `main`. Only `staging` is merged into `main`, through a pull request. The "Release guard" check fails any other source branch.

## Steps

1. Check `staging` is healthy:

   ```bash
   git switch staging
   git pull --ff-only
   npm run check
   ```

   Also check the Vercel preview of `staging` on a phone width and a laptop width.

2. See what will go out:

   ```bash
   git fetch origin
   git log --oneline origin/main..origin/staging
   ```

   If nothing is listed, there is nothing to release. Tell the user and stop.

3. Open the release pull request, base `main`, head `staging`. Title it `chore(release): <short summary>`, for example `chore(release): lesson 2`.

   With `gh`:

   ```bash
   gh pr create --base main --head staging --title "chore(release): lesson 2" --body "$(git log --oneline origin/main..origin/staging)"
   ```

   Without it, give the user this link:

   ```
   https://github.com/drSabine/personal-student-catechist/compare/main...staging?expand=1
   ```

4. Wait for CI and the Release guard to pass.

5. Merge with **Create a merge commit** (not squash, not rebase). This keeps `main` and `staging` sharing the same history, so the next release has no conflicts.

6. Watch the production deployment in Vercel and open the live site once it is ready.

After the merge, GitHub shows `staging` as one commit behind `main` (the merge commit). That is normal; the next release still merges cleanly. Do not push to `staging` or `main` directly to "fix" it.
