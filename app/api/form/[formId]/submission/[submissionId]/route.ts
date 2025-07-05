// app/api/form/[formId]/submission/[submissionId]/route.ts
import { NextResponse } from "next/server";
import { updateFormSubmission } from "@/lib/actions/form"; // your new function

export async function PUT(
  req: Request,
  { params }: { params: { formId: string; submissionId: string } }
) {
  try {
    const body = await req.json();

    const updated = await updateFormSubmission(params.formId, params.submissionId, body);

    return NextResponse.json({ message: "Updated successfully", updated });
  } catch (err) {
    console.error("❌ Failed to update submission:", err);
    return new NextResponse("Failed to update", { status: 500 });
  }
}
