import { Card, CardContent } from "@/components/ui/card";

export function AdminSetupNotice({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-8">
        <h2 className="font-serif text-3xl tracking-tight text-foreground">DB セットアップ待ち</h2>
        <p className="text-sm leading-7 text-muted-foreground">{message}</p>
        <p className="text-sm leading-7 text-muted-foreground">
          `DATABASE_URL` が未設定のままだと、公開フォームの回答は管理画面の集計には載りません。管理画面で一括分析したい場合は、Supabase か PostgreSQL を接続してください。
        </p>
      </CardContent>
    </Card>
  );
}
