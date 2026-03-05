import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  // Employer or the post author can delete
  if (session.role !== 'EMPLOYER' && session.role !== 'ADMIN' && post.authorId !== session.userId)
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  // Only employer/admin can pin; anyone can like
  if (data.pinned !== undefined && session.role !== 'EMPLOYER' && session.role !== 'ADMIN')
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  if (data.like) {
    const post = await prisma.post.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });
    return NextResponse.json(post);
  }

  const post = await prisma.post.update({ where: { id }, data });
  return NextResponse.json(post);
}
