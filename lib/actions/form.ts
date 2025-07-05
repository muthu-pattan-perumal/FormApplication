'use server';

import { prisma } from '@/lib/db';

export async function updateFormSubmission(
  formId: any,
  submissionId: any,
  content: Record<string, string>
) {
  try {
    const updated = await prisma.formSubmissions.update({
      where: {
        id: submissionId,
        formId: formId,
      },
      data: {
        content: JSON.stringify(content),
      },
    });

    return { success: true, updated };
  } catch (err) {
    console.error("🔥 Update failed:", err);
    throw new Error("Failed to update submission");
  }
}
