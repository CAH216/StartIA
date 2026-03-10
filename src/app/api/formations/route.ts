import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const formations = await prisma.formation.findMany({
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      include: {
        createdBy: { select: { fullName: true } },
        _count: { select: { purchases: true, enrollments: true } },
      },
    });
    return NextResponse.json(formations);
  } catch (e) {
    console.error('GET /api/formations', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== 'EMPLOYER' && session.role !== 'ADMIN'))
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  try {
    const {
      title, description, dates, duration, price, priceLabel,
      format, category, tags, featured, fileUrl,
      videoUrl, thumbnailUrl, isPaid, isFree,
    } = await req.json();
    if (!title) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });

    const formation = await prisma.formation.create({
      data: {
        title,
        description: description ?? null,
        dates: dates ?? [],
        duration: duration ?? null,
        price: price ?? null,
        priceLabel: priceLabel ?? null,
        format: format ?? 'En ligne',
        category: category ?? 'IA',
        tags: tags ?? [],
        featured: featured ?? false,
        fileUrl: fileUrl ?? null,
        videoUrl: videoUrl ?? null,
        thumbnailUrl: thumbnailUrl ?? null,
        isPaid: isPaid ?? false,
        isFree: isFree ?? false,
        createdById: session.userId,
      },
    });

    return NextResponse.json(formation, { status: 201 });
  } catch (e) {
    console.error('POST /api/formations', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
