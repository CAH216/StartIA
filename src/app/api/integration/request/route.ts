import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/integration/request — soumettre une demande d'intégration
 * GET  /api/integration/request — lister ses propres demandes
 */
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const {
        companyName, sector, teamSize, currentTools,
        mainChallenges, budget, preferredSlot, contactPhone, notes,
    } = await req.json();

    if (!companyName || !sector || !teamSize || !currentTools || !mainChallenges || !budget || !preferredSlot) {
        return NextResponse.json({ error: 'Tous les champs obligatoires sont requis.' }, { status: 400 });
    }

    const request = await prisma.integrationRequest.create({
        data: {
            userId: session.userId,
            companyName,
            sector,
            teamSize,
            currentTools,
            mainChallenges,
            budget,
            preferredSlot,
            contactPhone: contactPhone ?? null,
            notes: notes ?? null,
        },
    });

    return NextResponse.json({ ok: true, requestId: request.id, request }, { status: 201 });
}

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json([], { status: 401 });

    const requests = await prisma.integrationRequest.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(requests);
}
