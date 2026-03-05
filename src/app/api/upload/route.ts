import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth';

const BUCKET = 'uploads'; // single bucket, subfolders: certificates / resources / formations

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== 'EMPLOYER' && session.role !== 'ADMIN'))
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // [DEV BYPASS] Si la clé manque en local, on simule un succès pour ne pas bloquer le test
  if (!serviceKey || serviceKey.startsWith('REPLACE_') || !supabaseUrl) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ [DEV WARNING] SUPABASE_SERVICE_ROLE_KEY manquant. Upload simulé.');
      return NextResponse.json({ 
        url: 'https://placehold.co/600x400/png?text=Fichier+Simule+(Dev)',
        mock: true 
      }, { status: 201 });
    }
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY non configuré dans .env.local' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string | null) ?? 'certificates'; // certificates | resources | formations

    if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });

    // Only allow PDF and common image formats
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: 'Format non supporté. Seuls PDF, PNG, JPG sont acceptés.' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() ?? 'pdf';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `${folder}/${session.userId}/${fileName}`;

    const admin = createClient(supabaseUrl, serviceKey);

    // Create bucket if it doesn't exist (ignore error if already exists)
    await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {});

    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(filePath, buffer, { contentType: file.type, upsert: false });

    if (upErr) {
      console.error('Supabase upload error:', upErr);
      return NextResponse.json({ error: `Erreur upload: ${upErr.message}` }, { status: 500 });
    }

    const { data } = admin.storage.from(BUCKET).getPublicUrl(filePath);
    return NextResponse.json({ url: data.publicUrl }, { status: 201 });
  } catch (e) {
    console.error('POST /api/upload', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
