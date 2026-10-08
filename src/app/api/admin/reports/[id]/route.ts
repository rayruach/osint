import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const report = await prisma.adminReport.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ report });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, category, source, contact, location, status, body: reportBody, incidentStatus } = body;

    const VALID_INCIDENT_STATUSES = ["Active", "Resolved"];

    // Validate incidentStatus if provided
    if (incidentStatus && !VALID_INCIDENT_STATUSES.includes(incidentStatus)) {
      return NextResponse.json({ error: "Invalid incident status." }, { status: 400 });
    }

    const updated = await prisma.adminReport.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(category && { category }),
        ...(source && { source }),
        ...(contact && { contact }),
        ...(location && { location }),
        ...(status && { status }),
        ...(reportBody && { body: reportBody }),
        // Auto-mark bounty paid when approved
        ...(status === "Approved" && { bountyPaid: true }),
      },
    });

    // If approving, update the matching post with chosen incident status
    if (status === "Approved") {
      const postStatus = incidentStatus ?? "Active";
      await prisma.post.updateMany({
        where: { title: updated.title, state: updated.state },
        data: { status: postStatus },
      });
    }

    return NextResponse.json({ report: updated });
  } catch (err) {
    console.error("[PATCH /api/admin/reports/[id]]", err);
    return NextResponse.json({ error: "Failed to update report." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.adminReport.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/reports/[id]]", err);
    return NextResponse.json({ error: "Failed to delete report." }, { status: 500 });
  }
}
