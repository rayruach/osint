import { NextRequest, NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const body = await req.json().catch(() => ({}));
    const deviceId: string | null = body.deviceId ?? null;

    // Determine identity — logged-in userId takes priority
    const userId = session?.userId ?? null;

    // Must have one or the other
    if (!userId && !deviceId) {
      return NextResponse.json({ error: "Unable to identify device." }, { status: 400 });
    }

    // Build the where clause based on what we have
    const whereClause = userId
      ? { postId: id, userId }
      : { postId: id, deviceId: deviceId! };

    const existing = await withRetry(() =>
      prisma.postConfirmation.findFirst({ where: whereClause })
    );

    if (existing) {
      // Toggle off
      await withRetry(() =>
        prisma.postConfirmation.delete({ where: { id: existing.id } })
      );
      const count = await withRetry(() =>
        prisma.postConfirmation.count({ where: { postId: id } })
      );
      return NextResponse.json({ confirmed: false, confirmations: count });
    } else {
      // Toggle on
      const createData = userId
        ? { postId: id, userId }
        : { postId: id, deviceId: deviceId! };

      await withRetry(() =>
        prisma.postConfirmation.create({ data: createData })
      );
      const count = await withRetry(() =>
        prisma.postConfirmation.count({ where: { postId: id } })
      );
      return NextResponse.json({ confirmed: true, confirmations: count });
    }
  } catch (err) {
    console.error("[POST /api/posts/[id]/confirm] full error:", err);
    return NextResponse.json({ error: "Failed to confirm report." }, { status: 500 });
  }
}
