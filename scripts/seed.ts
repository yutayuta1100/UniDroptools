import bcrypt from "bcryptjs";
import postgres from "postgres";

import { surveySections } from "../src/config/survey";
import {
  tsukubaCircleAffiliations,
  tsukubaCommitteeAffiliations,
  tsukubaSchoolAffiliations,
} from "../src/data/tsukuba-directory";
import { suggestTags } from "../src/lib/free-text";
import type { SurveyAnswers } from "../src/lib/survey-types";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run the seed script.");
}

const sql = postgres(process.env.DATABASE_URL, {
  prepare: false,
});

type PersonaPreset = {
  key: string;
  gender: string;
  matchingExperience: string;
  participationReasons: string[];
  impressionBeforeSignup: string;
  concernsBeforeSignup: string[];
  signupDrivers: string[];
  signupEase: number;
  signupStumblingPoints: string[];
  conceptClarity: number;
  diagnosisSatisfaction: number;
  diagnosisLength: string;
  diagnosisFatiguePoint: string;
  diagnosisIntentConfusion: number;
  diagnosisValidity: number;
  diagnosisFun: number;
  saveResumeEase: string;
  dropFirstImpression: string;
  compatibilityTrust: number;
  reasonsTrust: number;
  wantToTalk: number;
  weeklyDropImpression: string;
  noFacePhotoInterest: number;
  firstMessageEase: number;
  firstMessageHesitation: string;
  firstMessageConfusion: number;
  chatAtmosphere: string;
  templateInterest: string;
  tsukubaSafety: number;
  optionalPhotoSafety: number;
  nicknameSafety: number;
  blocklistExpectation: number;
  anxieties: string[];
  nps: number;
  closestCategory: string;
  phrases: {
    serviceGuess: string;
    biggestHangup: string;
    confusingPoint: string;
    missingExplanation: string;
    memorableQuestion: string;
    diagnosisImprove: string;
    dropGood: string;
    dropWeak: string;
    dropLine: string;
    chatBarrier: string;
    chatEnabler: string;
    chatImprove: string;
    safetyNeed: string;
    npsReason: string;
    describeToFriend: string;
    bestPart: string;
    weakestPart: string;
    hiddenDiscomfort: string;
    whyNotSpread: string;
    oneFix: string;
    uncoolPoint: string;
    nextWeek: string;
  };
};

const schoolAffiliations = tsukubaSchoolAffiliations;
const committeeAffiliations = tsukubaCommitteeAffiliations;
const circleAffiliations = tsukubaCircleAffiliations;

const grades = ["b1", "b2", "b3", "b4", "m1", "m2"];

