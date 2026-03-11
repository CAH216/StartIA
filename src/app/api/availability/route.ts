/**
 * GET /api/availability?weekOffset=0
 * ====================================
 * Retourne les créneaux disponibles pour une semaine donnée.
 * weekOffset=0 → semaine courante, 1 → semaine suivante, etc.
 *
 * Logique :
 *   Un créneau (date, heure) est DISPONIBLE si :
 *   1. Au moins 1 EMPLOYER a (dayOfWeek, hour) actif dans son planning
 *   2. ET au moins 1 de ces employers N'a PAS encore un booking ACCEPTED sur ce (date, heure)
 *
 * Réponse : { slots: [{ date: "2026-03-09", hour: 9, label: "Lundi 9h" }, ...] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DAY_NAMES = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

// Retourne la date du prochain Lundi à partir d'aujourd'hui + weekOffset semaines
function getWeekStart(weekOffset: number): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0=Dimanche, 1=Lundi...
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + weekOffset * 7);
  return monday;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const weekOffset = Math.max(0, Math.min(8, parseInt(searchParams.get('weekOffset') ?? '0', 10)));

  // 1. Récupérer tous les EMPLOYER avec leur planning
  const employers = await prisma.user.findMany({
    where: { role: 'EMPLOYER' },
    select: {
      id: true,
      employeeSchedule: {
        where: { active: true },
        select: { dayOfWeek: true, hour: true },
      },
    },
  });

  if (employers.length === 0) {
    return NextResponse.json({ slots: [] });
  }

  // 2. Calculer les dates de la semaine demandée
  const weekStart = getWeekStart(weekOffset);
  const weekDates: Date[] = [];
  for (let d = 0; d < 5; d++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + d);
    weekDates.push(date);
  }

  // 3. Construire la map : dayOfWeek → hour → employerIds disponibles
  const availMap = new Map<string, Set<string>>(); // key: "dow-hour"
  for (const emp of employers) {
    for (const slot of emp.employeeSchedule) {
      const key = `${slot.dayOfWeek}-${slot.hour}`;
      if (!availMap.has(key)) availMap.set(key, new Set());
      availMap.get(key)!.add(emp.id);
    }
  }

  // 4. Récupérer les bookings ACCEPTED sur ces dates pour calculer la saturation
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 5);

  const acceptedBookings = await prisma.expertBooking.findMany({
    where: {
      status: 'ACCEPTED',
      bookedDate: { gte: weekStart, lt: weekEnd },
      bookedHour: { not: null },
    },
    select: { employerId: true, bookedDate: true, bookedHour: true },
  });

  // Map : "dateISO-hour" → Set<employerId> (déjà occupés)
  const busyMap = new Map<string, Set<string>>();
  for (const b of acceptedBookings) {
    if (!b.bookedDate || b.bookedHour == null || !b.employerId) continue;
    const dateStr = b.bookedDate.toISOString().slice(0, 10);
    const key = `${dateStr}-${b.bookedHour}`;
    if (!busyMap.has(key)) busyMap.set(key, new Set());
    busyMap.get(key)!.add(b.employerId);
  }

  // 5. Construire la liste des créneaux disponibles
  const slots: { date: string; hour: number; dayIndex: number; label: string }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = 0; d < 5; d++) {
    const date = weekDates[d];
    if (date < today) continue; // passé

    const dateStr = date.toISOString().slice(0, 10);

    for (const [key, employerIds] of availMap.entries()) {
      const [dow, hour] = key.split('-').map(Number);
      if (dow !== d) continue;

      const busyKey = `${dateStr}-${hour}`;
      const busySet = busyMap.get(busyKey) ?? new Set();
      // Combien d'employers disponibles ce jour+heure ont encore de la place ?
      const freeEmployers = [...employerIds].filter(id => !busySet.has(id));

      if (freeEmployers.length > 0) {
        slots.push({
          date: dateStr,
          hour,
          dayIndex: d,
          label: `${DAY_NAMES[d]} ${hour}h`,
        });
      }
    }
  }

  // Trier par date puis heure
  slots.sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour);

  return NextResponse.json({ slots, weekStart: weekStart.toISOString().slice(0, 10) });
}
