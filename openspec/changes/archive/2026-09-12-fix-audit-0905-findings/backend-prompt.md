# Backend prompt for Wisaw.cdk (copy-paste into the backend workspace)

> This is a **copy-paste prompt for the Wisaw.cdk workspace** (`/Users/dmitry/hacks/wisaw/Wisaw.cdk`).
> Per project rules the frontend repo does not modify backend files. Paste the block below
> into an agent session in the backend workspace to apply the change.

---

## Prompt

Add a `watchersCount` (Int) field to the `getPhotoDetails` GraphQL query so the WiSaw
mobile app can display the true bookmark/watcher count on the expanded photo card.

**Context (already verified against the codebase):**

- Resolver file: `lambda-fns/controllers/photos/getPhotoDetails.ts`
- It currently returns `{ comments, recognitions, isPhotoWatched, waveName, waveUuid }`.
- A `getWatchedCount.ts` controller already exists in the same directory that returns the
  watcher count for a photo — reuse it (or its underlying query) rather than writing a new
  count query.
- The `getPhotoDetails` query type is declared in `graphql/schema.graphql` and wired in
  `lambda-fns/index.ts` / `lib/resources/resolvers.ts`.

**Change:**

1. In `getPhotoDetails.ts`, fetch the watched count in parallel with the existing
   `Promise.all([...])` (add it to the tuple) and include it in the returned object as
   `watchersCount` (a non-negative `Int`, default `0` when the photo has no watchers).
2. Add `watchersCount: Int!` to the `getPhotoDetails` return type in `graphql/schema.graphql`
   (and any matching generated types / resolver mapping in `lambda-fns/index.ts`
   if the field list is explicit there).
3. Confirm the field serializes as a JSON integer.

**Do NOT** change the behavior of any other field. Keep `comments`, `recognitions`,
`isPhotoWatched`, `waveName`, and `waveUuid` exactly as they are.

**Validation:**
- Run the project's lint/typecheck.
- Call `getPhotoDetails` for a photo that has ≥1 watcher and confirm `watchersCount`
  reflects the real count; for an unwatched photo confirm it is `0`.

---

## Why the frontend needs this

- `src/components/Photo/reducer.js` `getPhotoDetails` now requests `watchersCount`.
- `src/components/Photo/index.js` renders `photoDetails?.watchersCount || 0` as the
  expanded-card bookmark count (line ~744). Until this backend field exists, the app
  degrades gracefully and shows `0`.

## Related (separate, optional) note for the backend team

- The upload flow PUTs to S3 key `${photoId}.upload` with `Content-Type: image/webp`, while
  the `Photo` model (`lambda-fns/models/photo.ts`) serves `imgUrl` as
  `https://${S3_IMAGES}/${id}.webp`. The upload-URL resolver
  (`lambda-fns/controllers/photos/generateUploadUrl.ts`) stores `Key` and `ContentType`
  independently, so the content-type fix is self-sufficient. If the `.webp` vs `.upload`
  key mismatch is not already handled by a CDN rewrite/copy step, the team should confirm
  how `imgUrl` resolves to the uploaded object. No frontend change is required for the
  content-type fix.
