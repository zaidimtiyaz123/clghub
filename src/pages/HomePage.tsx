import React, { useState } from 'react';
import { Club, Event, Announcement, GalleryImage } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import {
  Calendar,
  Users,
  MessageSquare,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Megaphone,
  Check,
  ChevronRight,
} from 'lucide-react';

interface HomePageProps {
  clubs: Club[];
  events: Event[];
  announcements: Announcement[];
  gallery: GalleryImage[];
  onNavigate: (tab: string, slug?: string) => void;
  onOpenRsvpModal: (event: Event) => void;
  onOpenLightbox: (image: GalleryImage) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  clubs,
  events,
  announcements,
  gallery,
  onNavigate,
  onOpenRsvpModal,
  onOpenLightbox,
}) => {
  const [pinnedAnnouncementDismissed, setPinnedAnnouncementDismissed] = useState(false);

  const safeClubs = clubs || [];
  const safeEvents = events || [];
  const safeAnnouncements = announcements || [];
  const safeGallery = gallery || [];

  const collegeAnnouncement = safeAnnouncements.find((a) => a && a.isCollegeWide);
  const upcomingEvents = safeEvents
    .filter((e) => e && e.approvalStatus === 'APPROVED')
    .slice(0, 3);
  const featuredGallery = safeGallery.slice(0, 4);

  return (
    <div className="space-y-16 pb-20">
      {/* College-Wide Announcement Banner (Monochrome Noir) */}
      {collegeAnnouncement && !pinnedAnnouncementDismissed && (
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/80 p-5 backdrop-blur-xl shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-white text-black shrink-0 mt-0.5 shadow-md">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
                    Official College Notice · {collegeAnnouncement.creatorName} ({collegeAnnouncement.creatorRole})
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {new Date(collegeAnnouncement.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {collegeAnnouncement.title}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-4xl">
                  {collegeAnnouncement.content}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPinnedAnnouncementDismissed(true)}
              className="text-xs text-zinc-400 hover:text-white shrink-0 p-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-14">
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-white bg-white/5 border border-white/20 px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>Apex Institute of Technology · Campus Guilds</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white text-balance leading-tight">
            Where collegiate passion turns into leadership.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            A single hub for all 6 official clubs: Code Crackers, Innovation, Devspire, Sports, Social responsibility sankalpa, and Cultural.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-3">
            <button
              onClick={() => onNavigate('clubs')}
              className="px-6 py-3 text-xs sm:text-sm font-bold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all shadow-xl hover:scale-105 flex items-center gap-2"
            >
              <span>Explore All 6 Clubs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('events')}
              className="px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-zinc-900 border border-white/20 hover:border-white/40 hover:bg-zinc-800 rounded-xl transition-all"
            >
              View Upcoming Events
            </button>
          </div>
        </div>

        {/* 3D Glassmorphism Stats Showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 max-w-5xl mx-auto">
          <GlassCard className="p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
              6
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">Official Student Guilds</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
              860+
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">Active Enrolled Members</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
              12
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">Workshops & Competitions</div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
              100%
            </div>
            <div className="text-xs text-zinc-400 mt-1 font-medium">Student Led & Governed</div>
          </GlassCard>
        </div>
      </section>

      {/* The 6 Clubs Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              The 6 Campus Guilds
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Each club features autonomous leadership, dedicated workshops, interactive galleries, and private group chatrooms.
            </p>
          </div>
          <button
            onClick={() => onNavigate('clubs')}
            className="text-xs font-semibold text-white hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View directory details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeClubs.map((club) => {
            return (
              <GlassCard
                key={club.id}
                onClick={() => onNavigate('club-detail', club.slug)}
                className="group flex flex-col justify-between"
              >
                {/* Banner Thumbnail */}
                <div className="relative h-44 overflow-hidden bg-zinc-950">
                  <img
                    src={club.bannerUrl}
                    alt={club.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  {/* Club Logo Avatar */}
                  <div className="absolute bottom-3 left-4 flex items-center gap-3">
                    <img
                      src={club.logoUrl}
                      alt={club.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/30 shadow-2xl bg-zinc-900"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors drop-shadow-sm">
                        {club.name}
                      </h3>
                      <div className="text-[11px] font-mono text-zinc-400">
                        {club.tag}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                    {club.description}
                  </p>

                  {/* Metadata Row */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5 font-mono tabular-nums">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{club.memberCount} members</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      <span className="truncate max-w-[130px]">{club.roomLocation}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('club-detail', club.slug);
                      }}
                      className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-white/10 hover:bg-white text-white hover:text-black transition-all text-center"
                    >
                      View Club Page
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('chat');
                      }}
                      className="p-2.5 rounded-xl border border-white/15 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                      title="Open Club Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Upcoming Events & Hackathons
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Workshops, collegiate tournaments, and festivals planned across all clubs.
            </p>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="text-xs font-semibold text-white hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Browse all events</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((evt) => (
            <GlassCard key={evt.id} className="flex flex-col">
              <div className="relative h-44 overflow-hidden bg-zinc-950">
                <img
                  src={evt.posterUrl}
                  alt={evt.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Event Category Tag */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-white border border-white/20">
                    {evt.category}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs font-semibold text-zinc-300">{evt.clubName}</div>
                  <h4 className="text-sm font-bold line-clamp-1">{evt.title}</h4>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                  {evt.description}
                </p>

                <div className="space-y-1.5 text-xs text-zinc-400 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>
                      {new Date(evt.eventDate).toLocaleDateString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-mono tabular-nums">
                      {evt.startTime} - {evt.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-mono tabular-nums text-zinc-400">
                    {evt.rsvpCount} registered
                  </span>
                  <button
                    onClick={() => onOpenRsvpModal(evt)}
                    className="px-4 py-2 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all flex items-center gap-1 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>RSVP</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Gallery Teaser Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Campus Guild Gallery
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live photography from lab sessions, robowars, open mics, and hackathon sprints.
            </p>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="text-xs font-semibold text-white hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View full gallery</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredGallery.map((img) => (
            <div
              key={img.id}
              onClick={() => onOpenLightbox(img)}
              className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden cursor-pointer border border-white/15 bg-zinc-950"
            >
              <img
                src={img.imageUrl}
                alt={img.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
                <span className="text-[10px] font-mono text-zinc-300">{img.clubName}</span>
                <h5 className="text-xs font-bold line-clamp-1">{img.title}</h5>
                <span className="text-[10px] text-zinc-400 mt-0.5">{img.albumName}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
