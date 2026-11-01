import React, { useState, useEffect } from 'react';
import { Club, User, ClubMember, Event, GalleryImage } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import {
  Users,
  MapPin,
  Calendar,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Clock,
  Edit3,
  UserPlus,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface ClubDetailPageProps {
  clubSlug: string;
  onNavigate: (tab: string, slug?: string) => void;
  onOpenRsvpModal: (event: Event) => void;
  onOpenLightbox: (image: GalleryImage) => void;
}

export const ClubDetailPage: React.FC<ClubDetailPageProps> = ({
  clubSlug,
  onNavigate,
  onOpenRsvpModal,
  onOpenLightbox,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    club: Club;
    president?: User;
    vicePresident?: User;
    members: ClubMember[];
    events: Event[];
    gallery: GalleryImage[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'ABOUT' | 'EVENTS' | 'GALLERY' | 'MEMBERS'>('ABOUT');
  const [joinStatus, setJoinStatus] = useState<'NONE' | 'PENDING' | 'APPROVED'>('NONE');
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Club>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadClubData();
  }, [clubSlug]);

  const loadClubData = async () => {
    const res = await api.getClubBySlugOrId(clubSlug);
    if (res) {
      setData(res);
      setEditForm(res.club);

      // Check user membership status
      if (user) {
        const mem = res.members.find((m) => m.userId === user.id);
        if (mem) {
          setJoinStatus(mem.status === 'APPROVED' ? 'APPROVED' : 'PENDING');
        } else {
          setJoinStatus('NONE');
        }
      }
    }
  };

  if (!data) {
    return (
      <div className="py-24 text-center text-zinc-400">
        <p className="text-sm">Loading club profile...</p>
      </div>
    );
  }

  const club = data.club;
  const president = data.president;
  const vicePresident = data.vicePresident;
  const members = Array.isArray(data.members) ? data.members : [];
  const events = Array.isArray(data.events) ? data.events : [];
  const gallery = Array.isArray(data.gallery) ? data.gallery : [];

  const isHod = user?.systemRole === 'HOD';
  const isClubPresident = user?.id === club.presidentId;
  const isClubVp = user?.id === club.vicePresidentId;
  const canManage = isHod || isClubPresident || isClubVp;

  const handleJoin = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }
    setLoadingJoin(true);
    try {
      await api.joinClub(club.id, user.id);
      setJoinStatus('PENDING');
      loadClubData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingJoin(false);
    }
  };

  const handleApproveMember = async (membershipId: string, approve: boolean) => {
    await api.updateMembership(membershipId, {
      status: approve ? 'APPROVED' : 'REJECTED',
      approvedById: user?.id,
    });
    loadClubData();
  };

  const handleSaveClubProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club.id) return;
    try {
      await api.updateClub(club.id, editForm);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setEditModalOpen(false);
        loadClubData();
      }, 700);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Club Banner & Identity Header (Black and White Noir) */}
      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-zinc-950 shadow-2xl">
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-black">
          <img
            src={club.bannerUrl}
            alt={club.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        {/* Club Profile Card Overlay */}
        <div className="p-6 sm:p-8 pt-0 sm:pt-0 -mt-16 sm:-mt-20 relative flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <img
              src={club.logoUrl}
              alt={club.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl bg-zinc-900"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {club.name}
                </h1>
                <span className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/20" />
              </div>
              <div className="text-xs sm:text-sm font-mono text-zinc-300">
                {club.tag} · {club.category}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-1">
                <span className="flex items-center gap-1 font-mono tabular-nums text-white">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  {club.memberCount} members
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  {club.roomLocation}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  {club.meetingSchedule}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {canManage && (
              <button
                onClick={() => setEditModalOpen(true)}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-white/20 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-zinc-300" />
                <span>Edit Profile</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-white/20 bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-zinc-300" />
              <span>Group Chat</span>
            </button>

            {joinStatus === 'APPROVED' ? (
              <div className="px-4 py-2.5 text-xs font-bold rounded-xl bg-white text-black border border-white flex items-center gap-1.5 shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Enrolled Member</span>
              </div>
            ) : joinStatus === 'PENDING' ? (
              <div className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-zinc-900 text-zinc-300 border border-white/30 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span>Application Pending</span>
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={loadingJoin}
                className="px-5 py-2.5 text-xs font-bold rounded-xl text-black bg-white hover:bg-zinc-200 transition-all shadow-xl flex items-center gap-1.5 hover:scale-105"
              >
                <UserPlus className="w-4 h-4 text-black" />
                <span>{loadingJoin ? 'Submitting...' : 'Join Club'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-white/10 rounded-xl max-w-full overflow-x-auto text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('ABOUT')}
          className={`px-4 py-2 font-medium rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'ABOUT'
              ? 'bg-white text-black font-bold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          About & Charter
        </button>
        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`px-4 py-2 font-medium rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'EVENTS'
              ? 'bg-white text-black font-bold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('GALLERY')}
          className={`px-4 py-2 font-medium rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'GALLERY'
              ? 'bg-white text-black font-bold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Gallery ({gallery.length})
        </button>
        <button
          onClick={() => setActiveTab('MEMBERS')}
          className={`px-4 py-2 font-medium rounded-lg transition-all whitespace-nowrap ${
            activeTab === 'MEMBERS'
              ? 'bg-white text-black font-bold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Members ({members.length})
        </button>
      </div>

      {/* TAB 1: ABOUT & CHARTER */}
      {activeTab === 'ABOUT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6 space-y-4">
              <h3 className="text-base font-bold text-white">
                About {club.name}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {club.fullAbout}
              </p>
            </GlassCard>

            {/* Leadership Spotlight */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Executive Leadership
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {president && (
                  <GlassCard className="p-4 flex items-start gap-4">
                    <img
                      src={president.avatarUrl}
                      alt={president.fullName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/30"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white">
                          {president.fullName}
                        </span>
                        <RoleBadge role="PRESIDENT" size="sm" />
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {president.rollNumber} · Year {president.year}
                      </div>
                      <p className="text-[11px] text-zinc-300 line-clamp-2">
                        {president.bio}
                      </p>
                    </div>
                  </GlassCard>
                )}

                {vicePresident && (
                  <GlassCard className="p-4 flex items-start gap-4">
                    <img
                      src={vicePresident.avatarUrl}
                      alt={vicePresident.fullName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/30"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white">
                          {vicePresident.fullName}
                        </span>
                        <RoleBadge role="VICE_PRESIDENT" size="sm" />
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {vicePresident.rollNumber} · Year {vicePresident.year}
                      </div>
                      <p className="text-[11px] text-zinc-300 line-clamp-2">
                        {vicePresident.bio}
                      </p>
                    </div>
                  </GlassCard>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <GlassCard className="p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Guild Headquarters & Contact
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-zinc-500 text-[11px]">Primary Lab Location</div>
                  <div className="font-semibold text-white mt-0.5">
                    {club.roomLocation}
                  </div>
                </div>

                <div>
                  <div className="text-zinc-500 text-[11px]">Regular Meeting Cadence</div>
                  <div className="font-semibold text-white mt-0.5">
                    {club.meetingSchedule}
                  </div>
                </div>

                <div>
                  <div className="text-zinc-500 text-[11px]">Official Email</div>
                  <a
                    href={`mailto:${club.contactEmail}`}
                    className="font-mono text-zinc-300 hover:text-white hover:underline mt-0.5 block"
                  >
                    {club.contactEmail}
                  </a>
                </div>

                {club.discordOrLink && (
                  <div>
                    <div className="text-zinc-500 text-[11px]">Public Community Link</div>
                    <a
                      href={club.discordOrLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:underline mt-0.5 flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{club.discordOrLink}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* TAB 2: EVENTS */}
      {activeTab === 'EVENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              Events by {club.name}
            </h3>
            {canManage && (
              <button
                onClick={() => onNavigate('events')}
                className="px-3.5 py-1.5 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-lg transition-colors shadow"
              >
                + Schedule New Event
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <GlassCard key={evt.id} className="flex flex-col">
                <div className="relative h-40 overflow-hidden bg-zinc-950">
                  <img
                    src={evt.posterUrl}
                    alt={evt.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/80 text-white border border-white/20">
                      {evt.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{evt.title}</h4>
                    <p className="text-xs text-zinc-300 line-clamp-2 mt-1">{evt.description}</p>
                  </div>

                  <div className="text-xs text-zinc-400 space-y-1 font-mono pt-2 border-t border-white/10">
                    <div>Date: {evt.eventDate} ({evt.startTime} - {evt.endTime})</div>
                    <div>Venue: {evt.venue}</div>
                  </div>

                  <button
                    onClick={() => onOpenRsvpModal(evt)}
                    className="w-full py-2 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-lg transition-colors text-center shadow"
                  >
                    RSVP ({evt.rsvpCount} Attending)
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>

          {events.length === 0 && (
            <div className="p-12 text-center text-zinc-400 border border-dashed border-white/20 rounded-xl text-xs bg-zinc-950">
              No events scheduled for {club.name} yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GALLERY */}
      {activeTab === 'GALLERY' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              {club.name} Photo Gallery
            </h3>
            <button
              onClick={() => onNavigate('gallery')}
              className="text-xs text-zinc-300 hover:text-white underline"
            >
              Go to Full Campus Gallery →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((img) => (
              <div
                key={img.id}
                onClick={() => onOpenLightbox(img)}
                className="group relative h-48 rounded-xl overflow-hidden cursor-pointer border border-white/15 bg-zinc-950"
              >
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                  <h5 className="text-xs font-bold line-clamp-1">{img.title}</h5>
                  <div className="text-[10px] text-zinc-400 font-mono">{img.albumName}</div>
                </div>
              </div>
            ))}
          </div>

          {gallery.length === 0 && (
            <div className="p-12 text-center text-zinc-400 border border-dashed border-white/20 rounded-xl text-xs bg-zinc-950">
              No gallery images uploaded for this club yet.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MEMBERS ROSTER */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">
              Registered Members ({members.length})
            </h3>
            {canManage && (
              <span className="text-xs font-mono text-zinc-400">
                Leader moderation active
              </span>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-zinc-950 divide-y divide-white/10">
            {members.map((m) => {
              const memUser = m.user || {
                fullName: 'Student Member',
                avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                department: 'Apex Student',
                year: 1,
              };
              return (
                <div
                  key={m.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={memUser.avatarUrl}
                      alt={memUser.fullName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">
                          {memUser.fullName}
                        </span>
                        <RoleBadge role={m.clubRole} size="sm" />
                        {m.status === 'PENDING' && (
                          <span className="text-[10px] font-mono text-white bg-zinc-800 border border-white/20 px-2 py-0.5 rounded">
                            Pending Approval
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {memUser.rollNumber} · {memUser.department} · Year {memUser.year}
                      </div>
                    </div>
                  </div>

                  {canManage && m.status === 'PENDING' && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleApproveMember(m.id, true)}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white text-black hover:bg-zinc-200 flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleApproveMember(m.id, false)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 border border-white/20 hover:border-white/40 text-zinc-300 flex items-center gap-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Club Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-zinc-950 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm text-white">
                Edit {club.name} Profile
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 text-xs rounded-xl bg-white text-black font-semibold">
                Club profile updated successfully!
              </div>
            )}

            <form onSubmit={handleSaveClubProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  value={editForm.tag || ''}
                  onChange={(e) => setEditForm({ ...editForm, tag: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Short Summary
                </label>
                <textarea
                  rows={2}
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Full Charter & Details
                </label>
                <textarea
                  rows={4}
                  value={editForm.fullAbout || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullAbout: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Meeting Schedule
                  </label>
                  <input
                    type="text"
                    value={editForm.meetingSchedule || ''}
                    onChange={(e) => setEditForm({ ...editForm, meetingSchedule: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Room Location
                  </label>
                  <input
                    type="text"
                    value={editForm.roomLocation || ''}
                    onChange={(e) => setEditForm({ ...editForm, roomLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-white text-black hover:bg-zinc-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
