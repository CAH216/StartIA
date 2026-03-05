import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST — ajouter un certificat à un client
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== 'EMPLOYER' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { id: clientId } = await params;

  // Vérifier que le client appartient à cet employeur
  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { id: true, employerId: true },
  });

  if (!client) {
    return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
  }

  // [MODIF] Restriction retirée : tout employeur peut ajouter des certificats.
  // if (session.role !== 'ADMIN' && client.employerId !== session.userId) { ... }

  const body = await req.json();
  const { name, issuer, issueDate, expiryDate, credentialUrl, fileUrl, notes } = body;

  if (!name) {
    return NextResponse.json({ error: 'Le nom du certificat est requis' }, { status: 400 });
  }

  const certificate = await prisma.certificate.create({
    data: {
      userId:        clientId,
      name,
      issuer:        issuer        || null,
      issueDate:     issueDate     ? new Date(issueDate)  : null,
      expiryDate:    expiryDate    ? new Date(expiryDate) : null,
      credentialUrl: credentialUrl || null,
      fileUrl:       fileUrl       || null,
      notes:         notes         || null,
    },
  });

  return NextResponse.json(certificate, { status: 201 });
}

// GET — liste des certificats d'un client
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== 'EMPLOYER' && session.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { id: clientId } = await params;

  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { id: true, employerId: true },
  });

  if (!client) {
    return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
  }

  // [MODIF] Restriction retirée : tout employeur peut consulter les certificats.
  // if (session.role !== 'ADMIN' && client.employerId !== session.userId) { ... }

  const certificates = await prisma.certificate.findMany({
    where:   { userId: clientId },
    orderBy: { issueDate: 'desc' },
  });

  return NextResponse.json(certificates);
}
