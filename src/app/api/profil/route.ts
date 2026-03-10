import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/* ── GET — lire son profil ─────────────────────── */
export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
            id: true, email: true, fullName: true, companyName: true,
            sector: true, province: true, role: true, plan: true,
            avatarUrl: true, createdAt: true, oauthProvider: true as any,
        } as any,
    });

    if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    return NextResponse.json(user);
}

/* ── PATCH — mettre à jour le profil ───────────── */
export async function PATCH(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { fullName, companyName, sector, province, currentPassword, newPassword } = body;

    const updateData: Record<string, unknown> = {};

    if (fullName !== undefined) updateData.fullName = fullName || null;
    if (companyName !== undefined) updateData.companyName = companyName || null;
    if (sector !== undefined) updateData.sector = sector || null;
    if (province !== undefined) updateData.province = province || null;

    // Changement de mot de passe
    if (newPassword) {
        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'Mot de passe trop court (8 caractères minimum)' }, { status: 400 });
        }
        const user = await prisma.user.findUnique({ where: { id: session.userId } });
        if (user?.passwordHash && currentPassword) {
            const ok = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!ok) return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
        }
        updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    const updated = await prisma.user.update({
        where: { id: session.userId },
        data: updateData,
        select: { id: true, email: true, fullName: true, companyName: true, sector: true, province: true, role: true, plan: true, avatarUrl: true },
    });

    return NextResponse.json(updated);
}

/* ── POST /api/profil/update — upload avatar ───── */
// Voir /api/profil/avatar/route.ts pour l'upload photo
