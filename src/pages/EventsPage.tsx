import React, { useState } from 'react';
import { Event, Club } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { useAuth } from '../context/AuthContext';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Search,
  Check,
  Plus,
  LayoutGrid,
  CalendarDays,
  X,
  Sparkles,
} from 'lucide-react';

interface EventsPageProps {
  events: Event[];
  clubs: Club[];
  onOpenRsvpModal: (event: Event) => void;
  onRefreshEvents: () => void;
  onCreateEvent: (newEvent: Partial<Event>) => Promise<void>;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  events,
  clubs,
  onOpenRsvpModal,
  onRefreshEvents,
  onCreateEvent,
}) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'GRID' | 'CALENDAR'>('GRID');
  const [selectedClubId, setSelectedClubId] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState<'UPCOMING' | 'PAST' | 'ALL'>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Event form
  const [newClubId, setNewClubId] = useState(clubs[0]?.id || 'club-1');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newFullDetails, setNewFullDetails] = useState('');
  const [newVenue, setNewVenue] = useState('Campus Auditorium');
  const [newEventDate, setNewEventDate] = useState('2026-10-30');
  const [newStartTime, setNewStartTime] = useState('14:00');
  const [newEndTime, setNewEndTime] = useState('17:00');
  const [newCategory, setNewCategory] = useState('WORKSHOP');
  const [newPosterUrl, setNewPosterUrl] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80');
  const [newMaxAttendees, setNewMaxAttendees] = useState(100);
  const [newIsCollegeWide, setNewIsCollegeWide] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLeaderOrAdmin =
    user?.systemRole === 'HOD' ||
    user?.systemRole === 'PRESIDENT' ||
    user?.systemRole === 'VICE_PRESIDENT';

  const safeClubs = clubs || [];
  const safeEvents = events || [];

  const todayStr = '2026-10-03';

  const filteredEvents = safeEvents.filter((evt) => {
    if (!evt) return false;
    const matchesClub = selectedClubId === 'ALL' || evt.clubId === selectedClubId;
    const matchesCat = selectedCategory === 'ALL' || evt.category === selectedCategory;
    const matchesSearch =
      (evt.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (evt.clubName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const isUpcoming = (evt.eventDate || '') >= todayStr;
    const matchesTime =
      timeFilter === 'ALL' ||
      (timeFilter === 'UPCOMING' && isUpcoming) ||
      (timeFilter === 'PAST' && !isUpcoming);

    return matchesClub && matchesCat && matchesSearch && matchesTime;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setSubmitting(true);
    try {
      await onCreateEvent({
        clubId: newClubId,
        title: newTitle,
        description: newDescription,
        fullDetails: newFullDetails,
        venue: newVenue,
        eventDate: newEventDate,
        startTime: newStartTime,
        endTime: newEndTime,
        category: newCategory as any,
        posterUrl: newPosterUrl,
        maxAttendees: newMaxAttendees,
        isCollegeWide: newIsCollegeWide,
        createdById: user?.id,
      });
      setCreateModalOpen(false);
      onRefreshEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/20" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Campus Events & Workshops
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Official calendar for hackathons, guest lectures, robotics trials, sports tournaments, and cultural spectacles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid vs Calendar View Switcher */}
          <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'GRID'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('CALENDAR')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'CALENDAR'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>

          {isLeaderOrAdmin && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all flex items-center gap-1.5 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search events by title, venue, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setTimeFilter('UPCOMING')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                timeFilter === 'UPCOMING'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setTimeFilter('PAST')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                timeFilter === 'PAST'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setTimeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                timeFilter === 'ALL'
                  ? 'bg-white text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Events
            </button>
          </div>
        </div>

        {/* Club Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedClubId('ALL')}
            className={`px-3 py-2 min-h-[40px] sm:min-h-0 rounded-lg whitespace-nowrap shrink-0 font-medium transition-all ${
              selectedClubId === 'ALL'
                ? 'bg-white text-black font-bold shadow-md'
                : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
            }`}
          >
            All 6 Guilds
          </button>
          {safeClubs.map((c) => {
            const active = selectedClubId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClubId(c.id)}
                className={`px-3 py-2 min-h-[40px] sm:min-h-0 rounded-lg whitespace-nowrap shrink-0 font-medium transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${active ? 'bg-black' : 'bg-white'}`}
                />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => (
            <GlassCard key={evt.id} className="flex flex-col justify-between group">
              <div className="relative h-44 overflow-hidden bg-zinc-950">
                <img
                  src={evt.posterUrl}
                  alt={evt.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-white border border-white/20">
                    {evt.category}
                  </span>
                  {evt.isCollegeWide && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-black shadow-md">
                      College Wide
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs font-semibold text-zinc-300 drop-shadow-sm">
                    {evt.clubName}
                  </div>
                  <h3 className="text-sm font-bold line-clamp-1">{evt.title}</h3>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                  {evt.description}
                </p>

                <div className="space-y-1.5 text-xs text-zinc-400 pt-3 border-t border-white/10 font-mono">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="tabular-nums">
                      {evt.eventDate} ({evt.startTime} - {evt.endTime})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="tabular-nums text-white">
                      {evt.rsvpCount} / {evt.maxAttendees} registered
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onOpenRsvpModal(evt)}
                    className="w-full py-2.5 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Check className="w-3.5 h-3.5 text-black" />
                    <span>RSVP / Details</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'CALENDAR' && (
        <div className="rounded-2xl border border-white/15 bg-zinc-950 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-extrabold text-sm text-white">
              October – November 2026 Schedule
            </h3>
            <span className="text-xs font-mono text-zinc-400">Chronological View</span>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onOpenRsvpModal(evt)}
                className="p-4 rounded-xl border border-white/10 bg-zinc-900/60 hover:border-white/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Date badge in pure black & white */}
                  <div className="w-16 h-16 rounded-xl bg-white text-black flex flex-col items-center justify-center shrink-0 shadow-lg">
                    <span className="text-[10px] font-mono uppercase font-bold text-zinc-800">
                      {new Date(evt.eventDate).toLocaleDateString([], { month: 'short' })}
                    </span>
                    <span className="text-2xl font-extrabold font-mono tabular-nums leading-none mt-0.5">
                      {new Date(evt.eventDate).getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {evt.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-white/20 text-zinc-300 font-semibold">
                        {evt.clubName}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {evt.startTime} - {evt.endTime}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {evt.venue}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-xs font-mono tabular-nums text-zinc-400">
                    {evt.rsvpCount} Attending
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenRsvpModal(evt);
                    }}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors shadow"
                  >
                    RSVP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="p-12 text-center text-zinc-400 border border-dashed border-white/20 rounded-2xl bg-zinc-950 text-xs">
          No events match your current filter selection.
        </div>
      )}

      {/* Create Event Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-zinc-950 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <h3 className="font-bold text-sm text-white">
                  Schedule New Collegiate Event
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Organizing Guild
                </label>
                <select
                  value={newClubId}
                  onChange={(e) => setNewClubId(e.target.value)}
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
                <label className="block text-zinc-300 font-medium mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Algorithmic Speed Coding Sprint"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Overview of the event..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Venue / Room
                  </label>
                  <input
                    type="text"
                    required
                    value={newVenue}
                    onChange={(e) => setNewVenue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="collegeWide"
                  checked={newIsCollegeWide}
                  onChange={(e) => setNewIsCollegeWide(e.target.checked)}
                  className="rounded border-white/20 bg-zinc-900 text-white focus:ring-white"
                />
                <label htmlFor="collegeWide" className="text-zinc-300">
                  Open as college-wide featured event
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl font-bold bg-white text-black hover:bg-zinc-200"
                >
                  {submitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
