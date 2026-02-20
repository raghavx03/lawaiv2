'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import Link from 'next/link'
import {
  Send, Scale, Sparkles, Loader2, Upload, X, FileText,
  Phone, Trash2, Plus, Download, Share2,
  Copy, Check, ChevronRight, MessageSquare, Clock,
  BookOpen, Briefcase, HelpCircle, FileEdit, Menu, Globe
} from 'lucide-react'

// ============ TYPES ============
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  file?: { name: string; type: string }
  isDraft?: boolean // Tag for draft messages
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

// ============ STORAGE ============
const SESSIONS_KEY = 'lawai-chat-sessions'
const ACTIVE_KEY = 'lawai-chat-active'

function genId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function timeAgo(date: Date) {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function fmtTime(date: Date) {
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

// ============ MARKDOWN RENDERER ============
function renderMarkdown(text: string): string {
  // Strip special tokens from view
  let html = text.replace(/\[OFFER_DRAFT\]/g, '')

  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Bold & Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="font-bold"><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em class="italic text-gray-700">$1</em>')

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr class="border-gray-200 my-4" />')

  // Numbered lists
  html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<div class="flex gap-3 mb-2 ml-1"><span class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0 mt-0.5">$1</span><span>$2</span></div>')

  // Bullet lists
  html = html.replace(/^[-•]\s+(.+)$/gm, '<div class="flex gap-2 mb-1.5 ml-2"><span class="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0 mt-2"></span><span>$1</span></div>')

  // Code blocks
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 text-gray-800 text-xs rounded font-mono">$1</code>')

  // Sections/Legal refs highlight
  html = html.replace(/Section\s+(\d+[A-Za-z]*)/g, '<span class="font-semibold text-amber-700 bg-amber-50 px-1 rounded">Section $1</span>')
  html = html.replace(/Article\s+(\d+[A-Za-z]*)/g, '<span class="font-semibold text-blue-700 bg-blue-50 px-1 rounded">Article $1</span>')

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="mb-3">')
  html = html.replace(/\n/g, '<br/>')

  html = `<p class="mb-3">${html}</p>`

  // Cleanup
  html = html.replace(/<p class="mb-3"><\/p>/g, '')
  html = html.replace(/<p class="mb-3">(<hr)/g, '$1')
  html = html.replace(/(\/>\s*)<\/p>/g, '$1')
  html = html.replace(/<p class="mb-3">(<div)/g, '$1')
  html = html.replace(/(<\/div>)<\/p>/g, '$1')

  return html
}

// ============ MAIN COMPONENT ============
export default function AIAssistantPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string; content?: string } | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ============ PERSISTENCE LOAD ============
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_KEY)
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: (s.messages || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }))
        setSessions(parsed)
        const activeId = localStorage.getItem(ACTIVE_KEY)
        if (activeId) {
          const active = parsed.find(s => s.id === activeId)
          if (active) { setActiveSession(active); setMessages(active.messages) }
        }
      }
    } catch (e) { console.error('Load sessions error:', e) }
  }, [])

  // ============ MULTI-TAB SYNC ============
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSIONS_KEY && e.newValue) {
        try {
          const parsed: ChatSession[] = JSON.parse(e.newValue).map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
            messages: (s.messages || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
          }))
          setSessions(parsed)
          // If active session was updated in another tab, update messages
          if (activeSession) {
            const updatedActive = parsed.find(s => s.id === activeSession.id)
            if (updatedActive) {
              setMessages(updatedActive.messages)
            }
          }
        } catch (err) {
          console.error('Sync failed:', err)
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [activeSession])

  const save = useCallback((updated: ChatSession[]) => {
    try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated)) } catch (e) { /* ignore */ }
  }, [])

  const saveActive = useCallback((id: string | null) => {
    id ? localStorage.setItem(ACTIVE_KEY, id) : localStorage.removeItem(ACTIVE_KEY)
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamText, loading])

  // Textarea auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = '48px'
    ta.style.height = Math.min(ta.scrollHeight, 150) + 'px'
  }

  // ============ SESSION MGMT ============
  const newSession = useCallback(() => {
    const s: ChatSession = { id: genId(), title: 'New Chat', messages: [], createdAt: new Date(), updatedAt: new Date() }
    setActiveSession(s); setMessages([]); setSessions(prev => { const u = [s, ...prev]; save(u); return u }); saveActive(s.id); setSidebarOpen(false)
  }, [save, saveActive])

  const selectSession = useCallback((s: ChatSession) => {
    setActiveSession(s); setMessages(s.messages); saveActive(s.id); setSidebarOpen(false)
  }, [saveActive])

  const deleteSession = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessions(prev => { const u = prev.filter(s => s.id !== id); save(u); return u })
    if (activeSession?.id === id) { setActiveSession(null); setMessages([]); saveActive(null) }
    toast.success('Deleted')
  }, [activeSession, save, saveActive])

  // ============ FILE UPLOAD ============
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10MB'); return }
    if (file.type === 'text/plain') {
      const r = new FileReader()
      r.onload = (ev) => setUploadedFile({ name: file.name, type: file.type, content: ev.target?.result as string })
      r.readAsText(file)
    } else {
      setUploadedFile({ name: file.name, type: file.type })
    }
    toast.success(`📎 ${file.name}`)
  }

  // ============ SEND — STREAMING ============
  const handleSend = async () => {
    if ((!input.trim() && !uploadedFile) || loading) return

    const msg = input.trim()
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = '48px'

    let session = activeSession
    if (!session) {
      session = { id: genId(), title: msg.slice(0, 60) || 'New Chat', messages: [], createdAt: new Date(), updatedAt: new Date() }
      setActiveSession(session)
      saveActive(session.id)
    }

    let prompt = msg
    if (uploadedFile?.content) {
      prompt = `[Document: ${uploadedFile.name}]\n\nContent:\n${uploadedFile.content.substring(0, 5000)}\n\nQuestion: ${msg || 'Analyze this document.'}`
    }

    const userMsg: Message = {
      id: `u-${genId()}`, role: 'user', content: msg || `📎 ${uploadedFile?.name}`, timestamp: new Date(),
      file: uploadedFile ? { name: uploadedFile.name, type: uploadedFile.type } : undefined
    }

    const updatedMsgs = [...messages, userMsg]
    setMessages(updatedMsgs)
    setUploadedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setLoading(true)
    setStreamText('')

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          setStreamText(accumulated)
        }
      }

      if (accumulated.trim()) {
        const hasDraft = accumulated.includes('[OFFER_DRAFT]')
        const cleanContent = accumulated

        const aiMsg: Message = {
          id: `a-${genId()}`,
          role: 'assistant',
          content: cleanContent,
          timestamp: new Date(),
          isDraft: hasDraft
        }

        const final = [...updatedMsgs, aiMsg]
        setMessages(final)
        setStreamText('')
        updateSession(session, final, msg)
      }
    } catch (error: any) {
      console.error('Chat error:', error)
      toast.error('Failed to get response')
      const errMsg: Message = { id: `e-${genId()}`, role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
      setStreamText('')
      textareaRef.current?.focus()
    }
  }

  const updateSession = (session: ChatSession, finalMsgs: Message[], userText: string) => {
    const updated: ChatSession = {
      ...session,
      title: session.title === 'New Chat' ? (userText.slice(0, 60) || 'Document Analysis') : session.title,
      messages: finalMsgs,
      updatedAt: new Date()
    }
    setActiveSession(updated)
    setSessions(prev => {
      const idx = prev.findIndex(s => s.id === updated.id)
      const u = idx >= 0 ? prev.map((s, i) => i === idx ? updated : s) : [updated, ...prev]
      save(u)
      return u
    })
  }

  // ============ ACTIONS ============
  const copyMsg = (m: Message) => {
    const text = m.content.replace(/\[OFFER_DRAFT\]/g, '')
    navigator.clipboard.writeText(text)
    setCopiedId(m.id)
    toast.success('Copied!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const downloadChat = () => {
    if (!messages.length) return
    const title = activeSession?.title || 'LAW.AI Chat'
    const date = new Date().toLocaleDateString('en-IN')
    let txt = `${title}\nDate: ${date}\n${'='.repeat(50)}\n\n`
    messages.forEach(m => {
      txt += `[${fmtTime(m.timestamp)}] ${m.role === 'user' ? 'You' : 'AI Lawyer'}:\n${m.content.replace(/\[OFFER_DRAFT\]/g, '')}\n\n`
    })
    txt += `\n${'='.repeat(50)}\nGenerated by LAW.AI\n`
    const blob = new Blob([txt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.txt`; a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  const shareChat = async () => {
    if (!messages.length) return
    const text = messages.map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content.replace(/\[OFFER_DRAFT\]/g, '')}`).join('\n\n')
    if (navigator.share) {
      try { await navigator.share({ title: activeSession?.title, text: text.slice(0, 1000) }) } catch (e) { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    }
  }

  const convertToDraft = async (m: Message) => {
    toast.loading('Creating draft...', { id: 'draft' })
    try {
      const text = m.content.replace(/\[OFFER_DRAFT\]/g, '')
      const r = await fetch('/api/ai-to-draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aiContent: text }) })
      const d = await r.json()
      // Fix: Redirect to specific draft ID (requires DraftsPage to handle query param)
      if (d.ok && d.draft?.id) {
        toast.success('Draft created! Opening editor...', { id: 'draft' });
        window.open(`/drafts?id=${d.draft.id}`, '_blank')
      }
      else {
        toast.error('Failed to create draft', { id: 'draft' })
      }
    } catch { toast.error('Failed', { id: 'draft' }) }
  }

  // ============ SUGGESTIONS ============
  const categories = [
    {
      title: 'Criminal Law', icon: Scale, color: 'from-red-500 to-rose-600',
      questions: ['What is Section 420 IPC?', 'Explain bail provisions under CrPC', 'How to file an FIR?']
    },
    {
      title: 'Civil & Property', icon: BookOpen, color: 'from-blue-500 to-indigo-600',
      questions: ['How to file a civil suit?', 'Property registration process', 'Tenant eviction procedure']
    },
    {
      title: 'Family Law', icon: HelpCircle, color: 'from-purple-500 to-violet-600',
      questions: ['Divorce by mutual consent', 'Child custody rights', 'Maintenance under Hindu law']
    },
    {
      title: 'Consumer & Business', icon: Briefcase, color: 'from-emerald-500 to-green-600',
      questions: ['Section 138 cheque bounce', 'Consumer complaint process', 'Company registration steps']
    }
  ]

  // ============ RENDER ============
  return (
    <div className="h-screen flex bg-white overflow-hidden font-sans">
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />

      {/* ====== SIDEBAR ====== */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-gray-50 border-r border-gray-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:w-72
      `}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">LAW.AI</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 hover:bg-gray-200 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <button onClick={newSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-all hover:shadow-lg active:scale-[0.98]">
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>

        {/* Voice Lawyer */}
        <Link href="/voice-lawyer"
          className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl hover:from-amber-100 hover:to-orange-100 transition-all group active:scale-[0.98]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">🎙️ Voice Lawyer</p>
            <p className="text-xs text-gray-500">Real-time Consultant</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No chats yet</p>
              <p className="text-xs text-gray-400 mt-1">Start a conversation</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Recent Chats</p>
              {sessions.map(s => (
                <div key={s.id} onClick={() => selectSession(s)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeSession?.id === s.id ? 'bg-gray-900 text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'
                    }`}>
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeSession?.id === s.id ? 'text-white/60' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate font-medium">{s.title}</p>
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-3 h-3 ${activeSession?.id === s.id ? 'text-white/40' : 'text-gray-400'}`} />
                      <p className={`text-xs ${activeSession?.id === s.id ? 'text-white/50' : 'text-gray-400'}`}>{timeAgo(s.updatedAt)}</p>
                    </div>
                  </div>
                  <button onClick={(e) => deleteSession(s.id, e)}
                    className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${activeSession?.id === s.id ? 'hover:bg-white/10 text-white/60' : 'hover:bg-red-100 text-gray-400 hover:text-red-500'
                      }`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="p-3 border-t border-gray-200"><p className="text-xs text-gray-400 text-center">© 2026 LAW.AI by RAGSPRO</p></div>
      </aside>

      {/* ====== MAIN CHAT ====== */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-sm">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">AI Legal Assistant</h1>
                <p className="text-xs text-gray-500">Indian Law Expert • Powered by AI</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href="/voice-lawyer"
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md active:scale-[0.97]">
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Voice Lawyer</span>
            </Link>
            {messages.length > 0 && (
              <>
                <button onClick={downloadChat} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Download"><Download className="w-4 h-4" /></button>
                <button onClick={shareChat} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Share"><Share2 className="w-4 h-4" /></button>
              </>
            )}
            <button onClick={newSession} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="New Chat"><Plus className="w-4 h-4" /></button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          {messages.length === 0 && !loading ? (
            /* ====== ANIMATED WELCOME STATE ====== */
            <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-700">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-pulse">
                <Sparkles className="w-10 h-10 text-amber-500" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-center tracking-tight">
                Ask Any Legal Question
              </h2>

              <p className="text-gray-500 text-base sm:text-lg text-center max-w-xl mb-10 leading-relaxed">
                Expert answers on IPC, CrPC, Property, and Family Law.<br />
                <span className="text-amber-600 font-medium">Capable of drafting legal notices instantly.</span>
              </p>

              <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((cat, idx) => (
                  <div key={cat.title}
                    className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group cursor-default"
                    style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                        <cat.icon className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">{cat.title}</h3>
                    </div>
                    <div className="space-y-2">
                      {cat.questions.map(q => (
                        <button key={q} onClick={() => { setInput(q); textareaRef.current?.focus() }}
                          className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs sm:text-sm rounded-lg transition-all flex items-center justify-between group/btn active:scale-[0.98]">
                          <span className="truncate">{q}</span>
                          <ChevronRight className="w-3 h-3 text-gray-300 group-hover/btn:text-gray-500 group-hover/btn:translate-x-0.5 transition-all opacity-0 group-hover/btn:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ====== MESSAGES ====== */
            <div className="py-6 px-4 sm:px-6 space-y-6 max-w-4xl mx-auto">
              {messages.map(m => (
                <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : ''} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                  {m.role === 'assistant' && (
                    <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Scale className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] ${m.role === 'user' ? '' : 'w-full'}`}>
                    {m.file && (
                      <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-600 w-fit">
                        <FileText className="w-3.5 h-3.5" /><span>{m.file.name}</span>
                      </div>
                    )}
                    <div className={`rounded-2xl overflow-hidden ${m.role === 'user'
                      ? 'bg-gray-900 text-white px-5 py-3.5 rounded-br-md shadow-lg'
                      : 'bg-white border border-gray-200 px-6 py-5 rounded-bl-md shadow-sm'
                      }`}>
                      {m.role === 'user' ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                      ) : (
                        <div className="prose-legal text-sm leading-relaxed text-gray-800"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                      )}
                    </div>

                    {/* DRAFT PROMPT CARD - Only for AI messages with draft tag */}
                    {m.role === 'assistant' && (m.isDraft || m.content.includes('[OFFER_DRAFT]')) && (
                      <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in zoom-in duration-300">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-blue-100">
                            <FileEdit className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">Draft Ready</h4>
                            <p className="text-xs text-gray-500">I noticed you requested a legal draft.</p>
                          </div>
                        </div>
                        <button
                          onClick={() => convertToDraft(m)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                        >
                          Open Editor <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2 px-1">
                      <span className="text-xs text-gray-400 font-medium">{fmtTime(m.timestamp)}</span>
                      {m.role === 'assistant' && (
                        <div className="flex items-center gap-1 ml-auto">
                          <button onClick={() => copyMsg(m)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Copy">
                            {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => convertToDraft(m)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Create Draft">
                            <FileEdit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={downloadChat} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Download">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {m.role === 'user' && (
                    <div className="w-9 h-9 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-xs font-bold text-gray-500">You</span>
                    </div>
                  )}
                </div>
              ))}

              {/* STREAMING TEXT */}
              {streamText && (
                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                    <Scale className="w-4 h-4 text-white" />
                  </div>
                  <div className="max-w-[85%] w-full bg-white border border-gray-200 rounded-2xl rounded-bl-md px-6 py-5 shadow-sm">
                    <div className="prose-legal text-sm leading-relaxed text-gray-800"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(streamText) }} />
                    <span className="inline-block w-2 h-4 bg-gray-400 rounded-sm animate-pulse ml-0.5" />
                  </div>
                </div>
              )}

              {/* LOADING */}
              {loading && !streamText && (
                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="w-9 h-9 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-sm">
                    <Scale className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 px-6 py-5 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 font-medium">Analyzing legal query...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* FILE PREVIEW */}
        {uploadedFile && (
          <div className="px-4 pb-2 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl animate-in slide-in-from-bottom-2">
              <FileText className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 flex-1 truncate">{uploadedFile.name}</span>
              <button onClick={() => { setUploadedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
            </div>
          </div>
        )}

        {/* INPUT */}
        <div className="border-t border-gray-200 bg-white p-4 pb-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-gray-400 focus-within:ring-4 focus-within:ring-gray-100 transition-all">
              <input type="file" ref={fileInputRef} onChange={handleFile} accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx" className="hidden" />
              <button onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-xl hover:bg-gray-200 text-gray-500 transition-all flex-shrink-0 active:scale-95" title="Upload doc">
                <Upload className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <textarea ref={textareaRef} value={input} onChange={handleInputChange}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Ask a legal question... (e.g. 'Draft a legal notice')" rows={1} disabled={loading}
                  className="w-full px-2 py-3 bg-transparent border-0 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 text-base resize-none"
                  style={{ minHeight: '48px', maxHeight: '150px' }} />
              </div>
              <button onClick={handleSend} disabled={loading || (!input.trim() && !uploadedFile)}
                className="p-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition-all disabled:opacity-40 flex-shrink-0 shadow-md hover:shadow-lg active:scale-95">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3 font-medium">AI responses are for reference only. Consult a qualified advocate.</p>
          </div>
        </div>
      </div>

      {/* Global CSS for Animations */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .prose-legal h1, .prose-legal h2, .prose-legal h3 { font-family: inherit; }
        .prose-legal hr { margin: 24px 0; border-color: #e5e7eb; }
        .prose-legal strong { color: #111827; font-weight: 600; }
        .prose-legal ul, .prose-legal ol { margin-top: 1rem; margin-bottom: 1rem; }
        .prose-legal li { margin-bottom: 0.5rem; }
      `}</style>
    </div>
  )
}
