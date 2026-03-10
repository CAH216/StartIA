import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password, company } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Tous les champs obligatoires sont requis.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash: hashedPassword,
        fullName: `${firstName} ${lastName}`.trim(),
        companyName: company || null,
        role: 'USER', // Default role for public registration
        plan: 'FREE',
      },
    });

    // Generate token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Rediriger vers dashboard avec param welcome pour déclencher l'onboarding
    const redirect = '/dashboard?welcome=1';

    const res = NextResponse.json({
      ok: true,
      redirect,
      user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    });

    // Set cookie
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue lors de l\'inscription.' }, { status: 500 });
  }
}
