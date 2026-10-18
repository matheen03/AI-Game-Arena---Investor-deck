import React, { useState } from 'react';
import { X, ExternalLink, Gamepad2, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Game, validateGameUrl } from '../utils/rules';

interface PlayModalProps {
  game: Game | null;
  onClose: () => void;
}

export const PlayModal: React.FC<PlayModalProps> = ({ game, onClose }) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  if (!game) return null;

  const urlCheck = validateGameUrl(game.netlifyUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] bg-slate-900 border border-cyan-800/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {game.gameTitle}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-cyan-900/60 text-cyan-300">
                  Section {game.section}
                </span>
                {game.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/40">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Created by {game.teamName || 'Student Team'} ({game.student2 ? `${game.student1} & ${game.student2}` : game.student1})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Reload iframe */}
            <button
              onClick={() => {
                setIsLoading(true);
                setIframeKey((prev) => prev + 1);
              }}
              title="Restart Game"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {/* Open in new tab securely */}
            {urlCheck.valid && (
              <a
                href={urlCheck.normalizedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors"
              >
                <span>Full Screen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game iframe Canvas / Sandboxed Shell */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {!urlCheck.valid ? (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
              <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Unverified External Target Blocked</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Security Sandbox Protection: Only verified Netlify applications (*.netlify.app) served over HTTPS can be embedded.
              </p>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-cyan-400 gap-3 z-10">
                  <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold tracking-wide">Loading Netlify Game Arcade...</p>
                </div>
              )}
              {/* Hardened Sandbox: Scripts & Forms allowed for game play, but same-origin & popups disabled for isolation */}
              <iframe
                key={iframeKey}
                src={urlCheck.normalizedUrl}
                title={game.gameTitle}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                sandbox="allow-scripts allow-forms"
                referrerPolicy="no-referrer"
                onLoad={() => setIsLoading(false)}
              />
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="truncate max-w-md">
            URL: <span className="text-cyan-400 font-mono">{game.netlifyUrl}</span>
          </span>
          <span className="text-[11px] text-slate-500">
            Isolated Sandbox Active   Press ESC or Close to return
          </span>
        </div>
      </div>
    </div>
  );
};
