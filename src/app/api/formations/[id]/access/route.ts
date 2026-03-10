import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/formations/[id]/access
 * Vérifie si l'user a accès à la vidéo d'une formation :
 *  - Formation gratuite (isFree) → OK
 *  - Abonnement PRO actif → OK
 *  - Achat unitaire existant → OK
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ hasAccess: false }, { status: 401 });

    const { id } = await params;

    const formation = await prisma.formation.findUnique({ where: { id } });
    if (!formation) return NextResponse.json({ error: 'Formation introuvable' }, { status: 404 });

    // Gratuit pour tout le monde
    if (formation.isFree || (!formation.isPaid && !formation.price)) {
        return NextResponse.json({ hasAccess: true, videoUrl: formation.videoUrl });
    }

    // Vérifier abonnement PRO
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { plan: true },
    });

    if (user?.plan === 'PRO') {
        // Créer enrollment si pas encore existant
        await prisma.formationEnrollment.upsert({
            where: { userId_formationId: { userId: session.userId, formationId: id } },
            create: { userId: session.userId, formationId: id, progress: 0 },
            update: {},
        });
        return NextResponse.json({ hasAccess: true, videoUrl: formation.videoUrl, reason: 'PRO' });
    }

    // Vérifier achat unitaire
    const purchase = await prisma.formationPurchase.findUnique({
        where: { userId_formationId: { userId: session.userId, formationId: id } },
    });

    if (purchase) {
        return NextResponse.json({ hasAccess: true, videoUrl: formation.videoUrl, reason: 'PURCHASED' });
    }

    return NextResponse.json({
        hasAccess: false,
        price: formation.price,
        priceLabel: formation.priceLabel,
    });
}
