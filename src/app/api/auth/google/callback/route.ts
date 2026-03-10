import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, COOKIE_NAME, TTL } from '@/lib/auth';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // CSRF check
    const savedState = req.cookies.get('stratia_oauth_state')?.value;
    if (!code || !state || state !== savedState) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=oauth_failed`);
    }

    try {
        // 1. Échange code → access_token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_REDIRECT_URI, grant_type: 'authorization_code',
            }),
        });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) throw new Error('Token exchange failed');

        // 2. Infos utilisateur
        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const profile = await userRes.json();
        if (!profile.email) throw new Error('No email from Google');

        // 3. Upsert utilisateur
        let user = await prisma.user.findUnique({ where: { email: profile.email.toLowerCase() } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: profile.email.toLowerCase(),
                    fullName: profile.name || null,
                    avatarUrl: profile.picture || null,
                    oauthProvider: 'google',
                    oauthId: profile.sub,
                    isNewUser: true,
                    role: 'USER',
                    plan: 'FREE',
                },
            });
        } else if (!user.oauthProvider) {
            // Utilisateur existant avec email/mot de passe — lier OAuth
            await prisma.user.update({
                where: { id: user.id },
                data: { oauthProvider: 'google', oauthId: profile.sub, avatarUrl: profile.picture || user.avatarUrl },
            });
        }

        // 4. JWT + cookie
        const token = await signToken({ userId: user.id, email: user.email, role: user.role });
        const isNew = !user.oauthProvider; // c'était un nouveau user non OAuth
        const dashUrl = isNew
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?welcome=1`
            : `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`;

        const res = NextResponse.redirect(dashUrl);
        res.cookies.set(COOKIE_NAME, token, {
            httpOnly: true, secure: process.env.NODE_ENV === 'production',
            maxAge: TTL, sameSite: 'lax', path: '/',
        });
        res.cookies.delete('stratia_oauth_state');

        // Persist role for client-side Sidebar
        return res;
    } catch (err) {
        console.error('[Google OAuth]', err);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=oauth_failed`);
    }
}
