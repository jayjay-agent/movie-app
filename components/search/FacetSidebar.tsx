"use client";

import {
  ClearRefinements,
  HierarchicalMenu,
  RangeInput,
  RefinementList,
} from "react-instantsearch";

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <section className="border-t border-border py-5 first:border-t-0 first:pt-0">
      <h3 className="font-heading mb-3 text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
        {title}
      </h3>
      <div className="ais-section">{children}</div>
    </section>
  );
}

export function FacetSidebar() {
  return (
    <aside className="sticky top-[88px] flex flex-col gap-2 self-start text-sm">
      <Section title="Genre">
        <HierarchicalMenu
          attributes={["genre.lvl0", "genre.lvl1"]}
          limit={8}
          showMore
        />
        <RefinementList
          attribute="genre"
          limit={8}
          showMore
          classNames={{ root: "mt-2" }}
        />
      </Section>

      <Section title="Year">
        <RangeInput attribute="year" precision={0} />
      </Section>

      <Section title="Actors">
        <RefinementList
          attribute="actors"
          limit={6}
          showMore
          searchable
          searchablePlaceholder="Search actors…"
        />
      </Section>

      <Section title="Rating">
        <RangeInput attribute="rating" precision={1} />
      </Section>

      <div className="pt-4">
        <ClearRefinements
          translations={{
            resetButtonText: "Clear all filters",
          }}
        />
      </div>
    </aside>
  );
}
