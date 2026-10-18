export interface Game {
  id: string;
  section: string; // e.g. '8A' .. '8L'
  teamName?: string;
  student1: string; // Required
  student2?: string; // Optional
  gameTitle: string; // Required
  category: string;
  description?: string;
  netlifyUrl: string; // Required (must be https://*.netlify.app)
  isVerified: boolean;
  isFinalist?: boolean;
  createdAt: string;
}

export interface Investment {
  id: string;
  section: string;
  gameId: string;
  investorId: string; // e.g. STU-8A-001
  investorName: string;
  studentTeamName?: string; // locked to prevent self-investing
  coins: number;
  timestamp: string;
}

export interface PTMInvestment {
  id: string;
  gameId: string;
  investorId: string; // stable parent ID
  parentName: string;
  coins: number;
  timestamp: string;
}

export interface LeaderboardEntry {
  rank: number;
  game: Game;
  totalCoins: number;
  distinctInvestors: number;
  normalizedScore: number;
}

/**
 * Validates whether an investment amount is valid given remaining budget
 */
export function validateCoinAllocation(
  currentAllocation: number,
  allocatedOtherGames: number,
  maxBudget: number = 100
): { valid: boolean; error?: string } {
  if (typeof currentAllocation !== 'number' || isNaN(currentAllocation)) {
    return { valid: false, error: 'Investment must be a valid number of AI Coins.' };
  }

  if (currentAllocation < 0) {
    return { valid: false, error: 'Investment cannot be negative.' };
  }

  if (!Number.isInteger(currentAllocation)) {
    return { valid: false, error: 'AI Coins must be whole numbers.' };
  }

  if (currentAllocation + allocatedOtherGames > maxBudget) {
    return {
      valid: false,
      error: `Total investments (${currentAllocation + allocatedOtherGames}) would exceed your ${maxBudget} AI Coin budget.`
    };
  }

  return { valid: true };
}

/**
 * Checks if a student is attempting to invest in their own team or project.
 * Performs deep, case-insensitive, normalized comparison across team names and student creators.
 */
export function isSelfInvestment(
  studentNameOrTeam: string | undefined,
  gameTeamName?: string,
  student1?: string,
  student2?: string
): boolean {
  if (!studentNameOrTeam || !studentNameOrTeam.trim()) return false;
  const target = studentNameOrTeam.trim().toLowerCase();

  const normalize = (str?: string) => (str ? str.trim().toLowerCase() : '');

  const normTeam = normalize(gameTeamName);
  const normS1 = normalize(student1);
  const normS2 = normalize(student2);

  if (normTeam && (normTeam === target || target.includes(normTeam) || normTeam.includes(target))) {
    return true;
  }
  if (normS1 && (normS1 === target || target.includes(normS1) || normS1.includes(target))) {
    return true;
  }
  if (normS2 && (normS2 === target || target.includes(normS2) || normS2.includes(target))) {
    return true;
  }

  return false;
}

/**
 * Validates a submitted game URL:
 * Strictly enforces HTTPS and Netlify hosting (*.netlify.app or *.netlify.com).
 * Blocks arbitrary external URLs, non-HTTPS protocols, and internal IP / localhost addresses.
 */
export function validateGameUrl(rawUrl: string): {
  valid: boolean;
  normalizedUrl: string;
  isNetlify: boolean;
  error?: string;
} {
  if (!rawUrl || !rawUrl.trim()) {
    return { valid: false, normalizedUrl: '', isNetlify: false, error: 'Netlify Game URL is required.' };
  }

  let formatted = rawUrl.trim();

  // Block dangerous schemes
  if (/^(javascript|data|file|vbscript):/i.test(formatted)) {
    return { valid: false, normalizedUrl: '', isNetlify: false, error: 'Dangerous URL scheme rejected.' };
  }

  // Auto-prefix https:// if omitted
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = `https://${formatted}`;
  }

  try {
    const parsed = new URL(formatted);

    // Strictly enforce https
    if (parsed.protocol !== 'https:') {
      return {
        valid: false,
        normalizedUrl: '',
        isNetlify: false,
        error: 'URL must use secure HTTPS (https://...).'
      };
    }

    const host = parsed.hostname.toLowerCase();

    // Prevent local IP addresses or private network SSRF
    if (
      host === 'localhost' ||
      host.startsWith('localhost.') ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host.endsWith('.local') ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.')
    ) {
      return {
        valid: false,
        normalizedUrl: '',
        isNetlify: false,
        error: 'Local or internal network URLs are not permitted.'
      };
    }

    // Strictly require Netlify domain
    const isNetlify = host.endsWith('.netlify.app') || host === 'netlify.app' || host.endsWith('.netlify.com');

    if (!isNetlify) {
      return {
        valid: false,
        normalizedUrl: formatted,
        isNetlify: false,
        error: 'Only verified Netlify deployment URLs (*.netlify.app) are accepted.'
      };
    }

    return { valid: true, normalizedUrl: formatted, isNetlify: true };
  } catch {
    return {
      valid: false,
      normalizedUrl: '',
      isNetlify: false,
      error: 'Invalid URL format. Example: https://my-game.netlify.app'
    };
  }
}

