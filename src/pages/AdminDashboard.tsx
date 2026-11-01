import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Club, Event, GalleryImage, ClubMember, User, Announcement } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Key,
  Megaphone,
  BarChart3,
  Edit2,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { ClubEngagementVisualizer } from '../components/admin/ClubEngagementVisualizer';

interface AdminDashboardProps {
  clubs: Club[];
  events?: Event[];
  onRefreshClubs: () => void;
  onRefreshEvents: () => void;
  onNavigate: (tab: string, slug?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  clubs,
  events = [],
  onRefreshClubs,
  onRefreshEvents,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ANALYTICS' | 'APPROVALS' | 'CLUBS' | 'LEADERSHIP' | 'ANNOUNCEMENTS'>('OVERVIEW');
  const [stats, setStats] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [eventsList, setEventsList] = useState<Event[]>(events || []);
  const [loading, setLoading] = useState(true);

  // New Club state
  const [newClubName, setNewClubName] = useState('');
  const [newClubSlug, setNewClubSlug] = useState('');
  const [newClubTag, setNewClubTag] = useState('');
  const [newClubCategory, setNewClubCategory] = useState('Coding & Algorithms');
  const [newClubDescription, setNewClubDescription] = useState('');
  const [newClubFullAbout, setNewClubFullAbout] = useState('');
  const [newClubRoom, setNewClubRoom] = useState('');
  const [newClubSchedule, setNewClubSchedule] = useState('');
  const [newClubEmail, setNewClubEmail] = useState('');
  const [createClubOpen, setCreateClubOpen] = useState(false);

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annIsCollegeWide, setAnnIsCollegeWide] = useState(true);
  const [annClubId, setAnnClubId] = useState(clubs[0]?.id || '');
  const [annPriority, setAnnPriority] = useState<'NORMAL' | 'URGENT' | 'PINNED'>('PINNED');
  const [annSuccess, setAnnSuccess] = useState(false);

  // Leadership assignment state
  const [assignClubId, setAssignClubId] = useState(clubs[0]?.id || '');
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState<'PRESIDENT' | 'VICE_PRESIDENT'>('PRESIDENT');
  const [assignSuccess, setAssignSuccess] = useState(false);