const personas: PersonaPreset[] = [
  {
    key: "quiet_fan",
    gender: "woman",
    matchingExperience: "installed_but_rarely_used",
    participationReasons: ["looked_interesting", "interested_in_diagnosis", "liked_tsukuba_only"],
    impressionBeforeSignup: "interesting_diagnosis",
    concernsBeforeSignup: ["too_long_diagnosis"],
    signupDrivers: ["values_diagnosis", "tsukuba_only", "no_face_photo"],
    signupEase: 4,
    signupStumblingPoints: ["none"],
    conceptClarity: 4,
    diagnosisSatisfaction: 5,
    diagnosisLength: "somewhat_long",
    diagnosisFatiguePoint: "middle_questions",
    diagnosisIntentConfusion: 2,
    diagnosisValidity: 5,
    diagnosisFun: 4,
    saveResumeEase: "4",
    dropFirstImpression: "wow_interesting",
    compatibilityTrust: 5,
    reasonsTrust: 4,
    wantToTalk: 4,
    weeklyDropImpression: "just_right",
    noFacePhotoInterest: 4,
    firstMessageEase: 3,
    firstMessageHesitation: "a_bit",
    firstMessageConfusion: 3,
    chatAtmosphere: "more_natural_than_expected",
    templateInterest: "would_use",
    tsukubaSafety: 5,
    optionalPhotoSafety: 5,
    nicknameSafety: 4,
    blocklistExpectation: 4,
    anxieties: ["could_match_acquaintance"],
    nps: 9,
    closestCategory: "campus_connection_service",
    phrases: {
      serviceGuess: "静かな価値観診断に近くて、週1で誰かとのきっかけが届くサービスだと思っていました。",
      biggestHangup: "診断が長すぎて途中で離脱しないかだけ少し気になっていました。",
      confusingPoint: "最初の説明は落ち着いているけど、Drop がどう届くかの絵はもう少し欲しかったです。",
      missingExplanation: "7日間チャットの温度感と、どのくらい匿名なのかは先に知りたかったです。",
      memorableQuestion: "生活テンポや一人時間の使い方を聞く質問は相性に効きそうで印象に残りました。",
      diagnosisImprove: "中盤で似た温度の質問が続くので、軽い区切りがあると楽です。",
      dropGood: "相性理由が短く整理されていて、静かな期待感がありました。",
      dropWeak: "画面の静けさは良いけど、最初の見た目は少し地味です。",
      dropLine: "思ったよりちゃんとしている",
      chatBarrier: "話しかける理由がまだ薄いので、初手の一文だけ少し迷いました。",
      chatEnabler: "相性理由があるのでゼロから話題を作る感じではないのが良かったです。",
      chatImprove: "初手の会話きっかけを1つだけ置くとかなり送りやすくなると思います。",
      safetyNeed: "除外リストとスクショ禁止の説明があるともっと安心です。",
      npsReason: "恋愛色を前に出しすぎず、価値観から入れるので人に話しやすいです。",
      describeToFriend: "筑波の人向けに、静かな価値観診断からつながりのきっかけを作るサービス。",
      bestPart: "入口の静けさ",
      weakestPart: "Drop の地味さ",
      hiddenDiscomfort: "価値観診断として期待すると後半の体力勝負感が少し見えてしまいます。",
      whyNotSpread: "外から見たときに何のサービスか一言で伝わりきらないと広がりづらそうです。",
      oneFix: "Drop 画面の第一印象をもう少しだけ高める。",
      uncoolPoint: "良くも悪くも真面目すぎて、最初の驚きが少し弱いです。",
      nextWeek: "Drop 画面の文言と初手チャット導線を先に整えます。",
    },
  },
  {
    key: "curious_but_cautious",
    gender: "man",
    matchingExperience: "never_used",
    participationReasons: ["invited_by_friend", "interested_in_diagnosis", "liked_tsukuba_only"],
    impressionBeforeSignup: "campus_connection_service",
    concernsBeforeSignup: ["noticed_by_acquaintances", "embarrassing"],
    signupDrivers: ["tsukuba_only", "friends_were_using", "values_diagnosis"],
    signupEase: 4,
    signupStumblingPoints: ["none"],
    conceptClarity: 4,
    diagnosisSatisfaction: 4,
    diagnosisLength: "just_right",
    diagnosisFatiguePoint: "late_questions",
    diagnosisIntentConfusion: 2,
    diagnosisValidity: 4,
    diagnosisFun: 4,
    saveResumeEase: "not_used",
    dropFirstImpression: "slightly_excited",
    compatibilityTrust: 4,
    reasonsTrust: 4,
    wantToTalk: 4,
    weeklyDropImpression: "low_but_valid",
    noFacePhotoInterest: 4,
    firstMessageEase: 3,
    firstMessageHesitation: "a_bit",
    firstMessageConfusion: 3,
    chatAtmosphere: "depends_on_person",
    templateInterest: "strongly_want",
    tsukubaSafety: 5,
    optionalPhotoSafety: 4,
    nicknameSafety: 4,
    blocklistExpectation: 5,
    anxieties: ["could_match_acquaintance", "screenshot_risk"],
    nps: 8,
    closestCategory: "campus_connection_service",
    phrases: {
      serviceGuess: "筑波限定の、少し匿名寄りなつながりサービスだと思っていました。",
      biggestHangup: "知り合いに見つかったら気まずいかも、という点が一番引っかかりました。",
      confusingPoint: "登録自体は簡単でしたが、どこまで恋愛寄りなのかは最後まで少し曖昧でした。",
      missingExplanation: "知り合いを避ける考え方や、安全面の設計思想はもっと見せた方がよさそうです。",
      memorableQuestion: "生活圏や会話のテンポを聞く質問は、実際の相性に繋がりそうでした。",
      diagnosisImprove: "後半に小さな達成感があると、最後まで走りやすいです。",
      dropGood: "1人だけ届くのでスワイプっぽさがなく、落ち着いて見られました。",
      dropWeak: "面白いけど、最初に見る情報量が少なくて少し手探りでした。",
      dropLine: "静かに来るのが逆に良い",
      chatBarrier: "失礼にならない最初の一文を考えるのに少し時間がかかりました。",
      chatEnabler: "筑波限定というだけで少し身近さが出て、送りやすくなっていました。",
      chatImprove: "初手テンプレを2〜3個だけ候補として出してほしいです。",
      safetyNeed: "知り合い除外や通報導線が見えるとさらに安心できます。",
      npsReason: "使っていて嫌な恋愛アプリ感が薄く、話すきっかけとしては勧めやすいです。",
      describeToFriend: "筑波の人向けの価値観診断ベースのつながりサービス、くらいで説明すると思います。",
      bestPart: "筑波限定の安心感",
      weakestPart: "最初の会話の難しさ",
      hiddenDiscomfort: "匿名性が安心と不安の両方を生んでいて、そのバランスがまだ揺れています。",
      whyNotSpread: "友達に紹介するときの一言説明が長くなると、広がる速度は落ちそうです。",
      oneFix: "知り合い回避の安心材料を見える化する。",
      uncoolPoint: "真面目さはあるけど、最初の説明が少し硬いです。",
      nextWeek: "安心設計の説明と初手テンプレを入れます。",
    },
  },
  {
    key: "skeptical",
    gender: "man",
    matchingExperience: "used",
    participationReasons: ["invited_by_friend", "connection_purpose"],
    impressionBeforeSignup: "basically_matching_app",
    concernsBeforeSignup: ["felt_like_dating_service", "personal_data", "uncertain_user_base"],
    signupDrivers: ["friends_were_using", "one_drop_per_week"],
    signupEase: 3,
    signupStumblingPoints: ["field_meaning", "screen_transition"],
    conceptClarity: 2,
    diagnosisSatisfaction: 2,
    diagnosisLength: "very_long",
    diagnosisFatiguePoint: "late_questions",
    diagnosisIntentConfusion: 4,
    diagnosisValidity: 2,
    diagnosisFun: 2,
    saveResumeEase: "2",
    dropFirstImpression: "not_compelling",
    compatibilityTrust: 2,
    reasonsTrust: 2,
    wantToTalk: 2,
    weeklyDropImpression: "want_more_control",
    noFacePhotoInterest: 2,
    firstMessageEase: 2,
    firstMessageHesitation: "a_lot",
    firstMessageConfusion: 4,
    chatAtmosphere: "very_awkward",
    templateInterest: "strongly_want",
    tsukubaSafety: 3,
    optionalPhotoSafety: 2,
    nicknameSafety: 3,
    blocklistExpectation: 5,
    anxieties: ["too_anonymous", "worry_about_bad_actors", "data_handling"],
    nps: 4,
    closestCategory: "matching_app",
    phrases: {
      serviceGuess: "結局はかなり恋愛寄りで、やや回りくどいマッチングサービスだと思っていました。",
      biggestHangup: "何のサービスか曖昧なまま登録を進める感じが一番引っかかりました。",
      confusingPoint: "価値観診断として見せたいのか、つながりサービスとして見せたいのかがぶれて見えました。",
      missingExplanation: "安全面と利用人数のイメージが見えないままだと警戒が残ります。",
      memorableQuestion: "質問自体は悪くないけど、相性にどう効くか見えないものが混ざっている印象でした。",
      diagnosisImprove: "質問数を削るか、途中で意味づけを挟まないと重いです。",
      dropGood: "毎週1人という設計はスワイプよりマシだと思いました。",
      dropWeak: "相性スコアと理由の説得力が弱く、第一印象で熱が上がりませんでした。",
      dropLine: "まだ決め手が弱い",
      chatBarrier: "知らない相手に何を送ればいいか分からず、かなり気まずかったです。",
      chatEnabler: "正直あまりなかったです。",
      chatImprove: "会話の導線を画面側でかなり支援しないと始まりづらいです。",
      safetyNeed: "除外、通報、スクショ抑止、本人確認の考え方まで見せてほしいです。",
      npsReason: "静かな雰囲気は悪くないけど、長さと納得感の弱さで人には勧めにくいです。",
      describeToFriend: "価値観診断っぽく始まるけど、実態はまだマッチングアプリ寄りに見えるサービス。",
      bestPart: "スワイプでないこと",
      weakestPart: "納得感の弱さ",
      hiddenDiscomfort: "恋愛アプリ感を隠そうとしているように見える瞬間があり、そこが逆に気になります。",
      whyNotSpread: "第一印象の説明不足と診断負荷の高さで、多くの人は途中で離れそうです。",
      oneFix: "最初の説明を短く強く整理し、診断負荷を下げる。",
      uncoolPoint: "言い回しが丁寧すぎて、何をしてくれるかがぼやけています。",
      nextWeek: "説明文を全面的に整理して、診断を短くします。",
    },
  },
  {
    key: "fatigued_diagnosis",
    gender: "woman",
    matchingExperience: "actively_avoid",
    participationReasons: ["interested_in_diagnosis", "liked_tsukuba_only"],
    impressionBeforeSignup: "interesting_diagnosis",
    concernsBeforeSignup: ["too_long_diagnosis", "embarrassing"],
    signupDrivers: ["values_diagnosis", "no_face_photo", "tsukuba_only"],
    signupEase: 4,
    signupStumblingPoints: ["none"],
    conceptClarity: 3,
    diagnosisSatisfaction: 3,
    diagnosisLength: "very_long",
    diagnosisFatiguePoint: "middle_questions",
    diagnosisIntentConfusion: 3,
    diagnosisValidity: 4,
    diagnosisFun: 3,
    saveResumeEase: "5",
    dropFirstImpression: "slightly_excited",
    compatibilityTrust: 4,
    reasonsTrust: 4,
    wantToTalk: 3,
    weeklyDropImpression: "just_right",
    noFacePhotoInterest: 4,
    firstMessageEase: 3,
    firstMessageHesitation: "a_bit",
    firstMessageConfusion: 3,
    chatAtmosphere: "slightly_awkward",
    templateInterest: "would_use",
    tsukubaSafety: 4,
    optionalPhotoSafety: 5,
    nicknameSafety: 4,
    blocklistExpectation: 4,
    anxieties: ["could_match_acquaintance"],
    nps: 7,
    closestCategory: "romantic_values_service",
    phrases: {
      serviceGuess: "価値観診断として面白そうだけど、少し恋愛寄りでもあるサービスだと思っていました。",
      biggestHangup: "質問数が多いと聞いた瞬間に、ちゃんと最後までやる気が持つかは不安でした。",
      confusingPoint: "説明は読めるけど、診断の長さに対する心構えがないまま始まる感じでした。",
      missingExplanation: "途中保存できることや、所要時間の目安はもっと前に出してよいです。",
      memorableQuestion: "休日の過ごし方や返信ペースに関する質問は実感に近かったです。",
      diagnosisImprove: "前半と中盤の間に、進捗の節目が見えるとかなり違うと思います。",
      dropGood: "診断のあとに来るので、Drop 自体には少し期待が乗っていました。",
      dropWeak: "診断を頑張ったぶん、Drop の情報量がもう少し欲しいと感じました。",
      dropLine: "もう一押し欲しい",
      chatBarrier: "疲れた直後だと、そこから初手を考えるのが少ししんどいです。",
      chatEnabler: "顔写真なしなので、見た目を気にしすぎずに済むのは楽でした。",
      chatImprove: "診断結果からそのまま拾える会話ネタがあると始めやすいです。",
      safetyNeed: "知り合いに当たるケースの扱いを先に説明してほしいです。",
      npsReason: "世界観は好きですが、診断の負荷がまだ人を選ぶと思います。",
      describeToFriend: "筑波限定で、価値観診断のあとに相性のいい人が毎週1人届くサービス。",
      bestPart: "顔写真なしの気軽さ",
      weakestPart: "診断の長さ",
      hiddenDiscomfort: "入口で静かに見せているぶん、途中の負荷が相対的に重く感じられます。",
      whyNotSpread: "最初の体験に体力が要ると、友達に軽く勧めづらいです。",
      oneFix: "診断の節目と途中保存の安心感をもっと出す。",
      uncoolPoint: "丁寧だけど、途中のテンポ設計がやや単調です。",
      nextWeek: "診断進捗の見せ方を改善します。",
    },
  },
  {
    key: "ui_confused",
    gender: "prefer_not_to_say",
    matchingExperience: "never_used",
    participationReasons: ["looked_interesting", "interested_in_diagnosis"],
    impressionBeforeSignup: "unclear",
    concernsBeforeSignup: ["personal_data", "uncertain_user_base", "too_long_diagnosis"],
    signupDrivers: ["values_diagnosis", "one_drop_per_week"],
    signupEase: 2,
    signupStumblingPoints: ["email_verification", "field_meaning"],
    conceptClarity: 2,
    diagnosisSatisfaction: 3,
    diagnosisLength: "somewhat_long",
    diagnosisFatiguePoint: "profile_setup",
    diagnosisIntentConfusion: 4,
    diagnosisValidity: 3,
    diagnosisFun: 3,
    saveResumeEase: "3",
    dropFirstImpression: "neutral",
    compatibilityTrust: 3,
    reasonsTrust: 3,
    wantToTalk: 3,
    weeklyDropImpression: "low_but_valid",
    noFacePhotoInterest: 3,
    firstMessageEase: 2,
    firstMessageHesitation: "a_lot",
    firstMessageConfusion: 4,
    chatAtmosphere: "ui_hard_to_use",
    templateInterest: "strongly_want",
    tsukubaSafety: 4,
    optionalPhotoSafety: 4,
    nicknameSafety: 4,
    blocklistExpectation: 5,
    anxieties: ["data_handling", "screenshot_risk"],
    nps: 6,
    closestCategory: "still_unclear",
    phrases: {
      serviceGuess: "価値観診断なのか、つながりサービスなのか、最初は正直よく分かりませんでした。",
      biggestHangup: "登録前から、全体の流れが少し見えにくかったのが気になりました。",
      confusingPoint: "用語が落ち着いているぶん、逆にどこが重要なのか掴みにくい場面がありました。",
      missingExplanation: "登録から診断、Drop、チャットまでの全体像を一枚で見せてほしいです。",
      memorableQuestion: "質問自体は悪くないですが、似た感触の項目が続くと意図が取りづらくなります。",
      diagnosisImprove: "プロフィール入力と診断の境目をもっとはっきり分けてほしいです。",
      dropGood: "一人に絞る設計はわかりやすいです。",
      dropWeak: "Drop 画面で何を見ればいいか一瞬迷いました。",
      dropLine: "少し説明不足",
      chatBarrier: "画面の空気が静かすぎて、最初の一通を打つきっかけが弱かったです。",
      chatEnabler: "相性理由が短くあるのは助かりました。",
      chatImprove: "画面上で最初の行動をもっと促してほしいです。",
      safetyNeed: "データの扱いとスクショ周りのガイドは明示してほしいです。",
      npsReason: "方向性は面白いですが、初見のわかりにくさで少し損をしていると思います。",
      describeToFriend: "筑波向けの価値観診断系サービスだけど、まだ説明が少し難しい感じ。",
      bestPart: "一人ずつ届く設計",
      weakestPart: "初見の理解しづらさ",
      hiddenDiscomfort: "静かで知的な雰囲気は良いのに、画面の案内不足で逆に距離を感じる瞬間があります。",
      whyNotSpread: "人に勧めるとき、自分もまだ説明しきれない感じが残ると広がりにくいです。",
      oneFix: "最初の説明を視覚的に整理する。",
      uncoolPoint: "おしゃれに抑えすぎて、行動のきっかけが少し薄いです。",
      nextWeek: "初見導線の説明を再設計します。",
    },
  },
];

