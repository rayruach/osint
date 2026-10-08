import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-dev-secret"
);

export interface JWTPayload {
  userId: string;
  ein: string;
  email: string;
  isAdmin: boolean;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("osint_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function isAdminSession(): Promise<boolean> {
  const session = await getSession();
  return session?.isAdmin === true;
}

export function generateEIN(): string {
  return "EIN-" + Math.floor(100000 + Math.random() * 900000);
}
