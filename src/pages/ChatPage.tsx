import React, { useState, useEffect, useRef } from 'react';
import { Club, ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { RoleBadge } from '../components/common/RoleBadge';
import {
  Send,
  Pin,
  Trash2,
  Image as ImageIcon,
  MessageSquare,
  Lock,
  X,
  Sparkles,
  Users,
} from 'lucide-react';

interface ChatPageProps {
  clubs: Club[];
  onNavigate: (tab: string, slug?: string) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ clubs, onNavigate }) => {
  const { user } = useAuth();
  const safeClubs = clubs || [];
  const [activeClubId, setActiveClubId] = useState<string>(safeClubs[0]?.id || 'club-1');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeClub = safeClubs.find((c) => c && c.id === activeClubId) || safeClubs[0];

  // User permission check
  const isHod = user?.systemRole === 'HOD';
  const isClubPresident = user?.id === activeClub?.presidentId;
  const isClubVp = user?.id === activeClub?.vicePresidentId;
  const canModerate = isHod || isClubPresident || isClubVp;

  useEffect(() => {
    loadMessages();
  }, [activeClubId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!activeClubId) return;
    setLoading(true);
    try {
      const msgs = await api.getChatMessages(activeClubId);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !imageUrl.trim()) || !user) return;

    try {
      const sent = await api.sendChatMessage(
        activeClubId,
        user.id,
        inputText.trim(),
        imageUrl.trim() || undefined
      );

      if (sent) {
        setMessages((prev) => [...(prev || []), sent]);
      }
      setInputText('');
      setImageUrl('');
      setShowImageInput(false);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleTogglePin = async (msgId: string) => {
    if (!canModerate) return;
    try {
      const updated = await api.togglePinMessage(msgId);
      if (updated) {
        setMessages((prev) => (prev || []).map((m) => (m.id === msgId ? updated : m)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!canModerate && !user) return;
    try {
      await api.deleteChatMessage(msgId, user?.id || 'moderator');
      setMessages((prev) => (prev || []).filter((m) => m.id !== msgId));
    } catch (err) {
      console.error(err);
    }
  };

  const safeMessages = messages || [];
  const pinnedMessages = safeMessages.filter((m) => m && m.isPinned);

  return (
    <div className="h-[calc(100vh-140px)] min-h-[600px] flex flex-col md:flex-row rounded-2xl border border-white/15 bg-zinc-950 overflow-hidden shadow-2xl">
      {/* Sidebar: Club Channels (Black & White) */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-black/60">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-white" />
            <h2 className="font-extrabold text-sm text-white">
              Guild Chatrooms
            </h2>
          </div>
          <span className="text-[10px] font-mono text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded">
            6 Clubs
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {safeClubs.map((c) => {
            const active = c.id === activeClubId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveClubId(c.id)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all ${
                  active
                    ? 'bg-white text-black shadow-lg font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/70'
                }`}
              >
                <img
                  src={c.logoUrl}
                  alt={c.name}
                  referrerPolicy="no-referrer"
                  className={`w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ${
                    active ? 'ring-black' : 'ring-white/20'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={`text-xs font-bold truncate ${
                        active ? 'text-black' : 'text-white'
                      }`}
                    >
                      {c.name}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        active ? 'bg-black' : 'bg-white'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-[11px] truncate font-mono ${
                      active ? 'text-zinc-700' : 'text-zinc-400'
                    }`}
                  >
                    {c.tag}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* User Active Status in sidebar */}
        {user ? (
          <div className="p-3 border-t border-white/10 bg-zinc-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover ring-1 ring-white/30"
              />
              <div className="truncate max-w-[120px]">
                <div className="font-semibold text-white truncate text-[11px]">
                  {user.fullName}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">Online</div>
              </div>
            </div>
            <RoleBadge role={user.systemRole} size="sm" />
          </div>
        ) : (
          <div className="p-3 border-t border-white/10 bg-zinc-900/60 text-center">
            <button
              onClick={() => onNavigate('login')}
              className="w-full py-1.5 text-xs font-bold rounded-lg bg-white text-black hover:bg-zinc-200"
            >
              Sign In to Chat
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-zinc-950/80">
        {/* Chat Room Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/20" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  {activeClub?.name} Official Group
                </h3>
                <span className="text-[10px] font-mono text-black bg-white font-bold px-2 py-0.5 rounded">
                  Live Sync
                </span>
              </div>
              <div className="text-[11px] text-zinc-400">
                {activeClub?.roomLocation} · {activeClub?.meetingSchedule}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('club-detail', activeClub?.slug)}
              className="text-xs text-zinc-300 hover:text-white underline font-medium hidden sm:inline"
            >
              View Guild Hub
            </button>
          </div>
        </div>

        {/* Pinned Announcements Bar */}
        {pinnedMessages.length > 0 && (
          <div className="px-4 py-2 bg-zinc-900 border-b border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <Pin className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="font-semibold text-white shrink-0">Pinned:</span>
              <span className="text-zinc-300 truncate">
                {pinnedMessages[pinnedMessages.length - 1].content}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 shrink-0 ml-2">
              {pinnedMessages.length} Pinned
            </span>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && safeMessages.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 text-xs">
              Loading group conversation...
            </div>
          ) : safeMessages.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-xs font-medium text-zinc-400">No messages in this guild room yet.</p>
              <p className="text-[11px]">Start the conversation below!</p>
            </div>
          ) : (
            safeMessages.map((msg) => {
              const isMe = user?.id === msg.senderId;

              return (
                <div
                  key={msg.id}
                  className={`group flex items-start gap-3 ${
                    isMe ? 'flex-row-reverse' : ''
                  }`}
                >
                  <img
                    src={
                      msg.senderAvatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={msg.senderName || 'User'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/20 mt-0.5"
                  />

                  <div
                    className={`max-w-[80%] sm:max-w-md space-y-1 ${
                      isMe ? 'items-end text-right' : 'items-start'
                    }`}
                  >
                    {/* Header info */}
                    <div
                      className={`flex items-center gap-1.5 text-[11px] ${
                        isMe ? 'justify-end' : ''
                      }`}
                    >
                      <span className="font-semibold text-white">
                        {msg.senderName || 'Member'}
                      </span>
                      {msg.senderRole && <RoleBadge role={msg.senderRole} size="sm" />}
                      <span className="text-zinc-500 font-mono text-[10px]">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {msg.isPinned && (
                        <Pin className="w-3 h-3 text-white fill-white" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`relative p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                        isMe
                          ? 'bg-white text-black font-medium'
                          : 'bg-zinc-900 text-zinc-200 border border-white/10'
                      }`}
                    >
                      {msg.content && <p>{msg.content}</p>}

                      {msg.imageUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden max-h-60 border border-white/10">
                          <img
                            src={msg.imageUrl}
                            alt="Attachment"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Moderation Actions Hover */}
                      {canModerate && (
                        <div
                          className={`absolute top-1 hidden group-hover:flex items-center gap-1 bg-black/90 border border-white/20 rounded-lg p-1 text-[10px] ${
                            isMe ? 'left-1 -translate-x-full' : 'right-1 translate-x-full'
                          }`}
                        >
                          <button
                            onClick={() => handleTogglePin(msg.id)}
                            className="p-1 text-zinc-300 hover:text-white"
                            title={msg.isPinned ? 'Unpin message' : 'Pin message'}
                          >
                            <Pin className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 text-zinc-300 hover:text-white"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-white/10 bg-black/60">
          {showImageInput && (
            <div className="mb-2 flex items-center gap-2 bg-zinc-900 border border-white/15 p-2 rounded-xl text-xs">
              <ImageIcon className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Paste image URL to attach..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-zinc-500 focus:outline-none text-xs"
              />
              <button
                onClick={() => {
                  setImageUrl('');
                  setShowImageInput(false);
                }}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className="p-2.5 rounded-xl border border-white/15 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
              title="Attach image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder={
                user
                  ? `Message #${activeClub?.name}...`
                  : 'Sign in to participate in the conversation'
              }
              disabled={!user}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
            />

            <button
              type="submit"
              disabled={(!inputText.trim() && !imageUrl.trim()) || !user}
              className="p-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white transition-all shrink-0 font-bold shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
