import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

type DirectMessage = {
  id: string;
  role: 'user' | 'support';
  text: string;
  createdAt: string;
};

const storageKey = (userId: string) => `directChat:${userId}`;

export const DirectChat: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  const key = useMemo(() => (user?.id ? storageKey(user.id) : null), [user?.id]);

  useEffect(() => {
    if (!isOpen) return;
    if (!key) return;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        setMessages([]);
        return;
      }
      const parsed = JSON.parse(raw) as DirectMessage[];
      setMessages(Array.isArray(parsed) ? parsed : []);
    } catch {
      setMessages([]);
    }
  }, [isOpen, key]);

  useEffect(() => {
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [key, messages]);

  useEffect(() => {
    if (!isOpen) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const send = () => {
    if (!input.trim()) return;
    const msg: DirectMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role: 'user',
      text: input.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/40 sm:bg-transparent">
      <div className="fixed inset-0 sm:inset-auto sm:bottom-8 sm:left-8 w-full h-full sm:h-[560px] sm:w-[380px] bg-[#E8E0D9] border border-white/40 shadow-2xl rounded-none sm:rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-zafting-text p-4 flex justify-between items-center text-[#E8E0D9]">
          <div className="min-w-0">
            <h3 className="font-serif text-lg truncate">
              {language === 'fa' ? 'دایرکت' : 'Direct'}
            </h3>
            <p className="font-sans text-xs opacity-70 mt-0.5">
              {language === 'fa'
                ? 'پشتیبانی و گفتگو'
                : 'Support chat'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover:opacity-80 transition-opacity"
            aria-label="close-direct-chat"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/50 backdrop-blur-sm">
          {messages.length === 0 ? (
            <div className="text-center text-zafting-text/60 text-sm mt-10">
              <p className="font-serif text-xl mb-2">
                {language === 'fa' ? 'گفتگو را شروع کنید' : 'Start a chat'}
              </p>
              <p className="font-sans">
                {language === 'fa'
                  ? 'پیام شما در این نسخه فقط روی دستگاه شما ذخیره می‌شود.'
                  : 'In this version, messages are stored only on your device.'}
              </p>
            </div>
          ) : null}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`font-sans max-w-[85%] p-3 rounded-xl text-sm leading-7 ${
                  m.role === 'user'
                    ? 'bg-zafting-text text-[#E8E0D9] rounded-be-none'
                    : 'bg-white border border-zafting-text/10 text-zafting-text rounded-bs-none shadow-sm'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="p-3 bg-white border-t border-zafting-text/10 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={language === 'fa' ? 'پیام شما...' : 'Your message...'}
            className="flex-1 bg-transparent outline-none text-sm text-zafting-text placeholder:text-zafting-text/40"
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim()}
            className="p-2 bg-zafting-text text-[#E8E0D9] rounded-lg disabled:opacity-50 hover:bg-opacity-90 rtl:scale-x-[-1]"
            aria-label="send-direct-message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
