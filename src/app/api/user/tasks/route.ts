import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TaskStatus } from '@prisma/client';

/** GET — return all task states for the current user as a key→status map */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({}, { status: 401 });

  const tasks = await prisma.task.findMany({ where: { userId: session.userId } });

  const map: Record<string, string> = {};
  for (const t of tasks) map[t.taskKey] = t.status; // 'IDLE' | 'ACTIVE' | 'DONE'

  return NextResponse.json(map);
}

/** PUT — upsert multiple tasks at once
 *  Body: { tasks: { taskKey: string; status: 'IDLE'|'ACTIVE'|'DONE' }[] }
 */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const body = await req.json();
  const items: { taskKey: string; status: TaskStatus }[] = body.tasks ?? [];

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Liste de tâches requise' }, { status: 400 });
  }

  await prisma.$transaction(
    items.map(t =>
      prisma.task.upsert({
        where: { userId_taskKey: { userId: session.userId, taskKey: t.taskKey } },
        create: { userId: session.userId, taskKey: t.taskKey, status: t.status },
        update: { status: t.status },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
