// app/api/form/[formId]/submission/[submissionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { formId: any; submissionId: any } }
) {
  const body = await req.json();

  try {
    const content = JSON.stringify(body);

    const result = await prisma.$executeRaw`
      UPDATE "FormSubmissions"
      SET "content" = ${content}
      WHERE "id" = ${params.submissionId} AND "formId" = ${params.formId}
    `;

    if (result === 0) {
      return new NextResponse("Submission not found", { status: 404 });
    }

    return NextResponse.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("❌ Update error:", err);
    return new NextResponse("Failed to update submission", { status: 500 });
  }
}
