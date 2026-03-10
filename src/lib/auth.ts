/**
 * src/lib/auth.ts — JWT helpers + session management
 * Cookie httpOnly: stratia_token
 */
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback_dev_secret_change_in_prod'
);
const COOKIE_NAME = 'stratia_token';
const TTL = 60 * 60 * 24 * 7; // 7 jours

export type JwtPayload = {
  userId: string;
  email: string;
  role: 'USER' | 'EMPLOYER' | 'FORMATEUR' | 'ADMIN';
};

/** Crée un JWT signé */
export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL}s`)
    .sign(SECRET);
}

/** Vérifie + décode un JWT */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

/** Lit la session depuis le cookie (server-side, dans Server Components ou Route Handlers) */
export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Nom du cookie — utilisé dans les route handlers pour set/delete */
export { COOKIE_NAME, TTL };
