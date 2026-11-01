/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Club, Event, GalleryImage, Announcement, NotificationItem, EventRegistration } from './types';
import {
  SEED_CLUBS,
  SEED_EVENTS,
  SEED_GALLERY,
  SEED_ANNOUNCEMENTS,
  SEED_REGISTRATIONS,
  SEED_NOTIFICATIONS,
} from './data/seedData';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { ClubsPage } from './pages/ClubsPage';
import { ClubDetailPage } from './pages/ClubDetailPage';
import { EventsPage } from './pages/EventsPage';
import { GalleryPage } from './pages/GalleryPage';
import { ChatPage } from './pages/ChatPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { AuthModal } from './components/common/AuthModal';
import { RsvpModal } from './components/common/RsvpModal';
import { LightboxModal } from './components/common/LightboxModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { BottomNav } from './components/common/BottomNav';

function MainLayout() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedClubSlug, setSelectedClubSlug] = useState<string>('code-crackers');

  // Core Data initialized with valid seed arrays so there is never an undefined or empty state
  const [clubs, setClubs] = useState<Club[]>(SEED_CLUBS);
  const [events, setEvents] = useState<Event[]>(SEED_EVENTS);
  const [gallery, setGallery] = useState<GalleryImage[]>(SEED_GALLERY);
  const [announcements, setAnnouncements] = useState<Announcement[]>(SEED_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);
  const [userRegistrations, setUserRegistrations] = useState<EventRegistration[]>(SEED_REGISTRATIONS);

  // Modals & Drawers
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [rsvpModalEvent, setRsvpModalEvent] = useState<Event | null>(null);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    try {
      const [cList, eList, gList, aList] = await Promise.all([
        api.getClubs(),
        api.getEvents(),
        api.getGallery(),
        api.getAnnouncements(),
      ]);

      if (Array.isArray(cList) && cList.length > 0) setClubs(cList);
      if (Array.isArray(eList) && eList.length > 0) setEvents(eList);
      if (Array.isArray(gList) && gList.length > 0) setGallery(gList);
      if (Array.isArray(aList) && aList.length > 0) setAnnouncements(aList);

      if (user) {
        const [nList, rList] = await Promise.all([
          api.getNotifications(user.id),
          api.getUserRegistrations(user.id),
        ]);
        if (Array.isArray(nList)) setNotifications(nList);
        if (Array.isArray(rList)) setUserRegistrations(rList);
      }
    } catch (err) {
      console.error('Error loading data in MainLayout:', err);
    }
  };

  const handleNavigate = (tab: string, slug?: string) => {
    if (tab === 'club-detail' && slug) {
      setSelectedClubSlug(slug);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    if (user) {
      const updated = await api.getNotifications(user.id);
      setNotifications(updated);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (user) {
      await api.markAllNotificationsRead(user.id);
      const updated = await api.getNotifications(user.id);
      setNotifications(updated);
    }
  };

  const handleCreateEvent = async (newEventData: Partial<Event>) => {
    await api.createEvent(newEventData);
    const updated = await api.getEvents();
    setEvents(updated);
  };

  const handleUploadPhoto = async (newPhotoData: Partial<GalleryImage>) => {
    await api.uploadPhoto(newPhotoData);
    const updated = await api.getGallery();
    setGallery(updated);
  };

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col bg-black text-zinc-100 selection:bg-white selection:text-black font-sans">
      <Header
        currentTab={currentTab}
        onNavigate={handleNavigate}
        unreadCount={unreadNotifCount}
        onOpenNotifications={() => setNotificationDrawerOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 pb-24 md:pb-8">
        {currentTab === 'home' && (
          <HomePage
            clubs={clubs}
            events={events}
            announcements={announcements}
            gallery={gallery}
            onNavigate={handleNavigate}
            onOpenRsvpModal={(evt) => setRsvpModalEvent(evt)}
            onOpenLightbox={(img) => setLightboxImage(img)}
          />
        )}

        {currentTab === 'clubs' && (
          <ClubsPage clubs={clubs} onNavigate={handleNavigate} />
        )}

        {currentTab === 'club-detail' && (
          <ClubDetailPage
            clubSlug={selectedClubSlug}
            onNavigate={handleNavigate}
            onOpenRsvpModal={(evt) => setRsvpModalEvent(evt)}
            onOpenLightbox={(img) => setLightboxImage(img)}
          />
        )}

        {currentTab === 'events' && (
          <EventsPage
            events={events}
            clubs={clubs}
            onOpenRsvpModal={(evt) => setRsvpModalEvent(evt)}
            onRefreshEvents={loadAllData}
            onCreateEvent={handleCreateEvent}
          />
        )}

        {currentTab === 'gallery' && (
          <GalleryPage
            gallery={gallery}
            clubs={clubs}
            onOpenLightbox={(img) => setLightboxImage(img)}
            onUploadPhoto={handleUploadPhoto}
          />
        )}

        {currentTab === 'chat' && (
          <ChatPage clubs={clubs} onNavigate={handleNavigate} />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            clubs={clubs}
            events={events}
            onRefreshClubs={loadAllData}
            onRefreshEvents={loadAllData}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'profile' && (
          <ProfilePage
            clubs={clubs}
            events={events}
            registrations={userRegistrations}
            onNavigate={handleNavigate}
            onOpenRsvpModal={(evt) => setRsvpModalEvent(evt)}
          />
        )}

        {(currentTab === 'login' || currentTab === 'signin') && (
          <AuthPage
            onNavigate={handleNavigate}
            initialMode="LOGIN"
          />
        )}

        {(currentTab === 'register' || currentTab === 'signup') && (
          <AuthPage
            onNavigate={handleNavigate}
            initialMode="REGISTER"
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
      <BottomNav
        currentTab={currentTab}
        onNavigate={handleNavigate}
        unreadCount={unreadNotifCount}
      />

      {/* Global Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <RsvpModal
        event={rsvpModalEvent}
        isOpen={!!rsvpModalEvent}
        onClose={() => setRsvpModalEvent(null)}
        onRsvpSuccess={loadAllData}
      />

      <LightboxModal
        image={lightboxImage}
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
