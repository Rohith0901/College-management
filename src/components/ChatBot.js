'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';

const QUICK_ACTIONS = [
  'Show cafeteria menu',
  'Any turf slots available?',
  'When is my next exam?',
  'Check parking availability',
  'Book a cafeteria table',
  'Check doctor availability',
];

export default function ChatBot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm CollegeHub AI. Ask me anything about cafeteria, parking, exams, doctors, turf, or complaints!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
        },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-ink text-white w-14 h-14 rounded-full shadow-apple-elevated hover:bg-ink/90 transition-all duration-300 flex items-center justify-center z-50 active:scale-95"
      >
        {isOpen ? <FiX size={20} /> : <FiMessageCircle size={20} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-surface rounded-apple-lg shadow-apple-drawer z-50 flex flex-col overflow-hidden border border-divider animate-apple-in" style={{ height: '520px' }}>
          <div className="bg-ink text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-apple-sm flex items-center justify-center">
                <FiMessageCircle size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">CollegeHub AI</h3>
                <p className="text-xs text-white/40">Powered by DeepSeek</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70">
              <FiX size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-elevated/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-ink text-white rounded-apple-md rounded-br-sm'
                    : 'bg-white text-ink rounded-apple-md rounded-bl-sm shadow-apple'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-apple-md rounded-bl-sm shadow-apple">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-muted/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-muted/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-elevated text-muted hover:text-ink hover:bg-divider transition-all duration-200"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t border-divider bg-white shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 bg-elevated rounded-apple-sm px-4 py-2.5 text-sm text-ink placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="bg-ink text-white w-10 h-10 rounded-apple-sm flex items-center justify-center hover:bg-ink/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 shrink-0"
              >
                <FiSend size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
