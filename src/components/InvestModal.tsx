import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Game, validateCoinAllocation, isSelfInvestment } from '../utils/rules';

interface InvestModalProps {
  game: Game | null;
  currentInvestment: number;
  totalInvestedAcrossOtherGames: number;
  maxBudget?: number;
  investorName: string;
  studentTeamName?: string;
  onClose: () => void;
  onSubmitInvestment: (gameId: string, coins: number) => void;
}

export const InvestModal: React.FC<InvestModalProps> = ({
  game,
  currentInvestment,
  totalInvestedAcrossOtherGames,
  maxBudget = 100,
  investorName,
  studentTeamName,
  onClose,
  onSubmitInvestment,
}) => {
  const [allocation, setAllocation] = useState<number>(currentInvestment);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setAllocation(currentInvestment);
    setIsConfirming(false);
    setErrorMsg(null);
  }, [game, currentInvestment]);

  if (!game) return null;

  const remainingBudgetBeforeThisGame = maxBudget - totalInvestedAcrossOtherGames;
  const maxAvailableForThisGame = Math.max(0, remainingBudgetBeforeThisGame);

  // Robust self-investment check: checks teamName, student1, student2 against both studentTeamName and investorName
  const isOwnTeam =
    isSelfInvestment(studentTeamName, game.teamName, game.student1, game.student2) ||
    isSelfInvestment(investorName, game.teamName, game.student1, game.student2);

  const handleQuickAdd = (amount: number) => {
    const nextVal = Math.min(maxAvailableForThisGame, allocation + amount);
    setAllocation(nextVal);
    setErrorMsg(null);
  };

  const handleSetMax = () => {
    setAllocation(maxAvailableForThisGame);
    setErrorMsg(null);
  };

  const handleStepToConfirmation = () => {
    if (isOwnTeam) {
      setErrorMsg("Fair Play Rule: You cannot invest in your own team's game.");
      return;
    }
    const validation = validateCoinAllocation(allocation, totalInvestedAcrossOtherGames, maxBudget);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid coin amount.');
      return;
    }
    setIsConfirming(true);
  };

  const handleFinalSubmit = () => {
    onSubmitInvestment(game.id, allocation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden arcade-glow-gold">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-slate-950">
            <Coins className="w-6 h-6 fill-current animate-bounce" />
            <div>
              <h3 className="font-extrabold text-lg leading-tight">
                Virtual AI Coin Investment
              </h3>
              <p className="text-xs font-semibold opacity-90">
                Grade 8 Investor Arcade   Max 100 AI Coins
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-slate-900 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Target Game Info */}
          <div className="bg-slate-950/70 rounded-2xl p-4 border border-slate-800 mb-5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-bold text-amber-400 uppercase tracking-wider">Target Project</span>
              <span className="bg-cyan-950 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-800">
                Section {game.section}
              </span>
            </div>
            <h4 className="text-lg font-bold text-white mb-0.5">{game.gameTitle}</h4>
            <p className="text-xs text-slate-300">
              Team: <span className="font-semibold text-indigo-400">{game.teamName}</span> ({game.student2 ? `${game.student1} & ${game.student2}` : game.student1})
            </p>
          </div>

          {/* Self-team prevention warning */}
          {isOwnTeam ? (
            <div className="bg-rose-950/60 border border-rose-500/50 rounded-2xl p-5 text-center mb-6">
              <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto mb-2" />
              <h5 className="font-bold text-rose-200 text-sm mb-1">Fair Play Rule: Self-Investment Blocked</h5>
              <p className="text-xs text-rose-300 leading-relaxed">
                You are registered as a creator or member of team <span className="font-bold underline">{game.teamName}</span>.
                Students cannot invest in their own game. Please support other Grade 8 peer projects!
              </p>
            </div>
          ) : !isConfirming ? (
            /* Allocation Step */
            <div>
              {/* Wallet HUD in modal */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Your Investor ID</span>
                  <span className="text-xs font-bold text-cyan-300 truncate block">
                    {investorName}
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Max Available</span>
                  <span className="text-sm font-extrabold text-amber-400">
                    {maxAvailableForThisGame} AI Coins
                  </span>
                </div>
              </div>

              {/* Coin Input & Slider */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Coins to Allocate to this Game (0 to {maxAvailableForThisGame}):
                </label>

                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="number"
                    min={0}
                    max={maxAvailableForThisGame}
                    value={allocation}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setAllocation(val);
                      setErrorMsg(null);
                    }}
                    className="w-28 bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xl font-extrabold text-amber-400 text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <div className="flex-1">
                    <input
                      type="range"
                      min={0}
                      max={maxAvailableForThisGame}
                      value={allocation}
                      onChange={(e) => {
                        setAllocation(parseInt(e.target.value) || 0);
                        setErrorMsg(null);
                      }}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Quick Add Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleQuickAdd(10)}
                    disabled={allocation + 10 > maxAvailableForThisGame}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    +10
                  </button>
                  <button
                    onClick={() => handleQuickAdd(25)}
                    disabled={allocation + 25 > maxAvailableForThisGame}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    +25
                  </button>
                  <button
                    onClick={() => handleQuickAdd(50)}
                    disabled={allocation + 50 > maxAvailableForThisGame}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 disabled:opacity-40 cursor-pointer"
                  >
                    +50
                  </button>
                  <button
                    onClick={handleSetMax}
                    disabled={allocation === maxAvailableForThisGame}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-950/80 hover:bg-amber-900/80 text-amber-300 border border-amber-600/50 disabled:opacity-40 ml-auto cursor-pointer"
                  >
                    Max ({maxAvailableForThisGame})
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/50 p-3 rounded-xl border border-rose-900/50 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Progress Summary */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 mb-6 text-xs text-slate-300 flex items-center justify-between">
                <span>Remaining Wallet Balance:</span>
                <span className="font-extrabold text-emerald-400">
                  {Math.max(0, maxBudget - (totalInvestedAcrossOtherGames + allocation))} / {maxBudget} AI Coins
                </span>
              </div>

              {/* Review Button */}
              <button
                onClick={handleStepToConfirmation}
                disabled={allocation < 0 || allocation > maxAvailableForThisGame}
                className="w-full py-3 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <span>Review & Confirm Investment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Confirmation Step */
            <div className="animate-in fade-in zoom-in-95 duration-150">
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 rounded-full flex items-center justify-center text-amber-400 mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">
                  Confirm Your Virtual Investment
                </h4>
                <p className="text-xs text-slate-400">
                  Please review the details below before submitting.
                </p>
              </div>

              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 mb-6 text-xs">
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Game:</span>
                  <span className="font-bold text-white">{game.gameTitle}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Team:</span>
                  <span className="font-bold text-indigo-400">{game.teamName}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Investment Amount:</span>
                  <span className="font-extrabold text-amber-400 text-sm">
                    {allocation} AI Coins
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Remaining Budget:</span>
                  <span className="font-bold text-emerald-400">
                    {maxBudget - (totalInvestedAcrossOtherGames + allocation)} AI Coins
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setIsConfirming(false)}
                  className="py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  Change Amount
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-transform active:scale-95 cursor-pointer"
                >
                  Submit Investment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
