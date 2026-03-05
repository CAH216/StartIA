import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  const reply = await prisma.postReply.findUnique({ where: { id } });
  if (!reply) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  if (session.role !== 'EMPLOYER' && session.role !== 'ADMIN' && reply.authorId !== session.userId)
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  await prisma.postReply.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
