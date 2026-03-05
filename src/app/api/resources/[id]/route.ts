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
    const resource = await prisma.resource.update({ where: { id }, data });
    return NextResponse.json(resource);
  } catch (e) {
    console.error('PATCH /api/resources/[id]', e);
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
    await prisma.resource.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/resources/[id]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