function mulberry32(seed: number) {
  let t = seed;
  return function rand() {
    t += 0x6d2b79f5;
    let next = Math.imul(t ^ (t >>> 15), t | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function withVariance(base: number, rand: () => number, spread = 1) {
  const delta = rand() < 0.33 ? -spread : rand() > 0.66 ? spread : 0;
  return clamp(base + delta, 1, 5);
}

function mapPretestImpression(value: string) {
  switch (value) {
    case "interesting_diagnosis":
      return "curious_about_diagnosis";
    case "campus_connection_service":
      return "cooperative_test_mode";
    case "basically_matching_app":
      return "guarded_by_romance";
    case "unclear":
    case "felt_suspicious":
    default:
      return "half_skeptical";
  }
}

function mapPretestConcerns(values: string[]) {
  return values
    .map((value) => {
      switch (value) {
        case "embarrassing":
          return "felt_like_dating_service";
        case "uncertain_user_base":
          return "not_sure_value";
        default:
          return value;
      }
    })
    .filter((value, index, array) => array.indexOf(value) === index);
}

function mapChatAtmosphere(value: string) {
  return value === "ui_hard_to_use" ? "screen_hard_to_use" : value;
}

function buildAnswers(preset: PersonaPreset, index: number): SurveyAnswers {
  const rand = mulberry32(index + 17);
  const grade = grades[index % grades.length];
  const schoolAffiliation = schoolAffiliations[index % schoolAffiliations.length];
  const committeeAffiliation =
    index % 3 === 0 ? committeeAffiliations[index % committeeAffiliations.length] : null;
  const circleAffiliation =
    index % 4 === 0 ? circleAffiliations[index % circleAffiliations.length] : null;

  return {
    honest_feedback_consent: ["agreed"],
    no_personal_info_consent: ["agreed"],
    grade,
    school_affiliation: schoolAffiliation,
    committee_affiliation: committeeAffiliation,
    circle_affiliation: circleAffiliation,
    gender: preset.gender,
    matching_app_experience: preset.matchingExperience,
    impression_before_signup: mapPretestImpression(preset.impressionBeforeSignup),
    concerns_before_signup: mapPretestConcerns(preset.concernsBeforeSignup),
    biggest_hangup_before_signup: preset.phrases.biggestHangup,
    signup_ease: withVariance(preset.signupEase, rand),
    signup_stumbling_points: preset.signupStumblingPoints,
    concept_clarity: withVariance(preset.conceptClarity, rand),
    confusing_points: preset.phrases.confusingPoint,
    missing_explanation: preset.phrases.missingExplanation,
    diagnosis_satisfaction: withVariance(preset.diagnosisSatisfaction, rand),
    diagnosis_length_impression: preset.diagnosisLength,
    diagnosis_fatigue_point: preset.diagnosisFatiguePoint,
    diagnosis_intent_confusion: withVariance(preset.diagnosisIntentConfusion, rand),
    memorable_or_weird_questions: preset.phrases.memorableQuestion,
    diagnosis_validity: withVariance(preset.diagnosisValidity, rand),
    diagnosis_fun_over_hassle: withVariance(preset.diagnosisFun, rand),
    save_resume_ease: preset.saveResumeEase,
    diagnosis_improve_one: preset.phrases.diagnosisImprove,
    drop_first_impression: preset.dropFirstImpression,
    compatibility_score_trust: withVariance(preset.compatibilityTrust, rand),
    reasons_trust: withVariance(preset.reasonsTrust, rand),
    want_to_talk: withVariance(preset.wantToTalk, rand),
    weekly_one_drop_impression: preset.weeklyDropImpression,
    no_face_photo_interest: withVariance(preset.noFacePhotoInterest, rand),
    drop_good_points: preset.phrases.dropGood,
    drop_weak_points: preset.phrases.dropWeak,
    drop_one_line: preset.phrases.dropLine,
    first_message_ease: withVariance(preset.firstMessageEase, rand),
    first_message_hesitation: preset.firstMessageHesitation,
    first_message_confusion: withVariance(preset.firstMessageConfusion, rand),
    chat_atmosphere: mapChatAtmosphere(preset.chatAtmosphere),
    chat_barriers: preset.phrases.chatBarrier,
    chat_enablers: preset.phrases.chatEnabler,
    template_interest: preset.templateInterest,
    chat_improve_one: preset.phrases.chatImprove,
    tsukuba_only_safety: withVariance(preset.tsukubaSafety, rand),
    optional_photo_safety: withVariance(preset.optionalPhotoSafety, rand),
    nickname_safety: withVariance(preset.nicknameSafety, rand),
    blocklist_expectation: withVariance(preset.blocklistExpectation, rand),
    anxieties: preset.anxieties,
    what_needed_for_safety: preset.phrases.safetyNeed,
    nps: clamp(preset.nps + (rand() > 0.7 ? 1 : rand() < 0.25 ? -1 : 0), 0, 10),
    nps_reason: preset.phrases.npsReason,
    describe_to_friend: preset.phrases.describeToFriend,
    closest_category: preset.closestCategory,
    best_part: preset.phrases.bestPart,
    weakest_part: preset.phrases.weakestPart,
    hidden_core_discomfort: preset.phrases.hiddenDiscomfort,
    why_not_spread: preset.phrases.whyNotSpread,
    one_fix_to_improve: preset.phrases.oneFix,
    uncool_or_unclear_points: preset.phrases.uncoolPoint,
    next_week_priority: preset.phrases.nextWeek,
  };
}

async function main() {
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@unidrop.local";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await sql.begin(async (tx) => {
    const db = tx as any;

    await db`delete from analysis_tags`;
    await db`delete from survey_answers`;
    await db`delete from survey_responses`;
    await db`delete from survey_questions`;
    await db`delete from survey_sections`;
    await db`delete from admin_users`;

    const sectionIdMap = new Map<string, string>();

    for (const section of surveySections) {
      const [insertedSection] = await db<{ id: string }[]>`
        insert into survey_sections (key, title, sort_order)
        values (${section.key}, ${section.title}, ${section.sortOrder})
        returning id
      `;
      sectionIdMap.set(section.key, insertedSection.id);
    }

    for (const section of surveySections) {
      const sectionId = sectionIdMap.get(section.key);
      if (!sectionId) continue;

      for (const [index, question] of section.questions.entries()) {
        await db`
          insert into survey_questions (
            section_id,
            key,
            type,
            label,
            helper_text,
            required,
            options_json,
            config_json,
            sort_order,
            active
          )
          values (
            ${sectionId},
            ${question.id},
            ${question.type},
            ${question.label},
            ${question.helperText ?? null},
            ${question.required},
            ${db.json(question.options ?? [])},
            ${db.json({
              placeholder: question.placeholder ?? null,
              maxSelections: question.maxSelections ?? null,
              minSelections: question.minSelections ?? null,
              scaleLabels: question.scaleLabels ?? null,
              rows: question.rows ?? null,
            })},
            ${index},
            true
          )
        `;
      }
    }

    await db`
      insert into admin_users (email, password_hash, role)
      values (${adminEmail.toLowerCase()}, ${passwordHash}, 'admin')
    `;

    for (let index = 0; index < 20; index += 1) {
      const preset = personas[index % personas.length];
      const answers = buildAnswers(preset, index);
      const respondentCode = `tester-${String(index + 1).padStart(3, "0")}`;
      const submitted = index % 5 !== 0;
      const cutoffIndex = submitted ? surveySections.length - 1 : 3 + (index % 4);
      const startedAt = new Date(Date.now() - (20 - index) * 6 * 60 * 60 * 1000);
      const submittedAt = submitted
        ? new Date(startedAt.getTime() + (18 + (index % 5) * 7) * 60 * 1000)
        : null;

      const completedSectionKeys = submitted
        ? surveySections.map((section) => section.key)
        : surveySections.slice(0, cutoffIndex).map((section) => section.key);

      const [response] = await db<{ id: string }[]>`
        insert into survey_responses (
          respondent_code,
          started_at,
          submitted_at,
          status,
          metadata
        )
        values (
          ${respondentCode},
          ${startedAt.toISOString()},
          ${submittedAt?.toISOString() ?? null},
          ${submitted ? "submitted" : "in_progress"},
          ${db.json({
            surveyVersion: "2026-03",
            completedSectionKeys,
            lastSavedSectionKey: surveySections[Math.min(cutoffIndex, surveySections.length - 1)]?.key,
            seededPersona: preset.key,
          })}
        )
        returning id
      `;

      for (const section of surveySections.slice(0, cutoffIndex + 1)) {
        for (const question of section.questions) {
          const value = answers[question.id];
          if (value === undefined) continue;

          await db`
            insert into survey_answers (
              response_id,
              question_id,
              question_type,
              answer_value_json,
              answer_text
            )
            values (
              ${response.id},
              ${question.id},
              ${question.type},
              ${db.json(value)},
              ${typeof value === "string"
                ? value
                : Array.isArray(value)
                  ? value.join(" / ")
                  : typeof value === "number"
                    ? String(value)
                    : null}
            )
          `;

          if (typeof value === "string" && value.length > 10) {
            const tags = suggestTags(value).slice(0, 2);
            for (const tag of tags) {
              await db`
                insert into analysis_tags (response_id, question_id, tag_type, tag_value)
                values (${response.id}, ${question.id}, 'topic', ${tag})
                on conflict do nothing
              `;
            }
          }
        }
      }
    }
  });

  console.log("Seed completed.");
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Admin password: ${adminPassword}`);
  await sql.end();
}

main().catch(async (error) => {
  console.error(error);
  await sql.end();
  process.exit(1);
});
