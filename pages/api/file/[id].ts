// pages/api/file/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);

  const file = await prisma.uploadedFile.findUnique({
    where: { id },
  });

  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  res.setHeader("Content-Disposition", `inline; filename="${file.name}"`);
  res.setHeader("Content-Type", file.mimeType);
  res.send(file.data); // ✅ directly send buffer
}
