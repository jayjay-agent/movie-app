import { SearchExperience } from "./SearchExperience";

export const metadata = {
  title: "Search · Movie App",
  description:
    "Faceted, sortable, URL-synced search across the Algolia movies index.",
};

export default function SearchPage() {
  return <SearchExperience />;
}
