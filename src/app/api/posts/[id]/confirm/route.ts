import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "You must be logged in to confirm a report." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.postConfirmation.findUnique({
      where: { postId_userId: { postId: id, userId: session.userId } },
    });

    if (existing) {
      // Toggle off — remove confirmation
      await prisma.postConfirmation.delete({
        where: { postId_userId: { postId: id, userId: session.userId } },
      });
      const count = await prisma.postConfirmation.count({ where: { postId: id } });
      return NextResponse.json({ confirmed: false, confirmations: count });
    } else {
      // Add confirmation
      await prisma.postConfirmation.create({
        data: { postId: id, userId: session.userId },
      });
      const count = await prisma.postConfirmation.count({ where: { postId: id } });
      return NextResponse.json({ confirmed: true, confirmations: count });
    }
  } catch (err) {
    console.error("[POST /api/posts/[id]/confirm]", err);
    return NextResponse.json({ error: "Failed to confirm report." }, { status: 500 });
  }
}
