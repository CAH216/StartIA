import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const BUCKET = 'avatars';

/* ── POST — upload avatar vers Supabase Storage ── */
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });

    // Validation type + taille
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
        return NextResponse.json({ error: 'Format non supporté (JPEG, PNG, WebP, GIF uniquement)' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Fichier trop volumineux (5 Mo maximum)' }, { status: 400 });
    }

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const path = `${session.userId}/avatar.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, arrayBuffer, {
            contentType: file.type,
            upsert: true, // Remplace l'ancien avatar
        });

    if (uploadError) {
        console.error('[avatar upload]', uploadError);
        return NextResponse.json({ error: 'Erreur upload Supabase : ' + uploadError.message }, { status: 500 });
    }

    // URL publique
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    // Ajouter cache-busting
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Sauvegarder en DB
    await prisma.user.update({
        where: { id: session.userId },
        data: { avatarUrl },
    });

    return NextResponse.json({ avatarUrl });
}

/* ── DELETE — supprimer le compte ──────────────── */
export async function DELETE() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    // Supprimer l'avatar de Supabase
    await supabase.storage.from(BUCKET).remove([
        `${session.userId}/avatar.jpg`,
        `${session.userId}/avatar.png`,
        `${session.userId}/avatar.webp`,
    ]).catch(() => null);

    // Supprimer le compte (cascade sur toutes les relations)
    await prisma.user.delete({ where: { id: session.userId } });

    const res = NextResponse.json({ ok: true });
    res.cookies.delete('stratia_token');
    return res;
}
