import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Gamepad2,
  Coins,
  Trophy,
  PlusCircle,
  Shield,
  Search,
  Filter,
  X,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Navbar, ActiveTab, UserRole } from './components/Navbar';
import { TeacherBar } from './components/TeacherBar';
import { GameCard } from './components/GameCard';
import { PlayModal } from './components/PlayModal';
import { InvestModal } from './components/InvestModal';
import { ProjectorModal } from './components/ProjectorModal';
import { RegisterGameModal } from './components/RegisterGameModal';
import { ClassroomLeaderboardView } from './components/ClassroomLeaderboardView';
import { ConsolidatedLeaderboardView } from './components/ConsolidatedLeaderboardView';
import { PTMSharkTankView } from './components/PTMSharkTankView';
import { IdentityModal } from './components/IdentityModal';
import { TeacherSettingsModal } from './components/TeacherSettingsModal';
import {
  Game,
  Investment,
  PTMInvestment,
  computeLeaderboard,
  exportLeaderboardToCSV,
  isSelfInvestment,
  validateCoinAllocation,
  validatePTMInvestment
} from './utils/rules';
import {
  SECTIONS,
  CATEGORIES,
  SectionCode,
  INITIAL_GAMES,
  INITIAL_INVESTMENTS,
  INITIAL_PTM_INVESTMENTS,
  SECTION_ROSTERS
} from './data/seedData';
import {
  loadLocalData,
  saveLocalData,
  AppStateData,
  SectionSessionState,
  getDefaultSessions,
  hashPin,
  DEFAULT_TEACHER_PIN_HASH,
  getSupabaseClient,
  fetchFromSupabase,
  pushGameToSupabase,
  pushInvestmentToSupabase,
  pushPTMInvestmentToSupabase,
  pushSectionStateToSupabase,
  setupSupabaseRealtime
} from './lib/storage';

