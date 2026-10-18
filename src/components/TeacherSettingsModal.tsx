import React, { useState, useRef } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Key,
  Trash2,
  Lock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { hashPin, AppStateData } from '../lib/storage';
import { validateUploadedFile } from '../utils/fileValidation';

interface TeacherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabaseConfig?: { url: string; anonKey: string };
  onSaveSupabaseConfig: (config: { url: string; anonKey: string }) => void;
  onResetSeedData: () => void;
  onClearAllData: () => void;
  onUpdateTeacherPin: (newPinHash: string) => void;
  onRestoreBackup?: (data: AppStateData) => void;
  onManualSync?: () => Promise<void>;
  appDataBackup?: object;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({
  isOpen,
  onClose,
  supabaseConfig,
  onSaveSupabaseConfig,
  onResetSeedData,
  onClearAllData,
  onUpdateTeacherPin,
  onRestoreBackup,
  onManualSync,
  appDataBackup,
}) => {
  const [url, setUrl] = useState(supabaseConfig?.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig?.anonKey || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError(null);
    const check = validateUploadedFile(file, 'data');
    if (!check.valid) {
      setRestoreError(check.error || 'Invalid file uploaded.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.games && parsed.sessions && onRestoreBackup) {
          onRestoreBackup(parsed);
          alert('Backup restored successfully!');
          onClose();
        } else {
          setRestoreError('Uploaded JSON does not contain valid AI Game Arena backup structure.');
        }
      } catch (err: any) {
        setRestoreError(`Failed to parse backup JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Teacher PIN Change State
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<string | null>(null);
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);

  // Destructive Wipe Confirmation State
  const [isWipeConfirmOpen, setIsWipeConfirmOpen] = useState(false);
  const [wipeConfirmText, setWipeConfirmText] = useState('');

  if (!isOpen) return null;

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleSyncNow = async () => {
    if (!onManualSync) return;
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      await onManualSync();
      setSyncStatusMsg('Synced successfully with Supabase!');
    } catch (err: any) {
      setSyncStatusMsg(`Sync error: ${err?.message || 'Check credentials'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);
    setPinChangeMsg(null);

    if (newPin.length < 4) {
      setPinChangeError('PIN must be at least 4 characters.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeError('PIN confirmation does not match.');
      return;
    }

    const hashed = await hashPin(newPin);
    onUpdateTeacherPin(hashed);
    setPinChangeMsg('Teacher PIN updated successfully!');
    setNewPin('');
    setConfirmPin('');
    setTimeout(() => setPinChangeMsg(null), 3000);
  };

  const handleDownloadBackup = () => {
    if (!appDataBackup) return;
    const jsonStr = JSON.stringify(appDataBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `AI_Game_Arena_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  const handleExecuteWipe = () => {
    if (wipeConfirmText.trim().toUpperCase() !== 'WIPE') return;
    onClearAllData();
    setIsWipeConfirmOpen(false);
    setWipeConfirmText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-950 text-indigo-400 border border-indigo-700/50">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                Teacher Controls & Database Settings
              </h3>
              <p className="text-xs text-slate-400">
                Data persistence, Supabase cloud sync, and teacher admin security
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

        {/* Section 1: Supabase Configuration */}
        <form onSubmit={handleSaveSupabase} className="mb-6 bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-sm text-white">Supabase Cloud Database Synchronization</h4>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold">
              {url ? 'Supabase Configured' : 'Offline LocalStorage Active'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Connect your Supabase project to automatically sync games, investments, and session states in real-time across student phones and classroom smartboards.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {syncStatusMsg && (
            <p className="text-xs text-emerald-400 font-medium">{syncStatusMsg}</p>
          )}

          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={!url || isSyncing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/40 disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Cloud Now'}</span>
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : null}
              <span>{isSaved ? 'Settings Saved!' : 'Save Supabase Credentials'}</span>
            </button>
          </div>
        </form>

        {/* Section 2: Teacher PIN Management */}
        <form onSubmit={handleUpdatePin} className="mb-6 bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Lock className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-sm text-white">Change Teacher Admin PIN</h4>
          </div>
          <p className="text-xs text-slate-300">
            Customize your secret PIN for teacher mode access. Prevents unauthorized student access to session controls.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">New PIN</label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new PIN"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Confirm New PIN</label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Re-enter new PIN"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {pinChangeError && (
            <p className="text-xs text-rose-400 font-medium">{pinChangeError}</p>
          )}
          {pinChangeMsg && (
            <p className="text-xs text-emerald-400 font-medium">{pinChangeMsg}</p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!newPin || !confirmPin}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-md transition-all disabled:opacity-40 cursor-pointer"
            >
              Update Teacher PIN
            </button>
          </div>
        </form>

        {/* Section 3: Data Management & Safe Reset */}
        <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-3">
          <h4 className="font-bold text-sm text-white">Event Data Controls & Backup</h4>
          <p className="text-xs text-slate-300">
            Export a full JSON backup of all registered games and investments, restore from backup, reset demo seeds across all 12 sections, or perform a clean event wipe with confirmation.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          {restoreError && (
            <p className="text-xs text-rose-400 font-medium bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
              {restoreError}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors w-full sm:w-auto justify-center cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors w-full sm:w-auto justify-center cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>Restore from Backup</span>
            </button>

            <button
              type="button"
              onClick={onResetSeedData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors w-full sm:w-auto justify-center cursor-pointer"
              title="Resets games and session states for 8A-8L cleanly"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset 8A–8L Demo Seeds</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWipeConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition-colors w-full sm:w-auto justify-center cursor-pointer ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Wipe Clean...</span>
            </button>
          </div>
        </div>

        {/* Wipe Clean Confirmation Modal */}
        {isWipeConfirmOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-100">
            <div className="bg-slate-900 border-2 border-rose-600 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center">
              <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3 animate-pulse" />
              <h3 className="text-lg font-black text-white mb-2">
                Confirm Destructive Clean Wipe
              </h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                This will permanently remove all registered games, student investments, and session records for all sections 8A through 8L.
              </p>
              <p className="text-xs font-bold text-rose-400 mb-2">
                Type <span className="font-mono underline">WIPE</span> below to confirm:
              </p>
              <input
                type="text"
                value={wipeConfirmText}
                onChange={(e) => setWipeConfirmText(e.target.value)}
                placeholder="Type WIPE"
                className="w-full bg-slate-950 border border-rose-700 rounded-xl px-3 py-2 text-center text-sm font-mono text-white mb-4 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsWipeConfirmOpen(false);
                    setWipeConfirmText('');
                  }}
                  className="py-2.5 rounded-xl font-bold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteWipe}
                  disabled={wipeConfirmText.trim().toUpperCase() !== 'WIPE'}
                  className="py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Confirm & Wipe Clean
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