/**
 * Calculates normalized score for school-wide comparison:
 * Formula: (Total Coins / Eligible Investors Count in Section)
 * Uses the section's eligible investor count as the fairness denominator.
 */
export function calculateNormalizedScore(
  totalCoins: number,
  eligibleInvestorsCount: number
): number {
  if (!eligibleInvestorsCount || eligibleInvestorsCount <= 0) {
    return totalCoins > 0 ? totalCoins : 0;
  }

  const avgCoinsPerInvestor = totalCoins / eligibleInvestorsCount;
  return Math.round(avgCoinsPerInvestor * 100) / 100;
}

/**
 * Computes ranked leaderboard from games and investment records.
 * Uses sectionEligibleInvestorsMap for fair normalization.
 */
export function computeLeaderboard(
  games: Game[],
  investments: Investment[],
  sectionEligibleInvestorsMap: Record<string, number> = {}
): LeaderboardEntry[] {
  const statsMap: Record<string, { totalCoins: number; investors: Set<string> }> = {};

  games.forEach((g) => {
    statsMap[g.id] = { totalCoins: 0, investors: new Set() };
  });

  investments.forEach((inv) => {
    if (statsMap[inv.gameId]) {
      statsMap[inv.gameId].totalCoins += inv.coins;
      statsMap[inv.gameId].investors.add(inv.investorId);
    }
  });

  const entries: LeaderboardEntry[] = games.map((game) => {
    const stat = statsMap[game.id] || { totalCoins: 0, investors: new Set() };
    const distinctInvestors = stat.investors.size;
    const eligibleInvestors = sectionEligibleInvestorsMap[game.section] || 12;
    const normalizedScore = calculateNormalizedScore(stat.totalCoins, eligibleInvestors);

    return {
      rank: 0,
      game,
      totalCoins: stat.totalCoins,
      distinctInvestors,
      normalizedScore
    };
  });

  // Sort by normalized score first, then totalCoins, then distinctInvestors
  entries.sort((a, b) => {
    if (b.normalizedScore !== a.normalizedScore) {
      return b.normalizedScore - a.normalizedScore;
    }
    if (b.totalCoins !== a.totalCoins) {
      return b.totalCoins - a.totalCoins;
    }
    return b.distinctInvestors - a.distinctInvestors;
  });

  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
}

/**
 * Sanitizes CSV field values to prevent spreadsheet formula injection.
 * Prepends a single quote if the field begins with '=', '+', '-', '@', '\t', or '\r'.
 */
export function sanitizeCSVField(val: string | number): string {
  if (typeof val === 'number') return String(val);
  if (!val) return '""';

  let s = String(val).trim();
  // CSV formula injection protection
  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }

  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Converts leaderboard entries to CSV format with formula injection protection.
 */
export function exportLeaderboardToCSV(entries: LeaderboardEntry[]): string {
  const headers = [
    'Rank',
    'Game Title',
    'Team Name',
    'Section',
    'Students',
    'Category',
    'Total AI Coins',
    'Distinct Investors',
    'Normalized Score (Coins/Eligible Investor)',
    'Netlify URL',
    'Verified Status',
    'Finalist Status'
  ];

  const rows = entries.map((e) => {
    const studentNames = e.game.student2
      ? `${e.game.student1} & ${e.game.student2}`
      : e.game.student1;
    const team = e.game.teamName || `${e.game.student1}'s Team`;

    return [
      e.rank,
      sanitizeCSVField(e.game.gameTitle),
      sanitizeCSVField(team),
      sanitizeCSVField(e.game.section),
      sanitizeCSVField(studentNames),
      sanitizeCSVField(e.game.category),
      e.totalCoins,
      e.distinctInvestors,
      e.normalizedScore,
      sanitizeCSVField(e.game.netlifyUrl),
      e.game.isVerified ? 'VERIFIED' : 'PENDING',
      e.game.isFinalist ? 'FINALIST' : 'CLASSROOM'
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Validates Parent Shark Tank investment against remaining 500 VIP budget.
 */
export function validatePTMInvestment(
  allocatedCoins: number,
  currentAllocationForGame: number,
  totalSpentByParentAcrossOtherGames: number,
  maxParentBudget: number = 500
): { valid: boolean; error?: string } {
  if (typeof allocatedCoins !== 'number' || isNaN(allocatedCoins)) {
    return { valid: false, error: 'VIP Credits must be a valid number.' };
  }
  if (allocatedCoins <= 0) {
    return { valid: false, error: 'VIP Credits must be greater than zero.' };
  }
  if (!Number.isInteger(allocatedCoins)) {
    return { valid: false, error: 'VIP Credits must be whole numbers.' };
  }
  if (totalSpentByParentAcrossOtherGames + allocatedCoins > maxParentBudget) {
    const remaining = Math.max(0, maxParentBudget - totalSpentByParentAcrossOtherGames);
    return {
      valid: false,
      error: `Exceeds available VIP credits. You have ${remaining} of ${maxParentBudget} VIP Credits remaining.`
    };
  }
  return { valid: true };
}
