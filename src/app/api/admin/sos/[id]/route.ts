import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!["Ongoing", "Resolved"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const alert = await prisma.sosAlert.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === "Resolved" ? new Date() : null,
      },
    });

    return NextResponse.json({ alert });
  } catch (err) {
    console.error("[PATCH /api/admin/sos/[id]]", err);
    return NextResponse.json({ error: "Failed to update SOS alert." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.sosAlert.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/sos/[id]]", err);
    return NextResponse.json({ error: "Failed to delete SOS alert." }, { status: 500 });
  }
}
