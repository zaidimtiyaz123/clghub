import React from 'react';
import { Home, Compass, Calendar, MessageSquare, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string, slug?: string) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigate,
  unreadCount = 0,
}) => {
  const { user, isAuthenticated } = useAuth();

  const isLeaderOrAdmin =
    user?.systemRole === 'HOD' ||
    user?.systemRole === 'PRESIDENT' ||
    user?.systemRole === 'VICE_PRESIDENT';

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'clubs', label: 'Clubs', icon: Compass },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    ...(isLeaderOrAdmin
      ? [{ id: 'admin', label: user?.systemRole === 'HOD' ? 'Admin' : 'Club Lead', icon: ShieldCheck }]
      : isAuthenticated
      ? [{ id: 'profile', label: 'Profile', icon: UserIcon }]
      : [{ id: 'login', label: 'Sign In', icon: UserIcon }]),
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-white/10 md:hidden pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || (item.id === 'clubs' && currentTab === 'club-detail');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-white' : 'text-zinc-400'
                  }`}
                />
                {item.id === 'admin' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-zinc-950" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 truncate max-w-full ${
                  isActive ? 'text-white font-semibold' : 'text-zinc-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
