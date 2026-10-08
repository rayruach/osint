import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const { sosType, location } = await req.json();

    if (!sosType || !location) {
      return NextResponse.json({ error: "SOS type and location required." }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        authorId: session?.userId ?? null,
        authorName: "Emergency SOS Beacon",
        badge: "Emergency SOS",
        title: `SOS: ${sosType}`,
        body: `Immediate emergency response requested at ${location}. Priority SOS beacon active.`,
        location,
        state: "Emergency",
        lga: "Emergency",
        town: location,
        isSOS: true,
        isPushed: true,
        status: "Active",
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/posts/sos]", err);
    return NextResponse.json({ error: "Failed to broadcast SOS." }, { status: 500 });
  }
}
