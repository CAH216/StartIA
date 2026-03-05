import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET — liste tous les utilisateurs
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, fullName: true, companyName: true,
      sector: true, province: true, role: true, plan: true,
      createdAt: true, lastActiveAt: true, employerId: true,
      employer: { select: { id: true, fullName: true, email: true } },
      _count: { select: { diagnostics: true, tasks: true, certificates: true } },
    },
  });

  return NextResponse.json(users);
}

// POST — créer un utilisateur
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { email, password, fullName, companyName, role, sector, province, plan, employerId } = await req.json();

  if (!email || !password || !role) {
    return NextResponse.json({ error: 'Email, mot de passe et rôle requis' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email:       email.toLowerCase().trim(),
      passwordHash,
      fullName:    fullName    || null,
      companyName: companyName || null,
      sector:      sector      || null,
      province:    province    || null,
      role,
      plan:        plan        || 'FREE',
      employerId:  employerId  || null,
    },
    select: { id: true, email: true, fullName: true, role: true, plan: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
