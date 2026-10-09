import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma, withRetry } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ user: null, isAdmin: false });

    const user = await withRetry(() => prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, fullName: true, email: true, phone: true, ein: true, isAdmin: true, createdAt: true },
    }));

    return NextResponse.json({ user, isAdmin: session.isAdmin });
  } catch {
    return NextResponse.json({ user: null, isAdmin: false });
  }
}
