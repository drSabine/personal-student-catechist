---
name: commit
description: Commit work in this repo the right way. Small focused commits, Conventional Commit messages, checks passing, no attribution lines. Use whenever you are about to run git commit here, or the user says "commit", "save this", or "push this".
---

# Commit

## Before committing

1. Check the branch. Never commit on `main` or `staging`; if you are on one, use the `start-branch` skill first.

   ```bash
   git branch --show-current
   ```

2. Look at what changed and stage only what belongs together. One idea per commit (for example: the new lesson content in one commit, a bug fix you noticed in another).

   ```bash
   git status --short
   git diff
   git add <files>
   ```

   Never stage `.env*`, secrets, `node_modules`, or `.next`.

## Message

Format: `type(scope): summary`. The scope is optional.

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
- Summary: lower case start, imperative ("add", not "added"), no period, 72 characters or fewer for the whole first line.
- Scope is usually the lesson or feature: `lesson-02`, `brick-wall`, `reflections`, `ci`.
- Add a body after a blank line only when the why is not obvious.
- **No `Co-Authored-By` or any attribution lines.** The `commit-msg` hook rejects them.
- Follow the design rules in the message too: no em dashes, no emoji.

Examples:

```
feat(lesson-02): add the sharing circle activity
fix(brick-wall): keep the brick under the finger on iPad
docs: explain the release flow
chore(ci): cache npm in the build job
```

## Commit

```bash
git commit -m "feat(lesson-02): add the sharing circle activity"
```

The `pre-commit` hook runs lint, typecheck, and tests. If it fails, fix the problem and commit again. Do not use `--no-verify` unless the user asks for it.

## Push

```bash
git push -u origin HEAD
```

The `pre-push` hook runs the production build, and GitHub Actions runs all checks again. Pushing straight to `main` or `staging` is blocked; changes reach them only through pull requests (skills: `open-pr`, `release`).
