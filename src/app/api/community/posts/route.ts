import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: {
      author: { select: { id: true, fullName: true, role: true, companyName: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: { author: { select: { id: true, fullName: true, role: true } } },
      },
    },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { title, content, tags } = await req.json();
  if (!title || !content)
    return NextResponse.json({ error: 'Titre et contenu requis' }, { status: 400 });

  const post = await prisma.post.create({
    data: {
      authorId: session.userId,
      title,
      content,
      tags: tags ?? [],
    },
    include: {
      author: { select: { id: true, fullName: true, role: true, companyName: true } },
      replies: true,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
