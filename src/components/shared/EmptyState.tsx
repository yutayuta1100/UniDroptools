import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <div className="rounded-full border border-border/70 bg-secondary/70 p-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl tracking-tight text-foreground">{title}</h2>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
