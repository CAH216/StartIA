import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/formations/[id]/purchase
 * Achat unitaire d'une formation (simulation — intégrer Stripe en prod)
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;

  const formation = await prisma.formation.findUnique({ where: { id } });
  if (!formation) return NextResponse.json({ error: 'Formation introuvable' }, { status: 404 });

  if (!formation.isPaid && !formation.price) {
    return NextResponse.json({ error: 'Cette formation ne nécessite pas d\'achat' }, { status: 400 });
  }

  // Idempotent — retourner si déjà acheté
  const existing = await prisma.formationPurchase.findUnique({
    where: { userId_formationId: { userId: session.userId, formationId: id } },
  });
  if (existing) {
    return NextResponse.json({ ok: true, already: true, purchase: existing });
  }

  // Créer l'achat (paiement simulé — en prod : vérifier le paiement Stripe avant)
  const purchase = await prisma.formationPurchase.create({
    data: {
      userId: session.userId,
      formationId: id,
      amount: formation.price ?? 0,
    },
  });

  // Créer ou mettre à jour l'enrollment
  await prisma.formationEnrollment.upsert({
    where: { userId_formationId: { userId: session.userId, formationId: id } },
    create: { userId: session.userId, formationId: id, progress: 0 },
    update: {},
  });

  return NextResponse.json({ ok: true, already: false, purchase }, { status: 201 });
}
