import { NextResponse } from "next/server"
import ReactPDF from "@react-pdf/renderer"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { InspectionPackPDF } from "@/features/inspection-pack/inspection-pack-pdf"
import React from "react"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const member = await db.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: true },
  })
  if (!member) {
    return new NextResponse("No workspace found", { status: 404 })
  }

  const now = new Date()
  const [completedOccurrences, allOccurrences, totalEvidence] = await Promise.all([
    db.taskOccurrence.findMany({
      where: {
        workspaceId: member.workspaceId,
        status: "completed",
        completedAt: { not: null },
      },
      include: {
        task: { select: { title: true, category: true, frequency: true } },
      },
      orderBy: { completedAt: "desc" },
    }),
    db.taskOccurrence.findMany({
      where: { workspaceId: member.workspaceId },
    }),
    db.evidenceFile.count({
      where: { workspaceId: member.workspaceId },
    }),
  ])

  const overdueCount = allOccurrences.filter(
    (o) => o.status === "due" && o.dueDate < now,
  ).length
  const completedOnTime = completedOccurrences.filter(
    (o) => o.completedAt! <= o.dueDate,
  ).length
  const complianceScore =
    completedOccurrences.length > 0
      ? Math.round((completedOnTime / completedOccurrences.length) * 100)
      : 100

  const data = {
    workspaceName: member.workspace.name,
    generatedAt: now.toISOString(),
    sector: member.workspace.sector,
    address: member.workspace.address,
    contactName: member.workspace.contactName,
    contactEmail: member.workspace.contactEmail,
    phone: member.workspace.phone,
    summary: {
      totalTasks: allOccurrences.length,
      completedOnTime,
      overdueCount,
      complianceScore,
      totalEvidence,
    },
    completedItems: completedOccurrences.map((o) => ({
      id: o.id,
      taskTitle: o.task.title,
      category: o.task.category,
      frequency: o.task.frequency,
      completedAt: o.completedAt!,
      completedByName: o.completedByName,
      notes: o.notes,
      evidenceCount: 0,
    })),
  }

  try {
    const pdfInstance = ReactPDF.pdf(
      React.createElement(InspectionPackPDF, { data }) as any,
    )
    const blob = await pdfInstance.toBlob()

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${member.workspace.name.replace(/[^a-zA-Z0-9]/g, "_")}_inspection_pack.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation failed:", error)
    return new NextResponse("Failed to generate PDF", { status: 500 })
  }
}
