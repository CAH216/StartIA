import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/integration — liste toutes les demandes (admin seulement)
 */
export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const requests = await prisma.integrationRequest.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, email: true, fullName: true, companyName: true } },
        },
    });

    return NextResponse.json(requests);
}
