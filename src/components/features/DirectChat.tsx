import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, Mic, Pause, Play, Send, Trash2, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { directChatService, type DirectMessageDto } from '../../services/directChat.service';

export const DirectChat: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const assetBaseUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'https://api.d-style.ir';
  const [messages, setMessages] = useState<DirectMessageDto[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const endRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const discardRecordingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioMessageIdRef = useRef<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [voiceDurationById, setVoiceDurationById] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isOpen) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen, messages]);

  // همیشه همه‌ی هوک‌ها را فراخوانی می‌کنیم؛ نمایش را در JSX کنترل می‌کنیم

  const resolveAssetUrl = (path: string) => {
    if (!path) return path;
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
    if (path.startsWith('/')) return `${assetBaseUrl}${path}`;
    return `${assetBaseUrl}/${path}`;
  };

  const formatDuration = (seconds: number) => {
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60;
    return `${mm}:${String(ss).padStart(2, '0')}`;
  };

  const voiceWave = (seed: string, bars = 35) => {
    let h = 0;
    for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const values: number[] = [];
    for (let i = 0; i < bars; i += 1) {
      h ^= h << 13;
      h ^= h >>> 17;
      h ^= h << 5;
      const v = (h >>> 0) % 100;
      const height = 8 + Math.floor((v / 100) * 20);
      values.push(height);
    }
    return values;
  };

  const refreshInitial = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await directChatService.getConversation();
      const res = await directChatService.listMessages({ limit: 50 });
      setMessages(res.messages);
    } finally {
      setLoading(false);
    }
  };

  const poll = async () => {
    if (!user?.id) return;
    const last = messages[messages.length - 1];
    const res = await directChatService.listMessages({ since: last?.createdAt, limit: 200 });
    if (res.messages.length) {
      setMessages((prev) => [...prev, ...res.messages]);
    }
  };

  const sendText = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      const created = await directChatService.sendMessage({ text: input.trim() });
      setMessages((prev) => [...prev, created]);
      setInput('');
    } finally {
      setSending(false);
    }
  };

  const sendFile = async (file: File, attachmentType: 'IMAGE' | 'AUDIO') => {
    setSending(true);
    try {
      const created = await directChatService.sendMessage({ file, attachmentType });
      setMessages((prev) => [...prev, created]);
    } finally {
      setSending(false);
    }
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    recordingStartedAtRef.current = null;
    setRecordingSeconds(0);
  };

  const startRecording = async () => {
    if (isRecording) return;
    discardRecordingRef.current = false;
    setRecordingSeconds(0);
    recordingStartedAtRef.current = Date.now();
    if (recordingTimerRef.current) window.clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = window.setInterval(() => {
      const startedAt = recordingStartedAtRef.current;
      if (!startedAt) return;
      const seconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      setRecordingSeconds(seconds);
    }, 250);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stopRecordingTimer();
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        chunksRef.current = [];
        setIsRecording(false);
        if (discardRecordingRef.current) return;
        if (blob.size === 0) return;
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
        await sendFile(file, 'AUDIO');
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      stopRecordingTimer();
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (recorder.state === 'inactive') return;
    recorder.stop();
  };

  const cancelRecording = () => {
    if (!isRecording) return;
    discardRecordingRef.current = true;
    stopRecording();
    stopRecordingTimer();
    setIsRecording(false);
  };

  const toggleVoicePlayback = async (params: { messageId: string; url: string }) => {
    const ensureAudio = () => {
      if (!audioRef.current) {
        const a = new Audio();
        a.preload = 'auto';
        a.addEventListener('timeupdate', () => {
          const duration = a.duration || 0;
          if (!duration) return;
          setAudioProgress(a.currentTime / duration);
        });
        a.addEventListener('ended', () => {
          setPlayingMessageId(null);
          setAudioProgress(0);
          audioMessageIdRef.current = null;
        });
        a.addEventListener('loadedmetadata', () => {
          const currentId = audioMessageIdRef.current;
          if (!currentId) return;
          const d = Number.isFinite(a.duration) ? Math.max(0, Math.floor(a.duration)) : 0;
          setVoiceDurationById((prev) => (prev[currentId] != null ? prev : { ...prev, [currentId]: d }));
        });
        audioRef.current = a;
      }
      return audioRef.current;
    };

    const audio = ensureAudio();
    if (audioMessageIdRef.current !== params.messageId) {
      audio.pause();
      audio.src = params.url;
      audio.currentTime = 0;
      audioMessageIdRef.current = params.messageId;
      setAudioProgress(0);
    }

    if (audio.paused) {
      try {
        await audio.play();
        setPlayingMessageId(params.messageId);
      } catch {
        setPlayingMessageId(null);
      }
    } else {
      audio.pause();
      setPlayingMessageId(null);
    }
  };

  const seekVoice = (params: { messageId: string; percent: number }) => {
    if (!audioRef.current) return;
    if (audioMessageIdRef.current !== params.messageId) return;
    const audio = audioRef.current;
    const duration = audio.duration || 0;
    if (!duration) return;
    const p = Math.min(1, Math.max(0, params.percent));
    audio.currentTime = p * duration;
    setAudioProgress(p);
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshInitial();
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const t = window.setInterval(() => {
      poll().catch(() => {});
    }, 60_000);
    return () => window.clearInterval(t);
  }, [isOpen, messages, user?.id]);

  useEffect(() => {
    if (!isOpen) return;
    return () => {
      stopRecordingTimer();
      const a = audioRef.current;
      if (a) a.pause();
      audioRef.current = null;
      audioMessageIdRef.current = null;
      setPlayingMessageId(null);
      setAudioProgress(0);
    };
  }, [isOpen]);

  useEffect(() => {
    const audioMessages = messages.filter((m) => m.attachmentType === 'AUDIO' && m.attachmentUrl);
    const missing = audioMessages.filter((m) => voiceDurationById[m.id] == null);
    if (missing.length === 0) return;
    missing.forEach((m) => {
      if (!m.attachmentUrl) return;
      const a = new Audio(resolveAssetUrl(m.attachmentUrl));
      a.preload = 'metadata';
      const onLoaded = () => {
        const d = Number.isFinite(a.duration) ? Math.max(0, Math.floor(a.duration)) : 0;
        setVoiceDurationById((prev) => (prev[m.id] != null ? prev : { ...prev, [m.id]: d }));
        a.removeEventListener('loadedmetadata', onLoaded);
      };
      a.addEventListener('loadedmetadata', onLoaded);
    });
  }, [messages, voiceDurationById]);

  return (
    <>
      {isOpen ? (
        <div
          dir={language === 'fa' ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-70 bg-black/40 sm:bg-transparent"
        >
          <div className="fixed inset-0 sm:inset-auto sm:bottom-8 sm:left-8 w-full h-full sm:h-[560px] sm:w-[380px] bg-zafting-bg border border-white/40 shadow-2xl rounded-none sm:rounded-2xl overflow-hidden flex flex-col">
        <div className="bg-zafting-text p-4 flex justify-between items-center text-zafting-bg">
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
          {loading ? (
            <div className="flex items-center justify-center text-zafting-text/60 text-sm mt-10">
              <Loader2 className="animate-spin" size={18} />
              <span className="ms-2">{language === 'fa' ? 'در حال دریافت...' : 'Loading...'}</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-zafting-text/60 text-sm mt-10">
              <p className="font-serif text-xl mb-2">
                {language === 'fa' ? 'گفتگو را شروع کنید' : 'Start a chat'}
              </p>
              <p className="font-sans">
                {language === 'fa'
                  ? 'پیام شما برای پشتیبانی ارسال می‌شود.'
                  : 'Your message will be sent to support.'}
              </p>
            </div>
          ) : null}

          {messages.map((m) => {
            const isMine = m.authorRole === 'USER';
            const audioUrl =
              m.attachmentType === 'AUDIO' && m.attachmentUrl ? resolveAssetUrl(m.attachmentUrl) : null;
            const isVoice = !!audioUrl && m.attachmentType === 'AUDIO';
            const isPlaying = playingMessageId === m.id;
            const durationSeconds = voiceDurationById[m.id] ?? 0;
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div
                    className={`font-sans p-3 rounded-xl text-sm leading-7 ${
                      isMine
                        ? 'bg-zafting-text text-zafting-bg rounded-be-none'
                        : 'bg-white border border-zafting-text/10 text-zafting-text rounded-bs-none shadow-sm'
                    }`}
                  >
                    {m.attachmentType === 'IMAGE' && m.attachmentUrl ? (
                      <img
                        src={resolveAssetUrl(m.attachmentUrl)}
                        alt="attachment"
                        className="w-full max-w-[260px] rounded-xl mb-2"
                      />
                    ) : null}

                    {isVoice ? (
                      <div className="w-[240px] sm:w-[280px] mb-1" dir="ltr">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleVoicePlayback({ messageId: m.id, url: audioUrl })}
                            className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center ${
                              isMine ? 'bg-white text-zafting-text' : 'bg-zafting-text text-zafting-bg'
                            }`}
                            aria-label={isPlaying ? 'pause' : 'play'}
                          >
                            {isPlaying ? (
                              <Pause size={20} fill="currentColor" />
                            ) : (
                              <Play size={20} className="ms-[2px]" fill="currentColor" />
                            )}
                          </button>

                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const percent = rect.width ? x / rect.width : 0;
                              seekVoice({ messageId: m.id, percent });
                            }}
                            onKeyDown={() => {}}
                            className="relative flex-1 h-10 flex items-center cursor-pointer"
                          >
                            <div className="flex items-center w-full gap-[2px]">
                              {voiceWave(m.id, 35).map((h, idx) => {
                                const isPlayed =
                                  idx / 35 <= (audioMessageIdRef.current === m.id ? audioProgress : 0);
                                return (
                                  <span
                                    key={idx}
                                    className={`w-[3px] rounded-full transition-colors ${
                                      isMine
                                        ? isPlayed
                                          ? 'bg-zafting-bg'
                                          : 'bg-zafting-bg/45'
                                        : isPlayed
                                          ? 'bg-zafting-text'
                                          : 'bg-zafting-text/35'
                                    }`}
                                    style={{ height: `${h}px` }}
                                  />
                                );
                              })}
                            </div>
                          </div>

                          <div className={`text-sm tabular-nums shrink-0 ${isMine ? 'text-zafting-bg' : 'text-zafting-text'}`}>
                            {formatDuration(durationSeconds)}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {m.text ? <div className="whitespace-pre-wrap">{m.text}</div> : null}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div className="p-3 bg-white border-t border-zafting-text/10 flex gap-2">
          <label className="p-2 rounded-lg border border-zafting-text/20 hover:bg-zafting-text/5 cursor-pointer">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                sendFile(file, 'IMAGE').catch(() => {});
              }}
            />
            <ImageIcon size={16} className="text-zafting-text" />
          </label>
          <button
            type="button"
            onClick={() => {
              if (isRecording) stopRecording();
              else startRecording().catch(() => {});
            }}
            disabled={sending}
            className={`p-2 rounded-lg border border-zafting-text/20 hover:bg-zafting-text/5 transition-colors ${
              isRecording ? 'bg-zafting-text text-[#E8E0D9]' : 'text-zafting-text'
            }`}
            aria-label="record-voice"
          >
            {isRecording ? (
              <span className="relative inline-flex h-4 w-4 items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-current/25 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-current" />
              </span>
            ) : (
              <Mic size={16} />
            )}
          </button>
          {isRecording ? (
            <>
              <div className="flex-1 bg-white border border-zafting-text/20 rounded-full px-4 py-2 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <span
                      key={idx}
                      className="h-3 w-1.5 rounded-full bg-[#FF6B6B] animate-pulse"
                      style={{ animationDelay: `${idx * 120}ms` }}
                    />
                  ))}
                </div>
                <div className="flex-1 h-0 border-t-2 border-dashed border-[#FF6B6B]/60" />
                <div className="flex items-center gap-2 text-zafting-text tabular-nums">
                  <span>{formatDuration(recordingSeconds)}</span>
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                </div>
              </div>
              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                aria-label="cancel-voice"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendText()}
            placeholder={language === 'fa' ? 'پیام شما...' : 'Your message...'}
            className="flex-1 bg-transparent outline-none text-sm text-zafting-text placeholder:text-zafting-text/40"
          />
          )}
          {!isRecording ? (
            <button
              type="button"
              onClick={sendText}
              disabled={sending || !input.trim()}
              className="p-2 bg-zafting-text text-zafting-bg rounded-lg disabled:opacity-50 hover:bg-opacity-90 rtl:scale-x-[-1]"
              aria-label="send-direct-message"
            >
              {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </button>
          ) : null}
          </div>
        </div>
        </div>
      ) : null}
    </>
  );
};
