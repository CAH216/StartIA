import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** GET — list sessions (metadata only, no messages) */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json([], { status: 401 });

  const sessions = await prisma.session.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, createdAt: true },
  });

  return NextResponse.json(sessions);
}

/** POST — create a new AI chat session
 *  Body: { title?: string; messages?: AiMessage[] }
 *  Returns the full session including id
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { title, messages } = await req.json();

  const s = await prisma.session.create({
    data: {
      userId: session.userId,
      title: title ?? 'Nouvelle conversation',
      messages: messages ?? [],
    },
  });

  return NextResponse.json(s, { status: 201 });
}
