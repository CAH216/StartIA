import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { fullName: true } } },
    });
    return NextResponse.json(resources);
  } catch (e) {
    console.error('GET /api/resources', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== 'EMPLOYER' && session.role !== 'ADMIN'))
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  try {
    const { title, description, category, type, fileUrl, premium } = await req.json();
    if (!title || !category) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });

    const resource = await prisma.resource.create({
      data: {
        title,
        description: description ?? null,
        category,
        type: type ?? 'PDF',
        fileUrl: fileUrl ?? null,
        premium: premium ?? false,
        createdById: session.userId,
      },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (e) {
    console.error('POST /api/resources', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
