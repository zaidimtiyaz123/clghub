export type SystemRole = 'HOD' | 'PRESIDENT' | 'VICE_PRESIDENT' | 'MEMBER';
export type ClubRole = 'PRESIDENT' | 'VICE_PRESIDENT' | 'MEMBER';
export type MembershipStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MUTED';
export type ApprovalStatus = 'APPROVED' | 'PENDING' | 'REJECTED';
export type EventCategory = 'WORKSHOP' | 'HACKATHON' | 'COMPETITION' | 'SEMINAR' | 'CULTURAL' | 'GAMING' | 'MEETUP';
export type RSVPStatus = 'GOING' | 'INTERESTED' | 'CANCELLED';
export type AnnouncementPriority = 'NORMAL' | 'URGENT' | 'PINNED';
export type NotificationType = 'EVENT' | 'ANNOUNCEMENT' | 'MEMBERSHIP_APPROVAL' | 'CHAT' | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  rollNumber?: string;
  department: string;
  year: number;
  avatarUrl: string;
  bio?: string;
  systemRole: SystemRole;
  clubAffiliations?: { clubId: string; clubRole: ClubRole; status: MembershipStatus }[];
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  tag: string;
  description: string;
  fullAbout: string;
  category: string;
  logoUrl: string;
  bannerUrl: string;
  accentColor: string;
  establishedYear: number;
  meetingSchedule: string;
  roomLocation: string;
  contactEmail: string;
  discordOrLink?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  presidentId: string;
  vicePresidentId?: string;
  memberCount: number;
  createdAt: string;
}

export interface ClubMember {
  id: string;
  userId: string;
  clubId: string;
  user: User;
  clubRole: ClubRole;
  status: MembershipStatus;
  joinedAt: string;
  approvedAt?: string;
  approvedById?: string;
}

export interface Event {
  id: string;
  clubId: string;
  clubName?: string;
  clubAccentColor?: string;
  title: string;
  slug: string;
  description: string;
  fullDetails: string;
  venue: string;
  eventDate: string; // ISO date YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  category: EventCategory;
  posterUrl: string;
  maxAttendees: number;
  rsvpCount: number;
  isCollegeWide: boolean;
  approvalStatus: ApprovalStatus;
  createdById: string;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  rsvpStatus: RSVPStatus;
  registeredAt: string;
  notes?: string;
}

export interface GalleryImage {
  id: string;
  clubId: string;
  clubName?: string;
  eventId?: string;
  title: string;
  caption?: string;
  imageUrl: string;
  albumName: string;
  approvalStatus: ApprovalStatus;
  uploadedById: string;
  uploaderName: string;
  createdAt: string;
  likesCount?: number;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  clubId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: SystemRole;
  content: string;
  imageUrl?: string;
  isPinned: boolean;
  isDeleted: boolean;
  deletedById?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  clubId?: string | null;
  clubName?: string;
  title: string;
  content: string;
  isCollegeWide: boolean;
  priority: AnnouncementPriority;
  createdById: string;
  creatorName: string;
  creatorRole: SystemRole;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
