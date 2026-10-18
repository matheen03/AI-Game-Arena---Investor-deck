import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Crown,
  Heart,
  Play,
  Coins,
  Users,
  CheckCircle2,
  Star,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Game, PTMInvestment, validatePTMInvestment } from '../utils/rules';

interface PTMSharkTankViewProps {
  finalists: Game[];
  ptmInvestments: PTMInvestment[];
  onPlayGame: (game: Game) => void;
  onSubmitPTMInvestment: (gameId: string, coins: number, parentName: string, parentId: string) => void;
  isTeacherMode: boolean;
}

export const PTMSharkTankView: React.FC<PTMSharkTankViewProps> = ({
  finalists,
  ptmInvestments,
  onPlayGame,
  onSubmitPTMInvestment,
  isTeacherMode,
}) => {
  const [parentName, setParentName] = useState<string>(() => {
    return localStorage.getItem('AI_PARENT_NAME') || 'Dr. Tariq Al-Ghamdi (Parent)';
  });
  const maxParentBudget = 500; // 500 VIP Shark Tank credits limit

  // Stable parent ID derived from sanitized name or stored identity
  const parentId = `PARENT_VIP_${parentName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  const [investingInGame, setInvestingInGame] = useState<Game | null>(null);
  const [allocatedCoins, setAllocatedCoins] = useState<number>(100);
  const [investError, setInvestError] = useState<string | null>(null);
  const [isSuccessModal, setIsSuccessModal] = useState<boolean>(false);

  // Calculate my existing investments as this parent
  const myParentInvestments = ptmInvestments.filter((i) => i.investorId === parentId);
  const totalSpentByMe = myParentInvestments.reduce((sum, i) => sum + i.coins, 0);

  // Calculate Level 2 stats per finalist game
  const ptmStatsMap: Record<string, { totalCoins: number; parentCount: number }> = {};
  finalists.forEach((f) => {
    ptmStatsMap[f.id] = { totalCoins: 0, parentCount: 0 };
  });

  const parentInvestorsSetByGame: Record<string, Set<string>> = {};
  finalists.forEach((f) => {
    parentInvestorsSetByGame[f.id] = new Set();
  });

  ptmInvestments.forEach((inv) => {
    if (ptmStatsMap[inv.gameId]) {
      ptmStatsMap[inv.gameId].totalCoins += inv.coins;
      parentInvestorsSetByGame[inv.gameId].add(inv.investorId || inv.parentName);
      ptmStatsMap[inv.gameId].parentCount = parentInvestorsSetByGame[inv.gameId].size;
    }
  });

  // Sort finalists by PTM coins
  const sortedFinalists = [...finalists].sort((a, b) => {
    const coinsA = ptmStatsMap[a.id]?.totalCoins || 0;
    const coinsB = ptmStatsMap[b.id]?.totalCoins || 0;
    return coinsB - coinsA;
  });
  const overallChampion = sortedFinalists[0];

  // Audience favorite is highest distinct parent backers
  const audienceFavorite = [...finalists].sort((a, b) => {
    const parentsA = ptmStatsMap[a.id]?.parentCount || 0;
    const parentsB = ptmStatsMap[b.id]?.parentCount || 0;
    return parentsB - parentsA;
  })[0];

  const handleOpenInvest = (game: Game) => {
    setInvestingInGame(game);
    const existingForGame = myParentInvestments.find((i) => i.gameId === game.id)?.coins || 0;
    const remaining = Math.max(0, maxParentBudget - (totalSpentByMe - existingForGame));
    setAllocatedCoins(existingForGame > 0 ? existingForGame : Math.min(100, remaining));
    setInvestError(null);
  };

  const handleConfirmInvestment = () => {
    if (!investingInGame) return;
    if (!parentName.trim()) {
      setInvestError('Please enter your name as the Shark Tank Investor.');
      return;
    }

    const existingForGame = myParentInvestments.find((i) => i.gameId === investingInGame.id)?.coins || 0;
    const otherSpent = totalSpentByMe - existingForGame;

    const validation = validatePTMInvestment(allocatedCoins, existingForGame, otherSpent, maxParentBudget);
    if (!validation.valid) {
      setInvestError(validation.error || 'Invalid VIP credit allocation.');
      return;
    }

    // Persist parent name
    localStorage.setItem('AI_PARENT_NAME', parentName.trim());

    onSubmitPTMInvestment(investingInGame.id, allocatedCoins, parentName.trim(), parentId);
    setInvestingInGame(null);
    setIsSuccessModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-pink-950 via-slate-900 to-rose-950 p-6 sm:p-8 rounded-3xl border border-pink-500/40 mb-10 shadow-2xl relative overflow-hidden arcade-glow-purple">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-pink-500/20 text-pink-300 border border-pink-500/40 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-pink-400" />
                LEVEL 2: SHARK TANK INVESTOR ARCADE (PTM FINALS)
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                Parent-Teacher Meeting
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Shark Tank Finals
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Welcome parents & esteemed guests! Grade 8 finalists from sections 8A through 8L are competing for the School Champion title. Scan or play their games and cast your Shark Tank VIP investment credits!
            </p>
          </div>

          {/* Parent Guest Identity Card & Live Wallet */}
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-pink-500/30 w-full md:w-84 flex-shrink-0">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-pink-300 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-pink-400" />
                Shark Tank Investor:
              </span>
              <span className="font-black text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded text-[11px] border border-amber-500/30">
                {Math.max(0, maxParentBudget - totalSpentByMe)} / {maxParentBudget} VIP Credits
              </span>
            </div>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Your Name (Parent / Guest)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
              <span>Budget Enforced: {maxParentBudget} VIP Credits</span>
              <span className="text-emerald-400 font-bold">Invested: {totalSpentByMe}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHAMPIONS SPOTLIGHT SECTION */}
      {finalists.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Overall Champion */}
          <div className="bg-gradient-to-br from-amber-950/60 to-slate-900 p-6 rounded-3xl border-2 border-amber-500 shadow-2xl relative overflow-hidden group arcade-glow-gold">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                Current School Champion
              </span>
            </div>
            {overallChampion ? (
              <div>
                <h3 className="text-2xl font-black text-white mb-1">
                  {overallChampion.gameTitle}
                </h3>
                <p className="text-xs text-indigo-300 font-semibold mb-3">
                  {overallChampion.teamName || `${overallChampion.student1}'s Team`} (
                  {overallChampion.student2
                    ? `${overallChampion.student1} & ${overallChampion.student2}`
                    : overallChampion.student1}
                  )   Section {overallChampion.section}
                </p>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Shark Tank VIP Coins:</span>
                  <span className="text-base font-black text-amber-400 flex items-center gap-1">
                    <Coins className="w-4 h-4 text-amber-400" />
                    {ptmStatsMap[overallChampion.id]?.totalCoins || 0} VIP Coins
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Pending finalist selection</p>
            )}
          </div>

          {/* Audience Favorite */}
          <div className="bg-gradient-to-br from-pink-950/60 to-slate-900 p-6 rounded-3xl border-2 border-pink-500 shadow-2xl relative overflow-hidden group arcade-glow-purple">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-6 h-6 text-pink-400 fill-pink-400 animate-pulse" />
              <span className="text-xs font-black text-pink-400 uppercase tracking-widest">
                Audience Favorite Award
              </span>
            </div>
            {audienceFavorite ? (
              <div>
                <h3 className="text-2xl font-black text-white mb-1">
                  {audienceFavorite.gameTitle}
                </h3>
                <p className="text-xs text-pink-200/90 font-semibold mb-3">
                  {audienceFavorite.teamName || `${audienceFavorite.student1}'s Team`} (
                  {audienceFavorite.student2
                    ? `${audienceFavorite.student1} & ${audienceFavorite.student2}`
                    : audienceFavorite.student1}
                  )   Section {audienceFavorite.section}
                </p>
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Parent / Guest Backers:</span>
                  <span className="text-base font-black text-pink-400 flex items-center gap-1">
                    <Users className="w-4 h-4 text-pink-400" />
                    {ptmStatsMap[audienceFavorite.id]?.parentCount || 0} Backers
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Pending votes</p>
            )}
          </div>
        </div>
      )}

      {/* FINALIST ARCADE CARDS */}
      <div className="mb-8">
        <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span>Finalists Showcase ({finalists.length} Qualified Games)</span>
        </h2>

        {finalists.length === 0 ? (
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center text-slate-400 text-sm">
            No finalists selected yet. The teacher can select finalists from the Classroom or School-Wide Leaderboard using the "+ Finalist" button.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finalists.map((game) => {
              const stats = ptmStatsMap[game.id] || { totalCoins: 0, parentCount: 0 };
              const myInvForGame = myParentInvestments.find((i) => i.gameId === game.id)?.coins || 0;

              return (
                <div
                  key={game.id}
                  className="bg-slate-900/90 rounded-3xl border border-pink-500/40 p-6 flex flex-col justify-between shadow-xl hover:border-pink-400 transition-all group"
                >
                  <div>
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-md font-extrabold text-xs bg-pink-950 text-pink-300 border border-pink-800">
                        Section {game.section}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {game.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors mb-1 line-clamp-1">
                      {game.gameTitle}
                    </h3>
                    <p className="text-xs text-indigo-300 font-semibold mb-3">
                      {game.teamName || `${game.student1}'s Team`} (
                      {game.student2 ? `${game.student1} & ${game.student2}` : game.student1}
                      )
                    </p>
                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      {game.description || 'Interactive AI browser game built with Gemini & Netlify.'}
                    </p>

                    {/* QR Code and Stats */}
                    <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between gap-3 mb-5">
                      <div className="p-1.5 bg-white rounded-xl shadow-md">
                        <QRCodeSVG
                          value={game.netlifyUrl}
                          size={70}
                          level="M"
                        />
                      </div>
                      <div className="flex-1 text-right space-y-1.5">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Shark Tank VIP Coins</span>
                          <span className="text-base font-extrabold text-amber-400 flex items-center justify-end gap-1">
                            <Coins className="w-3.5 h-3.5" />
                            {stats.totalCoins}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Parent Investors</span>
                          <span className="text-xs font-semibold text-slate-300 flex items-center justify-end gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {stats.parentCount}
                          </span>
                        </div>
                        {myInvForGame > 0 && (
                          <div className="text-[10px] text-pink-300 font-bold bg-pink-950/60 px-2 py-0.5 rounded border border-pink-800/40">
                            Your Vote: {myInvForGame} VIP
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => onPlayGame(game)}
                      className="py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Game</span>
                    </button>
                    <button
                      onClick={() => handleOpenInvest(game)}
                      className="py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-pink-600/20 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{myInvForGame > 0 ? 'Edit VIP Vote' : 'Invest VIP'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PTM INVEST DIALOG MODAL */}
      {investingInGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-pink-500/50 rounded-3xl p-6 shadow-2xl arcade-glow-purple">
            <h3 className="text-lg font-black text-white mb-1">
              Shark Tank VIP Investment
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Investing in <span className="font-bold text-pink-300">{investingInGame.gameTitle}</span> by {investingInGame.teamName}.
            </p>

            {investError && (
              <div className="flex items-center gap-2 p-3 bg-rose-950/70 border border-rose-500/60 rounded-xl text-rose-300 text-xs mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{investError}</span>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Investor Name:
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    VIP Credits to Allocate (Max {Math.max(0, maxParentBudget - (totalSpentByMe - (myParentInvestments.find((i) => i.gameId === investingInGame.id)?.coins || 0)))}):
                  </label>
                </div>
                <input
                  type="number"
                  min={10}
                  max={Math.max(0, maxParentBudget - (totalSpentByMe - (myParentInvestments.find((i) => i.gameId === investingInGame.id)?.coins || 0)))}
                  step={10}
                  value={allocatedCoins}
                  onChange={(e) => {
                    setAllocatedCoins(parseInt(e.target.value) || 0);
                    setInvestError(null);
                  }}
                  className="w-full bg-slate-950 border border-pink-500/60 rounded-xl px-3 py-2 text-lg font-extrabold text-amber-400 text-center focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setInvestingInGame(null)}
                className="py-2.5 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInvestment}
                className="py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                Submit VIP Investment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {isSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              Shark Tank Investment Recorded!
            </h4>
            <p className="text-xs text-slate-300 mb-5">
              Thank you for supporting Grade 8 young tech innovators! Your VIP allocation has been safely stored.
            </p>
            <button
              onClick={() => setIsSuccessModal(false)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
