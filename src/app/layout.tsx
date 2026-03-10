import type { Metadata } from "next";

import "@/app/globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { absoluteUrl, getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "UniDrop テスターアンケート",
    template: "%s | UniDrop テスターアンケート",
  },
  description:
    "UniDrop のクローズドテスト向けアンケートサイト。価値観診断、Drop、チャット体験の本音を集めて改善に活かします。",
  openGraph: {
    title: "UniDrop テスターアンケート",
    description:
      "UniDrop のクローズドテスト向けアンケートサイト。価値観診断、Drop、チャット体験の本音を集めて改善に活かします。",
    url: absoluteUrl("/"),
    siteName: "UniDrop テスターアンケート",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UniDrop テスターアンケート",
    description:
      "UniDrop のクローズドテスト向けアンケートサイト。価値観診断、Drop、チャット体験の本音を集めて改善に活かします。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen">
          <div className="mx-auto max-w-6xl px-0">{children}</div>
          <ToastProvider />
        </div>
      </body>
    </html>
  );
}
