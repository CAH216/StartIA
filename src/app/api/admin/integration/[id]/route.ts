import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { IntegrationStatus } from '@prisma/client';

/**
 * PATCH /api/admin/integration/[id] — mettre à jour une demande (admin)
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { id } = await params;
    const { status, adminNotes, assignedTo, scheduledAt } = await req.json() as {
        status?: IntegrationStatus;
        adminNotes?: string;
        assignedTo?: string;
        scheduledAt?: string;
    };

    const updated = await prisma.integrationRequest.update({
        where: { id },
        data: {
            ...(status && { status }),
            ...(adminNotes !== undefined && { adminNotes }),
            ...(assignedTo !== undefined && { assignedTo }),
            ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        },
    });

    return NextResponse.json(updated);
}

/**
 * GET /api/admin/integration/[id] — détail d'une demande
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { id } = await params;
    const request = await prisma.integrationRequest.findUnique({
        where: { id },
        include: { user: { select: { id: true, email: true, fullName: true, companyName: true } } },
    });

    if (!request) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    return NextResponse.json(request);
}
