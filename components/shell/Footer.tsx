export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-6 py-8 text-xs tracking-wider text-muted-foreground uppercase sm:flex-row sm:items-center sm:justify-between">
        <span>
          Algolia playground · public movies dataset · {new Date().getFullYear()}
        </span>
        <span className="font-mono normal-case tracking-normal">
          InstantSearch · Recommend · Personalization · Rules · NeuralSearch · Agent Studio
        </span>
      </div>
    </footer>
  );
}
