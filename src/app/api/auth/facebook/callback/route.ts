import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, COOKIE_NAME, TTL } from '@/lib/auth';

const FB_APP_ID = process.env.FACEBOOK_APP_ID!;
const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET!;
const FB_REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook/callback`;

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const savedState = req.cookies.get('stratia_oauth_state')?.value;
    if (!code || !state || state !== savedState) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=oauth_failed`);
    }

    try {
        // 1. Échange code → access_token
        const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
        tokenUrl.searchParams.set('client_id', FB_APP_ID);
        tokenUrl.searchParams.set('client_secret', FB_APP_SECRET);
        tokenUrl.searchParams.set('redirect_uri', FB_REDIRECT_URI);
        tokenUrl.searchParams.set('code', code);

        const tokenRes = await fetch(tokenUrl.toString());
        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error('FB token failed');

        // 2. Profil utilisateur via Graph API
        const profileRes = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${tokenData.access_token}`
        );
        const profile = await profileRes.json();
        if (!profile.email) throw new Error('No email from Facebook');

        // 3. Upsert
        let user = await prisma.user.findUnique({ where: { email: profile.email.toLowerCase() } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: profile.email.toLowerCase(),
                    fullName: profile.name || null,
                    avatarUrl: profile.picture?.data?.url || null,
                    oauthProvider: 'facebook',
                    oauthId: profile.id,
                    isNewUser: true,
                    role: 'USER',
                    plan: 'FREE',
                },
            });
        } else if (!user.oauthProvider) {
            await prisma.user.update({
                where: { id: user.id },
                data: { oauthProvider: 'facebook', oauthId: profile.id },
            });
        }

        // 4. JWT + cookie
        const token = await signToken({ userId: user.id, email: user.email, role: user.role });

        const res = NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`);
        res.cookies.set(COOKIE_NAME, token, {
            httpOnly: true, secure: process.env.NODE_ENV === 'production',
            maxAge: TTL, sameSite: 'lax', path: '/',
        });
        res.cookies.delete('stratia_oauth_state');
        return res;
    } catch (err) {
        console.error('[Facebook OAuth]', err);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=oauth_failed`);
    }
}
