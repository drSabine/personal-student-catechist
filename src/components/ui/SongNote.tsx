import type { SongReference } from "@/core/lesson/Lesson";

/** Names the song played in class, for reference. The app does not play it. */
export function SongNote({ songs }: { songs: readonly SongReference[] }) {
  if (songs.length === 0) return null;
  return (
    <p className="text-sm text-muted">
      Song:{" "}
      {songs.map((song, i) => (
        <span key={song.url}>
          {i > 0 && ", "}
          <a
            href={song.url}
            target="_blank"
            rel="noreferrer"
            className="text-ink underline decoration-hairline decoration-2 underline-offset-4 hover:decoration-gold"
          >
            {song.title}
          </a>
        </span>
      ))}
    </p>
  );
}
