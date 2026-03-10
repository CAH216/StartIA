import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const VIDEO_BUCKET = 'formations-videos';

/**
 * GET /api/my/formations
 * Retourne les formations achetées par le client connecté.
 * Pour chaque formation vidéo : génère une URL signée Supabase (1h)
 * Les clients ne peuvent accéder QU'A leurs formations payées.
 */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  // Récupérer les formations achetées
  const purchases = await (prisma as any).formationPurchase.findMany({
    where: { userId: session.userId },
    include: {
      formation: {
        select: {
          id: true, title: true, description: true, category: true,
          type: true, duration: true, price: true, videoPath: true,
          status: true, createdAt: true,
          formateur: { select: { fullName: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => []) as any[];

  // Générer les URLs signées pour les vidéos (expire 1h)
  const result = await Promise.all(purchases.map(async (p: any) => {
    const f = p.formation;
    let videoUrl: string | null = null;

    if (f.type === 'VIDEO' && f.videoPath) {
      const { data } = await supabase.storage
        .from(VIDEO_BUCKET)
        .createSignedUrl(f.videoPath, 3600); // 1h
      videoUrl = data?.signedUrl ?? null;
    }

    return {
      purchaseId: p.id,
      purchasedAt: p.createdAt,
      formation: {
        id: f.id,
        title: f.title,
        description: f.description,
        category: f.category,
        type: f.type,
        duration: f.duration,
        price: f.price,
        formateurName: f.formateur?.fullName ?? 'Formateur StratIA',
        videoUrl, // null si live ou si pas encore disponible
      },
    };
  }));

  return NextResponse.json(result);
}
