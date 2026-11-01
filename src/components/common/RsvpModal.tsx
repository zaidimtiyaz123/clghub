import React, { useState, useEffect } from 'react';
import { Event, RSVPStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Calendar, Clock, MapPin, Users, Check, X, CheckCircle2 } from 'lucide-react';

interface RsvpModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onRsvpSuccess: () => void;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({
  event,
  isOpen,
  onClose,
  onRsvpSuccess,
}) => {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<RSVPStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (event && user) {
      api.getUserRegistrations(user.id).then((regs) => {
        const found = regs.find((r) => r.eventId === event.id);
        setCurrentStatus(found ? found.rsvpStatus : null);
      });
    }
  }, [event, user]);

  if (!isOpen || !event) return null;

  const handleRsvp = async (status: RSVPStatus) => {
    if (!user) return;
    setLoading(true);
    try {
      await api.rsvpEvent(event.id, user.id, status);
      setCurrentStatus(status === 'CANCELLED' ? null : status);
      setMessage(
        status === 'GOING'
          ? 'You are confirmed as Going!'
          : status === 'INTERESTED'
          ? 'Marked as Interested!'
          : 'Registration cancelled.'
      );
      setTimeout(() => {
        setMessage('');
        onRsvpSuccess();
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-zinc-950 shadow-2xl overflow-hidden">
        {/* Banner image */}
        <div className="relative h-44 w-full bg-black overflow-hidden">
          <img
            src={event.posterUrl}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-black/80 border border-white/20">
              {event.clubName} · {event.category}
            </span>
            <h3 className="text-base font-bold mt-1 line-clamp-1">{event.title}</h3>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {message && (
            <div className="p-3 rounded-xl bg-white text-black font-semibold flex items-center gap-2 shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-black" />
              <span>{message}</span>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-white mb-1">Agenda & Overview</h4>
            <p className="text-zinc-300 leading-relaxed max-h-32 overflow-y-auto">
              {event.fullDetails || event.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300 font-mono">
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase">Date & Timing</div>
              <div className="font-semibold text-white text-[11px]">
                {event.eventDate} ({event.startTime} - {event.endTime})
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] text-zinc-500 uppercase">Location</div>
              <div className="font-semibold text-white text-[11px] truncate">
                {event.venue}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-zinc-400" />
              <span>{event.rsvpCount} Attending (Cap: {event.maxAttendees})</span>
            </span>
            {currentStatus && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white text-black">
                Current: {currentStatus}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handleRsvp('GOING')}
              disabled={loading}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                currentStatus === 'GOING'
                  ? 'bg-zinc-200 text-black ring-2 ring-white'
                  : 'bg-white text-black hover:bg-zinc-200 shadow-md'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{currentStatus === 'GOING' ? 'Confirmed Going' : "I'm Going"}</span>
            </button>

            <button
              onClick={() => handleRsvp('INTERESTED')}
              disabled={loading}
              className={`px-4 py-2.5 rounded-xl font-semibold border transition-all text-center ${
                currentStatus === 'INTERESTED'
                  ? 'bg-zinc-800 text-white border-white'
                  : 'bg-zinc-900 text-zinc-300 border-white/20 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Interested
            </button>

            {currentStatus && (
              <button
                onClick={() => handleRsvp('CANCELLED')}
                disabled={loading}
                className="px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 text-[11px]"
              >
                Cancel RSVP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
