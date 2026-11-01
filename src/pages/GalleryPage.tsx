import React, { useState } from 'react';
import { GalleryImage, Club } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Eye, X, UploadCloud, Sparkles } from 'lucide-react';

interface GalleryPageProps {
  gallery: GalleryImage[];
  clubs: Club[];
  onOpenLightbox: (image: GalleryImage) => void;
  onUploadPhoto: (data: Partial<GalleryImage>) => Promise<void>;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({
  gallery,
  clubs,
  onOpenLightbox,
  onUploadPhoto,
}) => {
  const { user } = useAuth();
  const [selectedClubId, setSelectedClubId] = useState('ALL');
  const [selectedAlbum, setSelectedAlbum] = useState('ALL');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const safeGallery = gallery || [];
  const safeClubs = clubs || [];

  // Upload Form
  const [clubId, setClubId] = useState(safeClubs[0]?.id || 'club-1');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [albumName, setAlbumName] = useState('Campus Highlights');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80');
  const [uploading, setUploading] = useState(false);

  // Extract unique albums safely
  const albums = ['ALL', ...Array.from(new Set(safeGallery.map((g) => g?.albumName || 'General')))];

  const filteredGallery = safeGallery.filter((img) => {
    if (!img) return false;
    const matchesClub = selectedClubId === 'ALL' || img.clubId === selectedClubId;
    const matchesAlbum = selectedAlbum === 'ALL' || img.albumName === selectedAlbum;
    return matchesClub && matchesAlbum;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;
    setUploading(true);
    try {
      await onUploadPhoto({
        clubId,
        title,
        caption,
        albumName,
        imageUrl,
        uploadedById: user?.id,
        uploaderName: user?.fullName || 'Student Member',
      });
      setUploadModalOpen(false);
      setTitle('');
      setCaption('');
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
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
              Campus Guild Gallery
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            A visual chronicle of hackathons, rover prototypes, athletic championships, community service, and cultural performances across all 6 clubs.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 text-xs font-bold text-black bg-white hover:bg-zinc-200 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Image</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-3">
        {/* Clubs filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedClubId('ALL')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              selectedClubId === 'ALL'
                ? 'bg-white text-black font-bold shadow-md'
                : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
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
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
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

        {/* Album Sub-Filter */}
        <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1 no-scrollbar text-zinc-400">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider shrink-0">
            Albums:
          </span>
          {albums.map((alb) => (
            <button
              key={alb}
              onClick={() => setSelectedAlbum(alb)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                selectedAlbum === alb
                  ? 'bg-zinc-800 text-white border border-white/30'
                  : 'hover:text-white'
              }`}
            >
              {alb}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Masonry/Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGallery.map((img) => (
          <div
            key={img.id}
            onClick={() => onOpenLightbox(img)}
            className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer border border-white/15 bg-zinc-950 shadow-xl transition-all duration-300 hover:border-white/40 hover:-translate-y-1"
          >
            <img
              src={img.imageUrl}
              alt={img.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400 mb-1">
                <span>{img.clubName}</span>
                <span>·</span>
                <span>{img.albumName}</span>
              </div>
              <h4 className="text-sm font-bold line-clamp-1">{img.title}</h4>
              {img.caption && (
                <p className="text-xs text-zinc-300 line-clamp-2 mt-0.5">{img.caption}</p>
              )}
              <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-white/15">
                <span>By {img.uploaderName || 'Member'}</span>
                <span className="flex items-center gap-1 font-mono">
                  <Eye className="w-3.5 h-3.5" /> View Photo
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGallery.length === 0 && (
        <div className="p-16 text-center text-zinc-400 border border-dashed border-white/20 rounded-2xl bg-zinc-950">
          <p className="text-sm font-semibold text-white">No images in this album or guild yet</p>
          <p className="text-xs mt-1">Be the first to upload photos from a recent meeting or competition!</p>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl border border-white/20 bg-zinc-950 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-white" />
                <h3 className="font-bold text-sm text-white">
                  Upload Guild Picture
                </h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Guild
                </label>
                <select
                  value={clubId}
                  onChange={(e) => setClubId(e.target.value)}
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
                  Picture Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rover Navigation Arena Demo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Album Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fall Hackathon, Robot Trials"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  Caption (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="A short story or reflection on the event..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/15 bg-zinc-900 text-white focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-white/20 text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl font-bold bg-white text-black hover:bg-zinc-200"
                >
                  {uploading ? 'Uploading...' : 'Submit Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
