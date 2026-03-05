import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      proUsers,
      employerCount,
      activeToday,
      allDiagnostics,
      tasksDone,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { plan: 'PRO' } }),
      prisma.user.count({ where: { role: 'EMPLOYER' } }),
      prisma.user.count({ where: { lastActiveAt: { gte: today } } }),
      prisma.diagnostic.findMany({ select: { score: true } }),
      prisma.task.count({ where: { status: 'DONE' } }),
    ]);

    const avgScore = allDiagnostics.length
      ? Math.round(allDiagnostics.reduce((s, d) => s + d.score, 0) / allDiagnostics.length)
      : 0;

    return NextResponse.json({
      totalUsers,
      proUsers,
      employerCount,
      activeToday,
      avgScore,
      totalDiagnostics: allDiagnostics.length,
      tasksCompleted: tasksDone,
      totalRevenue: proUsers * 149,
      conversionRate: totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0,
    });
  } catch (err) {
    console.error('[admin/stats]', err);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }
}

