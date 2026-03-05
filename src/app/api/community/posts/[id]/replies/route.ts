import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const replies = await prisma.postReply.findMany({
    where: { postId: id },
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { id: true, fullName: true, role: true } } },
  });
  return NextResponse.json(replies);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id: postId } = await params;
  const { content } = await req.json();
  if (!content) return NextResponse.json({ error: 'Contenu requis' }, { status: 400 });

  const reply = await prisma.postReply.create({
    data: { postId, authorId: session.userId, content },
    include: { author: { select: { id: true, fullName: true, role: true } } },
  });

  return NextResponse.json(reply, { status: 201 });
}
