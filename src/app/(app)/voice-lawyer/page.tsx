'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, ArrowLeft, Scale, Globe } from 'lucide-react'
import Link from 'next/link'

interface ConversationEntry {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

const VOICE_SYSTEM_PROMPT = `You are Advocate Sharma, a senior Indian lawyer with 25+ years experience. You are on a VOICE PHONE CALL with a client.

VOICE RULES:
1. Talk EXACTLY like a real Indian lawyer on phone — warm, professional, conversational
2. Use SHORT sentences — this is read aloud by text-to-speech
3. NEVER use markdown: no #, no *, no bullet points, no numbered lists, no dashes
4. NEVER say "asterisk", "hash", or any formatting words
5. Use natural speech pauses with periods and commas
6. Start by acknowledging what the user said warmly

LEGAL EXPERTISE:
- Cite specific Sections, Articles, Acts
- Give complete legal picture: rights, remedies, procedures, timelines
- Mention relevant Supreme Court or High Court case law
- Explain in simple words what each section means practically
- Tell them what steps to take next
- Mention costs, court fees, time estimates when relevant

RESPONSE STYLE:
- Start: "I understand your concern about..."
- Law: "Under Section X of the Y Act..."
- Advice: "What you should do is..."
- End: "Don't worry, the law protects you"

LANGUAGE RULES:
- Match the user's language exactly
- If Hindi: respond in Hindi, keep legal terms in English
- If English: respond in simple English
- Mix naturally like Indian lawyers: "Dekhiye, Section 138 ke under..."

Keep responses 4-8 sentences. Be concise but complete. Sound human, not robotic.`

export default function VoiceLawyerPage() {
    const [isCallActive, setIsCallActive] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [interimText, setInterimText] = useState('')
    const [conversation, setConversation] = useState<ConversationEntry[]>([])
    const [callDuration, setCallDuration] = useState(0)
    const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle')
    const [error, setError] = useState<string | null>(null)
    const [language, setLanguage] = useState('hi-IN')
    const [waveAmps, setWaveAmps] = useState<number[]>(Array.from({ length: 20 }).fill(0) as number[])
    const [detectedLang, setDetectedLang] = useState('')

    const recognitionRef = useRef<any>(null)
    const synthRef = useRef<SpeechSynthesis | null>(null)
    const callTimerRef = useRef<NodeJS.Timeout | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const isProcessingRef = useRef(false)
    const accumulatedRef = useRef('')
    const waveIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const isSpeakingRef = useRef(false)

    // Scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [conversation, interimText, transcript])

    // Call timer
    useEffect(() => {
        if (isCallActive) {
            callTimerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000)
        } else {
            if (callTimerRef.current) clearInterval(callTimerRef.current)
            setCallDuration(0)
        }
        return () => { if (callTimerRef.current) clearInterval(callTimerRef.current) }
    }, [isCallActive])

