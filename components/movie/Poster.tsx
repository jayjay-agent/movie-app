"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  imgClassName?: string;
};

/**
 * Movie poster with a graceful fallback.
 *
 * If the image URL is missing OR the request fails (the Algolia movies
 * dataset has a lot of stale TMDB poster paths that 404), renders a
 * diagonal-stripe placeholder using the muted token instead of the
 * browser's broken-image icon.
 */
export function Poster({ src, alt = "", className, imgClassName }: Props) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn("size-full object-cover", imgClassName)}
        />
      ) : (
        <div
          aria-hidden
          className="size-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, var(--muted), var(--muted) 6px, var(--background) 6px, var(--background) 12px)",
          }}
        />
      )}
    </div>
  );
}
