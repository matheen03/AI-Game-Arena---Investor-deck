import React, { useState } from 'react';
import { X, User, ShieldCheck, Lock, Users, AlertCircle } from 'lucide-react';
import { Game } from '../utils/rules';
import { SectionCode, SECTION_ROSTERS, RosterStudent } from '../data/seedData';

interface IdentityModalProps {
  currentInvestor: {
    name: string;
    teamName?: string;
    investorId: string;
  };
  section: SectionCode;
  sectionGames: Game[];
  onSave: (name: string, teamName?: string, investorId?: string) => void;
  onClose: () => void;
}

export const IdentityModal: React.FC<IdentityModalProps> = ({
  currentInvestor,
  section,
  sectionGames,
  onSave,
  onClose,
}) => {
  const sectionRoster = SECTION_ROSTERS[section] || [];

  // Match current investor to roster entry if available
  const initialRosterMatch = sectionRoster.find(
    (s) => s.id === currentInvestor.investorId || s.name.toLowerCase() === currentInvestor.name.toLowerCase()
  );

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialRosterMatch ? initialRosterMatch.id : 'custom'
  );
  const [customName, setCustomName] = useState<string>(currentInvestor.name);
  const [lockedTeamName, setLockedTeamName] = useState<string>(
    initialRosterMatch?.teamName || currentInvestor.teamName || ''
  );

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    if (studentId === 'custom') {
      // Freeform student
      setLockedTeamName('');
    } else {
      const found = sectionRoster.find((s) => s.id === studentId);
      if (found) {
        setCustomName(found.name);
        setLockedTeamName(found.teamName);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudentId !== 'custom') {
      const rosterStudent = sectionRoster.find((s) => s.id === selectedStudentId);
      if (rosterStudent) {
        onSave(rosterStudent.name, rosterStudent.teamName, rosterStudent.id);
        onClose();
        return;
      }
    }

    if (!customName.trim()) return;

    // Check if entered name matches any game creator in section to lock team automatically
    let detectedTeam = lockedTeamName;
    const matchingGame = sectionGames.find(
      (g) =>
        g.student1.toLowerCase() === customName.trim().toLowerCase() ||
        (g.student2 && g.student2.toLowerCase() === customName.trim().toLowerCase())
    );
    if (matchingGame) {
      detectedTeam = matchingGame.teamName || '';
    }

    onSave(customName.trim(), detectedTeam || undefined, currentInvestor.investorId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-cyan-700/60 rounded-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Student Investor Identity
              </h3>
              <p className="text-xs text-slate-400">
                Grade 8   Section {section} Official Roster
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Section Roster Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Select Your Name from Section {section} Roster:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              <optgroup label={`Section ${section} Students`}>
                {sectionRoster.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.teamName})
                  </option>
                ))}
              </optgroup>
              <option value="custom">Other / Visiting Student</option>
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Selecting your name locks your official team to ensure fair play across all investments.
            </p>
          </div>

          {selectedStudentId === 'custom' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Student Full Name:
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Tariq Al-Harbi"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>
          )}

          {/* Locked Team Membership display */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Assigned Team:</span>
              </span>
              <span className="font-bold text-indigo-300">
                {lockedTeamName || 'Independent Investor (No Team)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Investor Token ID:</span>
              <span className="font-mono text-cyan-400 font-bold">
                {selectedStudentId !== 'custom' ? selectedStudentId : currentInvestor.investorId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Session Budget:</span>
              <span className="text-amber-400 font-bold">100 AI Coins</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              Save Identity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
