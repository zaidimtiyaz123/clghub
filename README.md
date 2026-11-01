# Apex College Clubs Hub

A full-stack, enterprise-grade collegiate web platform uniting all 6 student technical and cultural clubs under a single unified hub. Built with a modern responsive UI, dynamic 3D glassmorphic components, real-time group chatrooms, event scheduling with RSVPs, interactive media galleries, and an authoritative Head of Department (HOD) administrative dashboard.

---

## 🏛 The 6 Campus Guilds
1. **RoboTech Guild** (Robotics & Autonomous AI) — Accent `#0284c7`
   - *President*: Aryan Sharma · *VP*: Tara Sen
2. **DevSphere** (Developers & Open Source Club) — Accent `#10b981`
   - *President*: Marcus Vance · *VP*: Priya Patel
3. **CreativeForge** (Design & Multimedia Guild) — Accent `#8b5cf6`
   - *President*: Elena Rostova · *VP*: Dev Khanna
4. **Aura Cultural Club** (Music, Dance & Theater) — Accent `#f59e0b`
   - *President*: Zoya Qureshi · *VP*: Rohan Mehra
5. **Apex Orators Society** (Debate, Model UN & Literary) — Accent `#e11d48`
   - *President*: Neil Deshmukh · *VP*: Aanya Roy
6. **Vortex Gaming Guild** (E-Sports & Game Development) — Accent `#6366f1`
   - *President*: Kevin Zhang · *VP*: Samira Khan

---

## 🔑 User Roles & Permissions Matrix

| Feature / Action | HOD (Super Admin) | Club President | Vice President | Member (Student) |
| :--- | :---: | :---: | :---: | :---: |
| **Create & Delete Clubs** | ✅ Full Authority | ❌ | ❌ | ❌ |
| **Assign / Reset Club Leadership Logins** | ✅ All Clubs | ❌ | ❌ | ❌ |
| **Approve Pending Events & Media** | ✅ Campus Clearance | ❌ | ❌ | ❌ |
| **Post College-Wide Announcements** | ✅ College-wide | ❌ | ❌ | ❌ |
| **Post Club Announcements** | ✅ Any Club | ✅ Own Club | ✅ Own Club | ❌ |
| **Manage Club Profile (Name, Lab, Hours)** | ✅ Any Club | ✅ Own Club | ✅ Own Club | ❌ |
| **Approve / Remove Club Members** | ✅ Any Club | ✅ Own Club | ✅ Own Club | ❌ |
| **Moderate Club Chat (Pin/Delete Messages)** | ✅ All 6 Rooms | ✅ Own Room | ✅ Own Room | ❌ |
| **Participate in Club Group Chat** | ✅ All 6 Rooms | ✅ Own Room | ✅ Own Room | ✅ Approved Rooms |
| **RSVP for Events (Going / Interested)** | ✅ | ✅ | ✅ | ✅ |
| **Submit Gallery Media** | ✅ Auto-Approved | ✅ Auto-Approved | ✅ Auto-Approved | ✅ Pending Approval |

---

## 🗄 Database Schema (Prisma)
Located in `/prisma/schema.prisma`:
- `users`: id, email, passwordHash, fullName, rollNumber, department, year, avatarUrl, bio, systemRole, createdAt, updatedAt
- `clubs`: id, name, slug, tag, description, fullAbout, category, logoUrl, bannerUrl, accentColor, establishedYear, meetingSchedule, roomLocation, contactEmail, status, presidentId, createdAt, updatedAt
- `club_members`: id, userId, clubId, clubRole, status (PENDING / APPROVED / REJECTED / MUTED), joinedAt, approvedAt, approvedById
- `events`: id, clubId, title, slug, description, fullDetails, venue, eventDate, startTime, endTime, category, posterUrl, maxAttendees, isCollegeWide, approvalStatus, createdById, createdAt, updatedAt
- `event_registrations`: id, eventId, userId, rsvpStatus (GOING / INTERESTED / CANCELLED), registeredAt, notes
- `gallery_images`: id, clubId, eventId, title, caption, imageUrl, albumName, approvalStatus, uploadedById, createdAt, likesCount
- `chat_rooms`: id, clubId, name, topic, isArchived, createdAt
- `messages`: id, chatRoomId, senderId, content, imageUrl, isPinned, isDeleted, deletedById, createdAt
- `announcements`: id, clubId, title, content, isCollegeWide, priority (NORMAL / URGENT / PINNED), createdById, createdAt
- `notifications`: id, userId, title, message, type, link, isRead, createdAt

---

## 🚀 Complete Backend REST API
Run on Express inside `server.ts`:
- **Auth**: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/reset-password`
- **Clubs**: `GET /api/clubs`, `GET /api/clubs/:slug`, `PUT /api/clubs/:id`, `DELETE /api/clubs/:id`, `POST /api/clubs/:id/join`, `PUT /api/memberships/:id`
- **Events**: `GET /api/events`, `POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id`, `POST /api/events/:id/rsvp`
- **Gallery**: `GET /api/gallery`, `POST /api/gallery`, `DELETE /api/gallery/:id`
- **Realtime Chat**: `GET /api/chat/:clubId/messages`, `POST /api/chat/:clubId/messages`, `PUT /api/chat/messages/:id/pin`, `DELETE /api/chat/messages/:id`
- **Announcements**: `GET /api/announcements`, `POST /api/announcements`
- **Admin**: `GET /api/admin/stats`, `POST /api/admin/approve-event`, `POST /api/admin/approve-gallery`, `POST /api/admin/assign-leader`
- **Notifications**: `GET /api/notifications/:userId`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/user/:userId/read-all`

---

## 📦 Getting Started & Running Locally

### 1. Installation
```bash
npm install
```

### 2. Run Full-Stack Development Server
Runs both Express API endpoints and Vite SPA middleware:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

### 4. Instant Demo Roles
Use the **"Role" dropdown** in the top navigation bar to instantaneously switch between:
- **Prof. Dr. Rajesh Sundaram** (HOD / Super Admin)
- **Aryan Sharma** (RoboTech President)
- **Marcus Vance** (DevSphere President)
- **Tara Sen** (RoboTech Vice President)
- **Rahul Verma** (Computer Science Student Member)
