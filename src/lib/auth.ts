import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";

import { getSql, hasDatabaseUrl } from "@/lib/db";

const SESSION_COOKIE = "unidrop_admin_session";
const encoder = new TextEncoder();

type AdminSession = {
  userId: string;
  email: string;
  role: string;
};

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.");
  }
  return encoder.encode(secret);
}

export async function createAdminSession(session: AdminSession) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getSessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify<AdminSession>(token, getSessionSecret());
    return verified.payload;
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function authenticateAdmin(email: string, password: string) {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const bcrypt = await import("bcryptjs");
  const sql = getSql();
  const [user] = await sql<{
    id: string;
    email: string;
    role: string;
    password_hash: string;
  }[]>`
    select id, email, role, password_hash
    from admin_users
    where email = ${email.toLowerCase()}
    limit 1
  `;

  if (!user) return null;

  const matched = await bcrypt.compare(password, user.password_hash);
  if (!matched) return null;

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
}
