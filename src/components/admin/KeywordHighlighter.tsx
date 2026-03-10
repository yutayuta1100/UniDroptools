import { cn } from "@/lib/utils";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function KeywordHighlighter({
  text,
  keywords,
  className,
}: {
  text: string;
  keywords: string[];
  className?: string;
}) {
  if (keywords.length === 0) {
    return <p className={cn("whitespace-pre-wrap text-sm leading-7 text-foreground", className)}>{text}</p>;
  }

  const pattern = new RegExp(`(${keywords.map(escapeRegex).join("|")})`, "gi");
  const parts = text.split(pattern);

  return (
    <p className={cn("whitespace-pre-wrap text-sm leading-7 text-foreground", className)}>
      {parts.map((part, index) => {
        const isHit = keywords.some((keyword) => keyword.toLowerCase() === part.toLowerCase());
        if (!isHit) {
          return <span key={`${part}-${index}`}>{part}</span>;
        }
        return (
          <mark key={`${part}-${index}`} className="rounded bg-amber-100 px-1 text-foreground">
            {part}
          </mark>
        );
      })}
    </p>
  );
}
