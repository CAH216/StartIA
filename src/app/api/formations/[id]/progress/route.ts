import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/formations/[id]/progress
 * Met à jour la progression de visionnage (0–100)
 * Body: { progress: number }
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const { progress } = await req.json() as { progress: number };

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return NextResponse.json({ error: 'progress doit être entre 0 et 100' }, { status: 400 });
    }

    const completedAt = progress >= 100 ? new Date() : undefined;

    const enrollment = await prisma.formationEnrollment.upsert({
        where: { userId_formationId: { userId: session.userId, formationId: id } },
        create: {
            userId: session.userId,
            formationId: id,
            progress,
            ...(completedAt && { completedAt }),
        },
        update: {
            progress,
            ...(completedAt && { completedAt }),
        },
    });

    return NextResponse.json(enrollment);
}
