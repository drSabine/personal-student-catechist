# Game saves

A game's progress is saved so a refresh, a closed tab, or another laptop picks up where the class left off. A demo must never lose its place.

```
store (zustand persist) -> SyncedStorage -> HttpSaveRepository -> /api/saves/[lessonId]/[activityId] -> Upstash Redis
       (browser)            (browser)          (browser)                   (server)                      (server)
```

- Each activity has one save, shared by every device. It is the same Redis as reflections, under `saves:<lesson>/<activity>`.
- `SyncedStorage` writes to this device at once and to the server a moment later, so a burst of changes is one request. If the server cannot be reached it keeps the copy here, says "Saved on this laptop", and tries again.
- When the page opens, the newer of this device's save and the server's wins.
- The last change is sent with `keepalive` when the tab closes.
- A save is checked twice before it is trusted: `readSave` on the server refuses anything that is not a small save, and the game reads the state through its own `sanitizeProgress`.
- Without Redis settings, `npm run dev` keeps saves in memory. With a `.env`, the dev server uses the real Redis, so reset the town after testing.

## Changing what a game saves

Add the field to the progress type and give it a default in `sanitizeProgress`. Older saves then load with the default, so there is no need to bump the save version. When a field's range shrinks, clamp old values instead of dropping them, so a class never loses what it finished.

## Adding saves to another activity

Make its store with `persist` and a `StateStorage` that calls a `SyncedStorage`, as `features/bayan/session.ts` does. The API accepts any activity that exists in a lesson.

## Privacy

Like reflections, the API has no login: anyone with the link can read or replace a save. Saves hold only progress, never names.