export default function App() {
  // Read URL params
  const urlParams = useMemo(() => {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  // Teacher Authentication state: Check session storage
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('AI_TEACHER_AUTH') === 'true';
  });

  // Security fix 1: NEVER bypass teacher authentication with ?role=teacher!
  // If not authenticated, force student role and prompt for PIN if requested.
  const initialRole: UserRole = useMemo(() => {
    const roleParam = urlParams.get('role');
    if (roleParam === 'teacher') {
      const isAuth = typeof window !== 'undefined' && sessionStorage.getItem('AI_TEACHER_AUTH') === 'true';
      return isAuth ? 'teacher' : 'student';
    }
    if (roleParam === 'parent' || roleParam === 'ptm') return 'parent';
    return 'student';
  }, [urlParams]);

  const initialSection: SectionCode = useMemo(() => {
    const secParam = urlParams.get('section')?.toUpperCase();
    if (secParam && SECTIONS.includes(secParam as SectionCode)) {
      return secParam as SectionCode;
    }
    return '8A';
  }, [urlParams]);

  // Persistent app data
  const [appData, setAppData] = useState<AppStateData>(() => loadLocalData());
  const [currentSection, setCurrentSection] = useState<SectionCode>(initialSection);
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);

  // Teacher PIN Modal & Rate Limiting
  const [isTeacherPinModalOpen, setIsTeacherPinModalOpen] = useState<boolean>(() => {
    // If user attempted to access ?role=teacher but was not authenticated, show PIN modal
    return urlParams.get('role') === 'teacher' && !isTeacherAuthenticated;
  });
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [failedPinAttempts, setFailedPinAttempts] = useState<number>(0);
  const [pinLockedUntil, setPinLockedUntil] = useState<number>(0);

  // Active Tab based on role
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (initialRole === 'parent') return 'ptm_finals';
    return 'gallery';
  });

  // Student Investor Profile (backed by Grade 8 official roster)
  const [studentInvestor, setStudentInvestor] = useState<{
    name: string;
    teamName?: string;
    investorId: string;
  }>(() => {
    const saved = localStorage.getItem('AI_STUDENT_INVESTOR');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    // Default to first roster student in 8A
    const defaultRoster = SECTION_ROSTERS['8A'][0];
    return {
      name: defaultRoster.name,
      teamName: defaultRoster.teamName,
      investorId: defaultRoster.id
    };
  });

  // Parent name state (with 500 VIP budget)
  const [parentName, setParentName] = useState<string>(() => {
    return localStorage.getItem('AI_PARENT_NAME') || 'Dr. Tariq Al-Ghamdi (Parent)';
  });

  // Modals state
  const [selectedGameForPlay, setSelectedGameForPlay] = useState<Game | null>(null);
  const [selectedGameForInvest, setSelectedGameForInvest] = useState<Game | null>(null);
  const [isProjectorModalOpen, setIsProjectorModalOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Gallery Filters
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('ALL');
  const [gallerySearch, setGallerySearch] = useState<string>('');

  // Supabase Sync Status
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('offline');

  // Persist state whenever appData changes locally
  useEffect(() => {
    saveLocalData(appData);
  }, [appData]);

  // Persist student investor
  useEffect(() => {
    localStorage.setItem('AI_STUDENT_INVESTOR', JSON.stringify(studentInvestor));
  }, [studentInvestor]);

  // -------------------------------------------------------------------------
  // Supabase Cloud Sync Integration (Live Sync & Realtime Listener)
  // -------------------------------------------------------------------------
  const syncWithSupabase = useCallback(async () => {
    const client = getSupabaseClient(appData.supabaseConfig);
    if (!client) {
      setCloudSyncStatus('offline');
      return;
    }

    setCloudSyncStatus('syncing');
    const result = await fetchFromSupabase(client);
    if (result.success && result.data) {
      setAppData((prev) => ({
        ...prev,
        games: result.data?.games && result.data.games.length > 0 ? result.data.games : prev.games,
        investments: result.data?.investments ?? prev.investments,
        ptmInvestments: result.data?.ptmInvestments ?? prev.ptmInvestments,
        sessions: result.data?.sessions ?? prev.sessions
      }));
      setCloudSyncStatus('synced');
    } else {
      setCloudSyncStatus('offline');
    }
  }, [appData.supabaseConfig]);

  // Setup Supabase sync and realtime listener on mount / config change
  useEffect(() => {
    const client = getSupabaseClient(appData.supabaseConfig);
    if (!client) {
      setCloudSyncStatus('offline');
      return;
    }

    syncWithSupabase();

    // Subscribe to realtime database changes across all tables
    const cleanupRealtime = setupSupabaseRealtime(client, () => {
      syncWithSupabase();
    });

    return () => {
      cleanupRealtime();
    };
  }, [appData.supabaseConfig, syncWithSupabase]);

  // -------------------------------------------------------------------------
  // Role Switching & Teacher PIN Authentication (Security Hardened)
  // -------------------------------------------------------------------------
  const handleRoleChange = (targetRole: UserRole) => {
    if (targetRole === 'teacher') {
      if (!isTeacherAuthenticated) {
        setPinInput('');
        setPinError(null);
        setIsTeacherPinModalOpen(true);
        return;
      }
      setCurrentRole('teacher');
      return;
    }
    setCurrentRole(targetRole);
    if (targetRole === 'parent') {
      setActiveTab('ptm_finals');
    } else {
      setActiveTab('gallery');
    }
  };

  const handleLogoutTeacher = () => {
    setIsTeacherAuthenticated(false);
    sessionStorage.removeItem('AI_TEACHER_AUTH');
    setCurrentRole('student');
    setActiveTab('gallery');
  };

  const handleVerifyTeacherPin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate-limiting check
    const now = Date.now();
    if (now < pinLockedUntil) {
      const waitSec = Math.ceil((pinLockedUntil - now) / 1000);
      setPinError(`Too many failed attempts. Locked for ${waitSec} more seconds.`);
      return;
    }

    if (!pinInput.trim()) {
      setPinError('Please enter teacher PIN.');
      return;
    }

    const hashedInput = await hashPin(pinInput.trim());
    const targetHash = appData.teacherPinHash || DEFAULT_TEACHER_PIN_HASH;

    if (hashedInput === targetHash) {
      setIsTeacherAuthenticated(true);
      sessionStorage.setItem('AI_TEACHER_AUTH', 'true');
      setIsTeacherPinModalOpen(false);
      setCurrentRole('teacher');
      setFailedPinAttempts(0);
      setPinError(null);
    } else {
      const nextFailed = failedPinAttempts + 1;
      setFailedPinAttempts(nextFailed);

      if (nextFailed >= 5) {
        setPinLockedUntil(now + 30000); // Lock for 30s
        setPinError('Incorrect PIN. 5 failed attempts reached. Locked for 30 seconds.');
      } else {
        setPinError(`Incorrect Teacher PIN. (${5 - nextFailed} attempts remaining)`);
      }
    }
  };

  // Current section session state
  const currentSessionState: SectionSessionState = useMemo(() => {
    return (
      appData.sessions[currentSection] || {
        status: currentSection === '8A' ? 'investing_open' : 'not_started',
        eligibleInvestorsCount: 12,
        lastUpdated: new Date().toISOString()
      }
    );
  }, [appData.sessions, currentSection]);

  // Filter games for current section
  const sectionGames = useMemo(() => {
    return appData.games.filter((g) => g.section === currentSection);
  }, [appData.games, currentSection]);

  // Student investments in current section
  const mySectionInvestments = useMemo(() => {
    return appData.investments.filter(
      (inv) => inv.section === currentSection && inv.investorId === studentInvestor.investorId
    );
  }, [appData.investments, currentSection, studentInvestor.investorId]);

  const totalInvestedByMe = useMemo(() => {
    return mySectionInvestments.reduce((sum, inv) => sum + inv.coins, 0);
  }, [mySectionInvestments]);

  // Fair Normalization Map: Uses each section's eligibleInvestorsCount (Fairness Model)
  const sectionEligibleInvestorsMap = useMemo(() => {
    const map: Record<string, number> = {};
    SECTIONS.forEach((sec) => {
      map[sec] = appData.sessions[sec]?.eligibleInvestorsCount || 12;
    });
    return map;
  }, [appData.sessions]);

  // Classroom Leaderboard for current section
  const sectionLeaderboard = useMemo(() => {
    const sectionInv = appData.investments.filter((inv) => inv.section === currentSection);
    return computeLeaderboard(sectionGames, sectionInv, sectionEligibleInvestorsMap);
  }, [sectionGames, appData.investments, currentSection, sectionEligibleInvestorsMap]);

  // School-wide Consolidated Leaderboard for all 12 sections
  const consolidatedLeaderboard = useMemo(() => {
    return computeLeaderboard(appData.games, appData.investments, sectionEligibleInvestorsMap);
  }, [appData.games, appData.investments, sectionEligibleInvestorsMap]);

  // All Qualified Finalists for Shark Tank PTM
  const finalists = useMemo(() => {
    return appData.games.filter((g) => g.isFinalist);
  }, [appData.games]);

  // Stable parent ID
  const parentId = `PARENT_VIP_${parentName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const totalSpentByParent = useMemo(() => {
    return appData.ptmInvestments
      .filter((i) => i.investorId === parentId)
      .reduce((sum, i) => sum + i.coins, 0);
  }, [appData.ptmInvestments, parentId]);
  const parentRemainingVIP = Math.max(0, 500 - totalSpentByParent);

  // -------------------------------------------------------------------------
  // Handlers for Investing & Project Submissions
  // -------------------------------------------------------------------------
  const handleInvestInGame = (gameId: string, coins: number) => {
    // Session state check
    if (currentSessionState.status !== 'investing_open') {
      alert('Investing is currently closed for this section.');
      return;
    }

    const targetGame = appData.games.find((g) => g.id === gameId);
    if (!targetGame) return;

    // Self-team investment check
    if (
      isSelfInvestment(studentInvestor.teamName, targetGame.teamName, targetGame.student1, targetGame.student2) ||
      isSelfInvestment(studentInvestor.name, targetGame.teamName, targetGame.student1, targetGame.student2)
    ) {
      alert("Fair play rule: You cannot invest in your own team's project.");
      return;
    }

    // Budget check
    const otherInvestments = mySectionInvestments.filter((i) => i.gameId !== gameId);
    const otherCoins = otherInvestments.reduce((sum, i) => sum + i.coins, 0);
    const validation = validateCoinAllocation(coins, otherCoins, 100);
    if (!validation.valid) {
      alert(validation.error || 'Invalid coin allocation.');
      return;
    }

    const otherSectionInv = appData.investments.filter(
      (inv) => !(inv.section === currentSection && inv.gameId === gameId && inv.investorId === studentInvestor.investorId)
    );

    let newRecord: Investment | null = null;
    let updatedInvestments = otherSectionInv;

    if (coins > 0) {
      newRecord = {
        id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        section: currentSection,
        gameId,
        investorId: studentInvestor.investorId,
        investorName: studentInvestor.name,
        studentTeamName: studentInvestor.teamName,
        coins,
        timestamp: new Date().toISOString()
      };
      updatedInvestments = [...otherSectionInv, newRecord];
    }

    setAppData((prev) => ({
      ...prev,
      investments: updatedInvestments
    }));

    // Async push to Supabase if connected
    const client = getSupabaseClient(appData.supabaseConfig);
    if (client && newRecord) {
      pushInvestmentToSupabase(client, newRecord);
    }
  };

  const handleSubmitPTMInvestment = (
    gameId: string,
    coins: number,
    pName: string,
    pId: string
  ) => {
    setParentName(pName);

    // Validate 500 VIP parent budget strictly
    const existing = appData.ptmInvestments.find((i) => i.investorId === pId && i.gameId === gameId)?.coins || 0;
    const otherSpent = totalSpentByParent - existing;
    const validation = validatePTMInvestment(coins, existing, otherSpent, 500);

    if (!validation.valid) {
      alert(validation.error || 'VIP credit allocation exceeds 500 budget limit.');
      return;
    }

    const otherPtm = appData.ptmInvestments.filter(
      (inv) => !(inv.investorId === pId && inv.gameId === gameId)
    );

    const newRecord: PTMInvestment = {
      id: `ptm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      gameId,
      investorId: pId,
      parentName: pName,
      coins,
      timestamp: new Date().toISOString()
    };

    setAppData((prev) => ({
      ...prev,
      ptmInvestments: [...otherPtm, newRecord]
    }));

    // Async push to Supabase
    const client = getSupabaseClient(appData.supabaseConfig);
    if (client) {
      pushPTMInvestmentToSupabase(client, newRecord);
    }
  };

  const handleRegisterGame = (gameData: Omit<Game, 'id' | 'createdAt'>) => {
    // Non-teachers can only submit to currentSection
    const targetSection = currentRole === 'teacher' ? gameData.section : currentSection;

    // Student submitted games are unverified by default (isVerified: false)
    const isVerified = currentRole === 'teacher' ? gameData.isVerified : false;

    const newGame: Game = {
      ...gameData,
      section: targetSection,
      isVerified,
      id: `game-${targetSection.toLowerCase()}-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };

    setAppData((prev) => ({
      ...prev,
      games: [newGame, ...prev.games]
    }));

    // Async push to Supabase
    const client = getSupabaseClient(appData.supabaseConfig);
    if (client) {
      pushGameToSupabase(client, newGame);
    }
  };

  // -------------------------------------------------------------------------
  // Teacher Admin Controls
  // -------------------------------------------------------------------------
  const handleToggleInvesting = (open: boolean) => {
    const updatedState: SectionSessionState = {
      ...currentSessionState,
      status: open ? 'investing_open' : 'investing_closed',
      lastUpdated: new Date().toISOString()
    };

    setAppData((prev) => ({
      ...prev,
      sessions: {
        ...prev.sessions,
        [currentSection]: updatedState
      }
    }));

    const client = getSupabaseClient(appData.supabaseConfig);
    if (client) {
      pushSectionStateToSupabase(client, currentSection, updatedState);
    }
  };

  const handleRevealLeaderboard = () => {
    const updatedState: SectionSessionState = {
      ...currentSessionState,
      status: 'results_revealed',
      lastUpdated: new Date().toISOString()
    };

    setAppData((prev) => ({
      ...prev,
      sessions: {
        ...prev.sessions,
        [currentSection]: updatedState
      }
    }));

    const client = getSupabaseClient(appData.supabaseConfig);
    if (client) {
      pushSectionStateToSupabase(client, currentSection, updatedState);
    }

    setActiveTab('classroom_leaderboard');
  };

  const handleToggleVerify = (gameId: string) => {
    setAppData((prev) => {
      const updatedGames = prev.games.map((g) =>
        g.id === gameId ? { ...g, isVerified: !g.isVerified } : g
      );
      const target = updatedGames.find((g) => g.id === gameId);
      if (target) {
        const client = getSupabaseClient(prev.supabaseConfig);
        if (client) pushGameToSupabase(client, target);
      }
      return { ...prev, games: updatedGames };
    });
  };

  const handleToggleFinalist = (gameId: string) => {
    setAppData((prev) => {
      const updatedGames = prev.games.map((g) =>
        g.id === gameId ? { ...g, isFinalist: !g.isFinalist } : g
      );
      const target = updatedGames.find((g) => g.id === gameId);
      if (target) {
        const client = getSupabaseClient(prev.supabaseConfig);
        if (client) pushGameToSupabase(client, target);
      }
      return { ...prev, games: updatedGames };
    });
  };

  const handleChangeEligibleInvestors = (count: number) => {
    const updatedState: SectionSessionState = {
      ...currentSessionState,
      eligibleInvestorsCount: count,
      lastUpdated: new Date().toISOString()
    };

    setAppData((prev) => ({
      ...prev,
      sessions: {
        ...prev.sessions,
        [currentSection]: updatedState
      }
    }));

    const client = getSupabaseClient(appData.supabaseConfig);
    if (client) {
      pushSectionStateToSupabase(client, currentSection, updatedState);
    }
  };

  const handleExportSectionCSV = () => {
    const csv = exportLeaderboardToCSV(sectionLeaderboard);
    downloadFile(csv, `AI_Game_Arena_Section_${currentSection}_Results.csv`, 'text/csv');
  };

  const handleExportConsolidatedCSV = () => {
    const csv = exportLeaderboardToCSV(consolidatedLeaderboard);
    downloadFile(csv, `AI_Game_Arena_School_Wide_All_12_Sections.csv`, 'text/csv');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filtered gallery games
  const filteredGalleryGames = useMemo(() => {
    return sectionGames.filter((g) => {
      const matchCat = galleryCategoryFilter === 'ALL' || g.category === galleryCategoryFilter;
      const query = gallerySearch.toLowerCase().trim();
      const matchSearch =
        !query ||
        g.gameTitle.toLowerCase().includes(query) ||
        (g.teamName && g.teamName.toLowerCase().includes(query)) ||
        g.student1.toLowerCase().includes(query) ||
        (g.student2 && g.student2.toLowerCase().includes(query)) ||
        (g.description && g.description.toLowerCase().includes(query));
      return matchCat && matchSearch;
    });
  }, [sectionGames, galleryCategoryFilter, gallerySearch]);

  return (
    <div className="min-h-screen bg-[#070d1a] text-slate-100 flex flex-col arcade-grid-bg">
      {/* Top Role Navbar */}
      <Navbar
        currentRole={currentRole}
        onChangeRole={handleRoleChange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentSection={currentSection}
        studentInvestor={studentInvestor}
        totalInvested={totalInvestedByMe}
        maxBudget={100}
        onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
        onOpenSubmitGameModal={() => setIsRegisterModalOpen(true)}
        parentName={parentName}
        parentRemainingVIP={parentRemainingVIP}
      />

      {/* Teacher Hub Controls (ONLY displayed to Teacher Admin) */}
      {currentRole === 'teacher' && (
        <TeacherBar
          currentSection={currentSection}
          onSelectSection={(sec) => setCurrentSection(sec)}
          sessionState={currentSessionState}
          onToggleInvesting={handleToggleInvesting}
          onRevealLeaderboard={handleRevealLeaderboard}
          onOpenProjectorModal={() => setIsProjectorModalOpen(true)}
          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onExportCSV={handleExportSectionCSV}
          onLogoutTeacher={handleLogoutTeacher}
          onChangeEligibleInvestors={handleChangeEligibleInvestors}
          totalGamesInSection={sectionGames.length}
          cloudSyncStatus={cloudSyncStatus}
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {/* VIEW 1: GAME GALLERY (Student or Teacher) */}
        {activeTab === 'gallery' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
            {/* Gallery Hero Banner */}
            <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 p-6 sm:p-8 rounded-3xl border border-cyan-800/40 mb-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    GRADE 8 SECTION {currentSection} ARCADE
                  </span>
                  {currentSessionState.status === 'investing_open' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Investing Open
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      Investing Closed
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  Student Game Showcase
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
                  {currentRole === 'student'
                    ? 'Play peer-created Netlify games, scan real QR codes with your phone, and allocate your 100 AI Coins to the most innovative projects!'
                    : `Managing Section ${currentSection} projects and student investments.`}
                </p>
              </div>

              {/* Action Buttons tailored to role */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-102 active:scale-95 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-slate-950" />
                  <span>+ Submit Your Netlify Game</span>
                </button>
                <button
                  onClick={() => setActiveTab('classroom_leaderboard')}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md transition-all cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-slate-950 fill-current" />
                  <span>Class Rank</span>
                </button>
              </div>
            </div>

            {/* Quick Student Project Registration Helper Banner */}
            {currentRole === 'student' && (
              <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 flex-shrink-0">
                    <Gamepad2 className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Have an AI Game to Submit?</span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                        Takes 30 Seconds
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Required: <span className="text-cyan-300 font-medium">Student 1 Full Name</span>,{' '}
                      <span className="text-cyan-300 font-medium">Game Title</span>, and{' '}
                      <span className="text-cyan-300 font-medium">Netlify URL</span> (*.netlify.app).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition-all flex-shrink-0 cursor-pointer"
                >
                  + Enter Project Details
                </button>
              </div>
            )}

            {/* Gallery Search & Category Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  placeholder="Search game title, team, creator..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                  Category:
                </span>
                <select
                  value={galleryCategoryFilter}
                  onChange={(e) => setGalleryCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-white font-semibold text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  ({filteredGalleryGames.length} games)
                </span>
              </div>
            </div>

            {/* Game Grid */}
            {filteredGalleryGames.length === 0 ? (
              <div className="bg-slate-900/60 rounded-3xl p-12 text-center border border-slate-800">
                <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">No Games Found</h3>
                <p className="text-xs text-slate-400 mb-4">
                  No games registered yet in Section {currentSection}.
                </p>
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit the First Game in Section {currentSection}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGalleryGames.map((game) => {
                  const myInv = mySectionInvestments.find((i) => i.gameId === game.id)?.coins || 0;
                  const totalCoins = appData.investments
                    .filter((i) => i.gameId === game.id)
                    .reduce((sum, i) => sum + i.coins, 0);
                  const distinctInvestors = new Set(
                    appData.investments.filter((i) => i.gameId === game.id).map((i) => i.investorId)
                  ).size;

                  // Deep self-investment check
                  const isSelfTeam =
                    isSelfInvestment(studentInvestor.teamName, game.teamName, game.student1, game.student2) ||
                    isSelfInvestment(studentInvestor.name, game.teamName, game.student1, game.student2);

                  return (
                    <GameCard
                      key={game.id}
                      game={game}
                      totalCoinsInvested={totalCoins}
                      distinctInvestorsCount={distinctInvestors}
                      myInvestmentInGame={myInv}
                      remainingCoins={Math.max(0, 100 - totalInvestedByMe)}
                      isSelfTeam={isSelfTeam}
                      isInvestingOpen={currentSessionState.status === 'investing_open'}
                      onPlayGame={(g) => setSelectedGameForPlay(g)}
                      onInvestInGame={(g) => setSelectedGameForInvest(g)}
                      isTeacherMode={currentRole === 'teacher'}
                      onToggleVerify={handleToggleVerify}
                      onToggleFinalist={handleToggleFinalist}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: CLASSROOM LEADERBOARD */}
        {activeTab === 'classroom_leaderboard' && (
          <ClassroomLeaderboardView
            section={currentSection}
            entries={sectionLeaderboard}
            isRevealed={currentSessionState.status === 'results_revealed'}
            onReveal={handleRevealLeaderboard}
            isTeacherMode={currentRole === 'teacher'}
            onToggleFinalist={handleToggleFinalist}
            onPlayGame={(g) => setSelectedGameForPlay(g)}
            onExportCSV={handleExportSectionCSV}
            onViewSchoolWide={() => setActiveTab('consolidated_leaderboard')}
          />
        )}

        {/* VIEW 3: CONSOLIDATED ALL 12 SECTIONS */}
        {activeTab === 'consolidated_leaderboard' && (
          <ConsolidatedLeaderboardView
            entries={consolidatedLeaderboard}
            onPlayGame={(g) => setSelectedGameForPlay(g)}
            onExportCSV={handleExportConsolidatedCSV}
            isTeacherMode={currentRole === 'teacher'}
            onToggleFinalist={handleToggleFinalist}
          />
        )}

        {/* VIEW 4: SHARK TANK PTM FINALS */}
        {activeTab === 'ptm_finals' && (
          <PTMSharkTankView
            finalists={finalists}
            ptmInvestments={appData.ptmInvestments}
            onPlayGame={(g) => setSelectedGameForPlay(g)}
            onSubmitPTMInvestment={handleSubmitPTMInvestment}
            isTeacherMode={currentRole === 'teacher'}
          />
        )}
      </main>

      {/* Modals */}
      <PlayModal
        game={selectedGameForPlay}
        onClose={() => setSelectedGameForPlay(null)}
      />

      <InvestModal
        game={selectedGameForInvest}
        currentInvestment={
          selectedGameForInvest
            ? mySectionInvestments.find((i) => i.gameId === selectedGameForInvest.id)?.coins || 0
            : 0
        }
        totalInvestedAcrossOtherGames={
          selectedGameForInvest
            ? totalInvestedByMe -
              (mySectionInvestments.find((i) => i.gameId === selectedGameForInvest.id)?.coins || 0)
            : totalInvestedByMe
        }
        maxBudget={100}
        investorName={studentInvestor.name}
        studentTeamName={studentInvestor.teamName}
        onClose={() => setSelectedGameForInvest(null)}
        onSubmitInvestment={handleInvestInGame}
      />

      {isProjectorModalOpen && (
        <ProjectorModal
          section={currentSection}
          onClose={() => setIsProjectorModalOpen(false)}
          totalGames={sectionGames.length}
          games={sectionGames}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterGameModal
          currentSection={currentSection}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegisterGame={handleRegisterGame}
          isTeacherMode={currentRole === 'teacher'}
          studentName={studentInvestor.name}
          studentTeamName={studentInvestor.teamName}
        />
      )}

      {isIdentityModalOpen && (
        <IdentityModal
          currentInvestor={studentInvestor}
          section={currentSection}
          sectionGames={sectionGames}
          onSave={(name, teamName, investorId) =>
            setStudentInvestor({
              name,
              teamName,
              investorId: investorId || studentInvestor.investorId
            })
          }
          onClose={() => setIsIdentityModalOpen(false)}
        />
      )}

      <TeacherSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        supabaseConfig={appData.supabaseConfig}
        appDataBackup={appData}
        onSaveSupabaseConfig={(config) =>
          setAppData((prev) => ({ ...prev, supabaseConfig: config }))
        }
        onManualSync={syncWithSupabase}
        onUpdateTeacherPin={(newPinHash) =>
          setAppData((prev) => ({ ...prev, teacherPinHash: newPinHash }))
        }
        onRestoreBackup={(backupData) => {
          setAppData(backupData);
          saveLocalData(backupData);
        }}
        onResetSeedData={() => {
          // Cleanly reset ALL sessions 8A through 8L with initial eligible count
          setAppData((prev) => ({
            ...prev,
            games: INITIAL_GAMES,
            investments: INITIAL_INVESTMENTS,
            ptmInvestments: INITIAL_PTM_INVESTMENTS,
            sessions: getDefaultSessions()
          }));
          setIsSettingsModalOpen(false);
        }}
        onClearAllData={() => {
          setAppData((prev) => ({
            ...prev,
            games: [],
            investments: [],
            ptmInvestments: [],
            sessions: getDefaultSessions()
          }));
          setIsSettingsModalOpen(false);
        }}
      />

      {/* Teacher PIN Unlock Modal (Security Hardened - No Quick Unlock Backdoors) */}
      {isTeacherPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-slate-900 border border-indigo-500/60 rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => {
                setIsTeacherPinModalOpen(false);
                setPinError(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-indigo-500/40">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Teacher Admin Access</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter teacher PIN to unlock session controls, section switching, and leaderboard reveal.
              </p>
            </div>

            <form onSubmit={handleVerifyTeacherPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(null);
                  }}
                  placeholder="Enter PIN"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-center text-lg font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest"
                  autoFocus
                />
                {pinError && (
                  <p className="text-rose-400 text-xs mt-1 text-center font-medium">
                    {pinError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer"
              >
                Authenticate Teacher
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
