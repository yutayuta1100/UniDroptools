import { Loader2 } from "lucide-react";

export default function SurveyLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 py-10">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        回答画面を準備しています...
      </div>
    </div>
  );
}
