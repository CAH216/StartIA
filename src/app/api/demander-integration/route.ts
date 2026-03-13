import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/demander-integration
 * Route publique — accessible sans compte (mode guest)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      companyName: string;
      sector: string;
      teamSize: string;
      currentTools: string;
      mainChallenges: string;
      budget: string;
      preferredSlot: string;
      contactPhone?: string;
      contactEmail: string;
      notes?: string;
    };

    const { companyName, sector, teamSize, currentTools, mainChallenges, budget, preferredSlot, contactEmail } = body;
    if (!companyName?.trim() || !sector || !teamSize || !currentTools?.trim() || !mainChallenges?.trim() || !budget || !preferredSlot || !contactEmail?.trim()) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    // Trouver ou créer un utilisateur guest temporaire basé sur l'email
    let user = await prisma.user.findUnique({ where: { email: contactEmail.toLowerCase() } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: contactEmail.toLowerCase(),
          fullName: companyName,
          role: 'USER',
          plan: 'FREE',
          isNewUser: true,
        },
      });
    }

    const request = await prisma.integrationRequest.create({
      data: {
        userId:         user.id,
        companyName:    companyName.trim(),
        sector,
        teamSize,
        currentTools:   currentTools.trim(),
        mainChallenges: mainChallenges.trim(),
        budget,
        preferredSlot,
        contactPhone:   body.contactPhone?.trim() || null,
        notes:          body.notes?.trim() || null,
        status:         'PENDING',
      },
    });

    return NextResponse.json({ ok: true, requestId: request.id }, { status: 201 });
  } catch (e) {
    console.error('[demander-integration]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
