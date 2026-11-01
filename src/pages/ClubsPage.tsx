import React, { useState } from 'react';
import { Club } from '../types';
import { GlassCard } from '../components/common/GlassCard';
import { Search, Users, MapPin, Calendar, ArrowRight, Sparkles } from 'lucide-react';

interface ClubsPageProps {
  clubs: Club[];
  onNavigate: (tab: string, slug?: string) => void;
}

export const ClubsPage: React.FC<ClubsPageProps> = ({ clubs, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = [
    'ALL',
    'Coding & Algorithms',
    'Engineering & Innovation',
    'Software & Open Source',
    'Athletics & Sports',
    'Social Impact & Service',
    'Performing Arts & Culture',
  ];

  const safeClubs = clubs || [];
  const filteredClubs = safeClubs.filter((c) => {
    if (!c) return false;
    const matchesSearch =
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.tag || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/20" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Collegiate Clubs Directory
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400">
          Discover all 6 student guilds: Code Crackers, Innovation, Devspire, Sports, Social responsibility sankalpa, and Cultural.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search clubs by name, category, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-white/15 bg-zinc-900 text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white"
          />
        </div>

        {/* Clean segmented category controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 min-h-[40px] sm:min-h-0 rounded-lg whitespace-nowrap shrink-0 text-xs font-medium transition-all ${
                  active
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:border-white/30'
                }`}
              >
                {cat === 'ALL' ? 'All 6 Clubs' : cat.split('&')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map((club) => (
          <GlassCard
            key={club.id}
            accentColor={club.accentColor}
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

              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-white border border-white/20">
                  Est. {club.establishedYear}
                </span>
              </div>

              <div className="absolute bottom-3 left-4 flex items-center gap-3">
                <img
                  src={club.logoUrl}
                  alt={club.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-white/40 shadow-2xl bg-zinc-900"
                />
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors drop-shadow-sm">
                    {club.name}
                  </h3>
                  <div className="text-[11px] font-mono text-zinc-400">{club.tag}</div>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                {club.description}
              </p>

              <div className="space-y-1.5 text-xs text-zinc-400 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-mono tabular-nums">{club.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="truncate max-w-[140px]">{club.roomLocation}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{club.meetingSchedule}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('club-detail', club.slug);
                }}
                className="w-full py-2.5 text-xs font-bold rounded-xl text-black bg-white hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>View Club Hub & Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {filteredClubs.length === 0 && (
        <div className="p-12 text-center text-zinc-400 border border-dashed border-white/20 rounded-2xl bg-zinc-950">
          <p className="text-sm font-semibold text-white">No clubs match your query</p>
          <p className="text-xs mt-1 text-zinc-400">Try searching for other keywords like "coding", "sports", or "innovation".</p>
        </div>
      )}
    </div>
  );
};
