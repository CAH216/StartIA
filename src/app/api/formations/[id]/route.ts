import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== 'EMPLOYER' && session.role !== 'ADMIN'))
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  try {
    const { id } = await params;
    const data = await req.json();
    const formation = await prisma.formation.update({ where: { id }, data });
    return NextResponse.json(formation);
  } catch (e) {
    console.error('PATCH /api/formations/[id]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== 'EMPLOYER' && session.role !== 'ADMIN'))
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

  try {
    const { id } = await params;
    await prisma.formation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/formations/[id]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
