import { NextRequest, NextResponse } from 'next/server';

const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Bella — voix féminine chaleureuse ElevenLabs
const ELEVENLABS_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 });

    const apiKey = process.env.ELEVEN_LABS;
    if (!apiKey) return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 500 });

    const sanitized = String(text).slice(0, 500).replace(/[<>]/g, '');

    const res = await fetch(ELEVENLABS_URL, {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
            text: sanitized,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.4, use_speaker_boost: true },
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        console.error('[ElevenLabs]', err);
        return NextResponse.json({ error: 'TTS failed' }, { status: 502 });
    }

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
        headers: {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
