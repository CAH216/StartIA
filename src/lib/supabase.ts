import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  sector: string | null;
  province: string | null;
  role: 'user' | 'admin';
  plan: 'free' | 'pro';
  avatar_url: string | null;
  created_at: string;
  last_active_at: string;
}

export interface DbDiagnostic {
  id: string;
  user_id: string;
  score: number;
  level: string;
  summary: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface DbTask {
  id: string;
  user_id: string;
  task_key: string;
  status: 'idle' | 'active' | 'done';
  updated_at: string;
}

export interface DbSession {
  id: string;
  user_id: string;
  title: string;
  messages: Array<{ role: string; content: string }>;
  created_at: string;
}

export interface DbSubscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro';
  status: 'active' | 'cancelled' | 'past_due';
  started_at: string;
  expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export interface DbCertificate {
  id: string;
  user_id: string;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_url: string | null;
  file_url: string | null;
  notes: string | null;
  created_at: string;
}

// ─── Admin helpers ────────────────────────────────────────────────────────────

export async function getAdminStats() {
  const [users, diagnostics, tasks, subscriptions] = await Promise.all([
    supabase.from('users').select('id, role, plan, created_at, last_active_at'),
    supabase.from('diagnostics').select('id, score, created_at'),
    supabase.from('tasks').select('id, status'),
    supabase.from('subscriptions').select('id, plan, status'),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allUsers = users.data ?? [];
  const activeToday = allUsers.filter(u =>
    new Date(u.last_active_at) >= today
  ).length;

  const allDiags = diagnostics.data ?? [];
  const avgScore = allDiags.length
    ? Math.round(allDiags.reduce((s, d) => s + d.score, 0) / allDiags.length)
    : 0;

  const allTasks = tasks.data ?? [];
  const doneTasks = allTasks.filter(t => t.status === 'done').length;

  const allSubs = subscriptions.data ?? [];
  const proUsers = allSubs.filter(s => s.plan === 'pro' && s.status === 'active').length;

  return {
    totalUsers: allUsers.length,
    activeToday,
    avgScore,
    totalDiagnostics: allDiags.length,
    tasksCompleted: doneTasks,
    proUsers,
    totalRevenue: proUsers * 149, // 149$/mois plan pro
  };
}

export async function getAllUsers(limit = 50) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      diagnostics(score, created_at),
      subscriptions(plan, status)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
