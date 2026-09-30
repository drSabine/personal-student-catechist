# Workflow: branches, commits, checks, and releases

## The three kinds of branches

| Branch | What it is | Who changes it |
| --- | --- | --- |
| `main` | Production. Vercel deploys it to the live site. | Only a pull request from `staging` |
| `staging` | Where finished work collects and gets tried together. Vercel gives it a preview link. | Only pull requests from work branches |
| `feat/...`, `fix/...`, `docs/...`, `refactor/...`, `chore/...` | One piece of work, for example `feat/lesson-02`. Short-lived. | You |

```
feat/lesson-02 ──PR (squash)──▶ staging ──PR (merge commit)──▶ main ──▶ Vercel production
```

## Day to day

1. **Start** from the latest `staging`:

   ```bash
   git switch staging
   git pull --ff-only
   git switch -c feat/lesson-02
   ```

2. **Commit** small steps with a clear message (format below). The hooks check each one.

3. **Push** and open a pull request into `staging`:

   ```bash
   git push -u origin HEAD
   ```

   Then on GitHub, open a pull request with base `staging`. CI runs, and Vercel posts a preview link. Check it on a phone and a laptop. Merge with **Squash and merge**.

4. **Release** when `staging` is ready: open a pull request from `staging` into `main` and merge it with **Create a merge commit**. Vercel deploys `main` to production.

In Claude Code, the skills `start-branch`, `commit`, `open-pr`, and `release` walk through each step.

## Commit messages

```
type(scope): short summary in the present tense
```

| Type | Use for |
| --- | --- |
| `feat` | a new lesson, activity, or feature |
| `fix` | a bug fix |
| `docs` | docs only |
| `style` | formatting only |
| `refactor` | a code change with the same behavior |
| `perf` | faster or lighter |
| `test` | tests only |
| `build` | dependencies or build setup |
| `ci` | GitHub Actions |
| `chore` | anything else, including releases |

Examples: `feat(lesson-02): add the sharing circle activity`, `fix(brick-wall): keep the brick under the finger on iPad`.

Rules: first line 72 characters or fewer, no period at the end, no `Co-Authored-By` lines, no em dashes or emoji.

## Checks

### On your computer (git hooks)

`npm install` turns on the hooks in `.githooks/` (through the `prepare` script).

| Hook | When | What |
| --- | --- | --- |
| `pre-commit` | every commit | stops commits on `main` or `staging`, then runs lint, typecheck, and tests |
| `commit-msg` | every commit | checks the message format above |
| `pre-push` | every push | stops pushes to `main` or `staging`, then runs the production build |

Run everything by hand with `npm run check`.

In an emergency, `git commit --no-verify` or `git push --no-verify` skips the hooks. CI still runs on GitHub, so broken code cannot reach `staging` or `main` once the branch rules below are on.

### On GitHub (Actions)

`.github/workflows/ci.yml` runs on every push to any branch and on every pull request into `staging` or `main`. Four checks run side by side:

| Check | Command | Catches |
| --- | --- | --- |
| Lint | `npm run lint` | code style problems and risky patterns |
| Typecheck | `npm run typecheck` | type errors (the "analyze" step) |
| Test | `npm test` | broken rules in the lesson logic |
| Build | `npm run build` | anything that stops the site from building |

`.github/workflows/release-guard.yml` adds one more check on pull requests into `main`: **Only staging into main**.

### Where the tests live

Tests sit next to the code they test, as `*.test.ts` files (for example `BrickWallActivity.test.ts`). They are already separate files: the site never imports them, so they are not shipped, and Vitest only picks up files ending in `.test.ts`. Keeping them next to the code makes it easy to see what is tested.

## One-time setup on GitHub and Vercel

These need an owner of the repository, in the browser.

### Branch rules (GitHub)

Settings, then Rules, then Rulesets, then New branch ruleset. Make two rulesets.

**`main`**

- Target: `main`
- Restrict deletions; Block force pushes
- Require a pull request before merging (allowed merge method: Merge)
- Require status checks to pass: `Lint`, `Typecheck`, `Test`, `Build`, `Only staging into main`
- Require branches to be up to date before merging

**`staging`**

- Target: `staging`
- Restrict deletions; Block force pushes
- Require a pull request before merging (allowed merge method: Squash)
- Require status checks to pass: `Lint`, `Typecheck`, `Test`, `Build`

Also in Settings, General: tick **Automatically delete head branches**.

The check names appear in the list after CI has run once.

### Vercel

In the Vercel project, Settings, then Git (or Environments):

- Production branch: `main`
- Preview deployments: on for all other branches, so `staging` and every pull request get a preview link.
