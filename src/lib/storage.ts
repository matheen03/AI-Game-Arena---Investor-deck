import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Game, Investment, PTMInvestment } from '../utils/rules';
import {
  INITIAL_GAMES,
  INITIAL_INVESTMENTS,
  INITIAL_PTM_INVESTMENTS,
  SECTIONS,
  SectionCode
} from '../data/seedData';

export interface SectionSessionState {
  status: 'not_started' | 'investing_open' | 'investing_closed' | 'results_revealed';
  eligibleInvestorsCount: number;
  lastUpdated: string;
}

export interface AppStateData {
  games: Game[];
  investments: Investment[];
  ptmInvestments: PTMInvestment[];
  sessions: Record<string, SectionSessionState>;
  teacherPinHash?: string; // SHA-256 hash of teacher PIN
  supabaseConfig?: {
    url: string;
    anonKey: string;
  };
}

const STORAGE_KEY = 'AI_GAME_ARENA_STORAGE_V3';

// Default secure PIN hash for initial setup: SHA-256 of "teach2026!"
export const DEFAULT_TEACHER_PIN_HASH =
  '79c53aa13049b49e2954a72d1f057889f0290caeefdfcfae188219c4d9b4db73'; // SHA-256("teach2026!")

export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getDefaultSessions(): Record<string, SectionSessionState> {
  const sessions: Record<string, SectionSessionState> = {};
  SECTIONS.forEach((sec, idx) => {
    sessions[sec] = {
      // Only 8A is open by default for demo; 8B-8L start as not_started
      status: idx === 0 ? 'investing_open' : 'not_started',
      eligibleInvestorsCount: 12, // Fair denominator for grade 8 section
      lastUpdated: new Date().toISOString()
    };
  });
  return sessions;
}

export function loadLocalData(): AppStateData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.games && parsed.investments) {
        // Ensure default PIN hash is present
        if (!parsed.teacherPinHash) {
          parsed.teacherPinHash = DEFAULT_TEACHER_PIN_HASH;
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading localStorage, using initial seed:', err);
  }

  const initial: AppStateData = {
    games: INITIAL_GAMES,
    investments: INITIAL_INVESTMENTS,
    ptmInvestments: INITIAL_PTM_INVESTMENTS,
    sessions: getDefaultSessions(),
    teacherPinHash: DEFAULT_TEACHER_PIN_HASH
  };
  saveLocalData(initial);
  return initial;
}