    // Wave animation
    useEffect(() => {
        if (status === 'listening' || status === 'speaking') {
            waveIntervalRef.current = setInterval(() => {
                setWaveAmps(prev => prev.map((_, i) => {
                    const base = status === 'speaking' ? 0.5 : 0.3
                    return base + Math.sin(Date.now() / 200 + i * 0.8) * 0.3 + Math.random() * 0.2
                }))
            }, 100)
        } else {
            if (waveIntervalRef.current) clearInterval(waveIntervalRef.current)
            setWaveAmps(Array.from({ length: 20 }).fill(0) as number[])
        }
        return () => { if (waveIntervalRef.current) clearInterval(waveIntervalRef.current) }
    }, [status])

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60)
        return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
    }

    // Auto-detect language from text
    const detectLanguage = useCallback((text: string): string => {
        const hindiRegex = /[\u0900-\u097F]/
        if (hindiRegex.test(text)) return 'hi-IN'
        return 'en-IN'
    }, [])

    // Interrupt AI when user speaks
    const interruptAI = useCallback(() => {
        if (synthRef.current && isSpeakingRef.current) {
            synthRef.current.cancel()
            isSpeakingRef.current = false
            setIsSpeaking(false)
            setStatus('listening')
        }
    }, [])

    // Speak text naturally
    const speakText = useCallback((text: string, onDone?: () => void) => {
        if (!synthRef.current || isMuted) { onDone?.(); return }
        synthRef.current.cancel()

        // Clean for speech
        const clean = text
            .replace(/#{1,6}\s*/g, '')
            .replace(/\*\*/g, '').replace(/\*/g, '')
            .replace(/^[-•]\s*/gm, '')
            .replace(/^\d+\.\s*/gm, '')
            .replace(/\[.*?\]/g, '')
            .replace(/\n+/g, '. ')
            .replace(/\s+/g, ' ')
            .trim()

        // Split into sentences
        const sentences = clean.split(/(?<=[.!?।])\s+/).filter(s => s.trim().length > 2)
        if (!sentences.length) { onDone?.(); return }

        isSpeakingRef.current = true
        setIsSpeaking(true)
        setStatus('speaking')

        // Stop recognition while speaking
        try { recognitionRef.current?.stop() } catch (e) { /* ok */ }

        const voices = synthRef.current?.getVoices() || []
        let idx = 0

        const speakNext = () => {
            if (!isSpeakingRef.current || !synthRef.current || idx >= sentences.length) {
                isSpeakingRef.current = false
                setIsSpeaking(false)
                setStatus('listening')
                restartListening()
                onDone?.()
                return
            }

            const utt = new SpeechSynthesisUtterance(sentences[idx].trim())

            // Detect language of this sentence
            const lang = detectLanguage(sentences[idx])
            utt.lang = lang

            // Find best voice for this language
            if (lang === 'hi-IN') {
                const hindiV = voices.find(v => v.lang.includes('hi-IN') || v.lang.includes('hi_IN'))
                    || voices.find(v => v.lang.includes('hi'))
                if (hindiV) utt.voice = hindiV
            } else {
                const indEn = voices.find(v => v.lang === 'en-IN')
                    || voices.find(v => v.lang.includes('en-IN'))
                const goodEn = voices.find(v => v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Moira'))
                    || voices.find(v => v.lang.startsWith('en-') && v.localService)
                    || voices.find(v => v.lang.startsWith('en-'))
                utt.voice = indEn || goodEn || null
            }

            utt.rate = 0.88
            utt.pitch = 1.0
            utt.volume = 1.0

            utt.onend = () => { idx++; setTimeout(speakNext, 180) }
            utt.onerror = () => { idx++; speakNext() }

            synthRef.current?.speak(utt)
        }

        speakNext()
    }, [isMuted, detectLanguage])

    // Restart listening
    const restartListening = useCallback(() => {
        if (!recognitionRef.current || isProcessingRef.current) return
        try { recognitionRef.current.start(); setStatus('listening') } catch (e) { /* already started */ }
    }, [])

    // Send to AI
    const sendToAI = useCallback(async (message: string) => {
        if (!message.trim() || isProcessingRef.current) return
        isProcessingRef.current = true

        try { recognitionRef.current?.stop() } catch (e) { /* ok */ }

        const detected = detectLanguage(message)
        setDetectedLang(detected === 'hi-IN' ? 'Hindi' : 'English')

        const userEntry: ConversationEntry = {
            id: `u-${Date.now()}`, role: 'user', content: message, timestamp: new Date()
        }
        setConversation(prev => [...prev, userEntry])
        setTranscript('')
        accumulatedRef.current = ''
        setInterimText('')
        setStatus('thinking')

        try {
            const langHint = detected === 'hi-IN' ? 'Respond in Hindi (Devanagari + English legal terms).' : 'Respond in English.'

            const response = await fetch('/api/chat-enhanced', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `[VOICE CALL - You are Advocate Sharma on phone. Keep 4-8 sentences. ${langHint}]\n\nClient: "${message}"`
                })
            })

            if (!response.ok) throw new Error('AI failed')
            const data = await response.json()

            if (data.ok && data.message) {
                let voiceText = data.message
                    .replace(/#{1,6}\s*/g, '')
                    .replace(/\*\*/g, '').replace(/\*/g, '')
                    .replace(/^[-•]\s*/gm, '')
                    .replace(/^\d+\.\s*/gm, '')
                    .replace(/\n{2,}/g, '. ')
                    .replace(/\n/g, ' ')
                    .trim()

                const aiEntry: ConversationEntry = {
                    id: `a-${Date.now()}`, role: 'assistant', content: voiceText, timestamp: new Date()
                }
                setConversation(prev => [...prev, aiEntry])
                speakText(voiceText, () => { isProcessingRef.current = false })
            } else throw new Error('No response')
        } catch (err) {
            console.error('Voice AI error:', err)
            const errText = detected === 'hi-IN'
                ? 'Maaf kijiye, thodi dikkat aayi hai. Kya aap phir se bol sakte hain?'
                : 'Sorry, I had trouble understanding. Could you please repeat that?'
            setConversation(prev => [...prev, {
                id: `e-${Date.now()}`, role: 'assistant', content: errText, timestamp: new Date()
            }])
            speakText(errText, () => { isProcessingRef.current = false })
        }
    }, [speakText, detectLanguage])

    // Init recognition
    const initRecognition = useCallback(() => {
        if (typeof window === 'undefined') return null
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SR) { setError('Speech recognition not supported. Use Chrome or Edge.'); return null }

        const rec = new SR()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = language
        rec.maxAlternatives = 1

        rec.onresult = (event: any) => {
            // Interrupt AI if user talks
            if (isSpeakingRef.current) interruptAI()

            let finalT = ''
            let interimT = ''

            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalT += event.results[i][0].transcript + ' '
                } else {
                    interimT += event.results[i][0].transcript
                }
            }

            if (interimT) setInterimText(interimT)

            if (finalT.trim()) {
                accumulatedRef.current = (accumulatedRef.current + ' ' + finalT).trim()
                setTranscript(accumulatedRef.current)
                setInterimText('')

                // Reset silence timer
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
                silenceTimerRef.current = setTimeout(() => {
                    if (accumulatedRef.current.trim().length > 3) {
                        sendToAI(accumulatedRef.current.trim())
                    }
                }, 2500)
            }
        }

        rec.onerror = (e: any) => {
            if (e.error !== 'no-speech' && e.error !== 'aborted') console.error('Speech error:', e.error)
        }

        rec.onend = () => {
            if (!isProcessingRef.current && !isSpeakingRef.current) {
                try { rec.start() } catch (e) { /* ok */ }
            }
        }

        return rec
    }, [language, interruptAI, sendToAI])

    // Start call
    const startCall = useCallback(() => {
        synthRef.current = window.speechSynthesis
        // Pre-load voices
        synthRef.current.getVoices()
        setTimeout(() => synthRef.current?.getVoices(), 300)

        const rec = initRecognition()
        if (!rec) return

        recognitionRef.current = rec
        isProcessingRef.current = false
        accumulatedRef.current = ''

        setIsCallActive(true)
        setConversation([])
        setError(null)
        setTranscript('')
        setInterimText('')

        const welcomeHi = "Namaste! Main Advocate Sharma hoon. Aap mujhe apna legal sawal bataiye. Main sun raha hoon."
        const welcomeEn = "Namaste! I am Advocate Sharma. Please tell me your legal concern. I am listening."
        const welcome = language === 'hi-IN' ? welcomeHi : welcomeEn
        setDetectedLang(language === 'hi-IN' ? 'Hindi' : 'English')

        setConversation([{ id: 'welcome', role: 'assistant', content: welcome, timestamp: new Date() }])
        speakText(welcome)
    }, [initRecognition, speakText, language])

    // End call
    const endCall = useCallback(() => {
        try { recognitionRef.current?.stop() } catch (e) { /* ok */ }
        synthRef.current?.cancel()
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        isSpeakingRef.current = false
        isProcessingRef.current = false
        setIsCallActive(false)
        setIsSpeaking(false)
        setStatus('idle')
        setTranscript('')
        setInterimText('')
    }, [])

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            if (!prev && isSpeaking) {
                synthRef.current?.cancel()
                isSpeakingRef.current = false
                setIsSpeaking(false)
                setStatus('listening')
                restartListening()
            }
            return !prev
        })
    }, [isSpeaking, restartListening])

    const statusColor = status === 'listening' ? 'bg-green-500' : status === 'thinking' ? 'bg-amber-500' : status === 'speaking' ? 'bg-blue-500' : 'bg-gray-500'
    const statusText = status === 'listening' ? 'Listening...' : status === 'thinking' ? 'Thinking...' : status === 'speaking' ? 'Advocate Sharma is speaking...' : 'Ready'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/ai-assistant" className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Scale className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold">Advocate Sharma</h1>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${isCallActive ? statusColor : 'bg-gray-500'} ${(status === 'listening' || status === 'speaking') ? 'animate-pulse' : ''}`} />
                                    <span className="text-xs text-slate-400">
                                        {isCallActive ? statusText : 'Available for consultation'}
                                    </span>
                                    {detectedLang && isCallActive && (
                                        <span className="text-xs text-slate-500 ml-1 flex items-center gap-1"><Globe className="w-3 h-3" /> {detectedLang}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!isCallActive && (
                            <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
                                {[{ code: 'hi-IN', label: 'Hindi' }, { code: 'en-IN', label: 'English' }].map(l => (
                                    <button key={l.code} onClick={() => setLanguage(l.code)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${language === l.code ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-300'
                                            }`}>
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        {isCallActive && (
                            <span className="text-sm font-mono text-slate-400 bg-slate-800/50 px-3 py-1 rounded-lg">
                                {formatDuration(callDuration)}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-4xl mx-auto px-4 pb-48">
                {!isCallActive ? (
                    /* ====== LANDING ====== */
                    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center border-2 border-amber-500/30 shadow-2xl">
                                <Scale className="w-16 h-16 text-amber-400" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-slate-900 flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            Talk to AI Lawyer
                        </h2>
                        <p className="text-lg text-slate-300 mb-1">Advocate Sharma — Senior Legal Consultant</p>
                        <p className="text-slate-500 text-sm max-w-lg mb-8">
                            Have a real voice conversation. Speak naturally in Hindi or English.
                            The AI will listen, understand, and explain Indian law with specific sections, solutions, and practical advice.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 w-full max-w-xl">
                            {[
                                { icon: Mic, color: 'green', title: 'Smart Listening', desc: 'Stops when you talk, speaks when you pause' },
                                { icon: Scale, color: 'amber', title: 'Real Indian Law', desc: 'Sections, Acts, case precedents & solutions' },
                                { icon: Globe, color: 'blue', title: 'Auto Language', desc: 'Detects Hindi/English automatically' }
                            ].map(f => (
                                <div key={f.title} className={`bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 text-center hover:border-${f.color}-500/30 transition-colors`}>
                                    <f.icon className={`w-6 h-6 text-${f.color}-400 mx-auto mb-2`} />
                                    <p className="text-sm font-medium text-slate-200">{f.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{f.desc}</p>
                                </div>
                            ))}
                        </div>

                        <button onClick={startCall}
                            className="group relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-xl shadow-green-500/30 hover:shadow-green-400/50 transition-all duration-300 hover:scale-110 active:scale-95">
                            <Phone className="w-8 h-8 text-white mx-auto" />
                            <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-slate-400 group-hover:text-green-300 transition-colors font-medium">
                                Start Call
                            </div>
                        </button>

                        {error && (
                            <div className="mt-14 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400 max-w-md">{error}</div>
                        )}
                    </div>
                ) : (
                    /* ====== ACTIVE CALL ====== */
                    <div className="py-6 space-y-4">
                        {conversation.map(entry => (
                            <div key={entry.id}
                                className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${entry.role === 'user'
                                        ? 'bg-blue-600/80 text-white rounded-br-sm'
                                        : 'bg-slate-700/80 text-slate-100 rounded-bl-sm border border-slate-600/30'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        {entry.role === 'assistant' ? <Scale className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /> : <Mic className="w-3.5 h-3.5 text-blue-200 flex-shrink-0" />}
                                        <span className="text-xs text-slate-400 font-medium">
                                            {entry.role === 'user' ? 'You' : 'Adv. Sharma'} • {entry.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                                </div>
                            </div>
                        ))}

                        {/* Real-time transcript */}
                        {status === 'listening' && (transcript || interimText) && (
                            <div className="flex justify-end" style={{ animation: 'fadeSlideUp 0.2s ease-out' }}>
                                <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-blue-600/30 border border-blue-500/30 text-blue-100 rounded-br-sm">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-xs text-blue-300 font-medium flex items-center gap-1"><Mic className="w-3 h-3" /> Listening...</span>
                                        <div className="flex gap-0.5">
                                            {[0, 1, 2].map(i => (
                                                <div key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-sm">
                                        {transcript && <span className="text-blue-100">{transcript} </span>}
                                        {interimText && (
                                            <span className="text-blue-300/60 italic">{interimText}
                                                <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse" />
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Thinking */}
                        {status === 'thinking' && (
                            <div className="flex justify-start" style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
                                <div className="bg-slate-700/80 rounded-2xl px-4 py-3 rounded-bl-sm border border-slate-600/30">
                                    <div className="flex items-center gap-3">
                                        <Scale className="w-4 h-4 text-amber-400 animate-pulse" />
                                        <span className="text-sm text-slate-300">Advocate Sharma is thinking...</span>
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map(i => (
                                                <div key={i} className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 200}ms` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={scrollRef} />
                    </div>
                )}
            </main>

            {/* ====== CALL CONTROLS ====== */}
            {isCallActive && (
                <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50">
                    <div className="max-w-4xl mx-auto p-5">
                        {/* Wave visualization */}
                        <div className="flex justify-center items-end gap-[3px] mb-4 h-10">
                            {waveAmps.map((amp, i) => (
                                <div key={i} className={`w-[3px] rounded-full transition-all duration-100 ${status === 'listening' ? 'bg-green-400' : status === 'speaking' ? 'bg-blue-400' : 'bg-gray-600'
                                    }`}
                                    style={{ height: `${Math.max(4, amp * 40)}px` }} />
                            ))}
                            <span className={`text-xs ml-3 font-medium flex items-center gap-1 ${status === 'listening' ? 'text-green-400' : status === 'speaking' ? 'text-blue-400' : 'text-amber-400'
                                }`}>
                                {status === 'listening' ? <><Mic className="w-3 h-3" /> Speak your question...</> : status === 'speaking' ? <><Volume2 className="w-3 h-3" /> Tap mic to interrupt</> : <><Scale className="w-3 h-3" /> Analyzing...</>}
                            </span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-6">
                            <button onClick={toggleMute}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 border-2 border-red-500/50 text-red-400' : 'bg-slate-700/60 border border-slate-600/50 text-slate-300 hover:bg-slate-600/60'
                                    }`} title={isMuted ? 'Unmute' : 'Mute'}>
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>

                            <div className="relative">
                                {(status === 'listening' || status === 'speaking') && (
                                    <div className={`absolute inset-[-6px] rounded-full ${statusColor} opacity-20 animate-ping`} />
                                )}
                                <button onClick={status === 'speaking' ? interruptAI : undefined}
                                    className={`w-16 h-16 rounded-full ${statusColor} flex items-center justify-center shadow-lg transition-all ${status === 'speaking' ? 'cursor-pointer hover:opacity-80' : ''
                                        }`}>
                                    {status === 'listening' && <Mic className="w-7 h-7 text-white" />}
                                    {status === 'thinking' && <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                    {status === 'speaking' && <Volume2 className="w-7 h-7 text-white animate-pulse" />}
                                </button>
                            </div>

                            <button onClick={endCall}
                                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95">
                                <PhoneOff className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    )
}
