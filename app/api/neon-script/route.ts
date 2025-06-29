// /api/neon-script/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    const trimmed = query.trim().toLowerCase();
    let result;

    if (trimmed.startsWith("select")) {
      result = await prisma.$queryRawUnsafe(query);
    } else {
      result = await prisma.$executeRawUnsafe(query);
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
