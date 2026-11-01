import React from 'react';
import { NotificationItem } from '../../types';
import { Bell, CheckCheck, X, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate: (tab: string, slug?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const safeNotifications = notifications || [];

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'EVENT':
        return <Calendar className="w-4 h-4 text-white" />;
      case 'CHAT':
        return <MessageSquare className="w-4 h-4 text-white" />;
      case 'ANNOUNCEMENT':
      case 'MEMBERSHIP_APPROVAL':
        return <AlertCircle className="w-4 h-4 text-white" />;
      default:
        return <Bell className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-sm sm:max-w-md bg-zinc-950 border-l border-white/20 shadow-2xl h-full flex flex-col text-white">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-white" />
            <span className="font-bold text-sm text-white">
              Campus Notifications
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white text-black font-bold">
              {safeNotifications.filter((n) => !n.isRead).length} new
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onMarkAllRead}
              className="p-1.5 text-xs text-zinc-400 hover:text-white flex items-center gap-1 rounded hover:bg-zinc-900"
              title="Mark all read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/10">
          {safeNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onMarkRead(n.id);
                if (n.link) {
                  onNavigate(n.link.replace('/', ''));
                  onClose();
                }
              }}
              className={`p-4 transition-colors cursor-pointer flex items-start gap-3 ${
                !n.isRead ? 'bg-zinc-900/80 hover:bg-zinc-900' : 'hover:bg-zinc-900/40'
              }`}
            >
              <div className="p-2 rounded-xl bg-white/10 border border-white/15 shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <h5 className="font-semibold text-xs text-white line-clamp-1">
                    {n.title}
                  </h5>
                  <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                  {n.message}
                </p>
                {!n.isRead && (
                  <span className="inline-block text-[10px] font-mono text-white bg-zinc-800 border border-white/20 px-1.5 py-0.5 rounded mt-1">
                    Unread
                  </span>
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-12 text-center text-zinc-500 text-xs">
              No notifications at this time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
