import React from 'react';
import {
  Lock,
  Unlock,
  Trophy,
  QrCode,
  PlusCircle,
  FileDown,
  Settings,
  AlertCircle,
  Sparkles,
  LogOut,
  Users
} from 'lucide-react';
import { SECTIONS, SectionCode } from '../data/seedData';
import { SectionSessionState } from '../lib/storage';

interface TeacherBarProps {
  currentSection: SectionCode;
  onSelectSection: (section: SectionCode) => void;
  sessionState: SectionSessionState;
  onToggleInvesting: (open: boolean) => void;
  onRevealLeaderboard: () => void;
  onOpenProjectorModal: () => void;
  onOpenRegisterModal: () => void;
  onOpenSettingsModal: () => void;
  onExportCSV: () => void;
  onLogoutTeacher: () => void;
  onChangeEligibleInvestors?: (count: number) => void;
  totalGamesInSection: number;
  cloudSyncStatus?: 'synced' | 'syncing' | 'offline';
}

export const TeacherBar: React.FC<TeacherBarProps> = ({
  currentSection,
  onSelectSection,
  sessionState,
  onToggleInvesting,
  onRevealLeaderboard,
  onOpenProjectorModal,
  onOpenRegisterModal,
  onOpenSettingsModal,
  onExportCSV,
  onLogoutTeacher,
  onChangeEligibleInvestors,
  totalGamesInSection,
  cloudSyncStatus = 'offline',
}) => {
  const isInvestingOpen = sessionState.status === 'investing_open';
  const isRevealed = sessionState.status === 'results_revealed';

  return (
    <div className="bg-slate-900 border-b border-indigo-900/40 px-4 py-3 text-slate-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Section Selector & Status */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Teacher Hub:
            </span>
            <div className="relative inline-block">
              <select
                value={currentSection}
                onChange={(e) => onSelectSection(e.target.value as SectionCode)}
                aria-label="Select Grade 8 Section"
                className="bg-slate-950 border border-indigo-600/60 text-white font-extrabold text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
              >
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-slate-400 font-medium ml-1">
              ({totalGamesInSection} games)
            </span>
          </div>

          {/* Session Status Pill */}
          <div className="flex items-center gap-1.5">
            {isInvestingOpen ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Investing
              </span>
            ) : isRevealed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
                <Trophy className="w-3 h-3 text-yellow-400" />
                Leaderboard Revealed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                <AlertCircle className="w-3 h-3" />
                Investing Paused
              </span>
            )}
          </div>

          {/* Eligible Investors Count Control for Fair Normalization */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Eligible Class Size:</span>
            <input
              type="number"
              min={1}
              max={40}
              value={sessionState.eligibleInvestorsCount || 12}
              onChange={(e) => {
                const count = Math.max(1, parseInt(e.target.value) || 12);
                if (onChangeEligibleInvestors) onChangeEligibleInvestors(count);
              }}
              title="Class size used for normalized fairness score calculation"
              className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-center text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Cloud Sync indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            {cloudSyncStatus === 'synced' ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Cloud Synced
              </span>
            ) : cloudSyncStatus === 'syncing' ? (
              <span className="inline-flex items-center gap-1 text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40 animate-pulse">
                Syncing...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Local Device
              </span>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Toggle Investing */}
          <button
            onClick={() => onToggleInvesting(!isInvestingOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isInvestingOpen
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isInvestingOpen ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Close Investing</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Open Investing</span>
              </>
            )}
          </button>

          {/* Reveal Leaderboard Button */}
          <button
            onClick={onRevealLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-slate-950 transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Reveal Leaderboard</span>
          </button>

          {/* Projector Gallery QR */}
          <button
            onClick={onOpenProjectorModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/50 transition-all cursor-pointer"
            title="Display large QR code for classroom smartboard/projector"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Projector QR</span>
          </button>

          {/* Register New Game */}
          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950 border border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/50 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Add Game</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            title="Export Section Results to CSV with Formula Injection Protection"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>CSV Export</span>
          </button>

          {/* Settings / Database Config */}
          <button
            onClick={onOpenSettingsModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Database, Supabase & Teacher Settings"
            aria-label="Teacher Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Lock / Logout Teacher Admin */}
          <button
            onClick={onLogoutTeacher}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-950/60 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60 hover:text-white transition-all cursor-pointer ml-1"
            title="Lock teacher admin and return to student view"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Lock</span>
          </button>
        </div>
      </div>
    </div>
  );
};
