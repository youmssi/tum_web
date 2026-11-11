export function MarketingPageHeader({ heading, intro }: { heading: string; intro: string }) {
  return (
    <header className="max-w-6xl mx-auto px-6 lg:px-12 pt-36 lg:pt-44 pb-4">
      <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-4">{heading}</h1>
      <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{intro}</p>
    </header>
  );
}