  const isHod = user?.systemRole === 'HOD';
  const safeClubs = clubs || [];
  const safeUsers = allUsers || [];
  const pendingEventsList: Event[] = Array.isArray(stats?.pendingItems?.events) ? stats.pendingItems.events : [];
  const pendingGalleryList: GalleryImage[] = Array.isArray(stats?.pendingItems?.gallery) ? stats.pendingItems.gallery : [];
  const clubStatsList = Array.isArray(stats?.clubStats) && stats.clubStats.length > 0
    ? stats.clubStats
    : safeClubs.map((c) => ({
        clubId: c.id,
        clubName: c.name,
        category: c.category,
        memberCount: c.memberCount,
        eventsCount: 2,
        chatMessagesCount: 20,
        presidentId: c.presidentId,
      }));

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (events && events.length > 0) {
      setEventsList(events);
    }
  }, [events]);

  const loadDashboardData = async () => {
    setLoading(true);
    const data = await api.getAdminStats();
    const users = await api.getAllUsers();
    const evts = await api.getEvents();
    setStats(data);
    setAllUsers(users);
    if (Array.isArray(evts) && evts.length > 0) {
      setEventsList(evts);
    }
    if (users.length > 0 && !assignUserId) {
      setAssignUserId(users[0].id);
    }
    setLoading(false);
  };

  const handleApproveEvent = async (eventId: string, approve: boolean) => {
    await api.approveEvent(eventId, approve);
    loadDashboardData();
    onRefreshEvents();
  };

  const handleApproveGallery = async (imageId: string, approve: boolean) => {
    await api.approveGallery(imageId, approve);
    loadDashboardData();
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName || !newClubSlug) return;

    await api.createClub({
      name: newClubName,
      slug: newClubSlug.toLowerCase().replace(/\s+/g, '-'),
      tag: newClubTag,
      category: newClubCategory,
      description: newClubDescription,
      fullAbout: newClubFullAbout,
      roomLocation: newClubRoom,
      meetingSchedule: newClubSchedule,
      contactEmail: newClubEmail,
      accentColor: '#ffffff',
      bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      logoUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      establishedYear: new Date().getFullYear(),
      presidentId: user?.id || 'user-pres-1',
    });

    setCreateClubOpen(false);
    onRefreshClubs();
    loadDashboardData();
  };

  const handleDeleteClub = async (clubId: string) => {
    if (window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
      await api.deleteClub(clubId);
      onRefreshClubs();
      loadDashboardData();
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    await api.createAnnouncement({
      title: annTitle,
      content: annContent,
      isCollegeWide: annIsCollegeWide,
      clubId: annIsCollegeWide ? null : annClubId,
      priority: annPriority,
      createdById: user?.id,
    });

    setAnnSuccess(true);
    setAnnTitle('');
    setAnnContent('');
    setTimeout(() => setAnnSuccess(false), 2000);
  };

  const handleAssignLeadership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignClubId || !assignUserId) return;

    await api.assignClubLeader(assignClubId, assignUserId, assignRole);
    setAssignSuccess(true);
    setTimeout(() => setAssignSuccess(false), 2000);
    onRefreshClubs();
    loadDashboardData();
  };

  if (loading || !stats) {
    return (
      <div className="py-24 text-center text-zinc-500">
        <p className="text-sm">Loading admin telemetry and pending queue...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Admin Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/20" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {isHod ? 'Head of Department (HOD) Super Admin Console' : 'Club Leadership Workspace'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            {isHod
              ? 'Campus-wide supervisory authority: manage all 6 clubs (Code Crackers, Innovation, Devspire, Sports, Sankalpa, Cultural), review approvals, and post college notices.'
              : `Operating as ${user?.fullName} (${user?.systemRole}).`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isHod && (
            <button
              onClick={() => setCreateClubOpen(true)}
              className="px-4 py-2 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all flex items-center gap-1.5 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Club</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Tabs (Horizontal Swipeable on Mobile) */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-white/10 rounded-xl text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3.5 py-2.5 min-h-[42px] sm:min-h-0 font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'OVERVIEW'
              ? 'bg-white text-black font-bold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          College Stats & Telemetry
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-3.5 py-2.5 min-h-[42px] sm:min-h-0 font-medium rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'ANALYTICS'
              ? 'bg-white text-black font-bold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Engagement Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('APPROVALS')}
          className={`px-3.5 py-2.5 min-h-[42px] sm:min-h-0 font-medium rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'APPROVALS'
              ? 'bg-white text-black font-bold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span>Approvals Queue</span>
          {((stats?.overview?.pendingEvents || 0) + (stats?.overview?.pendingGallery || 0) > 0) && (
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>

        {isHod && (
          <>
            <button
              onClick={() => setActiveTab('CLUBS')}
              className={`px-3.5 py-2.5 min-h-[42px] sm:min-h-0 font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'CLUBS'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Manage 6 Clubs
            </button>

            <button
              onClick={() => setActiveTab('LEADERSHIP')}
              className={`px-3.5 py-2.5 min-h-[42px] sm:min-h-0 font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'LEADERSHIP'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Presidents & VPs Logins
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          className={`px-3.5 py-2.5 min-h-[42px] sm:min-h-0 font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'ANNOUNCEMENTS'
              ? 'bg-white text-black font-bold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Post Notice / Announcement
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-5 text-center">
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {stats?.overview?.totalClubs ?? clubs.length}
              </div>
              <div className="text-xs text-zinc-400 mt-1 font-medium">Total Campus Clubs</div>
            </GlassCard>

            <GlassCard className="p-5 text-center">
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {stats?.overview?.totalMemberships ?? stats?.overview?.totalMembers ?? 860}
              </div>
              <div className="text-xs text-zinc-400 mt-1 font-medium">Enrolled Student Members</div>
            </GlassCard>

            <GlassCard className="p-5 text-center">
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {stats?.overview?.totalEvents ?? 12}
              </div>
              <div className="text-xs text-zinc-400 mt-1 font-medium">Scheduled Events</div>
            </GlassCard>

            <GlassCard className="p-5 text-center">
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {stats?.overview?.totalChatMessages ?? 120}
              </div>
              <div className="text-xs text-zinc-400 mt-1 font-medium">Guild Chat Messages</div>
            </GlassCard>
          </div>

          {/* Data Visualization Component with Recharts */}
          <ClubEngagementVisualizer clubs={safeClubs} events={eventsList} stats={stats} />

          {/* Breakdown per club */}
          <GlassCard className="p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Clubs Engagement Breakdown
            </h3>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono">
                    <th className="pb-3 font-semibold">Club Name</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Members</th>
                    <th className="pb-3 font-semibold">Events</th>
                    <th className="pb-3 font-semibold">Chat Messages</th>
                    <th className="pb-3 font-semibold">President</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {clubStatsList.map((cs: any) => {
                    const cObj = safeClubs.find((c) => c && c.id === (cs.clubId || cs.id));
                    const pres = safeUsers.find((u) => u && u.id === (cObj?.presidentId || cs.presidentId));
                    return (
                      <tr key={cs.clubId || cs.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3 font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-white" />
                          <span>{cs.clubName || cs.name || cObj?.name}</span>
                        </td>
                        <td className="py-3 text-zinc-400">{cObj?.category || cs.category}</td>
                        <td className="py-3 font-mono tabular-nums text-white">
                          {cs.memberCount ?? cs.membersCount ?? cObj?.memberCount ?? 0}
                        </td>
                        <td className="py-3 font-mono tabular-nums text-white">
                          {cs.eventsCount ?? 0}
                        </td>
                        <td className="py-3 font-mono tabular-nums text-white">
                          {cs.chatMessagesCount ?? cs.chatCount ?? 0}
                        </td>
                        <td className="py-3 font-medium text-zinc-300">
                          {pres?.fullName || 'Assigned'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
              {clubStatsList.map((cs: any) => {
                const cObj = safeClubs.find((c) => c && c.id === (cs.clubId || cs.id));
                const pres = safeUsers.find((u) => u && u.id === (cObj?.presidentId || cs.presidentId));
                return (
                  <div
                    key={cs.clubId || cs.id}
                    className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/10 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cObj?.accentColor || '#fff' }}
                        />
                        <span className="font-bold text-white text-sm">
                          {cs.clubName || cs.name || cObj?.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {cObj?.category || cs.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 font-mono text-[11px]">
                      <div>
                        <div className="text-zinc-500 uppercase text-[9px]">Members</div>
                        <div className="font-bold text-white tabular-nums">
                          {cs.memberCount ?? cs.membersCount ?? cObj?.memberCount ?? 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-zinc-500 uppercase text-[9px]">Events</div>
                        <div className="font-bold text-white tabular-nums">
                          {cs.eventsCount ?? 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-zinc-500 uppercase text-[9px]">Messages</div>
                        <div className="font-bold text-white tabular-nums">
                          {cs.chatMessagesCount ?? cs.chatCount ?? 0}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>
                        President: <strong className="text-zinc-200">{pres?.fullName || 'Assigned'}</strong>
                      </span>
                      {cObj && (
                        <button
                          onClick={() => onNavigate('club-detail', cObj.slug)}
                          className="text-white hover:underline font-semibold"
                        >
                          View Hub →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB: ENGAGEMENT ANALYTICS (DEDICATED FULL VIEW) */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <ClubEngagementVisualizer clubs={safeClubs} events={eventsList} stats={stats} />

          {/* Deep-Dive Telemetry Table */}
          <GlassCard className="p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Club Telemetry Matrix & Conversion Audit
            </h3>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono">
                    <th className="pb-3 font-semibold">Club Name</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Enrolled Members</th>
                    <th className="pb-3 font-semibold">Events Scheduled</th>
                    <th className="pb-3 font-semibold">Total RSVPs</th>
                    <th className="pb-3 font-semibold">Turnout Ratio</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {safeClubs.map((club) => {
                    const clubEvts = (eventsList || []).filter((e) => e && e.clubId === club.id);
                    const totalRsvps = clubEvts.reduce((sum, e) => sum + (e.rsvpCount || 0), 0);
                    const ratio = club.memberCount > 0 ? (totalRsvps / club.memberCount).toFixed(2) : '0.00';
                    return (
                      <tr key={club.id} className="hover:bg-zinc-900/60 transition-colors">
                        <td className="py-3 font-bold text-white flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: club.accentColor || '#fff' }}
                          />
                          <span>{club.name}</span>
                        </td>
                        <td className="py-3 text-zinc-400">{club.category}</td>
                        <td className="py-3 font-mono tabular-nums text-white">{club.memberCount}</td>
                        <td className="py-3 font-mono tabular-nums text-white">{clubEvts.length}</td>
                        <td className="py-3 font-mono tabular-nums text-emerald-400 font-bold">{totalRsvps}</td>
                        <td className="py-3 font-mono tabular-nums text-zinc-300">{ratio}x</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3">
              {safeClubs.map((club) => {
                const clubEvts = (eventsList || []).filter((e) => e && e.clubId === club.id);
                const totalRsvps = clubEvts.reduce((sum, e) => sum + (e.rsvpCount || 0), 0);
                const ratio = club.memberCount > 0 ? (totalRsvps / club.memberCount).toFixed(2) : '0.00';
                return (
                  <div
                    key={club.id}
                    className="p-3.5 rounded-xl bg-zinc-900/80 border border-white/10 space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: club.accentColor || '#fff' }}
                        />
                        <span className="font-bold text-white text-sm">{club.name}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-400 font-mono">
                      Category: <span className="text-zinc-200">{club.category}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 font-mono text-[11px]">
                      <div>
                        <div className="text-zinc-500 uppercase text-[9px]">Members</div>
                        <div className="font-bold text-white tabular-nums">{club.memberCount}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 uppercase text-[9px]">Events</div>
                        <div className="font-bold text-white tabular-nums">{clubEvts.length}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 uppercase text-[9px]">Total RSVPs</div>
                        <div className="font-bold text-emerald-400 tabular-nums">{totalRsvps}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Turnout Velocity Ratio:</span>
                      <span className="font-mono font-bold text-white tabular-nums">{ratio}x</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 2: APPROVALS */}
      {activeTab === 'APPROVALS' && (
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Pending Events Approval Queue ({pendingEventsList.length})
            </h3>
            {pendingEventsList.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4">No events waiting for approval.</p>
            ) : (
              <div className="space-y-3">
                {pendingEventsList.map((evt: Event) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-xl border border-white/10 bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">{evt.title}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/20">
                          {evt.clubName}
                        </span>
                      </div>
                      <p className="text-zinc-400 line-clamp-1">{evt.description}</p>
                      <div className="text-[11px] text-zinc-500 mt-1 font-mono">
                        Date: {evt.eventDate} ({evt.startTime}) · Venue: {evt.venue}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveEvent(evt.id, true)}
                        className="px-3 py-1.5 font-bold rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors flex items-center gap-1 shadow"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleApproveEvent(evt.id, false)}
                        className="px-3 py-1.5 font-semibold rounded-lg bg-zinc-900 border border-white/20 text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Pending Photo Gallery Queue ({pendingGalleryList.length})
            </h3>
            {pendingGalleryList.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4">No gallery uploads waiting for approval.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pendingGalleryList.map((img: GalleryImage) => (
                  <div
                    key={img.id}
                    className="p-3 rounded-xl border border-white/10 bg-zinc-900 flex items-center gap-3 text-xs"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate">{img.title}</h4>
                      <p className="text-[11px] text-zinc-400 font-mono">{img.clubName}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleApproveGallery(img.id, true)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded bg-white text-black hover:bg-zinc-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproveGallery(img.id, false)}
                          className="px-2.5 py-1 text-[11px] font-medium rounded bg-zinc-800 text-zinc-300"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {/* TAB 3: CLUBS MANAGEMENT (HOD Only) */}
      {isHod && activeTab === 'CLUBS' && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-bold text-base text-white">Campus Guilds Registry</h3>
              <p className="text-xs text-zinc-400">Total 6 official college clubs maintained by HOD</p>
            </div>
            <button
              onClick={() => setCreateClubOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-white text-black hover:bg-zinc-200"
            >
              + Add Guild
            </button>
          </div>

          <div className="divide-y divide-white/10">
            {safeClubs.map((c) => (
              <div
                key={c.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.logoUrl}
                    alt={c.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/20 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{c.name}</h4>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {c.tag} · {c.category}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      {c.roomLocation} · {c.memberCount} members
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('club-detail', c.slug)}
                    className="px-3 py-1.5 rounded-lg border border-white/20 text-zinc-300 hover:text-white"
                  >
                    View Hub
                  </button>
                  <button
                    onClick={() => handleDeleteClub(c.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
                    title="Delete club"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* TAB 4: LEADERSHIP ASSIGNMENT (HOD Only) */}
      {isHod && activeTab === 'LEADERSHIP' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-6 space-y-4">
            <h3 className="font-bold text-base text-white">Assign Club Leadership</h3>
            <p className="text-xs text-zinc-400">
              Set or update President and Vice President logins for each of the 6 clubs.
            </p>

            {assignSuccess && (
              <div className="p-3 text-xs rounded-xl bg-white text-black font-semibold">
                Leadership updated successfully!
              </div>
            )}

            <form onSubmit={handleAssignLeadership} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Select Club</label>
                <select
                  value={assignClubId}
                  onChange={(e) => setAssignClubId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                >
                  {safeClubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Select Student / Leader</label>
                <select
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                >
                  {safeUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.email}) - {u.systemRole}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Target Leadership Role</label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                >
                  <option value="PRESIDENT">President (Full Club Authority)</option>
                  <option value="VICE_PRESIDENT">Vice President (Operational Lead)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 font-bold rounded-xl bg-white text-black hover:bg-zinc-200 shadow-md"
              >
                Confirm Leadership Assignment
              </button>
            </form>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h3 className="font-bold text-base text-white">Current Leaders Directory</h3>
            <div className="space-y-3 text-xs">
              {safeClubs.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">{c.name}</span>
                    <div className="text-[11px] text-zinc-400">
                      President: {safeUsers.find((u) => u.id === c.presidentId)?.fullName || 'Assigned'}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      VP: {safeUsers.find((u) => u.id === c.vicePresidentId)?.fullName || 'Assigned'}
                    </div>
                  </div>
                  <RoleBadge role="PRESIDENT" size="sm" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeTab === 'ANNOUNCEMENTS' && (
        <GlassCard className="p-6 space-y-4 max-w-2xl mx-auto">
          <h3 className="font-bold text-base text-white">Post College or Guild Notice</h3>
          <p className="text-xs text-zinc-400">
            Send high-visibility pinned notices visible in the header banner and notifications center.
          </p>

          {annSuccess && (
            <div className="p-3 text-xs rounded-xl bg-white text-black font-semibold">
              Announcement broadcast successfully!
            </div>
          )}

          <form onSubmit={handlePostAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Notice Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Important: Annual Apex Youth Convention 2026"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Notice Content</label>
              <textarea
                rows={4}
                required
                placeholder="Detailed message text..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Audience Scope</label>
                <select
                  value={annIsCollegeWide ? 'COLLEGE' : 'CLUB'}
                  onChange={(e) => setAnnIsCollegeWide(e.target.value === 'COLLEGE')}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                >
                  <option value="COLLEGE">College-Wide (All 6 Clubs)</option>
                  <option value="CLUB">Specific Guild Only</option>
                </select>
              </div>

              {!annIsCollegeWide && (
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Select Club</label>
                  <select
                    value={annClubId}
                    onChange={(e) => setAnnClubId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                  >
                    {safeClubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 font-bold rounded-xl bg-white text-black hover:bg-zinc-200 shadow-md"
            >
              Broadcast Announcement
            </button>
          </form>
        </GlassCard>
      )}

      {/* Modal: Create Club */}
      {createClubOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-zinc-950 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm text-white">Create New Student Guild</h3>
              <button onClick={() => setCreateClubOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Club Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Code Crackers"
                    value={newClubName}
                    onChange={(e) => {
                      setNewClubName(e.target.value);
                      setNewClubSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={newClubSlug}
                    onChange={(e) => setNewClubSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Competitive Programming & Olympiads"
                  value={newClubTag}
                  onChange={(e) => setNewClubTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Category</label>
                <select
                  value={newClubCategory}
                  onChange={(e) => setNewClubCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                >
                  <option value="Coding & Algorithms">Coding & Algorithms</option>
                  <option value="Engineering & Innovation">Engineering & Innovation</option>
                  <option value="Software & Open Source">Software & Open Source</option>
                  <option value="Athletics & Sports">Athletics & Sports</option>
                  <option value="Social Impact & Service">Social Impact & Service</option>
                  <option value="Performing Arts & Culture">Performing Arts & Culture</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={newClubDescription}
                  onChange={(e) => setNewClubDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Full Charter</label>
                <textarea
                  rows={3}
                  value={newClubFullAbout}
                  onChange={(e) => setNewClubFullAbout(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Room / Lab</label>
                  <input
                    type="text"
                    placeholder="Lab 304"
                    value={newClubRoom}
                    onChange={(e) => setNewClubRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Schedule</label>
                  <input
                    type="text"
                    placeholder="Thursdays 5 PM"
                    value={newClubSchedule}
                    onChange={(e) => setNewClubSchedule(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="club@apex.edu"
                  value={newClubEmail}
                  onChange={(e) => setNewClubEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateClubOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold rounded-xl bg-white text-black hover:bg-zinc-200"
                >
                  Create Guild
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
