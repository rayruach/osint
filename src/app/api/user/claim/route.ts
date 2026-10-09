import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "You must be logged in to claim a reward." }, { status: 401 });
    }

    const { claimCode, bankAccount, bankName } = await req.json();

    if (!claimCode) {
      return NextResponse.json({ error: "Claim code is required." }, { status: 400 });
    }
    if (!bankAccount || !bankName) {
      return NextResponse.json({ error: "Bank name and account number are required." }, { status: 400 });
    }
    if (!/^\d{10}$/.test(bankAccount)) {
      return NextResponse.json({ error: "Account number must be exactly 10 digits." }, { status: 400 });
    }

    // Find the report by refCode
    const report = await prisma.adminReport.findFirst({
      where: { refCode: claimCode.trim().toUpperCase() },
    });

    if (!report) {
      return NextResponse.json({ error: "Invalid claim code. Please check and try again." }, { status: 404 });
    }

    if (report.status === "Rejected") {
      return NextResponse.json({ error: "This report was not approved and is not eligible for a reward." }, { status: 400 });
    }

    if (report.bountyPaid) {
      return NextResponse.json({ error: "This reward has already been paid out." }, { status: 400 });
    }

    if (!report.bountyEligible) {
      return NextResponse.json({ error: "This report has not been selected for a reward. Only high-priority verified reports qualify." }, { status: 400 });
    }

    // Check if someone else already claimed this code
    if (report.bankAccount && report.bankName) {
      return NextResponse.json({ error: "This claim code has already been used." }, { status: 400 });
    }

    // Save bank details to the report
    const updated = await prisma.adminReport.update({
      where: { id: report.id },
      data: { bankAccount, bankName },
    });

    return NextResponse.json({
      ok: true,
      message: "Claim submitted successfully. Your bank details have been saved. You will be paid within 24 hours.",
      refCode: updated.refCode,
      title: updated.title,
    });
  } catch (err) {
    console.error("[POST /api/user/claim]", err);
    return NextResponse.json({ error: "Failed to process claim." }, { status: 500 });
  }
}
