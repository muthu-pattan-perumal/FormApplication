import prisma from "@/lib/db";

export async function updateFormSubmission(
    formId: any,
    submissionId: any,
    data: Record<string, any>
) {
    return prisma.formSubmissions.update({
        where: { id: submissionId },
        data: {
            content: JSON.stringify(data),
        },
    });
}
