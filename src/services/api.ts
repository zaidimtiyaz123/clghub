import {
  User,
  Club,
  ClubMember,
  Event,
  EventRegistration,
  GalleryImage,
  ChatMessage,
  Announcement,
  NotificationItem,
} from '../types';
import {
  SEED_USERS,
  SEED_CLUBS,
  SEED_MEMBERSHIPS,
  SEED_EVENTS,
  SEED_REGISTRATIONS,
  SEED_GALLERY,
  SEED_CHAT_MESSAGES,
  SEED_ANNOUNCEMENTS,
  SEED_NOTIFICATIONS,
} from '../data/seedData';

// Storage keys for persistent state in browser
const STORAGE_PREFIX = 'apex_clubs_';
const USERS_KEY = `${STORAGE_PREFIX}users`;
const CLUBS_KEY = `${STORAGE_PREFIX}clubs`;
const MEMBERSHIPS_KEY = `${STORAGE_PREFIX}memberships`;
const EVENTS_KEY = `${STORAGE_PREFIX}events`;
const REGISTRATIONS_KEY = `${STORAGE_PREFIX}registrations`;
const GALLERY_KEY = `${STORAGE_PREFIX}gallery`;
const CHAT_KEY = `${STORAGE_PREFIX}chat`;
const ANNOUNCEMENTS_KEY = `${STORAGE_PREFIX}announcements`;
const NOTIFICATIONS_KEY = `${STORAGE_PREFIX}notifications`;
const VERSION_KEY = `${STORAGE_PREFIX}schema_version`;
const CURRENT_VERSION = 'v2026_bw_clubs_hub_final';

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') {
      return fallback;
    }
    const parsed = JSON.parse(item);
    if (parsed === undefined || parsed === null) {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    if (value === undefined || value === null) return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

// Initialise storage if empty or outdated
export function initLocalStorage(): void {
  const version = localStorage.getItem(VERSION_KEY);
  if (version !== CURRENT_VERSION || !localStorage.getItem(CLUBS_KEY)) {
    setStored(CLUBS_KEY, SEED_CLUBS);
    setStored(USERS_KEY, SEED_USERS);
    setStored(MEMBERSHIPS_KEY, SEED_MEMBERSHIPS);
    setStored(EVENTS_KEY, SEED_EVENTS);
    setStored(REGISTRATIONS_KEY, SEED_REGISTRATIONS);
    setStored(GALLERY_KEY, SEED_GALLERY);
    setStored(CHAT_KEY, SEED_CHAT_MESSAGES);
    setStored(ANNOUNCEMENTS_KEY, SEED_ANNOUNCEMENTS);
    setStored(NOTIFICATIONS_KEY, SEED_NOTIFICATIONS);
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }
}

export const api = {
  // CLUBS
  async getClubs(): Promise<Club[]> {
    try {
      const res = await fetch('/api/clubs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStored(CLUBS_KEY, data);
          return data;
        }
      }
    } catch {
      // fallback
    }
    const stored = getStored<Club[]>(CLUBS_KEY, SEED_CLUBS);
    return Array.isArray(stored) && stored.length > 0 ? stored : SEED_CLUBS;
  },

  async getClubBySlugOrId(idOrSlug: string): Promise<{
    club: Club;
    president?: User;
    vicePresident?: User;
    members: ClubMember[];
    events: Event[];
    gallery: GalleryImage[];
  } | null> {
    try {
      const res = await fetch(`/api/clubs/${idOrSlug}`);
      if (res.ok) {
        const parsed = await res.json();
        if (parsed && parsed.club) {
          return {
            club: parsed.club,
            president: parsed.president,
            vicePresident: parsed.vicePresident,
            members: Array.isArray(parsed.members) ? parsed.members : [],
            events: Array.isArray(parsed.events) ? parsed.events : [],
            gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
          };
        }
      }
    } catch {
      // fallback
    }

    const clubs = getStored<Club[]>(CLUBS_KEY, SEED_CLUBS);
    const club = clubs.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
    if (!club) return null;

    const users = getStored<User[]>(USERS_KEY, SEED_USERS);
    const memberships = getStored<ClubMember[]>(MEMBERSHIPS_KEY, SEED_MEMBERSHIPS);
    const events = getStored<Event[]>(EVENTS_KEY, SEED_EVENTS);
    const gallery = getStored<GalleryImage[]>(GALLERY_KEY, SEED_GALLERY);

    const president = users.find((u) => u.id === club.presidentId);
    const vicePresident = users.find((u) => u.id === club.vicePresidentId);
    const clubMembers = (memberships || [])
      .filter((m) => m && m.clubId === club.id)
      .map((m) => ({
        ...m,
        user: users.find((u) => u.id === m.userId) || m.user,
      }));
    const clubEvents = (events || []).filter((e) => e && e.clubId === club.id);
    const clubGallery = (gallery || []).filter((g) => g && g.clubId === club.id && g.approvalStatus === 'APPROVED');

    return {
      club,
      president,
      vicePresident,
      members: clubMembers,
      events: clubEvents,
      gallery: clubGallery,
    };
  },

  async updateClub(id: string, updates: Partial<Club>): Promise<Club> {
    try {
      const res = await fetch(`/api/clubs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const clubs = getStored<Club[]>(CLUBS_KEY, SEED_CLUBS);
    const index = clubs.findIndex((c) => c.id === id);
    if (index !== -1) {
      clubs[index] = { ...clubs[index], ...updates };
      setStored(CLUBS_KEY, clubs);
      return clubs[index];
    }
    throw new Error('Club not found');
  },

  async createClub(newClubData: Omit<Club, 'id' | 'memberCount' | 'createdAt'>): Promise<Club> {
    const clubs = getStored<Club[]>(CLUBS_KEY, SEED_CLUBS);
    const created: Club = {
      ...newClubData,
      id: `club-${Date.now()}`,
      memberCount: 1,
      createdAt: new Date().toISOString(),
    };
    clubs.push(created);
    setStored(CLUBS_KEY, clubs);
    return created;
  },

  async deleteClub(id: string): Promise<void> {
    try {
      await fetch(`/api/clubs/${id}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
    const clubs = getStored<Club[]>(CLUBS_KEY, SEED_CLUBS).filter((c) => c.id !== id);
    setStored(CLUBS_KEY, clubs);
  },

  async joinClub(clubId: string, userId: string): Promise<ClubMember> {
    try {
      const res = await fetch(`/api/clubs/${clubId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.membership;
      }
    } catch {
      // fallback
    }

    const memberships = getStored<ClubMember[]>(MEMBERSHIPS_KEY, SEED_MEMBERSHIPS);
    const users = getStored<User[]>(USERS_KEY, SEED_USERS);
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');

    const existing = memberships.find((m) => m.userId === userId && m.clubId === clubId);
    if (existing) return existing;

    const newMem: ClubMember = {
      id: `cm-${Date.now()}`,
      userId,
      clubId,
      user,
      clubRole: 'MEMBER',
      status: 'PENDING',
      joinedAt: new Date().toISOString(),
    };
    memberships.push(newMem);
    setStored(MEMBERSHIPS_KEY, memberships);
    return newMem;
  },

  async updateMembership(
    id: string,
    updates: { status?: ClubMember['status']; clubRole?: ClubMember['clubRole']; approvedById?: string }
  ): Promise<ClubMember> {
    try {
      const res = await fetch(`/api/memberships/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const memberships = getStored<ClubMember[]>(MEMBERSHIPS_KEY, SEED_MEMBERSHIPS);
    const index = memberships.findIndex((m) => m.id === id);
    if (index !== -1) {
      memberships[index] = {
        ...memberships[index],
        ...updates,
        approvedAt: updates.status === 'APPROVED' ? new Date().toISOString() : memberships[index].approvedAt,
      };
      setStored(MEMBERSHIPS_KEY, memberships);
      return memberships[index];
    }
    throw new Error('Membership not found');
  },

  // EVENTS
  async getEvents(filter?: { clubId?: string; category?: string }): Promise<Event[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.clubId) params.append('clubId', filter.clubId);
      if (filter?.category) params.append('category', filter.category);
      const res = await fetch(`/api/events?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setStored(EVENTS_KEY, data);
          return data;
        }
      }
    } catch {
      // fallback
    }

    const stored = getStored<Event[]>(EVENTS_KEY, SEED_EVENTS);
    let list = Array.isArray(stored) ? stored : SEED_EVENTS;
    if (filter?.clubId && filter.clubId !== 'all') {
      list = list.filter((e) => e && e.clubId === filter.clubId);
    }
    if (filter?.category && filter.category !== 'all') {
      list = list.filter((e) => e && e.category === filter.category);
    }
    return list;
  },

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const events = getStored<Event[]>(EVENTS_KEY, SEED_EVENTS);
    const clubs = getStored<Club[]>(CLUBS_KEY, SEED_CLUBS);
    const club = clubs.find((c) => c.id === eventData.clubId);

    const newEvt: Event = {
      id: `evt-${Date.now()}`,
      clubId: eventData.clubId || 'club-1',
      clubName: club?.name || 'Club Event',
      clubAccentColor: club?.accentColor || '#3b82f6',
      title: eventData.title || 'Untitled Event',
      slug: (eventData.title || 'event').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: eventData.description || '',
      fullDetails: eventData.fullDetails || eventData.description || '',
      venue: eventData.venue || 'Campus Auditorium',
      eventDate: eventData.eventDate || new Date().toISOString().split('T')[0],
      startTime: eventData.startTime || '14:00',
      endTime: eventData.endTime || '16:00',
      category: eventData.category || 'WORKSHOP',
      posterUrl:
        eventData.posterUrl ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      maxAttendees: eventData.maxAttendees || 100,
      rsvpCount: 0,
      isCollegeWide: Boolean(eventData.isCollegeWide),
      approvalStatus: eventData.approvalStatus || 'APPROVED',
      createdById: eventData.createdById || 'user-hod',
      createdAt: new Date().toISOString(),
    };

    events.unshift(newEvt);
    setStored(EVENTS_KEY, events);
    return newEvt;
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const events = getStored<Event[]>(EVENTS_KEY, SEED_EVENTS);
    const index = events.findIndex((e) => e.id === id);
    if (index !== -1) {
      events[index] = { ...events[index], ...updates };
      setStored(EVENTS_KEY, events);
      return events[index];
    }
    throw new Error('Event not found');
  },

  async deleteEvent(id: string): Promise<void> {
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
    const events = getStored<Event[]>(EVENTS_KEY, SEED_EVENTS).filter((e) => e.id !== id);
    setStored(EVENTS_KEY, events);
  },

  async rsvpEvent(eventId: string, userId: string, status: 'GOING' | 'INTERESTED' | 'CANCELLED'): Promise<{ event: Event; registration?: EventRegistration }> {
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const events = getStored<Event[]>(EVENTS_KEY, SEED_EVENTS);
    const registrations = getStored<EventRegistration[]>(REGISTRATIONS_KEY, SEED_REGISTRATIONS);
    const eventIndex = events.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) throw new Error('Event not found');

    const regIndex = registrations.findIndex((r) => r.eventId === eventId && r.userId === userId);
    if (regIndex !== -1) {
      if (status === 'CANCELLED') {
        registrations.splice(regIndex, 1);
        events[eventIndex].rsvpCount = Math.max(0, events[eventIndex].rsvpCount - 1);
      } else {
        registrations[regIndex].rsvpStatus = status;
      }
    } else if (status !== 'CANCELLED') {
      registrations.push({
        id: `reg-${Date.now()}`,
        eventId,
        userId,
        rsvpStatus: status,
        registeredAt: new Date().toISOString(),
      });
      events[eventIndex].rsvpCount += 1;
    }

    setStored(EVENTS_KEY, events);
    setStored(REGISTRATIONS_KEY, registrations);

    return {
      event: events[eventIndex],
      registration: registrations.find((r) => r.eventId === eventId && r.userId === userId),
    };
  },

  async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    try {
      const res = await fetch(`/api/users/${userId}/registrations`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // fallback
    }
    const regs = getStored<EventRegistration[]>(REGISTRATIONS_KEY, SEED_REGISTRATIONS);
    const safeRegs = Array.isArray(regs) ? regs : SEED_REGISTRATIONS;
    return safeRegs.filter((r) => r && r.userId === userId);
  },

  // GALLERY
  async getGallery(clubId?: string, album?: string): Promise<GalleryImage[]> {
    try {
      const params = new URLSearchParams();
      if (clubId) params.append('clubId', clubId);
      if (album) params.append('album', album);
      const res = await fetch(`/api/gallery?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // fallback
    }

    const stored = getStored<GalleryImage[]>(GALLERY_KEY, SEED_GALLERY);
    const safeList = Array.isArray(stored) ? stored : SEED_GALLERY;
    let list = safeList.filter((g) => g && g.approvalStatus === 'APPROVED');
    if (clubId && clubId !== 'all') {
      list = list.filter((g) => g && g.clubId === clubId);
    }
    if (album && album !== 'all') {
      list = list.filter((g) => g && g.albumName === album);
    }
    return list;
  },

  async uploadPhoto(data: Partial<GalleryImage>): Promise<GalleryImage> {
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const gallery = getStored<GalleryImage[]>(GALLERY_KEY, SEED_GALLERY);
    const clubs = getStored<Club[]>(CLUBS_KEY, SEED_CLUBS);
    const club = clubs.find((c) => c.id === data.clubId);

    const newPhoto: GalleryImage = {
      id: `gal-${Date.now()}`,
      clubId: data.clubId || 'club-1',
      clubName: club?.name || 'Club Gallery',
      title: data.title || 'Untitled Photo',
      caption: data.caption,
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      albumName: data.albumName || 'General',
      approvalStatus: data.approvalStatus || 'APPROVED',
      uploadedById: data.uploadedById || 'user-hod',
      uploaderName: data.uploaderName || 'Apex Student',
      createdAt: new Date().toISOString(),
      likesCount: 1,
    };

    gallery.unshift(newPhoto);
    setStored(GALLERY_KEY, gallery);
    return newPhoto;
  },

  async deletePhoto(id: string): Promise<void> {
    try {
      await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    } catch {
      // fallback
    }
    const gallery = getStored<GalleryImage[]>(GALLERY_KEY, SEED_GALLERY).filter((g) => g.id !== id);
    setStored(GALLERY_KEY, gallery);
  },

  // CHAT
  async getChatMessages(clubId: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`/api/chat/${clubId}/messages`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // fallback
    }

    const stored = getStored<ChatMessage[]>(CHAT_KEY, SEED_CHAT_MESSAGES);
    const messages = Array.isArray(stored) ? stored : SEED_CHAT_MESSAGES;
    return messages
      .filter((m) => m && m.clubId === clubId && !m.isDeleted)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async sendChatMessage(clubId: string, senderId: string, content: string, imageUrl?: string): Promise<ChatMessage> {
    try {
      const res = await fetch(`/api/chat/${clubId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, content, imageUrl }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const messages = getStored<ChatMessage[]>(CHAT_KEY, SEED_CHAT_MESSAGES);
    const users = getStored<User[]>(USERS_KEY, SEED_USERS);
    const sender = users.find((u) => u.id === senderId);

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      chatRoomId: `chat-${clubId}`,
      clubId,
      senderId,
      senderName: sender?.fullName || 'Student',
      senderAvatar: sender?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      senderRole: sender?.systemRole || 'MEMBER',
      content,
      imageUrl,
      isPinned: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };

    messages.push(newMsg);
    setStored(CHAT_KEY, messages);
    return newMsg;
  },

  async togglePinMessage(messageId: string): Promise<ChatMessage> {
    try {
      const res = await fetch(`/api/chat/messages/${messageId}/pin`, { method: 'PUT' });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const messages = getStored<ChatMessage[]>(CHAT_KEY, SEED_CHAT_MESSAGES);
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) throw new Error('Message not found');
    msg.isPinned = !msg.isPinned;
    setStored(CHAT_KEY, messages);
    return msg;
  },

  async deleteChatMessage(messageId: string, deletedById: string): Promise<void> {
    try {
      await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedById }),
      });
    } catch {
      // fallback
    }

    const messages = getStored<ChatMessage[]>(CHAT_KEY, SEED_CHAT_MESSAGES);
    const msg = messages.find((m) => m.id === messageId);
    if (msg) {
      msg.isDeleted = true;
      msg.deletedById = deletedById;
      setStored(CHAT_KEY, messages);
    }
  },

  // ANNOUNCEMENTS
  async getAnnouncements(): Promise<Announcement[]> {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // fallback
    }
    const stored = getStored<Announcement[]>(ANNOUNCEMENTS_KEY, SEED_ANNOUNCEMENTS);
    return Array.isArray(stored) ? stored : SEED_ANNOUNCEMENTS;
  },

  async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const announcements = getStored<Announcement[]>(ANNOUNCEMENTS_KEY, SEED_ANNOUNCEMENTS);
    const users = getStored<User[]>(USERS_KEY, SEED_USERS);
    const clubs = getStored<Club[]>(CLUBS_KEY, SEED_CLUBS);
    const creator = users.find((u) => u.id === data.createdById);
    const club = data.clubId ? clubs.find((c) => c.id === data.clubId) : null;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      clubId: data.clubId || null,
      clubName: club?.name,
      title: data.title || 'Announcement',
      content: data.content || '',
      isCollegeWide: Boolean(data.isCollegeWide),
      priority: data.priority || 'NORMAL',
      createdById: data.createdById || 'user-hod',
      creatorName: creator?.fullName || 'College Administration',
      creatorRole: creator?.systemRole || 'HOD',
      createdAt: new Date().toISOString(),
    };

    announcements.unshift(newAnn);
    setStored(ANNOUNCEMENTS_KEY, announcements);
    return newAnn;
  },

  // NOTIFICATIONS
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    try {
      const res = await fetch(`/api/notifications/${userId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // fallback
    }

    const notifs = getStored<NotificationItem[]>(NOTIFICATIONS_KEY, SEED_NOTIFICATIONS);
    const safeNotifs = Array.isArray(notifs) ? notifs : SEED_NOTIFICATIONS;
    return safeNotifs.filter((n) => n && n.userId === userId);
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    } catch {
      // fallback
    }
    const notifs = getStored<NotificationItem[]>(NOTIFICATIONS_KEY, SEED_NOTIFICATIONS);
    const item = notifs.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      setStored(NOTIFICATIONS_KEY, notifs);
    }
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    try {
      await fetch(`/api/notifications/user/${userId}/read-all`, { method: 'PUT' });
    } catch {
      // fallback
    }
    const notifs = getStored<NotificationItem[]>(NOTIFICATIONS_KEY, SEED_NOTIFICATIONS);
    notifs.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    setStored(NOTIFICATIONS_KEY, notifs);
  },

  // ADMIN STATS & APPROVALS
  async getAdminStats(): Promise<{
    overview: {
      totalUsers: number;
      totalClubs: number;
      totalMemberships: number;
      totalEvents: number;
      pendingEvents: number;
      pendingGallery: number;
      pendingMemberships: number;
    };
    clubStats: {
      clubId: string;
      clubName: string;
      accentColor: string;
      memberCount: number;
      eventsCount: number;
      chatMessagesCount: number;
    }[];
    pendingItems: {
      events: Event[];
      gallery: GalleryImage[];
      memberships: (ClubMember & { club?: Club })[];
    };
  }> {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        if (data && data.overview) {
          return {
            overview: data.overview,
            clubStats: Array.isArray(data.clubStats) ? data.clubStats : [],
            pendingItems: {
              events: Array.isArray(data?.pendingItems?.events) ? data.pendingItems.events : [],
              gallery: Array.isArray(data?.pendingItems?.gallery) ? data.pendingItems.gallery : [],
              memberships: Array.isArray(data?.pendingItems?.memberships) ? data.pendingItems.memberships : [],
            },
          };
        }
      }
    } catch {
      // fallback
    }

    const users = getStored<User[]>(USERS_KEY, SEED_USERS);
    const clubs = getStored<Club[]>(CLUBS_KEY, SEED_CLUBS);
    const memberships = getStored<ClubMember[]>(MEMBERSHIPS_KEY, SEED_MEMBERSHIPS);
    const events = getStored<Event[]>(EVENTS_KEY, SEED_EVENTS);
    const gallery = getStored<GalleryImage[]>(GALLERY_KEY, SEED_GALLERY);
    const chat = getStored<ChatMessage[]>(CHAT_KEY, SEED_CHAT_MESSAGES);

    return {
      overview: {
        totalUsers: (users || []).length,
        totalClubs: (clubs || []).length,
        totalMemberships: (memberships || []).filter((m) => m && m.status === 'APPROVED').length,
        totalEvents: (events || []).length,
        pendingEvents: (events || []).filter((e) => e && e.approvalStatus === 'PENDING').length,
        pendingGallery: (gallery || []).filter((g) => g && g.approvalStatus === 'PENDING').length,
        pendingMemberships: (memberships || []).filter((m) => m && m.status === 'PENDING').length,
      },
      clubStats: (clubs || []).map((c) => ({
        clubId: c.id,
        clubName: c.name,
        accentColor: c.accentColor,
        memberCount: (memberships || []).filter((m) => m && m.clubId === c.id && m.status === 'APPROVED').length,
        eventsCount: (events || []).filter((e) => e && e.clubId === c.id).length,
        chatMessagesCount: (chat || []).filter((m) => m && m.clubId === c.id && !m.isDeleted).length,
      })),
      pendingItems: {
        events: (events || []).filter((e) => e && e.approvalStatus === 'PENDING'),
        gallery: (gallery || []).filter((g) => g && g.approvalStatus === 'PENDING'),
        memberships: (memberships || [])
          .filter((m) => m && m.status === 'PENDING')
          .map((m) => ({
            ...m,
            user: (users || []).find((u) => u.id === m.userId) || m.user,
            club: (clubs || []).find((c) => c.id === m.clubId),
          })),
      },
    };
  },

  async approveEvent(eventId: string, approved: boolean): Promise<Event> {
    try {
      const res = await fetch('/api/admin/approve-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, approved }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const events = getStored<Event[]>(EVENTS_KEY, SEED_EVENTS);
    const evt = events.find((e) => e.id === eventId);
    if (!evt) throw new Error('Event not found');
    evt.approvalStatus = approved ? 'APPROVED' : 'REJECTED';
    setStored(EVENTS_KEY, events);
    return evt;
  },

  async approveGallery(imageId: string, approved: boolean): Promise<GalleryImage> {
    try {
      const res = await fetch('/api/admin/approve-gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, approved }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const gallery = getStored<GalleryImage[]>(GALLERY_KEY, SEED_GALLERY);
    const img = gallery.find((g) => g.id === imageId);
    if (!img) throw new Error('Image not found');
    img.approvalStatus = approved ? 'APPROVED' : 'REJECTED';
    setStored(GALLERY_KEY, gallery);
    return img;
  },

  async assignClubLeader(clubId: string, userId: string, role: 'PRESIDENT' | 'VICE_PRESIDENT'): Promise<{ club: Club; user: User }> {
    try {
      const res = await fetch('/api/admin/assign-leader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubId, userId, role }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const clubs = getStored<Club[]>(CLUBS_KEY, SEED_CLUBS);
    const users = getStored<User[]>(USERS_KEY, SEED_USERS);
    const club = clubs.find((c) => c.id === clubId);
    const user = users.find((u) => u.id === userId);
    if (!club || !user) throw new Error('Club or User not found');

    if (role === 'PRESIDENT') {
      club.presidentId = user.id;
      user.systemRole = 'PRESIDENT';
    } else {
      club.vicePresidentId = user.id;
      user.systemRole = 'VICE_PRESIDENT';
    }

    setStored(CLUBS_KEY, clubs);
    setStored(USERS_KEY, users);
    return { club, user };
  },

  async getAllUsers(): Promise<User[]> {
    const stored = getStored<User[]>(USERS_KEY, SEED_USERS);
    return Array.isArray(stored) && stored.length > 0 ? stored : SEED_USERS;
  },
};
