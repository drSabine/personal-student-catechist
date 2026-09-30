---
name: commit
description: Commit work in this repo the right way. Only when the user asks, one commit per finished piece of work, type(scope) messages, checks passing, no attribution lines. Use whenever you are about to run git commit here, or the user says "commit", "save this", or "push this".
---

# Commit

## When to commit

- **Only when the user asks.** Making changes is not a reason to commit. Rounds of feedback on the same thing ("move this", "now smaller", "undo that") are one piece of work, so they become one commit at the end, not one commit per round.
- One commit per finished idea. A new feature with its tests and docs is one commit. An unrelated fix spotted on the way is a second commit.
- If the last commit is not pushed yet and the new change belongs to it, fold it in instead of adding a commit:

  ```bash
  git add <files>
  git commit --amend --no-edit
  ```

- If it is already pushed on your own feature branch, leave it. The branch is squash-merged into `staging`, so `staging` still gets one commit per feature.
- Never rewrite `main` or `staging` history.

## Before committing

1. Check the branch. Never commit on `main` or `staging`; if you are on one, use the `start-branch` skill first.

   ```bash
   git branch --show-current
   ```

2. Look at what changed and stage only what belongs together.

   ```bash
   git status --short
   git diff
   git add <files>
   ```

   Never stage `.env*`, secrets, `node_modules`, or `.next`.

## Message

Format: `type(scope): summary`. **The scope is required.** The `commit-msg` hook rejects anything else.

| Type | Use for |
| --- | --- |
| `feat` | something new a pupil or teacher can see or use |
| `fix` | a bug fix |
| `docs` | docs only |
| `style` | formatting only, no behavior change |
| `refactor` | code change, same behavior |
| `perf` | faster or lighter |
| `test` | tests only |
| `build` | dependencies, build setup, git hooks |
| `ci` | GitHub Actions |
| `chore` | anything else, including releases |

| Scope | Covers |
| --- | --- |
| `ui` | shared components, layout, sidebar, pages in general |
| `design` | tokens, colors, fonts, spacing |
| `brick-wall` | the Build Our Wall activity |
| `reflections` | writing and reading reflections, the storage seam |
| `lessons` | lesson system in general (registry, runner) |
| `lesson-01`, `lesson-02`, ... | one lesson's content |
| `core` | plain TypeScript classes in `src/core` |
| `content` | site words, lesson list |
| `a11y` | accessibility |
| `perf` | performance work |
| `deps` | package updates |
| `git` | hooks, branch rules |
| `ci` | workflows |
| `claude` | `.claude/` skills and settings, `CLAUDE.md` |
| `workflow` | the branch and release guide |
| `release` | a staging into main release |

Summary: lower case start, imperative ("add", not "added"), no period, whole first line 72 characters or fewer. Add a body after a blank line only when the why is not obvious. No `Co-Authored-By` or other attribution lines. No em dashes or emoji.

Examples:

```
feat(brick-wall): mix lying and standing bricks
fix(ui): keep the reflection form beside its lesson card
feat(lesson-02): add the sharing circle activity
docs(workflow): explain the release flow
build(deps): update next to 16.4
chore(release): lesson 2
```

## Commit and push

```bash
git commit -m "feat(ui): add a collapsible control card"
git push -u origin HEAD
```

The `pre-commit` hook runs lint, typecheck, and tests; `pre-push` runs the build. If a hook fails, fix the problem and try again. Do not use `--no-verify` unless the user asks for it. Pushing to `main` or `staging` is blocked; they only change through pull requests (skills: `open-pr`, `release`).
