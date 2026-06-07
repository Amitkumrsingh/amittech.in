"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import { cn } from '../lib/classes'
import MicroButton from './MicroButton'

type Role = 'USER' | 'SUPER_ADMIN'
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED'
type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
type MediaType = 'IMAGE' | 'GIF' | 'VIDEO'

type AuthUser = {
  id: string
  name: string
  email: string
  profileImage?: string | null
  role: Role
  status: UserStatus
}

type Category = {
  id: string
  name: string
  slug: string
}

type Tag = {
  id: string
  name: string
  slug: string
}

type MediaItem = {
  id: string
  url: string
  type: MediaType
  filename: string
  mimeType: string
  size: number
  createdAt: string
}

type CmsPost = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  sanitizedHtml?: string | null
  coverImage?: string | null
  category?: Category | null
  tags: Tag[]
  status: PostStatus
  readingTime: number
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  metaTitle?: string | null
  metaDescription?: string | null
  ogImage?: string | null
  views: number
  isFeatured: boolean
  deletedAt?: string | null
  author: {
    id: string
    name: string
    email: string
    profileImage?: string | null
  }
}

type PostForm = {
  id?: string
  title: string
  slug: string
  excerpt: string
  html: string
  coverImage: string
  category: string
  tags: string
  status: PostStatus
  metaTitle: string
  metaDescription: string
  ogImage: string
  isFeatured: boolean
}

type ApiEnvelope<T> = {
  ok: boolean
  data?: T
  error?: string
  code?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void
          renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void
          prompt: () => void
        }
      }
    }
  }
}

const STATUS_OPTIONS: Array<{ label: string; value: PostStatus | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Drafts', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Archived', value: 'ARCHIVED' }
]

const emptyForm: PostForm = {
  title: '',
  slug: '',
  excerpt: '',
  html: '',
  coverImage: '',
  category: '',
  tags: '',
  status: 'DRAFT',
  metaTitle: '',
  metaDescription: '',
  ogImage: '',
  isFeatured: false
}

function compact(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function normalizeTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
    )
  )
}

function postToForm(post: CmsPost): PostForm {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    html: post.sanitizedHtml || '',
    coverImage: post.coverImage || '',
    category: post.category?.name || '',
    tags: post.tags.map(tag => tag.name).join(', '),
    status: post.status,
    metaTitle: post.metaTitle || '',
    metaDescription: post.metaDescription || '',
    ogImage: post.ogImage || '',
    isFeatured: post.isFeatured
  }
}

function formatDate(value?: string | null) {
  if (!value) return 'Not published'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body instanceof FormData ? init.headers : { 'content-type': 'application/json', ...init?.headers },
    credentials: 'same-origin'
  })
  const payload = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || !payload.ok) throw new Error(payload.error || 'Request failed')
  return payload.data as T
}

