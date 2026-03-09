import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireAdminSession } from "@/lib/auth";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6">
      <header className="mx-auto mb-8 flex max-w-6xl flex-col gap-4 rounded-3xl border border-border/70 bg-card px-5 py-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline">UniDrop Admin</Badge>
            <Badge variant="muted">{session.email}</Badge>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Link href="/admin" className="rounded-full px-3 py-2 hover:bg-accent hover:text-accent-foreground">
              ダッシュボード
            </Link>
            <Link
              href="/admin/responses"
              className="rounded-full px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              回答一覧
            </Link>
            <Link
              href="/admin/analysis"
              className="rounded-full px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            >
              自由記述分析
            </Link>
          </nav>
        </div>
        <form action="/api/admin/auth/logout" method="post">
          <Button type="submit" variant="outline">
            ログアウト
          </Button>
        </form>
      </header>

      <main className="mx-auto max-w-6xl">{children}</main>
    </div>
  );
}
