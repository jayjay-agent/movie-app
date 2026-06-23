import { notFound } from "next/navigation";

import { MovieDetail } from "@/components/movie/MovieDetail";
import { ViewTracker } from "@/components/movie/ViewTracker";
import { RelatedRail } from "@/components/recommend/RelatedRail";
import { FrequentlyBoughtTogetherRail } from "@/components/recommend/FrequentlyBoughtTogetherRail";
import { getMovieByObjectID } from "@/lib/algolia";

type Props = {
  params: Promise<{ objectID: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { objectID } = await params;
  const movie = await getMovieByObjectID(objectID);
  if (!movie) return { title: "Movie not found · Movie App" };
  return {
    title: `${movie.title} · Movie App`,
    description: movie.genre?.length
      ? `${movie.title} — ${movie.genre.join(" · ")}${movie.year ? ` (${movie.year})` : ""}`
      : `${movie.title}${movie.year ? ` (${movie.year})` : ""}`,
  };
}

export default async function MoviePage({ params }: Props) {
  const { objectID } = await params;
  const movie = await getMovieByObjectID(objectID);
  if (!movie) notFound();

  return (
    <>
      <MovieDetail movie={movie} />
      <ViewTracker objectID={movie.objectID} />
      <RelatedRail objectID={movie.objectID} />
      <FrequentlyBoughtTogetherRail objectID={movie.objectID} />
    </>
  );
}
