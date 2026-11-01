import React from 'react';
import { GalleryImage } from '../../types';
import { X, Heart, User } from 'lucide-react';

interface LightboxModalProps {
  image: GalleryImage | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  image,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !image) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full rounded-2xl overflow-hidden border border-white/20 bg-zinc-950 shadow-2xl flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* High-res image display */}
        <div className="relative max-h-[65vh] w-full flex items-center justify-center bg-black overflow-hidden">
          <img
            src={image.imageUrl}
            alt={image.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Metadata bar */}
        <div className="p-5 bg-zinc-950 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-bold">
                {image.clubName}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {image.albumName}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{image.title}</h3>
            {image.caption && (
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                {image.caption}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0 text-zinc-400 font-mono text-[11px]">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>{image.uploaderName}</span>
            </div>

            <div className="flex items-center gap-1.5 text-white">
              <Heart className="w-4 h-4 fill-white" />
              <span>{image.likesCount || 18}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
