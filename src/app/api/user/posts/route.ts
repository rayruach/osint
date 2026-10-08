import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const posts = await prisma.post.findMany({
      where: { authorId: session.userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { confirmations: true } } },
    });

    const enriched = posts.map((p: typeof posts[number]) => ({
      ...p,
      confirmations: p._count.confirmations,
    }));

    return NextResponse.json({ posts: enriched });
  } catch (err) {
    console.error("[GET /api/user/posts]", err);
    return NextResponse.json({ error: "Failed to fetch posts." }, { status: 500 });
  }
}
