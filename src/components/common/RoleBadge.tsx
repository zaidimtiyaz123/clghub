import React from 'react';
import { SystemRole, ClubRole } from '../../types';

interface RoleBadgeProps {
  role: SystemRole | ClubRole;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const isSm = size === 'sm';

  switch (role) {
    case 'HOD':
      return (
        <span
          className={`inline-flex items-center font-mono font-bold uppercase tracking-wider text-black bg-white rounded px-2 py-0.5 shadow-sm ${
            isSm ? 'text-[10px]' : 'text-xs'
          }`}
        >
          HOD · Super Admin
        </span>
      );
    case 'PRESIDENT':
      return (
        <span
          className={`inline-flex items-center font-mono font-semibold uppercase tracking-wider text-white bg-zinc-800 border border-zinc-600 rounded px-2 py-0.5 ${
            isSm ? 'text-[10px]' : 'text-xs'
          }`}
        >
          President
        </span>
      );
    case 'VICE_PRESIDENT':
      return (
        <span
          className={`inline-flex items-center font-mono font-semibold uppercase tracking-wider text-zinc-300 bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 ${
            isSm ? 'text-[10px]' : 'text-xs'
          }`}
        >
          Vice President
        </span>
      );
    case 'MEMBER':
    default:
      return (
        <span
          className={`inline-flex items-center font-mono text-zinc-400 bg-black/60 border border-zinc-800 rounded px-2 py-0.5 ${
            isSm ? 'text-[10px]' : 'text-xs'
          }`}
        >
          Member
        </span>
      );
  }
};
