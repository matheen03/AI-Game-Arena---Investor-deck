import React from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Coins,
  Users,
  Star,
  Sparkles,
  Medal,
  Play,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { LeaderboardEntry, Game } from '../utils/rules';
import { SectionCode } from '../data/seedData';

interface ClassroomLeaderboardViewProps {
  section: SectionCode;
  entries: LeaderboardEntry[];
  isRevealed: boolean;
  onReveal: () => void;
  isTeacherMode: boolean;
  onToggleFinalist: (gameId: string) => void;
  onPlayGame: (game: Game) => void;
  onExportCSV: () => void;
  onViewSchoolWide: () => void;
}

export const ClassroomLeaderboardView: React.FC<ClassroomLeaderboardViewProps> = ({
  section,
  entries,
  isRevealed,
  onReveal,
  isTeacherMode,
  onToggleFinalist,
  onPlayGame,
  onExportCSV,
  onViewSchoolWide,
}) => {
  const triggerConfettiCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 250);
  };

  const handleRevealClick = () => {
    onReveal();
    triggerConfettiCelebration();
  };

  const topThree = entries.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900/80 p-6 rounded-3xl border border-amber-500/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
              GRADE 8 SECTION {section}
            </span>
            {isRevealed ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Official Classroom Standings
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-950 text-purple-300 border border-purple-800">
                Awaiting Teacher Reveal
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Classroom Investor Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Ranked by authentic student AI Coin investments ({entries.length} projects registered).
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {!isRevealed ? (
            isTeacherMode ? (
              <button
                onClick={handleRevealClick}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-slate-950 shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
                <span>Reveal Leaderboard Now!</span>
              </button>
            ) : (
              <span className="text-xs text-amber-300/80 bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-800/40 font-semibold">
                Waiting for teacher to reveal class podium
              </span>
            )
          ) : (
            <button
              onClick={triggerConfettiCelebration}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Celebrate Again 🎉</span>
            </button>
          )}
          <button
            onClick={onViewSchoolWide}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <span>School Consolidated</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TOP 3 PODIUM (Gold, Silver, Bronze) */}
      {entries.length > 0 && (
        <div className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Rank 2: Silver (Left) */}
            {topThree[1] && (
              <div className="order-2 md:order-1 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 border-2 border-slate-400/50 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-300/20 border border-slate-300/40 flex items-center justify-center font-black text-lg text-slate-200">
                    2
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Medal className="w-7 h-7 text-slate-300" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                    Silver Medal
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mb-1 group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {topThree[1].game.gameTitle}
                </h3>
                <p className="text-xs text-indigo-300 font-semibold mb-4">
                  {topThree[1].game.teamName || `${topThree[1].game.student1}'s Team`} (
                  {topThree[1].game.student2
                    ? `${topThree[1].game.student1} & ${topThree[1].game.student2}`
                    : topThree[1].game.student1}
                  )
                </p>
                <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Invested</span>
                    <span className="text-lg font-black text-amber-400 flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-400" />
                      {topThree[1].totalCoins} Coins
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Distinct Investors</span>
                    <span className="text-sm font-bold text-slate-300 flex items-center justify-end gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {topThree[1].distinctInvestors}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => onPlayGame(topThree[1].game)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play</span>
                  </button>
                  {isTeacherMode && (
                    <button
                      onClick={() => onToggleFinalist(topThree[1].game.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        topThree[1].game.isFinalist
                          ? 'bg-pink-900/60 text-pink-300 border border-pink-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Star className="w-3 h-3" />
                      <span>{topThree[1].game.isFinalist ? 'Finalist' : '+ Finalist'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Rank 1: Gold (Center - Elevated) */}
            {topThree[0] && (
              <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-900 rounded-3xl p-7 border-2 border-amber-400 shadow-2xl relative overflow-hidden group arcade-glow-gold transform md:-translate-y-4">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute top-0 right-0 p-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-400/40">
                    1
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-bounce" />
                  <span className="text-xs font-black text-amber-300 uppercase tracking-widest">
                    Champion • Gold Medal
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white mb-1 group-hover:text-amber-300 transition-colors line-clamp-1">
                  {topThree[0].game.gameTitle}
                </h3>
                <p className="text-xs text-amber-200/90 font-bold mb-4">
                  {topThree[0].game.teamName || `${topThree[0].game.student1}'s Team`} (
                  {topThree[0].game.student2
                    ? `${topThree[0].game.student1} & ${topThree[0].game.student2}`
                    : topThree[0].game.student1}
                  )
                </p>
                <div className="bg-slate-950/90 rounded-2xl p-4 border border-amber-500/40 flex items-center justify-between mb-5">
                  <div>
                    <span className="text-[11px] text-amber-300/80 font-semibold block">Total Invested</span>
                    <span className="text-2xl font-black text-amber-400 flex items-center gap-1.5">
                      <Coins className="w-5 h-5 text-amber-400" />
                      {topThree[0].totalCoins} AI Coins
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Investors</span>
                    <span className="text-base font-bold text-slate-200 flex items-center justify-end gap-1">
                      <Users className="w-4 h-4 text-slate-400" />
                      {topThree[0].distinctInvestors} students
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => onPlayGame(topThree[0].game)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Champion Game</span>
                  </button>
                  {isTeacherMode && (
                    <button
                      onClick={() => onToggleFinalist(topThree[0].game.id)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        topThree[0].game.isFinalist
                          ? 'bg-pink-900/80 text-pink-300 border border-pink-500/50'
                          : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Star className="w-3 h-3" />
                      <span>{topThree[0].game.isFinalist ? 'Finalist' : '+ Finalist'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Rank 3: Bronze (Right) */}
            {topThree[2] && (
              <div className="order-3 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 border-2 border-amber-800/60 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-800/30 border border-amber-700/50 flex items-center justify-center font-black text-lg text-amber-500">
                    3
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Medal className="w-7 h-7 text-amber-600" />
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                    Bronze Medal
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mb-1 group-hover:text-cyan-300 transition-colors line-clamp-1">
                  {topThree[2].game.gameTitle}
                </h3>
                <p className="text-xs text-indigo-300 font-semibold mb-4">
                  {topThree[2].game.teamName || `${topThree[2].game.student1}'s Team`} (
                  {topThree[2].game.student2
                    ? `${topThree[2].game.student1} & ${topThree[2].game.student2}`
                    : topThree[2].game.student1}
                  )
                </p>
                <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Invested</span>
                    <span className="text-lg font-black text-amber-400 flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-400" />
                      {topThree[2].totalCoins} Coins
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Distinct Investors</span>
                    <span className="text-sm font-bold text-slate-300 flex items-center justify-end gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {topThree[2].distinctInvestors}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => onPlayGame(topThree[2].game)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play</span>
                  </button>
                  {isTeacherMode && (
                    <button
                      onClick={() => onToggleFinalist(topThree[2].game.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                        topThree[2].game.isFinalist
                          ? 'bg-pink-900/60 text-pink-300 border border-pink-500/40'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Star className="w-3 h-3" />
                      <span>{topThree[2].game.isFinalist ? 'Finalist' : '+ Finalist'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL SECTION RANKINGS TABLE */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-white">
            Complete Section {section} Standings
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {entries.length} teams participating
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Game & Category</th>
                <th className="py-3 px-4">Team & Creators</th>
                <th className="py-3 px-4 text-center">AI Coins</th>
                <th className="py-3 px-4 text-center">Investors</th>
                <th className="py-3 px-4 text-center">Finalist</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {entries.map((entry) => (
                <tr
                  key={entry.game.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    entry.rank <= 3 ? 'bg-slate-950/20' : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3.5 px-4 font-black">
                    {entry.rank === 1 ? (
                      <span className="w-7 h-7 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold">
                        🥇
                      </span>
                    ) : entry.rank === 2 ? (
                      <span className="w-7 h-7 rounded-lg bg-slate-400/20 text-slate-300 flex items-center justify-center font-bold">
                        🥈
                      </span>
                    ) : entry.rank === 3 ? (
                      <span className="w-7 h-7 rounded-lg bg-amber-700/20 text-amber-500 flex items-center justify-center font-bold">
                        🥉
                      </span>
                    ) : (
                      <span className="text-slate-400 pl-2">#{entry.rank}</span>
                    )}
                  </td>
                  {/* Game Title */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white hover:text-cyan-300 transition-colors">
                      {entry.game.gameTitle}
                    </div>
                    <span className="text-[11px] text-slate-400">{entry.game.category}</span>
                  </td>
                  {/* Team */}
                  <td className="py-3.5 px-4 text-xs">
                    <div className="font-semibold text-indigo-300">
                      {entry.game.teamName || `${entry.game.student1}'s Team`}
                    </div>
                    <div className="text-slate-400 text-[11px] truncate max-w-xs">
                      {entry.game.student2
                        ? `${entry.game.student1} & ${entry.game.student2}`
                        : entry.game.student1}
                    </div>
                  </td>
                  {/* Total Coins */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-black text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/40">
                      <Coins className="w-3.5 h-3.5" />
                      {entry.totalCoins}
                    </span>
                  </td>
                  {/* Distinct Investors */}
                  <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-300">
                    {entry.distinctInvestors}
                  </td>
                  {/* Finalist Status */}
                  <td className="py-3.5 px-4 text-center">
                    {isTeacherMode ? (
                      <button
                        onClick={() => onToggleFinalist(entry.game.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                          entry.game.isFinalist
                            ? 'bg-pink-900/60 text-pink-300 border border-pink-500/40'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {entry.game.isFinalist ? '★ Finalist' : '+ Select'}
                      </button>
                    ) : entry.game.isFinalist ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-pink-950 text-pink-300 border border-pink-800/60">
                        Finalist
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">—</span>
                    )}
                  </td>
                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onPlayGame(entry.game)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white transition-colors cursor-pointer"
                    >
                      Play
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
