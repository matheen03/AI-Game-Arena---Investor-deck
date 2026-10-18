import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  GraduationCap,
  HeartHandshake,
  Copy,
  Check,
  Gamepad2,
  ExternalLink
} from 'lucide-react';
import { SectionCode } from '../data/seedData';
import { Game } from '../utils/rules';

interface ProjectorModalProps {
  section: SectionCode;
  onClose: () => void;
  totalGames: number;
  games?: Game[];
}

export const ProjectorModal: React.FC<ProjectorModalProps> = ({
  section,
  onClose,
  games = [],
}) => {
  const [activeQrTarget, setActiveQrTarget] = useState<'student' | 'parent' | 'game'>('student');
  const [selectedGameId, setSelectedGameId] = useState<string>(games[0]?.id || '');
  const [isCopied, setIsCopied] = useState(false);

  // Generate clean origin URL
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://ai-game-arena.netlify.app';

  const studentUrl = `${baseUrl}?role=student&section=${section}`;
  const parentUrl = `${baseUrl}?role=parent`;
  const selectedGame = games.find((g) => g.id === selectedGameId) || games[0];
  const gameUrl = selectedGame?.netlifyUrl || studentUrl;

  const currentDisplayUrl =
    activeQrTarget === 'student' ? studentUrl :
    activeQrTarget === 'parent' ? parentUrl :
    gameUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentDisplayUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-center arcade-glow-cyan my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* QR Code Target Tabs: Student vs Parent vs Game */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-950 border border-slate-800 mb-6 flex-wrap justify-center gap-1">
          <button
            onClick={() => setActiveQrTarget('student')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              activeQrTarget === 'student'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Access QR (Section {section})</span>
          </button>
          <button
            onClick={() => setActiveQrTarget('parent')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              activeQrTarget === 'parent'
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Parent Shark Tank QR (PTM)</span>
          </button>
          {games.length > 0 && (
            <button
              onClick={() => setActiveQrTarget('game')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                activeQrTarget === 'game'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Project Game QR</span>
            </button>
          )}
        </div>

        {/* TARGET 1: STUDENT ACCESS QR (Grade 8 Classroom) */}
        {activeQrTarget === 'student' && (
          <div>
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <img
                src="/school-logo.svg"
                alt="Al-Rowad International Schools"
                className="w-11 h-11 object-contain drop-shadow-[0_0_12px_rgba(30,165,233,0.5)]"
              />
              <div className="text-left">
                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-widest block">
                  Al-Rowad International Schools
                </span>
                <span className="text-[10px] text-slate-400">
                  Grade 8 • Section {section} Classroom Session
                </span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
              Student Access QR Code
            </h2>
            <p className="text-xs sm:text-sm text-cyan-200/90 font-medium max-w-xl mx-auto mb-5">
              Students: Scan with your phone camera to open Section {section} arcade portal!
            </p>
            {/* High-Contrast QR Code */}
            <div className="inline-block p-5 bg-white rounded-3xl shadow-2xl mb-5 transform hover:scale-102 transition-transform">
              <QRCodeSVG
                value={studentUrl}
                size={220}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left mb-6">
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-cyan-800/40 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 font-black text-xs border border-cyan-800">1</div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Scan with Phone</h4>
                  <p className="text-[11px] text-slate-400">Open mobile camera or browser</p>
                </div>
              </div>
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-cyan-800/40 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 font-black text-xs border border-emerald-800">2</div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Enter Project Details</h4>
                  <p className="text-[11px] text-slate-400">Student 1, Title & Netlify link</p>
                </div>
              </div>
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-cyan-800/40 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-950 text-amber-400 font-black text-xs border border-amber-800">3</div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Play & Invest</h4>
                  <p className="text-[11px] text-slate-400">Allocate your 100 AI Coins</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TARGET 2: PARENT ACCESS QR (Shark Tank PTM Finals) */}
        {activeQrTarget === 'parent' && (
          <div>
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <img
                src="/school-logo.svg"
                alt="Al-Rowad International Schools"
                className="w-11 h-11 object-contain drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]"
              />
              <div className="text-left">
                <span className="text-[11px] font-bold text-pink-300 uppercase tracking-widest block">
                  Al-Rowad International Schools
                </span>
                <span className="text-[10px] text-slate-400">
                  Shark Tank Investor Arcade • Parent-Teacher Meeting
                </span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
              Parent & Guest Shark Tank QR
            </h2>
            <p className="text-xs sm:text-sm text-pink-200/90 font-medium max-w-xl mx-auto mb-5">
              Welcome parents & guests! Scan to test play school-wide finalists and cast your 500 VIP credits.
            </p>
            <div className="inline-block p-5 bg-white rounded-3xl shadow-2xl mb-5 transform hover:scale-102 transition-transform">
              <QRCodeSVG
                value={parentUrl}
                size={220}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left mb-6">
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-pink-800/40 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-pink-950 text-pink-400 font-black text-xs border border-pink-800">1</div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Scan with Phone</h4>
                  <p className="text-[11px] text-slate-400">Instant VIP mobile access</p>
                </div>
              </div>
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-pink-800/40 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-950 text-purple-400 font-black text-xs border border-purple-800">2</div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Play Finalist Games</h4>
                  <p className="text-[11px] text-slate-400">Test AI games from 8A–8L</p>
                </div>
              </div>
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-pink-800/40 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-950 text-amber-400 font-black text-xs border border-amber-800">3</div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">Cast 500 VIP Credits</h4>
                  <p className="text-[11px] text-slate-400">Vote for Champion & Favorite</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TARGET 3: SINGLE GAME DIRECT QR */}
        {activeQrTarget === 'game' && selectedGame && (
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-widest bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800">
                Direct Netlify Game Projector
              </span>
            </div>
            <div className="max-w-md mx-auto mb-4">
              <label className="block text-xs text-slate-400 mb-1 font-semibold text-left">
                Select game to spotlight on projector:
              </label>
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="w-full bg-slate-950 border border-purple-500/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.gameTitle} • {g.teamName || g.student1} (Section {g.section})
                  </option>
                ))}
              </select>
            </div>
            <h3 className="text-2xl font-black text-white mb-1">
              {selectedGame.gameTitle}
            </h3>
            <p className="text-xs text-purple-300 mb-4">
              By {selectedGame.student2 ? `${selectedGame.student1} & ${selectedGame.student2}` : selectedGame.student1} • {selectedGame.teamName}
            </p>
            <div className="inline-block p-5 bg-white rounded-3xl shadow-2xl mb-4 transform hover:scale-102 transition-transform">
              <QRCodeSVG
                value={selectedGame.netlifyUrl}
                size={220}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-xs text-slate-300 max-w-md mx-auto mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Direct Netlify URL:</span>
              <a
                href={selectedGame.netlifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-cyan-400 font-bold hover:underline flex items-center justify-center gap-1"
              >
                <span>{selectedGame.netlifyUrl}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Copy Link Footer */}
        <div className="flex items-center justify-center gap-2 max-w-lg mx-auto pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400 font-mono bg-slate-950 py-2 px-3.5 rounded-xl truncate border border-slate-800 flex-1 text-left">
            URL: <span className="text-cyan-400 font-bold">{currentDisplayUrl}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
