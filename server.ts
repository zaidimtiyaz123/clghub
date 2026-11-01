import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
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
} from './src/data/seedData';
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
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const portArgIndex = process.argv.indexOf('--port');
const portArg = portArgIndex !== -1 ? process.argv[portArgIndex + 1] : undefined;
// Cloud Run / container sets PORT=8080 for Nginx, dev server must run on port 3000
const PORT = parseInt(portArg || (process.env.PORT === '8080' ? '3000' : process.env.PORT || '3000'), 10);

const app = express();
app.use(express.json({ limit: '15mb' }));

// In-memory data store initialized with rich seed data
let users: User[] = [...SEED_USERS];
let clubs: Club[] = [...SEED_CLUBS];
let memberships: ClubMember[] = [...SEED_MEMBERSHIPS];
let events: Event[] = [...SEED_EVENTS];
let registrations: EventRegistration[] = [...SEED_REGISTRATIONS];
let gallery: GalleryImage[] = [...SEED_GALLERY];
let chatMessages: ChatMessage[] = [...SEED_CHAT_MESSAGES];
let announcements: Announcement[] = [...SEED_ANNOUNCEMENTS];
let notifications: NotificationItem[] = [...SEED_NOTIFICATIONS];

// ----------------- AUTH ROUTES -----------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());

  if (!user || (user.password && user.password !== password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Find user's club affiliations
  const userMemberships = memberships.filter((m) => m.userId === user.id);
  const safeUser = {
    ...user,
    clubAffiliations: userMemberships.map((m) => ({
      clubId: m.clubId,
      clubRole: m.clubRole,
      status: m.status,
    })),
  };

  return res.json({
    token: `token-${user.id}-${Date.now()}`,
    user: safeUser,
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, fullName, rollNumber, department, year } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: email.trim(),
    password,
    fullName: fullName.trim(),
    rollNumber: rollNumber || `2026STU${Math.floor(1000 + Math.random() * 9000)}`,
    department: department || 'General Engineering',
    year: parseInt(year, 10) || 1,
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    bio: 'Student member at Apex College.',
    systemRole: 'MEMBER',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  // Send welcome notification
  notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: newUser.id,
    title: 'Welcome to Apex Clubs Hub!',
    message: 'Explore our 6 clubs, join communities, and participate in upcoming events.',
    type: 'SYSTEM',
    link: '/clubs',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  return res.status(201).json({
    token: `token-${newUser.id}-${Date.now()}`,
    user: newUser,
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user) {
    return res.status(404).json({ error: 'User with specified email not found' });
  }

  user.password = newPassword || 'password123';
  return res.json({ message: 'Password reset successfully' });
});

// ----------------- CLUBS ROUTES -----------------
app.get('/api/clubs', (_req: Request, res: Response) => {
  const clubsWithCounts = clubs.map((club) => {
    const memberCount = memberships.filter(
      (m) => m.clubId === club.id && m.status === 'APPROVED'
    ).length;
    return {
      ...club,
      memberCount: Math.max(club.memberCount, memberCount),
    };
  });
  return res.json(clubsWithCounts);
});

app.get('/api/clubs/:idOrSlug', (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const club = clubs.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
  if (!club) {
    return res.status(404).json({ error: 'Club not found' });
  }

  const president = users.find((u) => u.id === club.presidentId);
  const vicePresident = users.find((u) => u.id === club.vicePresidentId);
  const clubMembers = memberships
    .filter((m) => m.clubId === club.id)
    .map((m) => {
      const u = users.find((user) => user.id === m.userId);
      return {
        ...m,
        user: u || m.user,
      };
    });

  const clubEvents = events.filter((e) => e.clubId === club.id);
  const clubGallery = gallery.filter((g) => g.clubId === club.id && g.approvalStatus === 'APPROVED');

  return res.json({
    club,
    president,
    vicePresident,
    members: clubMembers,
    events: clubEvents,
    gallery: clubGallery,
  });
});

app.put('/api/clubs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = clubs.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Club not found' });
  }

  clubs[index] = {
    ...clubs[index],
    ...req.body,
    id: clubs[index].id, // prevent ID overwrite
  };

  return res.json(clubs[index]);
});

app.delete('/api/clubs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  clubs = clubs.filter((c) => c.id !== id);
  memberships = memberships.filter((m) => m.clubId !== id);
  events = events.filter((e) => e.clubId !== id);
  gallery = gallery.filter((g) => g.clubId !== id);
  return res.json({ message: 'Club deleted successfully' });
});

