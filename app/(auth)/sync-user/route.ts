import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const { id, email, name } = await req.json();

  if (!id || !email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  console.log(existing, 'existing');
  if (!existing) {
     return NextResponse.json({ success: false });
    return NextResponse.json({ redirect: '/sign-in' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
