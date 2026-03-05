'use client';

import AppShell from '@/components/AppShell';
import { useState, useEffect, useCallback } from 'react';
import { Users, MessageSquare, ThumbsUp, Pin, TrendingUp, Plus, X, Loader2, Trash2, Send, ChevronDown, ChevronUp } from 'lucide-react';

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; fullName: string | null; role: string };
}

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  pinned: boolean;
  createdAt: string;
  author: { id: string; fullName: string | null; role: string; companyName: string | null };
  replies: Reply[];
}

interface PostForm { title: string; content: string; tags: string; }
const EMPTY_POST: PostForm = { title: '', content: '', tags: '' };

export default function Communaute() {
  const [posts,       setPosts]       = useState<Post[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [me,          setMe]          = useState<{ id: string; role: string; fullName: string | null } | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [postForm,    setPostForm]    = useState<PostForm>(EMPTY_POST);
  const [postErr,     setPostErr]     = useState('');
  const [saving,      setSaving]      = useState(false);

  // Reply state: { [postId]: content }
  const [replyText,   setReplyText]   = useState<Record<string, string>>({});
  const [replying,    setReplying]    = useState<Record<string, boolean>>({});
  const [expanded,    setExpanded]    = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d && setMe(d));
    loadPosts();
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/community/posts');
      if (res.ok) setPosts(await res.json());
    } finally { setLoading(false); }
  }, []);

  const isEmployerOrAdmin = me?.role === 'EMPLOYER' || me?.role === 'ADMIN';

  async function handleNewPost() {
    if (!postForm.title.trim() || !postForm.content.trim()) {
      setPostErr('Titre et contenu sont requis'); return;
    }
    setSaving(true); setPostErr('');
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postForm.title,
          content: postForm.content,
          tags: postForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        let msg = `Erreur ${res.status}`;
        try { const d = await res.json(); msg = d.error || msg; } catch {}
        setPostErr(msg); return;
      }
      const newPost = await res.json();
      setPosts(prev => [newPost, ...prev]);
      setShowNewPost(false); setPostForm(EMPTY_POST);
    } catch (e) { setPostErr('Erreur réseau : ' + (e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleLike(postId: string) {
    if (!me) return;
    await fetch(`/api/community/posts/${postId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ like: true }),
    });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  }

  async function handleDeletePost(postId: string) {
    if (!confirm('Supprimer cette discussion ?')) return;
    const res = await fetch(`/api/community/posts/${postId}`, { method: 'DELETE' });
    if (res.ok) setPosts(prev => prev.filter(p => p.id !== postId));
  }

  async function handlePin(post: Post) {
    await fetch(`/api/community/posts/${post.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: !post.pinned }),
    });
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, pinned: !p.pinned } : p));
  }

  async function handleReply(postId: string) {
    const text = replyText[postId]?.trim();
    if (!text) return;
    setReplying(r => ({ ...r, [postId]: true }));
    try {
      const res = await fetch(`/api/community/posts/${postId}/replies`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const reply = await res.json();
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, replies: [...p.replies, reply] } : p
        ));
        setReplyText(r => ({ ...r, [postId]: '' }));
        setExpanded(e => ({ ...e, [postId]: true }));
      }
    } finally { setReplying(r => ({ ...r, [postId]: false })); }
  }

  async function handleDeleteReply(postId: string, replyId: string) {
    if (!confirm('Supprimer cette réponse ?')) return;
    const res = await fetch(`/api/community/replies/${replyId}`, { method: 'DELETE' });
    if (res.ok) {
      setPosts(prev => prev.map(p =>
        p.id === postId ? { ...p, replies: p.replies.filter(r => r.id !== replyId) } : p
      ));
    }
  }

  const inp = {
    background: 'var(--bg-base)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', borderRadius: '0.75rem',
    padding: '0.5rem 0.75rem', fontSize: '0.875rem', width: '100%', outline: 'none',
  } as React.CSSProperties;

  const roleBadge = (role: string) => {
    if (role === 'EMPLOYER') return <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>Expert</span>;
    if (role === 'ADMIN')    return <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>Admin</span>;
    return null;
  };

  return (
    <AppShell>
      <div className="p-4 md:p-8 space-y-8" style={{ color: 'var(--text-primary)' }}>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Communauté</h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Discussions entre entrepreneurs — cas réels, retours d&apos;expérience</p>
          </div>
          {me && (
            <button onClick={() => setShowNewPost(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#3b82f6', color: '#fff' }}>
              <Plus size={16} />Nouvelle discussion
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Discussions',    value: posts.length },
            { label: 'Réponses',       value: posts.reduce((s, p) => s + p.replies.length, 0) },
            { label: 'J\'aime total',  value: posts.reduce((s, p) => s + p.likes, 0) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl p-5 text-center"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts */}
          <div className="col-span-2 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-2" style={{ color: 'var(--text-muted)' }}>
                <Loader2 size={20} className="animate-spin" />Chargement...
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p>Aucune discussion pour le moment.</p>
                {me && (
                  <button onClick={() => setShowNewPost(true)} className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold"
                    style={{ background: '#3b82f6', color: '#fff' }}>
                    Créer la première discussion
                  </button>
                )}
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="rounded-2xl p-6"
                  style={{ background: 'var(--bg-surface)', border: `1px solid ${post.pinned ? 'rgba(234,179,8,0.2)' : 'var(--border)'}` }}>
                  {post.pinned && (
                    <div className="flex items-center gap-1.5 text-xs text-yellow-400 mb-3">
                      <Pin size={11} />Épinglé
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(post.author.fullName ?? post.author.id)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {post.author.fullName ?? 'Utilisateur'}
                          </p>
                          {roleBadge(post.author.role)}
                          {post.author.companyName && (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {post.author.companyName}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isEmployerOrAdmin && (
                            <button onClick={() => handlePin(post)}
                              className="p-1.5 rounded-lg hover:opacity-70"
                              style={{ color: post.pinned ? '#fbbf24' : 'var(--text-muted)' }}
                              title={post.pinned ? 'Désépingler' : 'Épingler'}>
                              <Pin size={13} />
                            </button>
                          )}
                          {(isEmployerOrAdmin || me?.id === post.author.id) && (
                            <button onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 rounded-lg hover:opacity-70"
                              style={{ color: '#f87171' }}>
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs mt-0.5 mb-1" style={{ color: 'var(--text-muted)' }}>
                        {new Date(post.createdAt).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <h3 className="text-base font-bold mt-2 mb-2" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{post.content}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                        {post.tags.map(tag => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-md"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                        <button onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1.5 text-sm transition-all"
                          style={{ color: 'var(--text-muted)' }}>
                          <ThumbsUp size={14} />{post.likes}
                        </button>
                        <button
                          onClick={() => setExpanded(e => ({ ...e, [post.id]: !e[post.id] }))}
                          className="flex items-center gap-1.5 text-sm"
                          style={{ color: 'var(--text-muted)' }}>
                          <MessageSquare size={14} />{post.replies.length} réponse{post.replies.length !== 1 ? 's' : ''}
                          {post.replies.length > 0 && (expanded[post.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                        </button>
                      </div>

                      {/* Replies */}
                      {expanded[post.id] && post.replies.length > 0 && (
                        <div className="mt-3 space-y-3 pl-3" style={{ borderLeft: '2px solid var(--border)' }}>
                          {post.replies.map(reply => (
                            <div key={reply.id} className="flex items-start gap-2">
                              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                {(reply.author.fullName ?? reply.author.id)[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {reply.author.fullName ?? 'Utilisateur'}
                                  </span>
                                  {roleBadge(reply.author.role)}
                                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                    {new Date(reply.createdAt).toLocaleDateString('fr-CA')}
                                  </span>
                                  {(isEmployerOrAdmin || me?.id === reply.author.id) && (
                                    <button onClick={() => handleDeleteReply(post.id, reply.id)}
                                      className="ml-auto p-1 hover:opacity-70"
                                      style={{ color: '#f87171' }}>
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply input */}
                      {me && (
                        <div className="mt-3 flex gap-2">
                          <input
                            value={replyText[post.id] ?? ''}
                            onChange={e => setReplyText(r => ({ ...r, [post.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply(post.id)}
                            placeholder="Écrire une réponse..."
                            className="flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                          <button
                            onClick={() => handleReply(post.id)}
                            disabled={replying[post.id] || !replyText[post.id]?.trim()}
                            className="px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                            style={{ background: '#3b82f6', color: '#fff' }}>
                            {replying[post.id] ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} style={{ color: 'var(--primary)' }} />
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Top contributeurs</h3>
              </div>
              {posts
                .reduce((acc, p) => {
                  const existing = acc.find(a => a.id === p.author.id);
                  if (existing) { existing.count++; }
                  else acc.push({ id: p.author.id, name: p.author.fullName ?? 'Utilisateur', count: 1 });
                  return acc;
                }, [] as { id: string; name: string; count: number }[])
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {c.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.count} discussion{c.count !== 1 ? 's' : ''}</p>
                    </div>
                    <span className="text-sm">{['🥇','🥈','🥉','⭐','⭐'][i]}</span>
                  </div>
                ))}
              {posts.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Aucune discussion pour le moment.</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-5 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-blue-400" />
                <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Charte communauté</h3>
              </div>
              <ul className="space-y-1.5">
                {['Partager des cas réels et concrets', 'Respecter la confidentialité', 'Pas de promotion commerciale', 'Aider avant de demander'].map(r => (
                  <li key={r} className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span className="w-1 h-1 bg-blue-400 rounded-full flex-shrink-0" />{r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* New post modal */}
      {showNewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 relative"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <button onClick={() => { setShowNewPost(false); setPostForm(EMPTY_POST); setPostErr(''); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
            <h2 className="font-bold mb-5" style={{ color: 'var(--text-primary)' }}>Nouvelle discussion</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Titre *</label>
                <input value={postForm.title} onChange={e => setPostForm(f => ({ ...f, title: e.target.value }))} style={inp}
                  placeholder="ex: ChatGPT pour les soumissions — retour après 3 mois" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Contenu *</label>
                <textarea value={postForm.content} onChange={e => setPostForm(f => ({ ...f, content: e.target.value }))}
                  rows={5} style={{ ...inp, resize: 'vertical' as const }}
                  placeholder="Partagez votre expérience, votre question ou votre conseil..." />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Tags (séparés par virgule)</label>
                <input value={postForm.tags} onChange={e => setPostForm(f => ({ ...f, tags: e.target.value }))} style={inp}
                  placeholder="IA, Soumissions, ROI..." />
              </div>
              {postErr && (
                <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  {postErr}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button onClick={() => { setShowNewPost(false); setPostForm(EMPTY_POST); setPostErr(''); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Annuler</button>
                <button onClick={handleNewPost} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
                  style={{ background: '#3b82f6', color: '#fff' }}>
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Publier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
