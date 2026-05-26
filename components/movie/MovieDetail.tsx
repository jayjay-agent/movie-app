import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { RawMovie } from "@/lib/algolia";

type Props = {
  movie: RawMovie;
};

export function MovieDetail({ movie }: Props) {
  const ratingValue =
    typeof movie.rating === "number"
      ? movie.rating
      : typeof movie.score === "number"
        ? movie.score
        : null;

  return (
    <article className="mx-auto grid max-w-[1200px] gap-10 px-6 py-12 lg:grid-cols-[340px_1fr]">
      <div className="space-y-4">
        <div className="aspect-[2/3] w-full overflow-hidden border border-border bg-muted">
          {movie.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={movie.image}
              alt={`${movie.title} poster`}
              className="size-full object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="size-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, var(--muted), var(--muted) 8px, var(--background) 8px, var(--background) 16px)",
              }}
            />
          )}
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/search">Back to search</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <header className="space-y-4">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-muted-foreground">
            Movie · {movie.objectID}
          </p>
          <h1 className="font-heading text-3xl font-semibold uppercase leading-[1.05] tracking-tight lg:text-5xl">
            {movie.title}
          </h1>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {movie.year ? (
              <Stat label="Year" value={String(movie.year)} />
            ) : null}
            {ratingValue !== null ? (
              <Stat label="Rating" value={`★ ${ratingValue.toFixed(1)}`} />
            ) : null}
            {movie.genre?.length ? (
              <Stat label="Genre" value={movie.genre.join(" · ")} />
            ) : null}
            {movie.actors?.length ? (
              <Stat
                label="Top actors"
                value={movie.actors.slice(0, 4).join(", ")}
              />
            ) : null}
          </dl>
        </header>

        {movie.alternative_titles?.length ? (
          <section>
            <h2 className="font-heading text-xs tracking-[0.25em] uppercase text-muted-foreground">
              Also known as
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {movie.alternative_titles.slice(0, 8).map((t) => (
                <li
                  key={t}
                  className="border border-border bg-muted px-2 py-1 font-mono text-xs tracking-wide"
                >
                  {t}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {movie.genre?.length ? (
          <section>
            <h2 className="font-heading text-xs tracking-[0.25em] uppercase text-muted-foreground">
              Refine by genre
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {movie.genre.map((g) => (
                <li key={g}>
                  <Link
                    href={`/search?movies%5BrefinementList%5D%5Bgenre%5D%5B0%5D=${encodeURIComponent(g)}`}
                    className="border border-border px-3 py-1 font-mono text-xs tracking-widest uppercase hover:bg-muted"
                  >
                    {g}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
