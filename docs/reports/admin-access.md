# Report: a teacher-only page for managing reflections

Status: proposal, not built yet. Written 30 September 2026.

## The problem

Anyone who opens **Read reflections** can press the trash icon and remove an entry. On a shared classroom laptop, or a phone passed around, a pupil could delete someone else's reflection by accident or on purpose.

Today this is contained, because reflections live only in the browser tab (`InMemoryReflectionRepository`), so nobody can delete anything on another device. It becomes a real problem as soon as reflections are stored for good, which is the next step you planned.

## What we want

1. Pupils can **write** reflections.
2. Pupils (and the class on the TV) can **read** reflections, but cannot remove them.
3. Only the teacher can **remove** reflections, from a page only the teacher can open.
4. No accounts for pupils, no sign-up flow, nothing heavy.

## Options

| Option | How it works | Safe? | Effort | Cost |
| --- | --- | --- | --- | --- |
| A. Hidden link | An unlisted `/admin` page | No. Anyone who finds the link gets in | Tiny | Free |
| B. Passcode checked in the browser | The page asks for a code and compares it in JavaScript | No. The code ships to every visitor's browser | Small | Free |
| **C. Password checked on the server** | `/admin` asks for a password; the server checks it against a secret stored in Vercel; every delete is checked on the server too | **Yes**, for a classroom site | Small to medium | Free |
| D. Sign in with Google | Real login (for example Auth.js), limited to your email | Yes | Medium to large | Free |
| E. Vercel password protection | Vercel puts a password on the whole deployment | Yes, but locks pupils out too | Tiny | Paid plan |

A and B only hide the button. They do not stop a determined pupil. E protects the whole site, not one page. D is the most robust but is more than a single-teacher site needs today.

## Recommendation: option C

A single teacher password, checked on the server in two places.

### 1. Split reading from managing

- `/lessons/[lessonId]/reflections` stays as it is, **without** the trash icon. Pupils and the TV use this.
- New page `/admin/reflections`: the same cards **with** the trash icon, plus a lesson picker at the top. Only the teacher can open it.

### 2. Guard the admin page

- Store the password as a secret environment variable in Vercel: `ADMIN_PASSWORD` (and in `.env.local` on your laptop, which git already ignores).
- A small `/admin/login` page with one password field. On submit, a **server action** compares it with `ADMIN_PASSWORD`. If it matches, it sets a signed, `httpOnly`, `secure` cookie that lasts a few hours.
- `src/proxy.ts` (Next.js 16's name for middleware) sends anyone without that cookie from `/admin/*` to `/admin/login`. This is only a quick first gate; the Next.js docs are clear that proxy is not a full authorization check, so step 3 matters.

### 3. Guard every delete on the server

- Removing a reflection goes through a server action (or `DELETE /api/reflections/[id]`) that **checks the cookie again** before it calls `repository.delete()`.
- Without a valid cookie it refuses, even if someone calls it directly. This is the check that actually protects the data.

### 4. Fit it into the storage seam

- `ReflectionRepository` does not change. Your real repository (the one you are writing) runs on the server, and only the admin server action may call `delete`.
- Pupils' pages only need `save` and `listByLesson`.

## What it would touch

| File | Change |
| --- | --- |
| `src/features/reflections/ReflectionCards.tsx` | add a `canRemove` prop; the pupil page passes `false` |
| `src/app/admin/login/page.tsx` | new: password form |
| `src/app/admin/reflections/page.tsx` | new: cards with remove, lesson picker |
| `src/app/admin/actions.ts` | new: `login`, `logout`, `removeReflection` server actions with the password and cookie checks |
| `src/proxy.ts` | new: send `/admin/*` without the cookie to the login page |
| `.env.local`, Vercel settings | `ADMIN_PASSWORD`, and a random `ADMIN_SESSION_SECRET` for signing the cookie |
| `docs/reflections-storage.md` | explain that `delete` is admin-only |

No new packages are needed. Next.js has cookies, server actions, and proxy built in.

## Good to know

- Use a password you do not use anywhere else, and change it in Vercel if a pupil ever sees you type it.
- Log out on shared laptops. The cookie should also expire on its own after a few hours.
- The admin page is not linked from the pupils' menu. You open it by typing the address.
- Adding real storage and this admin page belong together. The admin page only matters once reflections are saved for good.
- Later, if more teachers use the site, move to option D (sign in with Google limited to a list of teacher emails). The page layout from this plan stays the same.

## Next step

When the real repository is ready, build option C on a branch such as `feat/reflections-admin`, and test it on the Vercel preview for `staging` before releasing to `main`.
