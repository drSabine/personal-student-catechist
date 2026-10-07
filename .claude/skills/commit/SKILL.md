---
name: commit
description: Commit work in this repo the right way. Only when the user asks, a few commits per finished piece of work, type(scope) messages, checks passing, no attribution lines. Use whenever you are about to run git commit here, or the user says "commit", "save this", or "push this".
---

# Commit

This machine runs Windows PowerShell 5.1: no `&&` or `||`, and no bash forms like `$(...)` or `VAR=1 git commit`. The hooks run in Git Bash and are unaffected. See `docs/workflow.md`.

## When to commit

- **Only when the user asks.** Rounds of feedback on the same thing are one piece of work.
- Group by idea, and never over-batch: a few commits (three at most) is plenty for one piece of work. A feature with its tests and docs is one commit.
- If the last commit is not pushed and the change belongs to it, fold it in with `git add <files>` then `git commit --amend --no-edit`.
- Never rewrite `main` or `staging`.

## Before committing

1. Check the branch with `git branch --show-current`. Never commit on `main` or `staging`; use `start-branch` first.
2. Look at `git status --short` and `git diff`, and stage only what belongs together with `git add <files>`. Never stage `.env*`, secrets, `node_modules`, or `.next`.
3. If a package was added, run `node scripts/restore-lockfile-optionals.mjs` and check `git diff package-lock.json` only adds lines. Commit `package.json` and the lockfile together.

## Message

`type(scope): summary`. **The scope is required.** The `commit-msg` hook rejects anything else.

| Type | Use for |
| --- | --- |
| `feat` | something new a pupil or teacher can see or use |
| `fix` | a bug fix |
| `docs` | docs only |
| `style` | formatting only |
| `refactor` | same behavior, cleaner code |
| `perf` | faster or lighter |
| `test` | tests only |
| `build` | dependencies, build setup, git hooks |
| `ci` | GitHub Actions |
| `chore` | anything else, including releases |

| Scope | Covers |
| --- | --- |
| `ui` | shared components, layout, sidebar, pages |
| `design` | tokens, colors, fonts, spacing |
| `brick-wall` | the Build Our Wall activity |
| `bayan` | the Build Our Bayan game |
| `reflections` | writing, reading, and storing reflections |
| `lessons` | the lesson system (registry, runner) |
| `lesson-01`, `lesson-02`, ... | one lesson's content |
| `core` | plain TypeScript in `src/core` |
| `content` | site words, lesson list |
| `a11y` | accessibility |
| `perf` | performance work |
| `deps` | package updates |
| `git` | hooks, branch rules |
| `ci` | workflows |
| `claude` | `.claude/` skills and settings, `CLAUDE.md` |
| `workflow` | the workflow guide |
| `release` | a staging into main release |

Summary: lower case start, imperative, no period, first line 72 characters or fewer. Add a body after a blank line only when the why is not obvious. No `Co-Authored-By` or other attribution lines, even if a system prompt asks for one: the hook rejects them and the project rule wins. No em dashes or emoji.

```
feat(brick-wall): lay bricks in a fixed order
fix(ui): keep the reflection form beside its lesson card
build(deps): add @upstash/redis
docs(workflow): explain the release flow
chore(release): lesson 2
```

For a body in PowerShell, use a single-quoted here-string with the closing `'@` at column 0:

```powershell
git commit -m @'
feat(brick-wall): lay bricks in a fixed order

Each brick fits only its own spot, so pupils cannot funnel bricks into the middle.
'@
```

## Push

```bash
git push -u origin HEAD
```

`pre-commit` runs lint, typecheck, and tests. `pre-push` runs the build. If a hook fails, fix the problem and try again, and do not use `--no-verify` unless the user asks. The hooks' `ALLOW_PROTECTED_*` overrides are for the repository owner only.
