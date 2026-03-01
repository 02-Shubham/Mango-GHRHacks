"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Newspaper, Send, X, Bot, Loader2,
    Shield, Minimize2, ChevronUp, Sparkles,
    TrendingUp, Scale, Landmark, Globe, Zap
} from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const QUICK_TOPICS = [
    { label: "Today's Headlines", query: "Give me today's top headlines", icon: Newspaper },
    { label: "Corruption Updates", query: "Latest corruption and scam updates in India", icon: Scale },
    { label: "Court & Legal", query: "Recent court verdicts and legal updates", icon: Landmark },
    { label: "Tech & Cyber", query: "Latest technology and cyber security news", icon: Zap },
];

function formatMarkdown(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono">$1</code>')
        .replace(/^- (.*$)/gm, '<div class="flex items-start gap-2 ml-1 mb-1"><span class="text-brand-primary mt-0.5 text-xs">▸</span><span>$1</span></div>')
        .replace(/^---$/gm, '<hr class="border-border-subtle my-3" />')
        .replace(/\[(.*?)\]/g, '<span class="text-[9px] font-bold px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded-md uppercase tracking-wider">$1</span>')
        .replace(/\n\n/g, '<div class="h-3"></div>')
        .replace(/\n/g, '<br/>');
}

export function VerifyBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 300);
    }, [isOpen, isMinimized]);

    const sendMessage = async (text?: string) => {
        const msg = text || input.trim();
        if (!msg || isLoading) return;

        const userMsg: Message = { role: "user", content: msg };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/verify-news", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg, history: messages }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Could not fetch news." }]);
        } catch {
            setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
        }
        setIsLoading(false);
    };

    return (
        <>
            {/* ═══ FLOATING BUTTON ═══ */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-[100] group"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand-primary rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity" />
                            <div className="relative w-14 h-14 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-brand-primary/30 transition-all hover:scale-105">
                                <Newspaper className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white animate-pulse" />
                        </div>
                        <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            News & Updates
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ═══ NEWS PANEL ═══ */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.96 }}
                        animate={isMinimized ? { opacity: 1, y: 0, scale: 1, height: 56 } : { opacity: 1, y: 0, scale: 1, height: 'auto' }}
                        exit={{ opacity: 0, y: 30, scale: 0.92 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                        className="fixed bottom-6 right-6 z-[100] w-[400px] max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-border-subtle overflow-hidden"
                        style={{ maxWidth: 'calc(100vw - 48px)' }}
                    >
                        {/* Header */}
                        <div
                            className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center justify-between cursor-pointer shrink-0"
                            onClick={() => setIsMinimized(!isMinimized)}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-xs tracking-wide">NyayaSetu NewsDesk</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                        <p className="text-white/50 text-[9px] font-medium uppercase tracking-wider">Live Updates</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                    {isMinimized ? <ChevronUp className="w-3.5 h-3.5 text-white" /> : <Minimize2 className="w-3.5 h-3.5 text-white" />}
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                    <X className="w-3.5 h-3.5 text-white" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-[280px] max-h-[52vh] bg-slate-50/60">
                                    {/* Welcome */}
                                    {messages.length === 0 && (
                                        <div className="space-y-3">
                                            <div className="bg-white border border-border-subtle rounded-xl p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Globe className="w-4 h-4 text-brand-primary" />
                                                    <span className="text-[10px] font-bold text-text-main uppercase tracking-wider">News & Updates Hub</span>
                                                </div>
                                                <p className="text-xs text-text-muted leading-relaxed">
                                                    Get the latest <strong>headlines</strong>, <strong>investigation updates</strong>, <strong>court verdicts</strong>, and more. Tap a topic below or ask anything!
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                {QUICK_TOPICS.map((topic, i) => (
                                                    <motion.button
                                                        key={i}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.08 * i }}
                                                        onClick={() => sendMessage(topic.query)}
                                                        className="text-left p-3 bg-white border border-border-subtle rounded-xl hover:border-brand-primary/30 hover:shadow-sm transition-all group"
                                                    >
                                                        <topic.icon className="w-4 h-4 text-brand-primary mb-1.5 group-hover:scale-110 transition-transform" />
                                                        <span className="text-[10px] font-bold text-text-main block leading-tight">{topic.label}</span>
                                                    </motion.button>
                                                ))}
                                            </div>

                                            <div className="text-center">
                                                <span className="text-[8px] text-text-muted font-medium uppercase tracking-widest">Powered by NyayaSetu</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Chat Messages */}
                                    {messages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {msg.role === 'user' ? (
                                                <div className="max-w-[80%] bg-brand-primary text-white px-3.5 py-2.5 rounded-xl rounded-br-sm shadow-sm">
                                                    <p className="text-xs leading-relaxed">{msg.content}</p>
                                                </div>
                                            ) : (
                                                <div className="max-w-[92%] bg-white border border-border-subtle px-3.5 py-3 rounded-xl rounded-bl-sm shadow-sm">
                                                    <div
                                                        className="text-xs text-text-main leading-relaxed"
                                                        dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                                                    />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}

                                    {isLoading && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                            <div className="bg-white border border-border-subtle px-3.5 py-2.5 rounded-xl rounded-bl-sm shadow-sm flex items-center gap-2">
                                                <Loader2 className="w-3.5 h-3.5 text-brand-primary animate-spin" />
                                                <span className="text-[10px] text-text-muted font-medium">Fetching updates...</span>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="shrink-0 border-t border-border-subtle bg-white px-3 py-2.5">
                                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask about any news topic..."
                                            disabled={isLoading}
                                            className="flex-1 bg-slate-50 border border-border-subtle rounded-lg px-3 py-2.5 text-xs text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-brand-primary/40 transition-all disabled:opacity-50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading || !input.trim()}
                                            className="p-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg disabled:opacity-30 transition-all"
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
