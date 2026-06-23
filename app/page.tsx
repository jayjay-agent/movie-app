import { HomeExperience } from "@/app/HomeExperience";

export const metadata = {
  title: "Home · Movie App",
  description:
    "Trending movie rails powered by Algolia Recommend against the public movies dataset.",
};

export default function Page() {
  return <HomeExperience />;
}
