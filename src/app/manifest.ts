import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UniDrop テスターアンケート",
    short_name: "UniDrop Survey",
    description:
      "UniDrop のクローズドテスト向けアンケートサイト。価値観診断、Drop、チャット体験の本音を集めます。",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ef",
    theme_color: "#46605d",
    icons: [
      {
        src: `${getSiteUrl()}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