app.post('/api/clubs/:id/join', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;

  const user = users.find((u) => u.id === userId);
  const club = clubs.find((c) => c.id === id);
  if (!user || !club) {
    return res.status(404).json({ error: 'User or Club not found' });
  }

  const existing = memberships.find((m) => m.userId === userId && m.clubId === id);
  if (existing) {
    return res.json({ membership: existing, message: 'Membership already recorded' });
  }

  const newMembership: ClubMember = {
    id: `cm-${Date.now()}`,
    userId,
    clubId: id,
    user,
    clubRole: 'MEMBER',
    status: 'PENDING',
    joinedAt: new Date().toISOString(),
  };

  memberships.push(newMembership);

  // Notify club president
  if (club.presidentId) {
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: club.presidentId,
      title: 'New Membership Application',
      message: `${user.fullName} applied to join ${club.name}. Review in Admin Panel.`,
      type: 'MEMBERSHIP_APPROVAL',
      link: '/admin',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  return res.status(201).json({ membership: newMembership, message: 'Application submitted' });
});

app.put('/api/memberships/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, clubRole, approvedById } = req.body;
  const index = memberships.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Membership not found' });
  }

  memberships[index] = {
    ...memberships[index],
    status: status || memberships[index].status,
    clubRole: clubRole || memberships[index].clubRole,
    approvedAt: status === 'APPROVED' ? new Date().toISOString() : memberships[index].approvedAt,
    approvedById: approvedById || memberships[index].approvedById,
  };

  const mem = memberships[index];
  const club = clubs.find((c) => c.id === mem.clubId);

  // Notify user
  if (status === 'APPROVED' && club) {
    notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: mem.userId,
      title: 'Membership Approved!',
      message: `Your membership application for ${club.name} was approved. You can now chat and attend exclusive sessions.`,
      type: 'MEMBERSHIP_APPROVAL',
      link: `/clubs/${club.slug}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  }

  return res.json(memberships[index]);
});

// ----------------- EVENTS ROUTES -----------------
app.get('/api/events', (req: Request, res: Response) => {
  const { clubId, category } = req.query;
  let filtered = [...events];

  if (clubId && clubId !== 'all') {
    filtered = filtered.filter((e) => e.clubId === clubId);
  }
  if (category && category !== 'all') {
    filtered = filtered.filter((e) => e.category === category);
  }

  // Sort by eventDate ascending
  filtered.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  return res.json(filtered);
});

app.post('/api/events', (req: Request, res: Response) => {
  const {
    clubId,
    title,
    description,
    fullDetails,
    venue,
    eventDate,
    startTime,
    endTime,
    category,
    posterUrl,
    maxAttendees,
    isCollegeWide,
    createdById,
  } = req.body;

  const club = clubs.find((c) => c.id === clubId);
  const creator = users.find((u) => u.id === createdById);

  // HOD created events are automatically approved; Presidents/VPs create pending HOD approval
  const isHod = creator?.systemRole === 'HOD';
  const approvalStatus = isHod ? 'APPROVED' : 'PENDING';

  const newEvent: Event = {
    id: `evt-${Date.now()}`,
    clubId,
    clubName: club?.name || 'Club Event',
    clubAccentColor: club?.accentColor || '#3b82f6',
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description,
    fullDetails: fullDetails || description,
    venue,
    eventDate,
    startTime,
    endTime,
    category: category || 'WORKSHOP',
    posterUrl: posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    maxAttendees: parseInt(maxAttendees, 10) || 100,
    rsvpCount: 0,
    isCollegeWide: Boolean(isCollegeWide),
    approvalStatus,
    createdById,
    createdAt: new Date().toISOString(),
  };

  events.unshift(newEvent);

  // Notify HOD if pending approval
  if (!isHod) {
    const hod = users.find((u) => u.systemRole === 'HOD');
    if (hod) {
      notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: hod.id,
        title: 'New Event Pending Approval',
        message: `${creator?.fullName || 'Club leader'} submitted "${newEvent.title}" for approval.`,
        type: 'EVENT',
        link: '/admin',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  events[index] = {
    ...events[index],
    ...req.body,
    id: events[index].id,
  };

  return res.json(events[index]);
});

app.delete('/api/events/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  events = events.filter((e) => e.id !== id);
  registrations = registrations.filter((r) => r.eventId !== id);
  return res.json({ message: 'Event deleted' });
});

// Event RSVP
app.post('/api/events/:id/rsvp', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, status } = req.body; // status: 'GOING' | 'INTERESTED' | 'CANCELLED'

  const eventIndex = events.findIndex((e) => e.id === id);
  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const existingIndex = registrations.findIndex((r) => r.eventId === id && r.userId === userId);
  if (existingIndex !== -1) {
    if (status === 'CANCELLED') {
      registrations.splice(existingIndex, 1);
      events[eventIndex].rsvpCount = Math.max(0, events[eventIndex].rsvpCount - 1);
    } else {
      registrations[existingIndex].rsvpStatus = status;
    }
  } else if (status !== 'CANCELLED') {
    registrations.push({
      id: `reg-${Date.now()}`,
      eventId: id,
      userId,
      rsvpStatus: status,
      registeredAt: new Date().toISOString(),
    });
    events[eventIndex].rsvpCount += 1;
  }

  return res.json({
    event: events[eventIndex],
    registration: registrations.find((r) => r.eventId === id && r.userId === userId),
  });
});

app.get('/api/users/:userId/registrations', (req: Request, res: Response) => {
  const { userId } = req.params;
  const userRegs = registrations.filter((r) => r.userId === userId);
  return res.json(userRegs);
});

// ----------------- GALLERY ROUTES -----------------
app.get('/api/gallery', (req: Request, res: Response) => {
  const { clubId, album } = req.query;
  let filtered = gallery.filter((g) => g.approvalStatus === 'APPROVED');
  if (clubId && clubId !== 'all') {
    filtered = filtered.filter((g) => g.clubId === clubId);
  }
  if (album && album !== 'all') {
    filtered = filtered.filter((g) => g.albumName === album);
  }
  return res.json(filtered);
});

app.post('/api/gallery', (req: Request, res: Response) => {
  const { clubId, title, caption, imageUrl, albumName, uploadedById } = req.body;
  const club = clubs.find((c) => c.id === clubId);
  const uploader = users.find((u) => u.id === uploadedById);

  const isHodOrLeader = uploader?.systemRole === 'HOD' || uploader?.systemRole === 'PRESIDENT';
  const approvalStatus = isHodOrLeader ? 'APPROVED' : 'PENDING';

  const newPhoto: GalleryImage = {
    id: `gal-${Date.now()}`,
    clubId,
    clubName: club?.name || 'Club Gallery',
    title,
    caption,
    imageUrl,
    albumName: albumName || 'General',
    approvalStatus,
    uploadedById,
    uploaderName: uploader?.fullName || 'Student',
    createdAt: new Date().toISOString(),
    likesCount: 1,
  };

  gallery.unshift(newPhoto);
  return res.status(201).json(newPhoto);
});

app.delete('/api/gallery/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  gallery = gallery.filter((g) => g.id !== id);
  return res.json({ message: 'Photo deleted' });
});

// ----------------- CHAT ROUTES -----------------
app.get('/api/chat/:clubId/messages', (req: Request, res: Response) => {
  const { clubId } = req.params;
  const messages = chatMessages
    .filter((m) => m.clubId === clubId && !m.isDeleted)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return res.json(messages);
});

app.post('/api/chat/:clubId/messages', (req: Request, res: Response) => {
  const { clubId } = req.params;
  const { senderId, content, imageUrl } = req.body;

  const sender = users.find((u) => u.id === senderId);
  if (!sender) {
    return res.status(404).json({ error: 'Sender not found' });
  }

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    chatRoomId: `chat-${clubId}`,
    clubId,
    senderId,
    senderName: sender.fullName,
    senderAvatar: sender.avatarUrl,
    senderRole: sender.systemRole,
    content,
    imageUrl,
    isPinned: false,
    isDeleted: false,
    createdAt: new Date().toISOString(),
  };

  chatMessages.push(newMessage);
  return res.status(201).json(newMessage);
});

app.put('/api/chat/messages/:id/pin', (req: Request, res: Response) => {
  const { id } = req.params;
  const msg = chatMessages.find((m) => m.id === id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  msg.isPinned = !msg.isPinned;
  return res.json(msg);
});

app.delete('/api/chat/messages/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { deletedById } = req.body;
  const msg = chatMessages.find((m) => m.id === id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  msg.isDeleted = true;
  msg.deletedById = deletedById;
  return res.json({ message: 'Message removed' });
});

// ----------------- ANNOUNCEMENTS ROUTES -----------------
app.get('/api/announcements', (_req: Request, res: Response) => {
  return res.json(announcements);
});

app.post('/api/announcements', (req: Request, res: Response) => {
  const { clubId, title, content, isCollegeWide, priority, createdById } = req.body;
  const creator = users.find((u) => u.id === createdById);
  const club = clubId ? clubs.find((c) => c.id === clubId) : null;

  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    clubId: clubId || null,
    clubName: club?.name,
    title,
    content,
    isCollegeWide: Boolean(isCollegeWide),
    priority: priority || 'NORMAL',
    createdById,
    creatorName: creator?.fullName || 'College Administration',
    creatorRole: creator?.systemRole || 'HOD',
    createdAt: new Date().toISOString(),
  };

  announcements.unshift(newAnn);

  // Broadcast notification to all users
  users.forEach((u) => {
    notifications.unshift({
      id: `notif-${Date.now()}-${u.id}`,
      userId: u.id,
      title: isCollegeWide ? 'College Announcement' : `${club?.name} Announcement`,
      message: title,
      type: 'ANNOUNCEMENT',
      link: '/',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  return res.status(201).json(newAnn);
});

// ----------------- NOTIFICATIONS ROUTES -----------------
app.get('/api/notifications/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const userNotifs = notifications.filter((n) => n.userId === userId);
  return res.json(userNotifs);
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = notifications.find((n) => n.id === id);
  if (notif) notif.isRead = true;
  return res.json(notif);
});

app.put('/api/notifications/user/:userId/read-all', (req: Request, res: Response) => {
  const { userId } = req.params;
  notifications.forEach((n) => {
    if (n.userId === userId) n.isRead = true;
  });
  return res.json({ message: 'All notifications marked as read' });
});

// ----------------- ADMIN DASHBOARD ROUTES -----------------
app.get('/api/admin/stats', (_req: Request, res: Response) => {
  const totalUsers = users.length;
  const totalClubs = clubs.length;
  const totalMemberships = memberships.filter((m) => m.status === 'APPROVED').length;
  const totalEvents = events.length;
  const pendingEvents = events.filter((e) => e.approvalStatus === 'PENDING').length;
  const pendingGallery = gallery.filter((g) => g.approvalStatus === 'PENDING').length;
  const pendingMemberships = memberships.filter((m) => m.status === 'PENDING').length;

  const clubStats = clubs.map((c) => ({
    clubId: c.id,
    clubName: c.name,
    accentColor: c.accentColor,
    memberCount: memberships.filter((m) => m.clubId === c.id && m.status === 'APPROVED').length,
    eventsCount: events.filter((e) => e.clubId === c.id).length,
    chatMessagesCount: chatMessages.filter((m) => m.clubId === c.id && !m.isDeleted).length,
  }));

  return res.json({
    overview: {
      totalUsers,
      totalClubs,
      totalMemberships,
      totalEvents,
      pendingEvents,
      pendingGallery,
      pendingMemberships,
    },
    clubStats,
    pendingItems: {
      events: events.filter((e) => e.approvalStatus === 'PENDING'),
      gallery: gallery.filter((g) => g.approvalStatus === 'PENDING'),
      memberships: memberships
        .filter((m) => m.status === 'PENDING')
        .map((m) => ({
          ...m,
          user: users.find((u) => u.id === m.userId),
          club: clubs.find((c) => c.id === m.clubId),
        })),
    },
  });
});

app.post('/api/admin/approve-event', (req: Request, res: Response) => {
  const { eventId, approved } = req.body;
  const event = events.find((e) => e.id === eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  event.approvalStatus = approved ? 'APPROVED' : 'REJECTED';
  return res.json(event);
});

app.post('/api/admin/approve-gallery', (req: Request, res: Response) => {
  const { imageId, approved } = req.body;
  const img = gallery.find((g) => g.id === imageId);
  if (!img) return res.status(404).json({ error: 'Image not found' });
  img.approvalStatus = approved ? 'APPROVED' : 'REJECTED';
  return res.json(img);
});

// Reset or change leadership for a club
app.post('/api/admin/assign-leader', (req: Request, res: Response) => {
  const { clubId, userId, role } = req.body; // role: 'PRESIDENT' | 'VICE_PRESIDENT'
  const club = clubs.find((c) => c.id === clubId);
  const user = users.find((u) => u.id === userId);
  if (!club || !user) return res.status(404).json({ error: 'Club or User not found' });

  if (role === 'PRESIDENT') {
    club.presidentId = user.id;
    user.systemRole = 'PRESIDENT';
  } else if (role === 'VICE_PRESIDENT') {
    club.vicePresidentId = user.id;
    user.systemRole = 'VICE_PRESIDENT';
  }

  // Update membership role
  const mem = memberships.find((m) => m.userId === userId && m.clubId === clubId);
  if (mem) {
    mem.clubRole = role;
    mem.status = 'APPROVED';
  } else {
    memberships.push({
      id: `cm-${Date.now()}`,
      userId,
      clubId,
      user,
      clubRole: role,
      status: 'APPROVED',
      joinedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
    });
  }

  return res.json({ club, user });
});

// Setup Vite middleware in development mode
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Apex Clubs Hub server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
