import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`;
const SCOPES = 'openid email profile';

export async function GET(req: NextRequest) {
    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json({ error: 'Google OAuth non configuré' }, { status: 500 });
    }

    const state = crypto.randomUUID(); // CSRF protection
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', GOOGLE_CLIENT_ID);
    url.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', SCOPES);
    url.searchParams.set('state', state);
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'select_account');

    const res = NextResponse.redirect(url.toString());
    res.cookies.set('stratia_oauth_state', state, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        maxAge: 600, sameSite: 'lax', path: '/',
    });
    return res;
}
