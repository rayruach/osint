import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Identifier and password required." }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier },
          { ein: identifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "No account found with those details." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const token = await signToken({
      userId: user.id,
      ein: user.ein,
      email: user.email,
      isAdmin: false,
    });

    const cookieStore = await cookies();
    cookieStore.set("osint_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      user: { id: user.id, fullName: user.fullName, email: user.email, ein: user.ein },
    });
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
