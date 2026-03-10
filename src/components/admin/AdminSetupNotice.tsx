import { Card, CardContent } from "@/components/ui/card";

export function AdminSetupNotice({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-8">
        <h2 className="font-serif text-3xl tracking-tight text-foreground">DB セットアップ待ち</h2>
        <p className="text-sm leading-7 text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
