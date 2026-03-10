import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ error: 'Email requis.' }, { status: 400 });
        }

        const clean = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
            return NextResponse.json({ error: 'Format email invalide.' }, { status: 400 });
        }

        // Check if Prisma model exists — soft-fail if not yet migrated
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = prisma as any;
        if (typeof db.newsletterSubscriber === 'undefined') {
            // Model not yet added — log and succeed silently until DB is migrated
            console.log('[Newsletter] Subscriber (pre-migration):', clean);
            return NextResponse.json({ message: 'Inscription enregistrée ! Bienvenue dans la veille IA StratIA.' });
        }

        const existing = await db.newsletterSubscriber.findUnique({ where: { email: clean } });
        if (existing) {
            return NextResponse.json({ message: 'Vous êtes déjà inscrit(e) à la newsletter !' });
        }

        await db.newsletterSubscriber.create({ data: { email: clean } });

        return NextResponse.json({ message: 'Inscription enregistrée ! Bienvenue dans la veille IA StratIA.' });
    } catch (err) {
        console.error('[Newsletter] Error:', err);
        return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
    }
}