export function saveLocalData(data: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// ---------------------------------------------------------------------------
// Supabase Cloud Sync Engine (Real-Time & Two-Way Sync)
// ---------------------------------------------------------------------------

let supabaseClient: SupabaseClient | null = null;
let activeConfigKey: string = '';

export function getSupabaseClient(configOverride?: { url: string; anonKey: string }): SupabaseClient | null {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  const url = configOverride?.url || envUrl;
  const key = configOverride?.anonKey || envKey;

  const configKey = `${url}_${key}`;
  if (url && key && url.startsWith('http')) {
    if (!supabaseClient || activeConfigKey !== configKey) {
      supabaseClient = createClient(url, key);
      activeConfigKey = configKey;
    }
    return supabaseClient;
  }
  return null;
}

export interface SupabaseSyncResult {
  success: boolean;
  message?: string;
  data?: Partial<AppStateData>;
}

/**
 * Fetches all games, investments, ptm_investments, and section states from Supabase
 */
export async function fetchFromSupabase(
  client: SupabaseClient
): Promise<SupabaseSyncResult> {
  try {
    const [sectionsRes, gamesRes, investmentsRes, ptmRes] = await Promise.all([
      client.from('sections').select('*'),
      client.from('games').select('*'),
      client.from('investments').select('*'),
      client.from('ptm_investments').select('*')
    ]);

    const updatedData: Partial<AppStateData> = {};

    if (gamesRes.data && gamesRes.data.length > 0) {
      updatedData.games = gamesRes.data.map((row: any) => ({
        id: row.id,
        section: row.section,
        teamName: row.team_name,
        student1: row.student1,
        student2: row.student2 || undefined,
        gameTitle: row.game_title,
        category: row.category,
        description: row.description,
        netlifyUrl: row.netlify_url,
        isVerified: Boolean(row.is_verified),
        isFinalist: Boolean(row.is_finalist),
        createdAt: row.created_at || new Date().toISOString()
      }));
    }

    if (investmentsRes.data) {
      updatedData.investments = investmentsRes.data.map((row: any) => ({
        id: row.id,
        section: row.section,
        gameId: row.game_id,
        investorId: row.investor_id,
        investorName: row.investor_name,
        studentTeamName: row.student_team_name || undefined,
        coins: Number(row.coins),
        timestamp: row.created_at || row.timestamp || new Date().toISOString()
      }));
    }

    if (ptmRes.data) {
      updatedData.ptmInvestments = ptmRes.data.map((row: any) => ({
        id: row.id,
        gameId: row.game_id,
        investorId: row.investor_id,
        parentName: row.parent_name,
        coins: Number(row.coins),
        timestamp: row.created_at || row.timestamp || new Date().toISOString()
      }));
    }

    if (sectionsRes.data && sectionsRes.data.length > 0) {
      const sessionsMap: Record<string, SectionSessionState> = {};
      sectionsRes.data.forEach((row: any) => {
        sessionsMap[row.section_id] = {
          status: row.status as SectionSessionState['status'],
          eligibleInvestorsCount: Number(row.eligible_investors_count) || 12,
          lastUpdated: row.updated_at || new Date().toISOString()
        };
      });
      updatedData.sessions = sessionsMap;
    }

    return { success: true, data: updatedData };
  } catch (err: any) {
    console.error('Supabase fetch error:', err);
    return { success: false, message: err?.message || 'Failed to fetch from Supabase' };
  }
}

/**
 * Pushes a single game to Supabase
 */
export async function pushGameToSupabase(client: SupabaseClient, game: Game): Promise<boolean> {
  try {
    const { error } = await client.from('games').upsert({
      id: game.id,
      section: game.section,
      team_name: game.teamName || `${game.student1}'s Team`,
      student1: game.student1,
      student2: game.student2 || '',
      game_title: game.gameTitle,
      category: game.category,
      description: game.description || '',
      netlify_url: game.netlifyUrl,
      is_verified: game.isVerified,
      is_finalist: game.isFinalist || false,
      created_at: game.createdAt
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to push game to Supabase:', err);
    return false;
  }
}

/**
 * Pushes an investment to Supabase
 */
export async function pushInvestmentToSupabase(client: SupabaseClient, inv: Investment): Promise<boolean> {
  try {
    const { error } = await client.from('investments').upsert({
      id: inv.id,
      section: inv.section,
      game_id: inv.gameId,
      investor_id: inv.investorId,
      investor_name: inv.investorName,
      student_team_name: inv.studentTeamName || '',
      coins: inv.coins,
      created_at: inv.timestamp
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to push investment to Supabase:', err);
    return false;
  }
}

/**
 * Pushes a PTM investment to Supabase
 */
export async function pushPTMInvestmentToSupabase(client: SupabaseClient, ptm: PTMInvestment): Promise<boolean> {
  try {
    const { error } = await client.from('ptm_investments').upsert({
      id: ptm.id,
      game_id: ptm.gameId,
      investor_id: ptm.investorId,
      parent_name: ptm.parentName,
      coins: ptm.coins,
      created_at: ptm.timestamp
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to push PTM investment to Supabase:', err);
    return false;
  }
}

/**
 * Pushes section session updates to Supabase
 */
export async function pushSectionStateToSupabase(
  client: SupabaseClient,
  sectionId: string,
  state: SectionSessionState
): Promise<boolean> {
  try {
    const { error } = await client.from('sections').upsert({
      section_id: sectionId,
      status: state.status,
      eligible_investors_count: state.eligibleInvestorsCount,
      updated_at: state.lastUpdated
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to push section state to Supabase:', err);
    return false;
  }
}

/**
 * Sets up Supabase real-time listener for multi-device sync
 */
export function setupSupabaseRealtime(
  client: SupabaseClient,
  onUpdate: () => void
): () => void {
  const channel = client
    .channel('public_db_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'games' },
      () => onUpdate()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'investments' },
      () => onUpdate()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'ptm_investments' },
      () => onUpdate()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sections' },
      () => onUpdate()
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
