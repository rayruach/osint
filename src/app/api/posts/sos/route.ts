import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "You must be logged in to send an SOS." }, { status: 401 });
    }

    const { sosType, location, latitude, longitude } = await req.json();

    if (!sosType || !location) {
      return NextResponse.json({ error: "SOS type and location required." }, { status: 400 });
    }

    // Fetch user details for prefill storage
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { fullName: true, phone: true, ein: true },
    });

    const alert = await prisma.sosAlert.create({
      data: {
        userId: session.userId,
        ein: user?.ein ?? null,
        phone: user?.phone ?? null,
        fullName: user?.fullName ?? null,
        sosType,
        location,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        status: "Ongoing",
      },
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/posts/sos]", err);
    return NextResponse.json({ error: "Failed to broadcast SOS." }, { status: 500 });
  }
}
