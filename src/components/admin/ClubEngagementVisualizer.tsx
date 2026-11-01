import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Club, Event } from '../../types';
import { GlassCard } from '../common/GlassCard';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Layers,
  Calendar,
  Users,
  Award,
  Zap,
  Filter,
  CheckCircle2,
} from 'lucide-react';

interface ClubEngagementVisualizerProps {
  clubs: Club[];
  events: Event[];
  stats?: any;
}

type ViewMode = 'PARTICIPATION' | 'TRENDS' | 'DISTRIBUTION' | 'CATEGORIES';
type TimeRange = 'ALL' | 'LAST_60' | 'LAST_30';

// Distinctive, high-contrast accessible color palette matching club themes
const CLUB_COLORS: Record<string, string> = {
  'club-1': '#38bdf8', // Code Crackers (Sky Cyan)
  'club-2': '#a855f7', // Innovation (Purple)
  'club-3': '#10b981', // Devspire (Emerald Green)
  'club-4': '#f97316', // Sports (Orange)
  'club-5': '#14b8a6', // Sankalpa (Teal)
  'club-6': '#ec4899', // Cultural (Pink)
};

const DEFAULT_COLOR = '#e4e4e7';

export const ClubEngagementVisualizer: React.FC<ClubEngagementVisualizerProps> = ({
  clubs = [],
  events = [],
  stats,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('PARTICIPATION');
  const [selectedClubId, setSelectedClubId] = useState<string>('ALL');
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL');
  const [trendType, setTrendType] = useState<'CUMULATIVE' | 'WEEKLY'>('CUMULATIVE');

  const safeClubs = useMemo(() => Array.isArray(clubs) ? clubs : [], [clubs]);
  const safeEvents = useMemo(() => Array.isArray(events) ? events : [], [events]);

  // Map club ID to color
  const getClubColor = (clubId: string) => CLUB_COLORS[clubId] || DEFAULT_COLOR;

  // 1. Compute Club Event Participation Rates Data
  const participationData = useMemo(() => {
    return safeClubs.map((club) => {
      const clubEvents = safeEvents.filter((e) => e.clubId === club.id);
      const totalRsvp = clubEvents.reduce((acc, curr) => acc + (curr.rsvpCount || 0), 0);
      const totalCapacity = clubEvents.reduce((acc, curr) => acc + (curr.maxAttendees || 100), 0);
      const rate = totalCapacity > 0 ? Math.round((totalRsvp / totalCapacity) * 100) : 0;
      const avgAttendance = clubEvents.length > 0 ? Math.round(totalRsvp / clubEvents.length) : 0;

      return {
        id: club.id,
        clubName: club.name.length > 15 ? club.name.substring(0, 13) + '…' : club.name,
        fullClubName: club.name,
        eventsCount: clubEvents.length,
        totalRsvp,
        totalCapacity,
        participationRate: rate,
        avgAttendance,
        memberCount: club.memberCount || 50,
        color: getClubColor(club.id),
      };
    });
  }, [safeClubs, safeEvents]);

  // 2. Compute Registration Trends Timeline Data (Synthetic historical timestamps + real baseline)
  const registrationTrendsData = useMemo(() => {
    // Generate dates representing weeks of Fall 2026 semester
    const weeks = [
      { label: 'Week 1 (Aug 15)', date: '2026-08-15', weight: 0.12 },
      { label: 'Week 3 (Aug 29)', date: '2026-08-29', weight: 0.22 },
      { label: 'Week 5 (Sep 12)', date: '2026-09-12', weight: 0.38 },
      { label: 'Week 7 (Sep 26)', date: '2026-09-26', weight: 0.58 },
      { label: 'Week 9 (Oct 10)', date: '2026-10-10', weight: 0.82 },
      { label: 'Week 11 (Oct 24)', date: '2026-10-24', weight: 1.0 },
    ];

    // Filter by time range if needed
    let filteredWeeks = weeks;
    if (timeRange === 'LAST_30') {
      filteredWeeks = weeks.slice(3);
    } else if (timeRange === 'LAST_60') {
      filteredWeeks = weeks.slice(1);
    }

    // Build timeline point for each week
    let runningTotals: Record<string, number> = {};
    safeClubs.forEach((c) => {
      runningTotals[c.id] = 0;
    });

    return filteredWeeks.map((w, idx) => {
      const point: any = {
        label: w.label,
        date: w.date,
        totalCampus: 0,
      };

      safeClubs.forEach((c) => {
        // Base memberships target
        const target = c.memberCount || 100;
        // Cumulative count at this point in time
        const cumulativeCount = Math.round(target * w.weight);
        // Incremental count for weekly view
        const prevCumulative = idx === 0 ? Math.round(target * 0.05) : Math.round(target * filteredWeeks[idx - 1].weight);
        const weeklyIncrement = Math.max(1, cumulativeCount - prevCumulative);

        const val = trendType === 'CUMULATIVE' ? cumulativeCount : weeklyIncrement;
        point[c.name] = val;
        point[`${c.name}_color`] = getClubColor(c.id);
        point.totalCampus += val;
      });

      return point;
    });
  }, [safeClubs, timeRange, trendType]);

  // 3. Compute Share / Distribution Data for Pie Chart
  const distributionData = useMemo(() => {
    return safeClubs.map((c) => {
      const clubEvents = safeEvents.filter((e) => e.clubId === c.id);
      const totalRsvp = clubEvents.reduce((acc, curr) => acc + (curr.rsvpCount || 0), 0);
      return {
        name: c.name,
        id: c.id,
        rsvps: totalRsvp,
        members: c.memberCount,
        color: getClubColor(c.id),
      };
    });
  }, [safeClubs, safeEvents]);

  // 4. Compute Event Category Participation Rates
  const categoryData = useMemo(() => {
    const categories = ['HACKATHON', 'WORKSHOP', 'COMPETITION', 'CULTURAL', 'MEETUP'];
    return categories.map((cat) => {
      const catEvents = safeEvents.filter((e) => e.category === cat);
      const totalRsvp = catEvents.reduce((acc, curr) => acc + (curr.rsvpCount || 0), 0);
      const totalCap = catEvents.reduce((acc, curr) => acc + (curr.maxAttendees || 100), 0);
      const fillRate = totalCap > 0 ? Math.round((totalRsvp / totalCap) * 100) : 0;

      return {
        category: cat,
        eventsCount: catEvents.length,
        totalRsvp,
        totalCap,
        fillRate,
      };
    }).filter((cat) => cat.eventsCount > 0);
  }, [safeEvents]);

  // Overall Campus KPIs
  const overallKPIs = useMemo(() => {
    const totalRsvps = safeEvents.reduce((acc, curr) => acc + (curr.rsvpCount || 0), 0);
    const totalCapacity = safeEvents.reduce((acc, curr) => acc + (curr.maxAttendees || 0), 0);
    const avgFillRate = totalCapacity > 0 ? Math.round((totalRsvps / totalCapacity) * 100) : 0;
    
    // Top club by participation rate
    const topClub = [...participationData].sort((a, b) => b.participationRate - a.participationRate)[0];

    return {
      totalRsvps,
      totalCapacity,
      avgFillRate,
      topClubName: topClub?.fullClubName || 'Devspire',
      topClubRate: topClub?.participationRate || 0,
    };
  }, [safeEvents, participationData]);

  // Custom Dark Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950/95 border border-white/20 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono min-w-[180px]">
          <p className="text-white font-bold mb-2 pb-1.5 border-b border-white/10 flex items-center justify-between">
            <span>{label}</span>
          </p>
          <div className="space-y-1.5">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: item.color || item.fill || '#fff' }}
                  />
                  <span>{item.name}:</span>
                </span>
                <span className="text-white font-bold tabular-nums">
                  {item.value}
                  {item.unit || (item.name.includes('Rate') ? '%' : '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Visualizer Header with View Controls */}
      <GlassCard className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-white/10 text-white">
                <BarChart3 className="w-4 h-4 text-white" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Club Engagement & Participation Analytics
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              Interactive Recharts telemetry: analyze event turnout, RSVP velocity, and registration growth.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-white/10 p-1 rounded-xl text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setViewMode('PARTICIPATION')}
              className={`px-3 py-2 min-h-[40px] sm:min-h-0 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                viewMode === 'PARTICIPATION'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Participation Rates</span>
            </button>

            <button
              onClick={() => setViewMode('TRENDS')}
              className={`px-3 py-2 min-h-[40px] sm:min-h-0 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                viewMode === 'TRENDS'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Registration Trends</span>
            </button>

            <button
              onClick={() => setViewMode('DISTRIBUTION')}
              className={`px-3 py-2 min-h-[40px] sm:min-h-0 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                viewMode === 'DISTRIBUTION'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Campus Share</span>
            </button>

            <button
              onClick={() => setViewMode('CATEGORIES')}
              className={`px-3 py-2 min-h-[40px] sm:min-h-0 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                viewMode === 'CATEGORIES'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>By Category</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Micro-KPI Cards: Swipeable Carousel on Mobile, Grid on Desktop */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 md:grid-cols-4 mt-4">
          <div className="min-w-[210px] sm:min-w-0 flex-shrink-0 snap-start p-3 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white shrink-0">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Avg Fill Rate</div>
              <div className="text-lg font-bold font-mono text-white tabular-nums">
                {overallKPIs.avgFillRate}%
              </div>
            </div>
          </div>

          <div className="min-w-[210px] sm:min-w-0 flex-shrink-0 snap-start p-3 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white shrink-0">
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Total RSVPs</div>
              <div className="text-lg font-bold font-mono text-white tabular-nums">
                {overallKPIs.totalRsvps} <span className="text-xs text-zinc-500 font-normal">/ {overallKPIs.totalCapacity}</span>
              </div>
            </div>
          </div>

          <div className="min-w-[210px] sm:min-w-0 flex-shrink-0 snap-start p-3 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white shrink-0">
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Peak Turnout</div>
              <div className="text-sm font-bold font-mono text-white truncate">
                {overallKPIs.topClubName} ({overallKPIs.topClubRate}%)
              </div>
            </div>
          </div>

          <div className="min-w-[210px] sm:min-w-0 flex-shrink-0 snap-start p-3 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white shrink-0">
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Total Events</div>
              <div className="text-lg font-bold font-mono text-white tabular-nums">
                {safeEvents.length} <span className="text-xs text-zinc-500 font-normal">active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sm:hidden text-[10px] font-mono text-zinc-500 pt-1 flex items-center gap-1 justify-end">
          <span>← Swipe metrics →</span>
        </div>
      </GlassCard>

      {/* VIEW 1: PARTICIPATION RATES BY CLUB */}
      {viewMode === 'PARTICIPATION' && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span>Event Participation Rates vs Capacity</span>
                <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Live RSVPs
                </span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Compares actual student RSVPs against scheduled event hall capacities, with computed attendance efficiency.
              </p>
            </div>

            {/* Legend Indicators */}
            <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white" />
                <span>RSVP Count</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-zinc-700" />
                <span>Max Capacity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Fill Rate %</span>
              </div>
            </div>
          </div>

          <div className="h-[260px] sm:h-[340px] w-full min-w-0 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={participationData}
                margin={{ top: 15, right: 10, bottom: 25, left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="clubName"
                  stroke="#71717a"
                  fontSize={10}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={45}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  width={35}
                  axisLine={{ stroke: '#3f3f46' }}
                  label={{ value: 'RSVPs', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 9 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  fontSize={10}
                  tickLine={false}
                  width={35}
                  axisLine={{ stroke: '#10b981' }}
                  unit="%"
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  yAxisId="left"
                  dataKey="totalRsvp"
                  name="Total RSVPs"
                  fill="#ffffff"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Bar
                  yAxisId="left"
                  dataKey="totalCapacity"
                  name="Event Capacity"
                  fill="#3f3f46"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="participationRate"
                  name="Participation Rate"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 1.5, stroke: '#000' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Data Summary Grid: Swipeable on mobile, Grid on desktop */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 pt-2 border-t border-white/10">
            {participationData.map((d) => (
              <div key={d.id} className="min-w-[140px] sm:min-w-0 flex-shrink-0 snap-start p-2.5 rounded-xl bg-zinc-900/60 border border-white/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[11px] font-bold text-white truncate">{d.fullClubName}</span>
                </div>
                <div className="text-xs font-mono text-zinc-300">
                  <span className="font-bold text-white tabular-nums">{d.totalRsvp}</span>
                  <span className="text-[10px] text-zinc-500"> / {d.totalCapacity} RSVPs</span>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                  {d.participationRate}% Fill Rate
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* VIEW 2: REGISTRATION TRENDS TIMELINE */}
      {viewMode === 'TRENDS' && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span>Semester Registration & Member Growth Trends</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Tracking membership signups and club enrollment velocity across the academic term.
              </p>
            </div>

            {/* Timeframe & Display Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-white/10 text-[11px]">
                <button
                  onClick={() => setTrendType('CUMULATIVE')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    trendType === 'CUMULATIVE' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Cumulative Total
                </button>
                <button
                  onClick={() => setTrendType('WEEKLY')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    trendType === 'WEEKLY' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Weekly Velocity
                </button>
              </div>

              <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-white/10 text-[11px]">
                {(['ALL', 'LAST_60', 'LAST_30'] as TimeRange[]).map((tr) => (
                  <button
                    key={tr}
                    onClick={() => setTimeRange(tr)}
                    className={`px-2 py-1 rounded-md transition-all ${
                      timeRange === tr ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tr === 'ALL' ? 'Full Term' : tr === 'LAST_60' ? '60 Days' : '30 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[260px] sm:h-[340px] w-full min-w-0 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={registrationTrendsData}
                margin={{ top: 15, right: 10, bottom: 25, left: -10 }}
              >
                <defs>
                  {safeClubs.map((club) => {
                    const color = getClubColor(club.id);
                    return (
                      <linearGradient key={club.id} id={`grad-${club.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  fontSize={10}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={45}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={10}
                  width={35}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                  label={{ value: trendType === 'CUMULATIVE' ? 'Members' : 'Weekly', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 9 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={32}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 10, paddingBottom: 6 }}
                />
                {safeClubs.map((club) => {
                  const color = getClubColor(club.id);
                  return (
                    <Area
                      key={club.id}
                      type="monotone"
                      dataKey={club.name}
                      stroke={color}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#grad-${club.id})`}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* VIEW 3: CAMPUS SHARE DISTRIBUTION */}
      {viewMode === 'DISTRIBUTION' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Event RSVPs Market Share
            </h3>
            <p className="text-xs text-zinc-400">
              Proportion of total student event attendees captured by each student organization.
            </p>
            <div className="h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="rsvps"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    stroke="#18181b"
                    strokeWidth={2}
                  >
                    {distributionData.map((entry) => (
                      <Cell key={`cell-${entry.id}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono">
              {distributionData.map((d) => (
                <div key={d.id} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-zinc-300">{d.name}:</span>
                  <span className="text-white font-bold">{d.rsvps}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Registered Membership Base
            </h3>
            <p className="text-xs text-zinc-400">
              Official membership roster breakdown verified by club leaders and HOD office.
            </p>
            <div className="h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="members"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    stroke="#18181b"
                    strokeWidth={2}
                  >
                    {distributionData.map((entry) => (
                      <Cell key={`cell-m-${entry.id}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono">
              {distributionData.map((d) => (
                <div key={d.id} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-zinc-300">{d.name}:</span>
                  <span className="text-white font-bold">{d.members}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* VIEW 4: BY CATEGORY */}
      {viewMode === 'CATEGORIES' && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Participation Rates by Event Category
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Evaluating student appetite across Hackathons, Workshops, Competitions, Cultural Galas, and Meetups.
              </p>
            </div>
          </div>

          <div className="h-[260px] sm:h-[340px] w-full min-w-0 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 15, right: 10, bottom: 25, left: -10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke="#71717a"
                  fontSize={10}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={40}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={10}
                  width={35}
                  tickLine={false}
                  axisLine={{ stroke: '#3f3f46' }}
                  label={{ value: 'RSVPs', angle: -90, position: 'insideLeft', fill: '#71717a', fontSize: 9 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="totalRsvp"
                  name="Total RSVPs"
                  fill="#ffffff"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="totalCap"
                  name="Total Capacity"
                  fill="#3f3f46"
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-5 pt-2 border-t border-white/10">
            {categoryData.map((cat) => (
              <div key={cat.category} className="min-w-[130px] sm:min-w-0 flex-shrink-0 snap-start p-3 rounded-xl bg-zinc-900/60 border border-white/10">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  {cat.category}
                </div>
                <div className="text-base font-bold text-white font-mono tabular-nums mt-0.5">
                  {cat.totalRsvp} <span className="text-xs text-zinc-500 font-normal">RSVPs</span>
                </div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                  {cat.fillRate}% filled
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};
