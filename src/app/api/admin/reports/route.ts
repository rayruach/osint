import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "ALL";

    const where = {
      AND: [
        status !== "ALL" ? { status } : {},
        search
          ? {
              OR: [
                { id: { contains: search, mode: "insensitive" as const } },
                { contact: { contains: search, mode: "insensitive" as const } },
                { title: { contains: search, mode: "insensitive" as const } },
                { category: { contains: search, mode: "insensitive" as const } },
                { location: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
      ],
    };

    const reports = await prisma.adminReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports });
  } catch (err) {
    console.error("[GET /api/admin/reports]", err);
    return NextResponse.json({ error: "Failed to fetch reports." }, { status: 500 });
  }
}

// Admin creates a post directly (bypasses user report flow)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, badge, incidentStatus, state, lga, town, sourceUrl, mediaUrl, isSensitive } = body;

    if (!title || !description || !state || !lga || !town) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    const VALID_BADGES = ["Authorities", "News", "Public"];
    const VALID_STATUSES = ["Active", "Resolved"];

    if (!VALID_BADGES.includes(badge)) {
      return NextResponse.json({ error: "Invalid badge value." }, { status: 400 });
    }
    if (incidentStatus && !VALID_STATUSES.includes(incidentStatus)) {
      return NextResponse.json({ error: "Invalid incident status." }, { status: 400 });
    }

    const locationString = [town, `${lga} LGA`, `${state} State`].join(", ");
    const cleanState = state.replace(/^FCT\s*-\s*/i, "").trim().toUpperCase();
    const authorName = `OSINT ${cleanState}`;

    const post = await prisma.post.create({
      data: {
        authorId: null,
        authorName,
        badge,
        title,
        body: description,
        location: locationString,
        state,
        lga,
        town,
        sourceUrl: sourceUrl || null,
        mediaUrl: mediaUrl || null,
        isSensitive: isSensitive ?? false,
        status: incidentStatus ?? "Active",
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/reports]", err);
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}
