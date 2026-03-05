import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — liste de TOUS les clients (role USER), sans filtre d'assignation
export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'EMPLOYER' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const clients = await prisma.user.findMany({
    where: { role: 'USER' },
    select: {
      id:          true,
      email:       true,
      fullName:    true,
      companyName: true,
      plan:        true,
      createdAt:   true,
      certificates: {
        select: { id: true, name: true, issueDate: true },
        orderBy: { issueDate: 'desc' },
      },
      _count: {
        select: { diagnostics: true, tasks: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(clients);
}
