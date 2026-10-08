import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

type PostWithCount = {
  id: string;
  authorId: string | null;
  authorName: string;
  badge: string;
  sourceUrl: string | null;
  status: string;
  title: string;
  body: string;
  location: string;
  state: string;
  lga: string;
  town: string;
  mediaUrl: string | null;
  isSensitive: boolean;
  isSOS: boolean;
  isPushed: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: { confirmations: number };
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const state = searchParams.get("state") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" as const } },
                { body: { contains: search, mode: "insensitive" as const } },
                { location: { contains: search, mode: "insensitive" as const } },
              ],
            }
          : {},
        state ? { state: { contains: state, mode: "insensitive" as const } } : {},
      ],
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: { select: { confirmations: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    // Check which posts the current user has confirmed
    const session = await getSession();
    let confirmedIds: string[] = [];
    if (session) {
      const userConfirmations = await prisma.postConfirmation.findMany({
        where: { userId: session.userId, postId: { in: posts.map((p: PostWithCount) => p.id) } },
        select: { postId: true },
      });
      confirmedIds = userConfirmations.map((c: { postId: string }) => c.postId);
    }

    const enriched = posts.map((p: PostWithCount) => ({
      ...p,
      confirmations: p._count.confirmations,
      isConfirmed: confirmedIds.includes(p.id),
    }));

    return NextResponse.json({ posts: enriched, total, page, limit });
  } catch (err) {
    console.error("[GET /api/posts]", err);
    return NextResponse.json({ error: "Failed to fetch posts." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { title, incidentType, contact, state, lga, town, description, mediaUrl, isSensitive } = body;
    const resolvedTitle = incidentType || title;

    if (!resolvedTitle || !state || !lga || !town || !description) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    const locationString = [town, `${lga} LGA`, `${state} State`].join(", ");
    const cleanState = state.replace(/^FCT\s*-\s*/i, "").trim().toUpperCase();
    const authorName = `OSINT ${cleanState}`;

    // Also create an AdminReport entry pending review
    const [post] = await prisma.$transaction([
      prisma.post.create({
        data: {
          authorId: session?.userId ?? null,
          authorName,
          badge: "Public",
          title: resolvedTitle,
          body: description,
          location: locationString,
          state,
          lga,
          town,
          mediaUrl: mediaUrl ?? null,
          isSensitive: isSensitive ?? false,
          status: "Active",
        },
      }),
      prisma.adminReport.create({
        data: {
          contact: contact ?? session?.email ?? "anonymous",
          category: incidentType ?? title,
          title: resolvedTitle,
          body: description,
          location: locationString,
          state,
          source: "Public",
          mediaUrl: mediaUrl ?? null,
          status: "Pending",
        },
      }),
    ]);

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/posts]", err);
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}
