import { Progress } from "@/components/ui/progress";

export function ProgressHeader({
  currentSection,
  totalSections,
  title,
  completionPercent,
  savedAtLabel,
}: {
  currentSection: number;
  totalSections: number;
  title: string;
  completionPercent: number;
  savedAtLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Section {currentSection} / {totalSections}
            </p>
            <h1 className="text-base font-medium text-foreground sm:text-lg">{title}</h1>
          </div>
          {savedAtLabel ? <p className="text-xs text-muted-foreground">{savedAtLabel}</p> : null}
        </div>
        <Progress value={completionPercent} />
      </div>
    </header>
  );
}
