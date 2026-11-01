import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Club, Event, EventRegistration } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { RoleBadge } from '../components/common/RoleBadge';
import {
  Calendar,
  Users,
  Mail,
  Clock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

interface ProfilePageProps {
  clubs: Club[];
  events: Event[];
  registrations: EventRegistration[];
  onNavigate: (tab: string, slug?: string) => void;
  onOpenRsvpModal: (event: Event) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  clubs,
  events,
  registrations,
  onNavigate,
  onOpenRsvpModal,
}) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="py-24 text-center text-zinc-400 space-y-3">
        <p className="text-sm">Please sign in to view your collegiate profile.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-5 py-2 font-bold text-xs rounded-xl bg-white text-black hover:bg-zinc-200"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  // Find user's registered events safely
  const userRegisteredEvents = (registrations || [])
    .map((reg) => {
      if (!reg) return null;
      const evt = (events || []).find((e) => e && e.id === reg.eventId);
      return { reg, evt };
    })
    .filter((item): item is { reg: EventRegistration; evt: Event } => item != null && item.evt != null);

  // Clubs user is associated with
  const userClubAffiliations = user.clubAffiliations || [];
  const affiliatedClubs = (clubs || []).filter(
    (c) =>
      c && (
        c.presidentId === user.id ||
        c.vicePresidentId === user.id ||
        userClubAffiliations.some((a) => a && a.clubId === c.id)
      )
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Profile Header (Black and White ID Card) */}
      <GlassCard className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-white/30 shadow-2xl bg-zinc-900"
          />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                {user.fullName}
              </h1>
              <RoleBadge role={user.systemRole} />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                {user.email}
              </span>
              {user.rollNumber && (
                <>
                  <span>·</span>
                  <span>ID: {user.rollNumber}</span>
                </>
              )}
              {user.year > 0 && (
                <>
                  <span>·</span>
                  <span>Year {user.year}</span>
                </>
              )}
            </div>

            <p className="text-xs text-zinc-300 pt-0.5">
              {user.department}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('clubs')}
          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-white text-black hover:bg-zinc-200 transition-all self-start sm:self-auto shadow-md"
        >
          Explore All 6 Clubs
        </button>
      </GlassCard>

      {/* Grid: My Clubs & Registered Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Affiliated Clubs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white">
              My Guild Affiliations ({affiliatedClubs.length})
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              Campus Memberships
            </span>
          </div>

          <div className="space-y-3">
            {affiliatedClubs.map((club) => {
              const isPres = club.presidentId === user.id;
              const isVp = club.vicePresidentId === user.id;

              return (
                <div
                  key={club.id}
                  onClick={() => onNavigate('club-detail', club.slug)}
                  className="p-4 rounded-xl border border-white/10 bg-zinc-950 hover:border-white/30 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={club.logoUrl}
                      alt={club.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-white/20 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{club.name}</h4>
                      <p className="text-xs text-zinc-400 font-mono">{club.tag}</p>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {club.roomLocation} · {club.meetingSchedule}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPres ? (
                      <RoleBadge role="PRESIDENT" size="sm" />
                    ) : isVp ? (
                      <RoleBadge role="VICE_PRESIDENT" size="sm" />
                    ) : (
                      <RoleBadge role="MEMBER" size="sm" />
                    )}
                    <ArrowRight className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>
              );
            })}

            {affiliatedClubs.length === 0 && (
              <div className="p-8 text-center text-zinc-400 border border-dashed border-white/20 rounded-2xl bg-zinc-950 text-xs">
                You haven't joined any clubs yet. Visit the clubs directory to join Code Crackers, Innovation, Devspire, Sports, Sankalpa, or Cultural!
              </div>
            )}
          </div>
        </div>

        {/* Right: Registered Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white">
              My Registered Events ({userRegisteredEvents.length})
            </h3>
            <span className="text-xs font-mono text-zinc-500">
              RSVP Passes
            </span>
          </div>

          <div className="space-y-3">
            {userRegisteredEvents.map(({ reg, evt }) => {
              if (!evt) return null;

              return (
                <div
                  key={reg.id}
                  onClick={() => onOpenRsvpModal(evt)}
                  className="p-4 rounded-xl border border-white/10 bg-zinc-950 hover:border-white/30 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white line-clamp-1">
                        {evt.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/20 text-zinc-300 font-semibold">
                        {evt.clubName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                      <span>{evt.eventDate} ({evt.startTime})</span>
                      <span>·</span>
                      <span className="truncate max-w-[150px]">{evt.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-1 rounded text-[11px] font-bold bg-white text-black">
                      {reg.rsvpStatus}
                    </span>
                  </div>
                </div>
              );
            })}

            {userRegisteredEvents.length === 0 && (
              <div className="p-8 text-center text-zinc-400 border border-dashed border-white/20 rounded-2xl bg-zinc-950 text-xs">
                You haven't registered for any events yet. Check the Events tab to RSVP!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
