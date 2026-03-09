import { cookies } from "next/headers";

export const RESPONDENT_COOKIE = "unidrop_respondent";

export function createRespondentCode() {
  return `ud-${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`;
}

export async function getRespondentCodeFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(RESPONDENT_COOKIE)?.value ?? null;
}
