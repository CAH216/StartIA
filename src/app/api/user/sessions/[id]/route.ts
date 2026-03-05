import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

/** GET — full session with all messages */
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;

  const s = await prisma.session.findUnique({ where: { id } });
  if (!s || s.userId !== session.userId)
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });

  return NextResponse.json(s);
}

/** PATCH — replace the messages array (structured JSON, not raw text)
 *  Body: { messages: AiMessage[]; title?: string }
 *  Message format: { role:'user'|'ai', content:string, ts:number, quickReplies?:string[], actionCard?:object|null }
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.session.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.userId)
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });

  const { messages, title } = await req.json();

  const updated = await prisma.session.update({
    where: { id },
    data: {
      ...(messages !== undefined ? { messages } : {}),
      ...(title !== undefined ? { title } : {}),
    },
  });

  return NextResponse.json(updated);
}

/** DELETE — permanently delete a session */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.session.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.userId)
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });

  await prisma.session.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
