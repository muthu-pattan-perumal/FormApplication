import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File } from "formidable";
import { promises as fs } from "fs";
import prisma from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

const fileToBuffer = async (file: File): Promise<Buffer> => {
  const data = await fs.readFile(file.filepath);
  return data;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new IncomingForm({ maxFileSize: 1024 * 1024 * 1024 }); // 1GB

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(500).json({ error: "Error parsing file" });
    }

    const uploadedFile = files.file?.[0];
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const buffer = await fileToBuffer(uploadedFile);

      const saved = await prisma.uploadedFile.create({
        data: {
          name: uploadedFile.originalFilename || "unnamed",
          mimeType: uploadedFile.mimetype || "application/octet-stream",
          size: uploadedFile.size,
          data: buffer,
        },
      });

      return res.status(200).json({ success: true, fileId: saved.id });
    } catch (e) {
      console.error("DB insert failed:", e);
      return res.status(500).json({ error: "Upload failed", details: String(e) });
    }
  });
}
