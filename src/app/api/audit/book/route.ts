/**
 * POST /api/audit/book
 * =====================
 * Réservation publique d'un audit (client sans compte).
 *
 * Body:
 *   { clientName, clientEmail, sector, biggestTask, currentTool, date: "2026-03-09", hour: 9 }
 *
 * Vérifie que le créneau est toujours disponible avant de créer le booking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      clientName:  string;
      clientEmail: string;
      sector:      string;
      biggestTask: string;
      currentTool: string;
      date:        string; // "2026-03-09"
      hour:        number;
    };

    const { clientName, clientEmail, sector, biggestTask, currentTool, date, hour } = body;

    if (!clientName?.trim() || !clientEmail?.trim() || !date || !hour) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    // Validation email simple
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const bookedDate = new Date(date + 'T00:00:00.000Z');
    if (isNaN(bookedDate.getTime())) {
      return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
    }

    // Vérifier que la date n'est pas passée
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookedDate < today) {
      return NextResponse.json({ error: 'Ce créneau est passé' }, { status: 400 });
    }

    // 0=Dim en JS, convertir en 0=Lun
    const jsDay = bookedDate.getUTCDay(); // 0=Dim, 1=Lun...
    const dayOfWeek = (jsDay + 6) % 7;   // 0=Lun, 4=Ven

    if (dayOfWeek > 4) {
      return NextResponse.json({ error: 'Week-end non disponible' }, { status: 400 });
    }

    // Vérifier qu'au moins un employé est disponible et libre
    const availableEmployers = await prisma.employeeAvailability.findMany({
      where: { dayOfWeek, hour, active: true },
      select: { employeeId: true },
    });

    if (availableEmployers.length === 0) {
      return NextResponse.json({ error: 'Ce créneau n\'est plus disponible' }, { status: 409 });
    }

    // Vérifier saturation : tous les employés disponibles ont-ils déjà un booking ACCEPTED ?
    const nextDay = new Date(bookedDate);
    nextDay.setUTCDate(bookedDate.getUTCDate() + 1);

    const busyEmployers = await prisma.expertBooking.findMany({
      where: {
        status:    'ACCEPTED',
        bookedDate: { gte: bookedDate, lt: nextDay },
        bookedHour: hour,
        employerId: { in: availableEmployers.map(e => e.employeeId) },
      },
      select: { employerId: true },
    });

    const busyIds = new Set(busyEmployers.map(b => b.employerId));
    const freeCount = availableEmployers.filter(e => !busyIds.has(e.employeeId)).length;

    if (freeCount === 0) {
      return NextResponse.json({ error: 'Ce créneau est complet' }, { status: 409 });
    }

    // Créer la réservation
    const dayLabel = DAY_NAMES[dayOfWeek] ?? 'Jour';
    const booking = await prisma.expertBooking.create({
      data: {
        clientName:  clientName.trim(),
        clientEmail: clientEmail.trim().toLowerCase(),
        topic:       sector || 'Audit IA',
        description: biggestTask || null,
        clientTool:  currentTool || null,
        slot:        `${dayLabel} ${hour}h`,
        bookedDate,
        bookedHour:  hour,
        status:      'PENDING',
      },
    });

    return NextResponse.json({ ok: true, bookingId: booking.id }, { status: 201 });

  } catch (e) {
    console.error('[audit/book]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
