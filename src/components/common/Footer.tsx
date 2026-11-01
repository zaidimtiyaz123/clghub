import React from 'react';

interface FooterProps {
  onNavigate: (tab: string, slug?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-white/10 bg-black py-12 text-sm text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/20" />
              <span>Apex College Clubs Hub</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              The official collegiate network uniting all 6 student guilds: Code Crackers, Innovation, Devspire, Sports, Social responsibility sankalpa, and Cultural. Governed under the Office of the Head of Department.
            </p>
            <div className="text-xs text-zinc-500 pt-1 font-mono">
              Apex Institute of Technology · Dean of Student Affairs & Technical Guilds
            </div>
          </div>

          <div>
            <div className="font-semibold text-xs uppercase tracking-wider text-zinc-300 mb-3 font-mono">
              The 6 Guilds
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('club-detail', 'code-crackers')}
                  className="hover:text-white transition-colors"
                >
                  Code Crackers
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('club-detail', 'innovation')}
                  className="hover:text-white transition-colors"
                >
                  Innovation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('club-detail', 'devspire')}
                  className="hover:text-white transition-colors"
                >
                  Devspire
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('club-detail', 'sports')}
                  className="hover:text-white transition-colors"
                >
                  Sports
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('club-detail', 'sankalpa')}
                  className="hover:text-white transition-colors"
                >
                  Social responsibility sankalpa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('club-detail', 'cultural')}
                  className="hover:text-white transition-colors"
                >
                  Cultural
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-xs uppercase tracking-wider text-zinc-300 mb-3 font-mono">
              Quick Navigation
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">
                  Home Portal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('clubs')} className="hover:text-white transition-colors">
                  All 6 Clubs Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('events')} className="hover:text-white transition-colors">
                  Events & Schedule
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} className="hover:text-white transition-colors">
                  Photo & Media Gallery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('chat')} className="hover:text-white transition-colors">
                  Guild Chatrooms
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('login')} className="hover:text-white font-bold transition-colors">
                  Sign In / Register
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
          <div>
            © {new Date().getFullYear()} Apex College Clubs Hub · Built for Student Leadership & Guilds
          </div>
          <div className="flex items-center gap-4 text-zinc-500 font-mono text-[11px]">
            <span>Student Affairs Office</span>
            <span>·</span>
            <span>Annex 301</span>
            <span>·</span>
            <span>clubs@apex.edu</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
