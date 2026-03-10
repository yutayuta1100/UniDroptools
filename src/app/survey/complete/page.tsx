import type { Metadata } from "next";

import { SurveyCompletionView } from "@/components/survey/SurveyCompletionView";

export const metadata: Metadata = {
  title: "回答完了",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SurveyCompletePage() {
  return <SurveyCompletionView />;
}
