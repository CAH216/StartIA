import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const VIDEO_BUCKET = 'formations-videos';
const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2 Go

/* ── POST — créer une formation ────────────────────── */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (session.role !== 'FORMATEUR' && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès réservé aux formateurs' }, { status: 403 });
  }

  const fd = await req.formData();
  const type        = fd.get('type') as string;
  const title       = (fd.get('title') as string)?.trim();
  const description = (fd.get('description') as string)?.trim() || null;
  const category    = (fd.get('category') as string) || null;
  const price       = parseFloat(fd.get('price') as string);
  const duration    = (fd.get('duration') as string) || null;
  const videoFile   = fd.get('video') as File | null;

  if (!title) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
  if (isNaN(price) || price < 0) return NextResponse.json({ error: 'Prix invalide' }, { status: 400 });

  let videoUrl: string | null = null;

  // Upload vidéo vers Supabase Storage (formations-videos bucket)
  if (type === 'video' && videoFile) {
    if (videoFile.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 2 Go)' }, { status: 400 });
    }
    const ext  = videoFile.name.split('.').pop() || 'mp4';
    const path = `${session.userId}/${Date.now()}.${ext}`;

    const arrayBuffer = await videoFile.arrayBuffer();
    const { error: uploadErr } = await supabase.storage
      .from(VIDEO_BUCKET)
      .upload(path, arrayBuffer, { contentType: videoFile.type, upsert: false });

    if (uploadErr) {
      console.error('[formations upload]', uploadErr);
      return NextResponse.json({ error: 'Erreur upload vidéo : ' + uploadErr.message }, { status: 500 });
    }
    // URL signée stockée en DB (pas publique — générée à la demande pour les acheteurs)
    videoUrl = path; // on stocke juste le path, l'URL signée est générée à la lecture
  }

  // Créer la formation en DB
  const formation = await (prisma as any).formation.create({
    data: {
      title,
      description,
      category,
      price,
      duration,
      type: type === 'live' ? 'LIVE' : 'VIDEO',
      videoPath: videoUrl,
      formateurId: session.userId,
      status: 'PENDING', // En attente de validation par un employer
    },
  }).catch((err: unknown) => {
    console.error('[formation create]', err);
    return null;
  });

  if (!formation) {
    return NextResponse.json({ error: 'Erreur création en base' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: formation.id });
}

/* ── GET — lister les formations du formateur ──────── */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (session.role !== 'FORMATEUR' && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès réservé aux formateurs' }, { status: 403 });
  }

  const formations = await (prisma as any).formation.findMany({
    where: { formateurId: session.userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, title: true, category: true, price: true,
      type: true, status: true, duration: true, createdAt: true,
      _count: { select: { enrollments: true } },
    },
  }).catch(() => []);

  return NextResponse.json(formations);
}
