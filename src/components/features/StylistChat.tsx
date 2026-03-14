import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { ChatMessage } from '../../types';
import { sendMessageToStylist } from '../../services/geminiService';
import { useLanguage } from '../../contexts/LanguageContext';

export const StylistChat: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const replyText = await sendMessageToStylist(input);
    
    setLoading(false);
    setMessages(prev => [...prev, { role: 'model', text: replyText }]);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 end-8 z-50 bg-zafting-text text-[#E8E0D9] p-4 rounded-full shadow-xl hover:scale-105 transition-transform duration-300 ${isOpen ? 'hidden' : 'flex'} items-center gap-2`}
      >
        <Sparkles size={20} />
        <span className="font-serif italic pe-1">{t('chat.trigger')}</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 end-8 z-50 w-full max-w-xs md:max-w-sm bg-[#E8E0D9] border border-white/40 shadow-2xl rounded-2xl overflow-hidden flex flex-col h-[500px]">
          {/* Header */}
          <div className="bg-zafting-text p-4 flex justify-between items-center text-[#E8E0D9]">
            <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-yellow-200" />
                <h3 className="font-serif text-lg">{t('chat.title')}</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-70">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 backdrop-blur-sm">
            {messages.length === 0 && (
                <div className="text-center text-zafting-text/60 text-sm mt-10">
                    <p className="font-serif text-xl mb-2">{t('chat.welcome')}</p>
                    <p className="font-sans">{t('chat.intro')}</p>
                </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`font-sans max-w-[80%] p-3 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-zafting-text text-[#E8E0D9] rounded-be-none' // rounded-be is logical bottom-end (bottom-right in LTR, bottom-left in RTL)
                      : 'bg-white border border-zafting-text/10 text-zafting-text rounded-bs-none shadow-sm' // rounded-bs is logical bottom-start
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-xl rounded-bs-none shadow-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-zafting-text/40 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-zafting-text/40 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-zafting-text/40 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-zafting-text/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chat.placeholder')}
              className="flex-1 bg-transparent outline-none text-sm text-zafting-text placeholder:text-zafting-text/40"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2 bg-zafting-text text-[#E8E0D9] rounded-lg disabled:opacity-50 hover:bg-opacity-90 rtl:scale-x-[-1]"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};