import { surveyQuestions } from "@/config/survey";
import { getStringAnswer } from "@/lib/answer-helpers";
import type { StoredResponse } from "@/lib/survey-store";

const stopwords = new Set([
  "こと",
  "感じ",
  "思う",
  "かなり",
  "少し",
  "なんか",
  "ような",
  "ため",
  "もの",
  "これ",
  "それ",
  "ここ",
  "そこ",
  "ある",
  "いる",
  "して",
  "した",
  "です",
  "ます",
  "でした",
  "けど",
  "ので",
  "から",
  "でも",
  "とか",
  "より",
  "もう",
  "まだ",
  "ただ",
  "かな",
  "なら",
]);

const keywordFamilies = [
  { tag: "不安", patterns: ["不安", "怖", "怪", "心配", "こわい"] },
  { tag: "長い", patterns: ["長い", "疲", "だれ", "55問", "多い"] },
  { tag: "わかりづらい", patterns: ["わかりづら", "伝わりづら", "意味", "説明不足", "不明"] },
  { tag: "面白い", patterns: ["面白", "ワクワク", "興味", "楽しい"] },
  { tag: "安心", patterns: ["安心", "筑波", "限定", "顔写真", "ニックネーム"] },
  { tag: "気まずい", patterns: ["気まず", "送りづら", "話しかけ", "迷", "何を送"] },
  { tag: "チャット", patterns: ["チャット", "メッセージ", "会話", "初手"] },
  { tag: "Drop", patterns: ["Drop", "相性", "理由", "スコア"] },
  { tag: "登録", patterns: ["登録", "認証", "メール", "パスワード"] },
  { tag: "診断", patterns: ["診断", "質問", "価値観", "プロフィール"] },
];

const positivePatterns = ["面白", "良い", "自然", "安心", "好き", "わくわく", "納得"];
const negativePatterns = ["不安", "長い", "だる", "微妙", "ダサ", "気まず", "怪", "わかりづら"];

export type FreeTextEntry = {
  responseId: string;
  respondentCode: string;
  questionId: string;
  text: string;
  suggestedTags: string[];
  sentiment: "ポジ" | "ネガ" | "要改善";
  keywords: string[];
};

function normalizeText(text: string) {
  return text
    .replace(/[。、，．！？!?\n\r\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractKeywords(text: string) {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const latinWords = normalized.match(/[A-Za-z0-9_-]{2,}/g) ?? [];
  const japaneseChunks = normalized.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー]{2,}/gu) ?? [];

  const tokens = [...latinWords, ...japaneseChunks]
    .map((token) => token.toLowerCase())
    .filter((token) => token.length >= 2 && !stopwords.has(token));

  const familyHits = keywordFamilies
    .filter((family) => family.patterns.some((pattern) => normalized.includes(pattern)))
    .map((family) => family.tag);

  return Array.from(new Set([...familyHits, ...tokens])).slice(0, 12);
}

export function suggestTags(text: string) {
  const normalized = normalizeText(text);
  return keywordFamilies
    .filter((family) => family.patterns.some((pattern) => normalized.includes(pattern)))
    .map((family) => family.tag);
}

export function classifySentiment(text: string): "ポジ" | "ネガ" | "要改善" {
  const normalized = normalizeText(text);
  const positiveScore = positivePatterns.filter((pattern) => normalized.includes(pattern)).length;
  const negativeScore = negativePatterns.filter((pattern) => normalized.includes(pattern)).length;

  if (negativeScore >= positiveScore + 1) return "ネガ";
  if (positiveScore >= negativeScore + 1) return "ポジ";
  return "要改善";
}

export function buildFreeTextEntries(responses: StoredResponse[]) {
  const textQuestionIds = surveyQuestions
    .filter((question) => question.type === "textarea" || question.type === "shortText")
    .map((question) => question.id);

  return responses.flatMap<FreeTextEntry>((response) =>
    textQuestionIds.flatMap((questionId) => {
      const text = getStringAnswer(response, questionId);
      if (!text) return [];

      return [
        {
          responseId: response.id,
          respondentCode: response.respondentCode,
          questionId,
          text,
          suggestedTags: suggestTags(text),
          sentiment: classifySentiment(text),
          keywords: extractKeywords(text),
        },
      ];
    }),
  );
}

export function buildTopicFrequency(entries: FreeTextEntry[]) {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    for (const keyword of entry.keywords) {
      counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([keyword, count]) => ({ keyword, count }));
}

export function calculateNegativeIntensity(response: StoredResponse) {
  const textAnswers = surveyQuestions
    .filter((question) => question.type === "textarea" || question.type === "shortText")
    .map((question) => getStringAnswer(response, question.id) ?? "")
    .filter(Boolean);

  const combined = textAnswers.join(" ");
  const negativeScore = negativePatterns.filter((pattern) => combined.includes(pattern)).length;
  const strongWords = ["ダサ", "痛", "最悪", "嫌", "無理", "怪"];
  const strongScore = strongWords.filter((pattern) => combined.includes(pattern)).length * 2;

  return Math.min(100, negativeScore * 10 + strongScore * 12);
}
