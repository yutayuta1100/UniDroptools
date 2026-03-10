import { Badge } from "@/components/ui/badge";

export function SectionIntro({
  index,
  title,
  estimatedMinutes,
  description,
}: {
  index: number;
  title: string;
  estimatedMinutes: string;
  description: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="outline">{index.toString().padStart(2, "0")}</Badge>
        <Badge variant="muted">{estimatedMinutes}</Badge>
      </div>
      <div className="space-y-2">
        <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">{title}</h2>
        <div className="space-y-2">
          {description.map((line) => (
            <p key={line} className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
