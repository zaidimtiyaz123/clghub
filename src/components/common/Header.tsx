import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { RoleBadge } from './RoleBadge';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string, slug?: string) => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  unreadCount,
  onOpenNotifications,
  onOpenAuthModal,
}) => {
  const { user, isAuthenticated, logout, quickSwitchUser, theme, toggleTheme } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isLeaderOrAdmin =
    user?.systemRole === 'HOD' ||
    user?.systemRole === 'PRESIDENT' ||
    user?.systemRole === 'VICE_PRESIDENT';

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'clubs', label: 'Clubs' },
    { id: 'events', label: 'Events' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'chat', label: 'Club Chat' },
    { id: 'login', label: 'Sign In' },
    ...(isLeaderOrAdmin ? [{ id: 'admin', label: user?.systemRole === 'HOD' ? 'HOD Admin' : 'Club Admin' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single element wordmark */}
        <button
          onClick={() => {
            onNavigate('home');
            setMobileMenuOpen(false);
          }}
          className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2.5 text-left group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/20 group-hover:scale-110 transition-transform" />
          <span>Apex Clubs Hub</span>
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => {
            const active = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`transition-colors whitespace-nowrap cursor-pointer relative py-1 ${
                  active
                    ? 'text-white font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher Pill Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-white/15 bg-zinc-900/80 text-zinc-200 hover:border-white/30 hover:bg-zinc-850 transition-colors"
              title="Switch user role demo view"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline text-zinc-400">Role:</span>
              <span className="font-semibold text-white">
                {user ? user.systemRole : 'Guest'}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/15 bg-zinc-950 p-2 shadow-2xl z-50 text-xs"
                onClick={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 text-zinc-400 font-mono text-[10px] uppercase tracking-wider border-b border-white/10 mb-1">
                  Switch Active Persona
                </div>
                <button
                  onClick={() => quickSwitchUser('HOD')}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-900 flex items-center justify-between text-zinc-200 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">Prof. Dr. Rajesh Sundaram</div>
                    <div className="text-[11px] text-zinc-400">HOD (Super Admin)</div>
                  </div>
                  <RoleBadge role="HOD" size="sm" />
                </button>
                <button
                  onClick={() => quickSwitchUser('PRESIDENT')}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-900 flex items-center justify-between text-zinc-200 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">Aryan Sharma</div>
                    <div className="text-[11px] text-zinc-400">President (Code Crackers)</div>
                  </div>
                  <RoleBadge role="PRESIDENT" size="sm" />
                </button>
                <button
                  onClick={() => quickSwitchUser('PRESIDENT_DEV')}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-900 flex items-center justify-between text-zinc-200 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">Marcus Vance</div>
                    <div className="text-[11px] text-zinc-400">President (Innovation)</div>
                  </div>
                  <RoleBadge role="PRESIDENT" size="sm" />
                </button>
                <button
                  onClick={() => quickSwitchUser('VICE_PRESIDENT')}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-900 flex items-center justify-between text-zinc-200 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">Tara Sen</div>
                    <div className="text-[11px] text-zinc-400">VP (Code Crackers)</div>
                  </div>
                  <RoleBadge role="VICE_PRESIDENT" size="sm" />
                </button>
                <button
                  onClick={() => quickSwitchUser('MEMBER')}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-zinc-900 flex items-center justify-between text-zinc-200 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-white">Rahul Verma</div>
                    <div className="text-[11px] text-zinc-400">Student Member</div>
                  </div>
                  <RoleBadge role="MEMBER" size="sm" />
                </button>
                <div className="pt-1 mt-1 border-t border-white/10">
                  <button
                    onClick={() => onNavigate('login')}
                    className="w-full text-center py-2 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all"
                  >
                    Open Full Login & Sign In Page →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white ring-2 ring-black" />
            )}
          </button>

          {/* User Profile / Login */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-xl border border-white/15 hover:border-white/30 bg-zinc-900 transition-all"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-white/30"
                />
                <span className="text-xs font-semibold text-white hidden sm:inline max-w-[100px] truncate">
                  {user.fullName.split(' ')[0]}
                </span>
              </button>
              <button
                onClick={() => {
                  logout();
                  onNavigate('login');
                }}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('login')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                currentTab === 'login'
                  ? 'bg-zinc-200 text-black shadow-lg'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              Sign In
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-300 hover:text-white rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-black px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === link.id
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              {link.label}
            </button>
          ))}
          {isAuthenticated ? (
            <div className="pt-2 border-t border-white/10 space-y-1">
              <button
                onClick={() => {
                  onNavigate('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-200 hover:bg-zinc-900 flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-white" />
                My Profile & Enrolled Clubs
              </button>
              <button
                onClick={() => {
                  logout();
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-white/10 space-y-1">
              <button
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-black bg-white flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Sign In / Student Register
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
