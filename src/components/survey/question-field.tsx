import { AlertCircle } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function QuestionField({
  id,
  label,
  helperText,
  required,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  helperText?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <Label htmlFor={id} className="text-[15px] leading-7 text-foreground">
          {label}
          {required ? <span className="ml-1 text-sm text-primary">*</span> : null}
        </Label>
        {helperText ? <p className="text-sm leading-6 text-muted-foreground">{helperText}</p> : null}
      </div>
      {children}
      {error ? (
        <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
