import React, { useState } from 'react';
import {
  Coins,
  Trophy,
  Gamepad2,
  Globe,
  Shield,
  Sparkles,
  GraduationCap,
  HeartHandshake,
  PlusCircle,
  ChevronDown
} from 'lucide-react';
import { SectionCode } from '../data/seedData';

export type UserRole = 'student' | 'teacher' | 'parent';
export type ActiveTab = 'gallery' | 'classroom_leaderboard' | 'consolidated_leaderboard' | 'ptm_finals';

interface NavbarProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentSection: SectionCode;
  studentInvestor: {
    name: string;
    teamName?: string;
    investorId: string;
  };
  totalInvested: number;
  maxBudget?: number;
  onOpenIdentityModal: () => void;
  onOpenSubmitGameModal: () => void;
  parentName?: string;
  parentRemainingVIP?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onChangeRole,
  activeTab,
  onTabChange,
  currentSection,
  studentInvestor,
  totalInvested,
  maxBudget = 100,
  onOpenIdentityModal,
  onOpenSubmitGameModal,
  parentName = 'Parent / Guest Investor',
  parentRemainingVIP = 500,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const remainingCoins = Math.max(0, maxBudget - totalInvested);

  return (
    <header className="sticky top-0 z-30 border-b border-cyan-900/40 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Tagline with Al-Rowad International Schools Logo */}
          <div className="flex items-center gap-3">
            <div className="relative group flex items-center justify-center">
              <img
                src="/school-logo.svg"
                alt="Al-Rowad International Schools"
                className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(30,165,233,0.5)] group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-wider text-xl sm:text-2xl bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  AI GAME ARENA
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-purple-900/60 text-purple-300 border border-purple-500/30">
                  Investor Edition
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 hidden sm:flex">
                <span className="font-bold text-cyan-400">Al-Rowad International Schools</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Grade 8 (Section {currentSection})</span>
              </p>
            </div>
          </div>

          {/* Role-Specific Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800" aria-label="Role Navigation">
            {currentRole === 'student' && (
              <>
                <button
                  onClick={() => onTabChange('gallery')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'gallery'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4 text-cyan-300" />
                  <span>Arcade Games ({currentSection})</span>
                </button>
                <button
                  onClick={onOpenSubmitGameModal}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Submit My Game</span>
                </button>
                <button
                  onClick={() => onTabChange('classroom_leaderboard')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'classroom_leaderboard'
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md shadow-amber-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Trophy className="w-4 h-4 text-yellow-300" />
                  <span>Class Rank</span>
                </button>
              </>
            )}

            {currentRole === 'parent' && (
              <button
                onClick={() => onTabChange('ptm_finals')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-pink-300" />
                <span>Shark Tank Finals Arcade</span>
              </button>
            )}

            {currentRole === 'teacher' && (
              <>
                <button
                  onClick={() => onTabChange('gallery')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'gallery'
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Section {currentSection}</span>
                </button>
                <button
                  onClick={() => onTabChange('classroom_leaderboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'classroom_leaderboard'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Class Rank</span>
                </button>
                <button
                  onClick={() => onTabChange('consolidated_leaderboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'consolidated_leaderboard'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>All 12 Sections</span>
                </button>
                <button
                  onClick={() => onTabChange('ptm_finals')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'ptm_finals'
                      ? 'bg-pink-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Shark Tank (PTM)</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Area: Role-Specific Wallet & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Student Wallet */}
            {currentRole === 'student' && (
              <button
                onClick={onOpenIdentityModal}
                title="Click to view/change your student investor profile"
                className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-800/40 hover:border-cyan-500/60 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <Coins className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold text-amber-300">
                      {remainingCoins} AI Coins
                    </span>
                    <span className="text-[10px] text-slate-400">left</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-medium truncate max-w-[110px]">
                    {studentInvestor.name}
                  </div>
                </div>
              </button>
            )}

            {/* Parent Wallet */}
            {currentRole === 'parent' && (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-pink-800/40">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-extrabold text-pink-300 block">
                    {parentRemainingVIP} VIP Credits
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px] block">
                    {parentName}
                  </span>
                </div>
              </div>
            )}

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  currentRole === 'teacher'
                    ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-300 hover:bg-indigo-900/60'
                    : currentRole === 'student'
                    ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300 hover:bg-cyan-900/60'
                    : 'bg-pink-950/80 border-pink-500/60 text-pink-300 hover:bg-pink-900/60'
                }`}
                title="Switch Portal Role"
              >
                {currentRole === 'teacher' ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Teacher Admin</span>
                  </>
                ) : currentRole === 'student' ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Student Portal</span>
                  </>
                ) : (
                  <>
                    <HeartHandshake className="w-3.5 h-3.5 text-pink-400" />
                    <span>Parent Portal</span>
                  </>
                )}
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              {/* Role Dropdown Popup */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">
                    Select Portal View
                  </div>
                  <button
                    onClick={() => {
                      onChangeRole('student');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors text-left cursor-pointer ${
                      currentRole === 'student'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-bold">Student Portal</div>
                      <div className="text-[10px] text-slate-400 font-normal">Play & Invest 100 AI Coins</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onChangeRole('parent');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors text-left mt-1 cursor-pointer ${
                      currentRole === 'parent'
                        ? 'bg-pink-950 text-pink-300 border border-pink-800'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4 text-pink-400" />
                    <div>
                      <div className="font-bold">Parent / Guest Portal</div>
                      <div className="text-[10px] text-slate-400 font-normal">Shark Tank PTM Finals (500 VIP)</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onChangeRole('teacher');
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors text-left mt-1 cursor-pointer ${
                      currentRole === 'teacher'
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="font-bold">Teacher Admin Hub</div>
                      <div className="text-[10px] text-slate-400 font-normal">Requires Teacher PIN Auth</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-800/80 overflow-x-auto gap-2">
          {currentRole === 'student' && (
            <>
              <button
                onClick={() => onTabChange('gallery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  activeTab === 'gallery' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                Arcade Games
              </button>
              <button
                onClick={onOpenSubmitGameModal}
                className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-emerald-600 text-white cursor-pointer"
              >
                + Submit Game
              </button>
              <button
                onClick={() => onTabChange('classroom_leaderboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  activeTab === 'classroom_leaderboard' ? 'bg-amber-600 text-white' : 'text-slate-400'
                }`}
              >
                Class Rank
              </button>
            </>
          )}

          {currentRole === 'parent' && (
            <button
              onClick={() => onTabChange('ptm_finals')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap bg-pink-600 text-white cursor-pointer"
            >
              Shark Tank Finals
            </button>
          )}

          {currentRole === 'teacher' && (
            <>
              <button
                onClick={() => onTabChange('gallery')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  activeTab === 'gallery' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                Gallery ({currentSection})
              </button>
              <button
                onClick={() => onTabChange('classroom_leaderboard')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  activeTab === 'classroom_leaderboard' ? 'bg-amber-600 text-white' : 'text-slate-400'
                }`}
              >
                Class Rank
              </button>
              <button
                onClick={() => onTabChange('consolidated_leaderboard')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  activeTab === 'consolidated_leaderboard' ? 'bg-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                All 12 Sections
              </button>
              <button
                onClick={() => onTabChange('ptm_finals')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  activeTab === 'ptm_finals' ? 'bg-pink-600 text-white' : 'text-slate-400'
                }`}
              >
                Shark Tank PTM
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
