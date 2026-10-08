import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [total, pending, approved, rejected, totalConfirms, reports] =
      await Promise.all([
        prisma.adminReport.count(),
        prisma.adminReport.count({ where: { status: "Pending" } }),
        prisma.adminReport.count({ where: { status: "Approved" } }),
        prisma.adminReport.count({ where: { status: "Rejected" } }),
        prisma.postConfirmation.count(),
        prisma.adminReport.findMany({
          select: { category: true, state: true, confirmations: true },
        }),
      ]);

    // Category distribution
    const catCounts: Record<string, number> = {};
    const stateCounts: Record<string, number> = {};
    reports.forEach((r: { category: string; state: string; confirmations: number }) => {
      catCounts[r.category] = (catCounts[r.category] ?? 0) + 1;
      stateCounts[r.state] = (stateCounts[r.state] ?? 0) + 1;
    });

    const categories = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / (total || 1)) * 100) }));

    const states = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / (total || 1)) * 100) }));

    return NextResponse.json({
      total,
      pending,
      approved,
      rejected,
      totalConfirms,
      bountiesTotal: approved * 500,
      categories,
      states,
    });
  } catch (err) {
    console.error("[GET /api/admin/analytics]", err);
    return NextResponse.json({ error: "Failed to fetch analytics." }, { status: 500 });
  }
}
