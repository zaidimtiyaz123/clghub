import React, { useRef, useState } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  enableTilt?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  accentColor,
  enableTilt = true,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -4;
    const rY = ((x - centerX) / centerX) * 4;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: enableTilt
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${
              isHovered ? 'translateZ(4px)' : 'translateZ(0px)'
            }`
          : undefined,
        transition: isHovered
          ? 'transform 0.1s cubic-bezier(0.16, 1, 0.3, 1)'
          : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        borderColor: isHovered ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.08)',
      }}
      className={`relative overflow-hidden rounded-2xl border bg-zinc-950/80 backdrop-blur-xl shadow-2xl transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Specular ambient monochrome highlight */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
          opacity: isHovered ? 0.6 : 0.2,
        }}
      />
      {children}
    </div>
  );
};
