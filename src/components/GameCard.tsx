import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Play,
  Coins,
  CheckCircle2,
  ExternalLink,
  Users,
  Star,
  ShieldCheck,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Game } from '../utils/rules';

interface GameCardProps {
  game: Game;
  totalCoinsInvested: number;
  distinctInvestorsCount: number;
  myInvestmentInGame: number;
  remainingCoins: number;
  isSelfTeam: boolean;
  isInvestingOpen: boolean;
  onPlayGame: (game: Game) => void;
  onInvestInGame: (game: Game) => void;
  isTeacherMode: boolean;
  onToggleVerify?: (gameId: string) => void;
  onToggleFinalist?: (gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  totalCoinsInvested,
  distinctInvestorsCount,
  myInvestmentInGame,
  isSelfTeam,
  isInvestingOpen,
  onPlayGame,
  onInvestInGame,
  isTeacherMode,
  onToggleVerify,
  onToggleFinalist,
}) => {
  return (
    <div className="relative group bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between overflow-hidden">
      {/* Top Accent Strip */}
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${
          game.isFinalist
            ? 'from-pink-500 via-purple-500 to-cyan-400'
            : 'from-cyan-500 via-indigo-500 to-purple-600'
        }`}
      />

      {/* Card Header & Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              Section {game.section}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-300">
              {game.category}
            </span>
            {game.isFinalist && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-pink-950 text-pink-300 border border-pink-700/60 animate-pulse">
                <Star className="w-3 h-3 fill-pink-400 text-pink-400" />
                Shark Tank Finalist
              </span>
            )}
          </div>

          {/* Verification Badge */}
          {game.isVerified ? (
            <span
              title="Verified Netlify Game"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Verified
            </span>
          ) : (
            <span
              title="Awaiting Teacher Verification"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/40"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              Pending Review
            </span>
          )}
        </div>

        {/* Game Title */}
        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1">
          {game.gameTitle}
        </h3>

        {/* Team and Student Creators */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <span className="font-semibold text-indigo-400">
            {game.teamName || `${game.student1}'s Project`}
          </span>
          <span>•</span>
          <span className="truncate">
            {game.student2 ? `${game.student1} & ${game.student2}` : game.student1}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed flex-1">
          {game.description || 'Interactive AI web game built with Gemini & Netlify.'}
        </p>

        {/* Center QR Code and Live Stats */}
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-3 mb-4">
          {/* Real QR Code linking to Netlify URL */}
          <div className="flex flex-col items-center">
            <div className="p-1.5 bg-white rounded-lg shadow-md group-hover:scale-105 transition-transform">
              <QRCodeSVG
                value={game.netlifyUrl}
                size={74}
                level="M"
                includeMargin={false}
              />
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Scan to play</span>
          </div>

          {/* Investment & Investor Metrics */}
          <div className="flex-1 flex flex-col justify-center space-y-2">
            <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <Coins className="w-3.5 h-3.5" />
                <span>{totalCoinsInvested} AI Coins</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Users className="w-3 h-3 text-slate-400" />
                <span>{distinctInvestorsCount}</span>
              </div>
            </div>

            {/* My investment info */}
            {myInvestmentInGame > 0 && (
              <div className="text-[11px] text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-950/40 rounded border border-emerald-900/40">
                You invested: <span className="font-bold">{myInvestmentInGame}</span> coins
              </div>
            )}

            {isSelfTeam && (
              <div className="text-[10px] text-amber-300/90 font-medium flex items-center gap-1 bg-amber-950/40 px-2 py-1 rounded border border-amber-900/40">
                <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span>Your team's project</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 pb-5 pt-0 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {/* PLAY Button */}
          <button
            onClick={() => onPlayGame(game)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-cyan-600 text-slate-100 hover:text-white transition-all border border-slate-700 hover:border-cyan-500 shadow-sm cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PLAY</span>
          </button>

          {/* INVEST Button */}
          <button
            onClick={() => onInvestInGame(game)}
            disabled={!isInvestingOpen || isSelfTeam}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
              isSelfTeam
                ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
                : !isInvestingOpen
                ? 'bg-slate-800/80 text-slate-400 cursor-not-allowed border border-slate-800'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 cursor-pointer'
            }`}
            title={
              isSelfTeam
                ? 'Fair play rule: Cannot invest in your own team'
                : !isInvestingOpen
                ? 'Investing is currently paused by teacher'
                : 'Invest virtual AI Coins'
            }
          >
            <Coins className="w-3.5 h-3.5" />
            <span>
              {isSelfTeam ? 'Own Team' : myInvestmentInGame > 0 ? 'Edit Coins' : 'Invest'}
            </span>
          </button>
        </div>

        {/* Teacher Quick Controls on card */}
        {isTeacherMode && (
          <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <button
              onClick={() => onToggleVerify && onToggleVerify(game.id)}
              className={`hover:underline flex items-center gap-1 cursor-pointer ${
                game.isVerified ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              {game.isVerified ? 'Verified ✓' : 'Approve Verify'}
            </button>
            <button
              onClick={() => onToggleFinalist && onToggleFinalist(game.id)}
              className={`hover:underline flex items-center gap-1 cursor-pointer ${
                game.isFinalist ? 'text-pink-400 font-bold' : 'text-slate-400 hover:text-pink-300'
              }`}
            >
              <Star className="w-3 h-3" />
              {game.isFinalist ? '★ Finalist' : '+ Finalist'}
            </button>
            <a
              href={game.netlifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-0.5"
            >
              <span>Netlify</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
