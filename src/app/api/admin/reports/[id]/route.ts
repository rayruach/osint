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
    const { title, category, source, contact, location, status, body: reportBody, incidentStatus, markPaid, bountyEligible } = body;

    const VALID_INCIDENT_STATUSES = ["Active", "Resolved"];
    if (incidentStatus && !VALID_INCIDENT_STATUSES.includes(incidentStatus)) {
      return NextResponse.json({ error: "Invalid incident status." }, { status: 400 });
    }

    // Handle mark paid separately
    if (markPaid === true) {
      const updated = await prisma.adminReport.update({
        where: { id },
        data: { bountyPaid: true },
      });
      return NextResponse.json({ report: updated });
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
        ...(status === "Approved" && { bountyPaid: false }),
        ...(bountyEligible !== undefined && { bountyEligible }),
      },
    });

    // Always sync edits to the matching post
    const postUpdateData: Record<string, string> = {};
    if (title) postUpdateData.title = title;
    if (reportBody) postUpdateData.body = reportBody;
    if (location) postUpdateData.location = location;

    if (status === "Approved") {
      const postStatus = incidentStatus ?? "Active";
      postUpdateData.status = postStatus;
    }

    if (Object.keys(postUpdateData).length > 0) {
      await prisma.post.updateMany({
        where: { title: title ?? updated.title, state: updated.state },
        data: postUpdateData,
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

    // Find the report first so we can match and delete the post too
    const report = await prisma.adminReport.findUnique({ where: { id } });

    if (report) {
      // Delete the matching post from the public feed
      await prisma.post.deleteMany({
        where: { title: report.title, state: report.state },
      });
    }

    await prisma.adminReport.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/reports/[id]]", err);
    return NextResponse.json({ error: "Failed to delete report." }, { status: 500 });
  }
}
