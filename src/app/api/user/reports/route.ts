import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    // Find reports where the contact matches this user's email or phone
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { email: true, phone: true },
    });
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const reports = await prisma.adminReport.findMany({
      where: {
        OR: [
          { contact: user.email },
          { contact: user.phone },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        refCode: true,
        title: true,
        status: true,
        bountyPaid: true,
        bountyEligible: true,
        bankAccount: true,
        bankName: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ reports });
  } catch (err) {
    console.error("[GET /api/user/reports]", err);
    return NextResponse.json({ error: "Failed to fetch reports." }, { status: 500 });
  }
}
