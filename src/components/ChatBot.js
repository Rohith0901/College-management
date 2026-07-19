'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FiMessageCircle, FiX, FiSend, FiCheck, FiLoader } from 'react-icons/fi';

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
    {
      role: 'bot',
      text: "Hi! I'm CollegeHub AI. I can check availability, book cafeterias & turfs, view exams, and more. What would you like to do?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
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
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, {
        role: 'bot',
        text: data.response,
        actions: data.actions || [],
      }]);
      setHistory(prev => [
        ...prev,
        { role: 'user', text: msg },
        { role: 'bot', text: data.response },
      ]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Sorry, something went wrong. Please try again.',
      }]);
    }
    setLoading(false);
  };

  const formatActionLabel = (type) => {
    const labels = {
      get_cafeterias: 'Fetched cafeterias',
      get_cafeteria_menu: 'Fetched menu',
      get_turfs: 'Fetched turfs',
      book_turf: 'Booked turf',
      book_cafeteria: 'Booked cafeteria',
      get_my_bookings: 'Fetched bookings',
      cancel_booking: 'Cancelled booking',
      get_exams: 'Fetched exams',
      get_doctors: 'Fetched doctors',
      get_parking: 'Fetched parking',
      get_timetable: 'Fetched timetable',
      submit_complaint: 'Submitted complaint',
      get_rooms: 'Fetched rooms',
    };
    return labels[type] || type;
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
        <div
          className="fixed bottom-24 right-6 w-[420px] max-w-[calc(100vw-3rem)] bg-surface rounded-apple-lg shadow-apple-drawer z-50 flex flex-col overflow-hidden border border-divider animate-apple-in"
          style={{ height: '560px' }}
        >
          {/* Header */}
          <div className="bg-ink text-white px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-apple-sm flex items-center justify-center">
                <FiMessageCircle size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-tight">CollegeHub AI</h3>
                <p className="text-xs text-white/40">Powered by Gemini</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white/70 transition-colors">
              <FiX size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'space-y-2'}`}>
                  <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-ink text-white rounded-apple-md rounded-br-sm'
                      : 'bg-elevated text-ink rounded-apple-md rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Action badges */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-1">
                      {msg.actions.map((a, j) => {
                        const success = a.result?.success || (a.result?.result && !a.result?.result?.includes?.('not found'));
                        return (
                          <div key={j} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                            <FiCheck size={10} strokeWidth={2.5} />
                            {formatActionLabel(a.type)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-elevated px-4 py-3 rounded-apple-md rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <FiLoader size={14} className="text-muted animate-spin" />
                    <span className="text-xs text-muted">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions (only show at start) */}
          {messages.length <= 1 && (
            <div className="px-5 pb-3 flex flex-wrap gap-1.5">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="text-xs px-3 py-1.5 rounded-full bg-elevated text-muted hover:text-ink hover:bg-divider transition-all duration-200"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-divider bg-white shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={user ? 'Ask me anything...' : 'Login to book & manage...'}
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
