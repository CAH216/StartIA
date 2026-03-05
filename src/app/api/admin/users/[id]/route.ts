import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// PATCH — modifier un utilisateur
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { fullName, companyName, role, plan, sector, province, employerId, password } = body;

  const data: Record<string, unknown> = {};
  if (fullName    !== undefined) data.fullName    = fullName;
  if (companyName !== undefined) data.companyName = companyName;
  if (role        !== undefined) data.role        = role;
  if (plan        !== undefined) data.plan        = plan;
  if (sector      !== undefined) data.sector      = sector;
  if (province    !== undefined) data.province    = province;
  if (employerId  !== undefined) data.employerId  = employerId || null;
  if (password)                  data.passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.update({
    where:  { id },
    data,
    select: { id: true, email: true, fullName: true, role: true, plan: true, employerId: true },
  });

  return NextResponse.json(user);
}

// DELETE — supprimer un utilisateur
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { id } = await params;

  // Empêcher de supprimer son propre compte
  if (id === session.userId) {
    return NextResponse.json({ error: 'Impossible de supprimer votre propre compte' }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