export default function AdminDashboard() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [googleClientId, setGoogleClientId] = useState<string | null>(null)
  const [googleReady, setGoogleReady] = useState(false)
  const [posts, setPosts] = useState<CmsPost[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState<PostForm>(emptyForm)
  const googleButtonRef = useRef<HTMLDivElement | null>(null)

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const refreshMe = useCallback(async () => {
    setAuthLoading(true)
    try {
      const data = await requestJson<{ user: AuthUser | null }>('/api/auth/me')
      setUser(data.user)
    } catch (requestError) {
      setAuthError(requestError instanceof Error ? requestError.message : 'Unable to check session')
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const loadPosts = useCallback(async () => {
    if (!user) return
    setLoadingPosts(true)
    setError('')
    const params = new URLSearchParams({ pageSize: '50' })
    if (isSuperAdmin) params.set('includeDeleted', 'true')
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    if (search.trim()) params.set('search', search.trim())

    try {
      const endpoint = isSuperAdmin ? '/api/admin/posts' : '/api/my/posts'
      const data = await requestJson<{ items: CmsPost[]; pagination: { total: number } }>(`${endpoint}?${params.toString()}`)
      setPosts(data.items)
      setForm(current => {
        if (!current.id) return current
        const updatedPost = data.items.find(post => post.id === current.id)
        return updatedPost ? postToForm(updatedPost) : emptyForm
      })
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load posts')
    } finally {
      setLoadingPosts(false)
    }
  }, [isSuperAdmin, search, statusFilter, user])

  const loadMedia = useCallback(async () => {
    if (!user) return
    try {
      const data = await requestJson<{ media: MediaItem[] }>('/api/media/my')
      setMedia(data.media)
    } catch {
      setMedia([])
    }
  }, [user])

  useEffect(() => {
    refreshMe()
    requestJson<{ googleClientId: string | null; googleConfigured: boolean }>('/api/auth/config')
      .then(data => setGoogleClientId(data.googleClientId))
      .catch(() => setGoogleClientId(null))
  }, [refreshMe])

  useEffect(() => {
    if (!googleClientId || user) return

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]')
    const renderButton = () => {
      if (!window.google || !googleButtonRef.current) return
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async response => {
          if (!response.credential) {
            setAuthError('Google did not return a credential')
            return
          }
          setAuthError('')
          try {
            const data = await requestJson<{ user: AuthUser }>('/api/auth/google', {
              method: 'POST',
              body: JSON.stringify({ credential: response.credential })
            })
            setUser(data.user)
            setMessage('Signed in')
          } catch (requestError) {
            setAuthError(requestError instanceof Error ? requestError.message : 'Google login failed')
          }
        }
      })
      googleButtonRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: 280
      })
      setGoogleReady(true)
    }

    if (existingScript) {
      if (window.google) renderButton()
      else existingScript.addEventListener('load', renderButton, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = renderButton
    script.onerror = () => setAuthError('Google login script could not load')
    document.head.appendChild(script)
  }, [googleClientId, user])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  useEffect(() => {
    loadMedia()
  }, [loadMedia])

  const metrics = useMemo(() => {
    const visiblePosts = posts.filter(post => !post.deletedAt)
    return {
      total: visiblePosts.length,
      published: visiblePosts.filter(post => post.status === 'PUBLISHED').length,
      drafts: visiblePosts.filter(post => post.status === 'DRAFT').length,
      views: visiblePosts.reduce((sum, post) => sum + post.views, 0)
    }
  }, [posts])

  const categories = useMemo(() => {
    return Array.from(new Set(posts.map(post => post.category?.name).filter(Boolean) as string[])).sort()
  }, [posts])

  const tags = useMemo(() => {
    return Array.from(new Set(posts.flatMap(post => post.tags.map(tag => tag.name)))).sort()
  }, [posts])

  function updateForm<K extends keyof PostForm>(key: K, value: PostForm[K]) {
    setForm(current => ({ ...current, [key]: value }))
  }

  function getPayload(nextStatus = form.status) {
    return {
      title: form.title.trim(),
      slug: compact(form.slug) || undefined,
      excerpt: compact(form.excerpt),
      html: compact(form.html),
      coverImage: compact(form.coverImage),
      category: compact(form.category),
      tags: normalizeTags(form.tags),
      status: nextStatus,
      metaTitle: compact(form.metaTitle),
      metaDescription: compact(form.metaDescription),
      ogImage: compact(form.ogImage),
      ...(isSuperAdmin ? { isFeatured: form.isFeatured } : {})
    }
  }

  async function savePost(nextStatus = form.status) {
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const payload = getPayload(nextStatus)
      const data = form.id
        ? await requestJson<{ post: CmsPost }>(`${isSuperAdmin ? '/api/admin/posts' : '/api/posts'}/${form.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : await requestJson<{ post: CmsPost }>('/api/posts', { method: 'POST', body: JSON.stringify(payload) })

      setForm(postToForm(data.post))
      setMessage(nextStatus === 'PUBLISHED' ? 'Post published' : 'Post saved')
      await loadPosts()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save post')
    } finally {
      setSaving(false)
    }
  }

  async function runAction(action: 'publish' | 'unpublish' | 'archive' | 'delete' | 'feature', post = selectedPost) {
    if (!post) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      if (action === 'delete') {
        await requestJson<{ post: CmsPost }>(`${isSuperAdmin ? '/api/admin/posts' : '/api/posts'}/${post.id}`, { method: 'DELETE' })
        setForm(emptyForm)
        setMessage('Post deleted')
      } else if (action === 'feature') {
        if (!isSuperAdmin) throw new Error('Only super admins can feature posts')
        const data = await requestJson<{ post: CmsPost }>(`/api/admin/posts/${post.id}/feature`, {
          method: 'PATCH',
          body: JSON.stringify({ isFeatured: !post.isFeatured })
        })
        setForm(postToForm(data.post))
        setMessage(data.post.isFeatured ? 'Featured post updated' : 'Removed from featured')
      } else {
        const data = await requestJson<{ post: CmsPost }>(`/api/posts/${post.id}/${action}`, { method: 'PATCH' })
        setForm(postToForm(data.post))
        setMessage(`Post ${action === 'unpublish' ? 'moved to draft' : action}d`)
      }
      await loadPosts()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Action failed')
    } finally {
      setSaving(false)
    }
  }

  async function logout() {
    await requestJson<{ loggedOut: boolean }>('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setPosts([])
    setMedia([])
    setForm(emptyForm)
    setMessage('Signed out')
  }

  async function uploadCover(file?: File) {
    if (!file) return
    setUploading(true)
    setError('')
    setMessage('')
    try {
      const body = new FormData()
      body.append('file', file)
      if (form.id) body.append('postId', form.id)
      const data = await requestJson<{ media: MediaItem }>('/api/media/upload', { method: 'POST', body })
      updateForm('coverImage', data.media.url)
      setMedia(current => [data.media, ...current])
      setMessage('Cover uploaded')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const selectedPost = useMemo(() => posts.find(post => post.id === form.id), [form.id, posts])
  const filteredPosts = posts.filter(post => !post.deletedAt)

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={motionTheme.variants.containerStagger(0.04)}
      className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] p-4 shadow-[0_40px_140px_-90px_rgba(6,182,212,0.65)] backdrop-blur-2xl sm:p-6"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-40 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.22),transparent_65%)] blur-3xl" />

      <div className="relative flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">Private CMS</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-5xl">CMS Command Center</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Publish engineering notes with production-grade metadata, media, status control, and editorial preview.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/blog" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-secondary/50 hover:text-secondary">
            View blog
          </Link>
          {user ? (
            <MicroButton
              type="button"
              onClick={logout}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-accent/50 hover:text-accent"
            >
              Sign out
            </MicroButton>
          ) : null}
        </div>
      </div>

      {authLoading ? (
        <DashboardShell>
          <Panel className="lg:col-span-5">
            <p className="text-sm text-slate-300">Checking session...</p>
          </Panel>
        </DashboardShell>
      ) : !user ? (
        <DashboardShell>
          <Panel className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Authentication</p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-white">Sign in to manage posts.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              Use Google to write and manage your posts. Super admins can manage all content.
            </p>
            <div className="mt-6 min-h-11">
              {googleClientId ? <div ref={googleButtonRef} /> : <p className="text-sm text-accent">Google OAuth is not configured.</p>}
            </div>
            {googleClientId && !googleReady ? <p className="mt-3 text-xs text-slate-500">Loading Google sign-in...</p> : null}
            {authError ? <Alert tone="error">{authError}</Alert> : null}
          </Panel>
          <Panel className="lg:col-span-7">
            <EditorialEmptyState />
          </Panel>
        </DashboardShell>
      ) : (
        <DashboardShell>
          <div className="space-y-4 lg:col-span-5">
            <Panel>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Signed in</p>
                  <h2 className="mt-2 text-lg font-semibold text-white">{user.name}</h2>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
                <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  {isSuperAdmin ? 'SUPER ADMIN' : 'WRITER'}
                </span>
              </div>
            </Panel>

            <div className="grid grid-cols-2 gap-3">
              <Metric label="Posts" value={metrics.total} />
              <Metric label="Published" value={metrics.published} />
              <Metric label="Drafts" value={metrics.drafts} />
              <Metric label="Views" value={metrics.views} />
            </div>

            <Panel>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="Search posts"
                  className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-slate-500 focus:border-secondary/50"
                />
                <MicroButton
                  type="button"
                  onClick={() => setForm(emptyForm)}
                  className="min-h-11 rounded-2xl bg-secondary px-4 text-sm font-semibold text-black transition hover:bg-auroraTeal"
                >
                  New post
                </MicroButton>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(option => (
                  <MicroButton
                    key={option.value}
                    type="button"
                    onClick={() => setStatusFilter(option.value)}
                    className={cn(
                      'rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition',
                      statusFilter === option.value
                        ? 'border-secondary bg-secondary/15 text-secondary'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                    )}
                  >
                    {option.label}
                  </MicroButton>
                ))}
              </div>
            </Panel>

            <Panel className="max-h-[620px] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Articles</h2>
                {loadingPosts ? <span className="text-xs text-secondary">Syncing</span> : null}
              </div>
              <div className="mt-4 space-y-3">
                {filteredPosts.length ? (
                  filteredPosts.map(post => (
                    <PostListItem key={post.id} post={post} active={post.id === form.id} onSelect={() => setForm(postToForm(post))} />
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-white/10 p-5 text-sm leading-7 text-slate-400">
                    No posts yet. Start with a production lesson, not a tutorial.
                  </p>
                )}
              </div>
            </Panel>

            <Panel>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Taxonomy</h2>
              <ChipGroup label="Categories" items={categories} onPick={value => updateForm('category', value)} />
              <ChipGroup
                label="Tags"
                items={tags}
                onPick={value => updateForm('tags', form.tags ? `${form.tags}, ${value}` : value)}
              />
            </Panel>
          </div>

          <div className="space-y-4 lg:col-span-7">
            {message ? <Alert tone="success">{message}</Alert> : null}
            {error ? <Alert tone="error">{error}</Alert> : null}

            <Panel>
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {form.id ? 'Edit article' : 'New article'}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-white">
                    {form.title || 'Untitled production note'}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton onClick={() => savePost('DRAFT')} disabled={saving}>
                    Save draft
                  </ActionButton>
                  <ActionButton onClick={() => savePost('PUBLISHED')} disabled={saving} variant="primary">
                    Publish
                  </ActionButton>
                  {selectedPost ? (
                    <>
                      <ActionButton onClick={() => runAction(selectedPost.status === 'PUBLISHED' ? 'unpublish' : 'publish')} disabled={saving}>
                        {selectedPost.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </ActionButton>
                      <ActionButton onClick={() => runAction('archive')} disabled={saving}>
                        Archive
                      </ActionButton>
                      {isSuperAdmin ? (
                        <ActionButton onClick={() => runAction('feature')} disabled={saving}>
                          {selectedPost.isFeatured ? 'Unfeature' : 'Feature'}
                        </ActionButton>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Title">
                  <input value={form.title} onChange={event => updateForm('title', event.target.value)} className={inputClassName} />
                </Field>
                <Field label="Slug">
                  <input value={form.slug} onChange={event => updateForm('slug', event.target.value)} placeholder="auto-generated when empty" className={inputClassName} />
                </Field>
                <Field label="Category">
                  <input value={form.category} onChange={event => updateForm('category', event.target.value)} className={inputClassName} />
                </Field>
                <Field label="Tags">
                  <input value={form.tags} onChange={event => updateForm('tags', event.target.value)} placeholder="Kafka, Reliability, Backend" className={inputClassName} />
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={event => updateForm('status', event.target.value as PostStatus)} className={inputClassName}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </Field>
                <Field label="Cover image URL">
                  <input value={form.coverImage} onChange={event => updateForm('coverImage', event.target.value)} className={inputClassName} />
                </Field>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <Field label="Cloudinary cover upload">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={event => uploadCover(event.target.files?.[0])}
                    className="block min-h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
                  />
                </Field>
                <span className="pb-3 text-xs text-slate-500">{uploading ? 'Uploading...' : media.length ? `${media.length} uploads` : 'No uploads yet'}</span>
              </div>

              <Field label="Hook / excerpt" className="mt-4">
                <textarea value={form.excerpt} onChange={event => updateForm('excerpt', event.target.value)} rows={3} className={textareaClassName} />
              </Field>

              <Field label="Article HTML" className="mt-4">
                <textarea
                  value={form.html}
                  onChange={event => updateForm('html', event.target.value)}
                  rows={12}
                  placeholder="<p>Start with the production problem. Then show the tradeoff.</p>"
                  className={cn(textareaClassName, 'font-mono text-xs leading-6')}
                />
              </Field>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Meta title">
                  <input value={form.metaTitle} onChange={event => updateForm('metaTitle', event.target.value)} className={inputClassName} />
                </Field>
                <Field label="OG image">
                  <input value={form.ogImage} onChange={event => updateForm('ogImage', event.target.value)} className={inputClassName} />
                </Field>
              </div>
              <Field label="Meta description" className="mt-4">
                <textarea value={form.metaDescription} onChange={event => updateForm('metaDescription', event.target.value)} rows={2} className={textareaClassName} />
              </Field>

              {isSuperAdmin ? (
                <label className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={event => updateForm('isFeatured', event.target.checked)}
                    className="h-4 w-4 accent-cyan-400"
                  />
                  Featured article
                </label>
              ) : null}

              <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-5">
                <div className="flex flex-wrap gap-2">
                  <ActionButton onClick={() => savePost(form.status)} disabled={saving} variant="primary">
                    {saving ? 'Saving...' : 'Save changes'}
                  </ActionButton>
                  <ActionButton onClick={() => setForm(emptyForm)} disabled={saving}>
                    Reset
                  </ActionButton>
                </div>
                {selectedPost ? (
                  <ActionButton onClick={() => runAction('delete')} disabled={saving} variant="danger">
                    Delete
                  </ActionButton>
                ) : null}
              </div>
            </Panel>

            <Panel>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Preview</h2>
                <div className="flex items-center gap-2">
                  <StatusPill status={form.status} />
                  {selectedPost?.slug ? (
                    <Link href={`/blog/${selectedPost.slug}`} className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:text-secondary">
                      Open post
                    </Link>
                  ) : null}
                </div>
              </div>
              <article className="mt-5 overflow-hidden rounded-[28px] border border-white/10 bg-black/20">
                {form.coverImage ? (
                  <img src={form.coverImage} alt="" className="h-64 w-full object-cover" />
                ) : (
                  <div className="grid h-64 place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.16),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] text-sm text-slate-500">
                    Cover preview
                  </div>
                )}
                <div className="p-5 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">{form.category || 'Engineering'}</p>
                  <h3 className="mt-3 font-display text-3xl font-semibold leading-tight text-white">{form.title || 'Untitled article'}</h3>
                  <p className="mt-4 text-base leading-8 text-slate-300">{form.excerpt || 'The hook should name the real engineering tension.'}</p>
                  <div
                    className="mt-5 space-y-4 text-sm leading-7 text-slate-300 [&_a]:text-secondary [&_blockquote]:border-l-2 [&_blockquote]:border-secondary [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc"
                    dangerouslySetInnerHTML={{ __html: form.html || '<p>Write the lesson like a senior engineer talking to another engineer.</p>' }}
                  />
                </div>
              </article>
            </Panel>
          </div>
        </DashboardShell>
      )}
    </motion.section>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  return <div className="relative mt-6 grid gap-4 lg:grid-cols-12">{children}</div>
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={motionTheme.variants.fadeUp()} className={cn('rounded-[28px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_28px_100px_-80px_rgba(124,58,237,0.65)] backdrop-blur-xl sm:p-5', className)}>
      {children}
    </motion.div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Panel>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-white">{value.toLocaleString()}</p>
    </Panel>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      {children}
    </label>
  )
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = 'default'
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'primary' | 'danger'
}) {
  return (
    <MicroButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary'
          ? 'border-secondary bg-secondary text-black hover:bg-auroraTeal'
          : variant === 'danger'
            ? 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
            : 'border-white/10 bg-white/5 text-slate-200 hover:border-secondary/40 hover:text-secondary'
      )}
    >
      {children}
    </MicroButton>
  )
}

function Alert({ children, tone }: { children: React.ReactNode; tone: 'success' | 'error' }) {
  return (
    <div className={cn('rounded-2xl border px-4 py-3 text-sm', tone === 'success' ? 'border-secondary/30 bg-secondary/10 text-secondary' : 'border-accent/30 bg-accent/10 text-accent')}>
      {children}
    </div>
  )
}

function PostListItem({ post, active, onSelect }: { post: CmsPost; active: boolean; onSelect: () => void }) {
  return (
    <MicroButton
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-2xl border p-4 text-left transition',
        active ? 'border-secondary bg-secondary/10' : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.055]'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{post.title}</p>
          <p className="mt-1 text-xs text-slate-500">{post.slug}</p>
        </div>
        <StatusPill status={post.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span>{post.readingTime} min</span>
        <span>{formatDate(post.publishedAt || post.createdAt)}</span>
        {post.isFeatured ? <span className="text-gold">Featured</span> : null}
      </div>
    </MicroButton>
  )
}

function StatusPill({ status }: { status: PostStatus }) {
  const styles: Record<PostStatus, string> = {
    DRAFT: 'border-gold/30 bg-gold/10 text-gold',
    PUBLISHED: 'border-secondary/30 bg-secondary/10 text-secondary',
    ARCHIVED: 'border-slate-500/30 bg-slate-500/10 text-slate-300'
  }

  return (
    <span className={cn('shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]', styles[status])}>
      {status}
    </span>
  )
}

function ChipGroup({ label, items, onPick }: { label: string; items: string[]; onPick: (value: string) => void }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length ? (
          items.slice(0, 12).map(item => (
            <MicroButton
              key={item}
              type="button"
              onClick={() => onPick(item)}
              className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-slate-300 transition hover:border-secondary/50 hover:text-secondary"
            >
              {item}
            </MicroButton>
          ))
        ) : (
          <span className="text-xs text-slate-500">No {label.toLowerCase()} yet</span>
        )}
      </div>
    </div>
  )
}

function EditorialEmptyState() {
  return (
    <div className="grid min-h-[300px] place-items-center rounded-[28px] border border-dashed border-white/10 bg-black/20 p-6 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">Editorial OS</p>
        <h2 className="mt-4 font-display text-3xl font-semibold text-white">Turn production lessons into readable notes.</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
          The dashboard opens after Google login and session verification.
        </p>
      </div>
    </div>
  )
}

const inputClassName = 'min-h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-slate-500 focus:border-secondary/50'
const textareaClassName = 'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-7 text-white placeholder:text-slate-500 focus:border-secondary/50'
