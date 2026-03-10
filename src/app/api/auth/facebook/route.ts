import { NextRequest, NextResponse } from 'next/server';

const FB_APP_ID = process.env.FACEBOOK_APP_ID!;
const FB_REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/facebook/callback`;

export async function GET(req: NextRequest) {
    if (!FB_APP_ID) {
        return NextResponse.json({ error: 'Facebook OAuth non configuré' }, { status: 500 });
    }

    const state = crypto.randomUUID();
    const url = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    url.searchParams.set('client_id', FB_APP_ID);
    url.searchParams.set('redirect_uri', FB_REDIRECT_URI);
    url.searchParams.set('state', state);
    url.searchParams.set('scope', 'email,public_profile');
    url.searchParams.set('response_type', 'code');

    const res = NextResponse.redirect(url.toString());
    res.cookies.set('stratia_oauth_state', state, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        maxAge: 600, sameSite: 'lax', path: '/',
    });
    return res;
}
