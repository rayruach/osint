import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken, generateEIN } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { fullName, phone, email, password } = await req.json();

    if (!fullName || !phone || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) {
      return NextResponse.json({ error: "Email or phone already registered." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const ein = generateEIN();

    const user = await prisma.user.create({
      data: { fullName, phone, email, passwordHash, ein },
    });

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
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      user: { id: user.id, fullName: user.fullName, email: user.email, ein: user.ein },
    });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
