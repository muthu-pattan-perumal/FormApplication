// app/api/form/[formId]/submission/[submissionId]/route.ts
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { formId: string; submissionId: string } }
) {
  const body = await req.json();

  console.log("🔧 Updating submission:", params.submissionId, body);

  // Replace this with actual DB update logic
  const updated = true; // simulate update

  if (!updated) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json({ message: "Updated successfully" });
}
