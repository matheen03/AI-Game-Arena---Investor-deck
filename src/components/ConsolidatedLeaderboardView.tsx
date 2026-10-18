import React, { useState, useMemo } from 'react';
import {
  Globe,
  Coins,
  Star,
  FileDown,
  Search,
  Filter,
  Calculator
} from 'lucide-react';
import { LeaderboardEntry, Game } from '../utils/rules';
import { SECTIONS } from '../data/seedData';

interface ConsolidatedLeaderboardViewProps {
  entries: LeaderboardEntry[];
  onPlayGame: (game: Game) => void;
  onExportCSV: () => void;
  isTeacherMode: boolean;
  onToggleFinalist: (gameId: string) => void;
}

export const ConsolidatedLeaderboardView: React.FC<ConsolidatedLeaderboardViewProps> = ({
  entries,
  onPlayGame,
  onExportCSV,
  isTeacherMode,
  onToggleFinalist,
}) => {
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFormulaInfo, setShowFormulaInfo] = useState<boolean>(false);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchSection = selectedSectionFilter === 'ALL' || e.game.section === selectedSectionFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        e.game.gameTitle.toLowerCase().includes(query) ||
        (e.game.teamName && e.game.teamName.toLowerCase().includes(query)) ||
        e.game.student1.toLowerCase().includes(query) ||
        (e.game.student2 && e.game.student2.toLowerCase().includes(query)) ||
        e.game.category.toLowerCase().includes(query);
      return matchSection && matchSearch;
    });
  }, [entries, selectedSectionFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 p-6 sm:p-8 rounded-3xl border border-purple-500/30 mb-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-purple-400" />
                SCHOOL-WIDE STANDINGS (8A – 8L)
              </span>
              <button
                onClick={() => setShowFormulaInfo(!showFormulaInfo)}
                className="text-xs text-slate-400 hover:text-cyan-300 underline flex items-center gap-1 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>How is Normalized Score calculated?</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Consolidated 12-Section Arena
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Consolidates results across all 12 Grade 8 sections. Uses normalized average valid AI Coins received per eligible class investor to guarantee 100% fair ranking across classes.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Export All 12 Sections (CSV)</span>
            </button>
          </div>
        </div>

        {/* Normalization Info Accordion */}
        {showFormulaInfo && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-950/90 border border-purple-500/30 text-xs text-slate-300 animate-in fade-in duration-200">
            <h4 className="font-bold text-purple-300 mb-1 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-purple-400" />
              <span>Fair Play Statistical Normalization Model:</span>
            </h4>
            <p className="leading-relaxed mb-2">
              Each section has a defined number of eligible student investors (default: 12 students). To prevent turnout variations from skewing school-wide standings:
            </p>
            <div className="font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-cyan-300 mb-2">
              Normalized Score = (Total AI Coins Received ÷ Section Eligible Investors Count)
            </div>
            <p className="text-slate-400">
              For example, 120 coins in a class with 12 eligible investors = 10.00 pts. This reflects the true average support per student investor in that section.
            </p>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search game, team, or student..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Section Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter Section:
          </span>
          <select
            value={selectedSectionFilter}
            onChange={(e) => setSelectedSectionFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="ALL">All Sections (8A - 8L)</option>
            {SECTIONS.map((sec) => (
              <option key={sec} value={sec}>
                Section {sec} Only
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400 font-semibold whitespace-nowrap ml-1">
            Showing {filteredEntries.length} of {entries.length} projects
          </span>
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                <th className="py-3.5 px-4 text-center">School Rank</th>
                <th className="py-3.5 px-4">Game Title & Category</th>
                <th className="py-3.5 px-4">Team & Students</th>
                <th className="py-3.5 px-4 text-center">Section</th>
                <th className="py-3.5 px-4 text-center">Raw AI Coins</th>
                <th className="py-3.5 px-4 text-center">Investors</th>
                <th className="py-3.5 px-4 text-center">Normalized Score</th>
                <th className="py-3.5 px-4 text-center">Shark Tank</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No matching games found for this filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr
                    key={entry.game.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Overall Rank */}
                    <td className="py-3.5 px-4 text-center font-black">
                      {entry.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-300 font-extrabold border border-yellow-500/40 shadow-sm">
                          🥇
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-300/20 text-slate-200 font-extrabold border border-slate-400/40 shadow-sm">
                          🥈
                        </span>
                      ) : entry.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-amber-800/20 text-amber-500 font-extrabold border border-amber-700/40 shadow-sm">
                          🥉
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">#{entry.rank}</span>
                      )}
                    </td>

                    {/* Game Title & Category */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white hover:text-purple-300 transition-colors">
                        {entry.game.gameTitle}
                      </div>
                      <span className="text-[11px] text-slate-400">{entry.game.category}</span>
                    </td>

                    {/* Team & Students */}
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

                    {/* Section Pill */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-md font-extrabold text-xs bg-slate-950 text-cyan-300 border border-cyan-800/60">
                        {entry.game.section}
                      </span>
                    </td>

                    {/* Raw Coins */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/30 text-xs">
                        <Coins className="w-3 h-3" />
                        {entry.totalCoins}
                      </span>
                    </td>

                    {/* Investors */}
                    <td className="py-3.5 px-4 text-center text-xs text-slate-300 font-medium">
                      {entry.distinctInvestors}
                    </td>

                    {/* Normalized Score */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-xs text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/50">
                        {entry.normalizedScore.toFixed(2)} pts
                      </span>
                    </td>

                    {/* Finalist Status */}
                    <td className="py-3.5 px-4 text-center">
                      {isTeacherMode ? (
                        <button
                          onClick={() => onToggleFinalist(entry.game.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                            entry.game.isFinalist
                              ? 'bg-pink-900/70 text-pink-300 border border-pink-500/50'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {entry.game.isFinalist ? '★ Finalist' : '+ Select'}
                        </button>
                      ) : entry.game.isFinalist ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-pink-950 text-pink-300 border border-pink-700/60">
                          <Star className="w-3 h-3 fill-pink-400 text-pink-400" />
                          Finalist
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onPlayGame(entry.game)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white transition-colors cursor-pointer"
                      >
                        Play
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
