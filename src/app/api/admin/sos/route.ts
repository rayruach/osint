import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const alerts = await prisma.sosAlert.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ alerts });
  } catch (err) {
    console.error("[GET /api/admin/sos]", err);
    return NextResponse.json({ error: "Failed to fetch SOS alerts." }, { status: 500 });
  }
}
