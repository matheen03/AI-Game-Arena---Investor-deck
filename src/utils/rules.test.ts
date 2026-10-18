import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCoinAllocation,
  isSelfInvestment,
  validateGameUrl,
  calculateNormalizedScore,
  computeLeaderboard,
  exportLeaderboardToCSV,
  sanitizeCSVField,
  validatePTMInvestment,
  type Game,
  type Investment
} from './rules.ts';

test('validateCoinAllocation allows valid amounts within 100 coin budget', () => {
  const result1 = validateCoinAllocation(30, 40, 100);
  assert.equal(result1.valid, true);

  const result2 = validateCoinAllocation(30, 70, 100);
  assert.equal(result2.valid, true);
});

test('validateCoinAllocation rejects exceeding budget or invalid amounts', () => {
  const resultOver = validateCoinAllocation(40, 70, 100);
  assert.equal(resultOver.valid, false);
  assert.match(resultOver.error || '', /exceed/i);

  const resultNegative = validateCoinAllocation(-10, 0, 100);
  assert.equal(resultNegative.valid, false);

  const resultDecimal = validateCoinAllocation(15.5, 0, 100);
  assert.equal(resultDecimal.valid, false);
  assert.match(resultDecimal.error || '', /whole numbers/i);
});

test('isSelfInvestment correctly detects same team or creator student name', () => {
  assert.equal(isSelfInvestment('Cyber Falcons', 'Cyber Falcons', 'Tariq Al-Harbi', 'Omar Al-Ghamdi'), true);
  assert.equal(isSelfInvestment('Tariq Al-Harbi', 'Cyber Falcons', 'Tariq Al-Harbi', 'Omar Al-Ghamdi'), true);
  assert.equal(isSelfInvestment('Omar Al-Ghamdi', 'Cyber Falcons', 'Tariq Al-Harbi', 'Omar Al-Ghamdi'), true);
  assert.equal(isSelfInvestment('Zaid Al-Mutairi', 'Cyber Falcons', 'Tariq Al-Harbi', 'Omar Al-Ghamdi'), false);
  assert.equal(isSelfInvestment(undefined, 'Cyber Falcons', 'Tariq Al-Harbi', 'Omar Al-Ghamdi'), false);
});

test('validateGameUrl strictly enforces https and netlify hosting', () => {
  const netlifyUrl = validateGameUrl('https://gemini-arcade-8a.netlify.app');
  assert.equal(netlifyUrl.valid, true);
  assert.equal(netlifyUrl.isNetlify, true);

  const autoPrefixed = validateGameUrl('my-gemini-game.netlify.app');
  assert.equal(autoPrefixed.valid, true);
  assert.equal(autoPrefixed.normalizedUrl, 'https://my-gemini-game.netlify.app');
  assert.equal(autoPrefixed.isNetlify, true);

  // Non-netlify URLs must be rejected
  const otherUrl = validateGameUrl('https://mygame.com/play');
  assert.equal(otherUrl.valid, false);
  assert.equal(otherUrl.isNetlify, false);
  assert.match(otherUrl.error || '', /netlify/i);

  // Plain http must be rejected
  const insecure = validateGameUrl('http://falcon.netlify.app');
  assert.equal(insecure.valid, false);

  // Dangerous javascript: scheme must be rejected
  const xss = validateGameUrl('javascript:alert(1)');
  assert.equal(xss.valid, false);

  // Localhost / private IP must be rejected
  const ssrf = validateGameUrl('https://localhost.netlify.app');
  assert.equal(ssrf.valid, false);
});

test('calculateNormalizedScore uses eligible investors count as fairness denominator', () => {
  // 300 coins received in a section with 15 eligible investors = 20.0 coins per eligible investor
  assert.equal(calculateNormalizedScore(300, 15), 20.0);
  // 125 coins received in a section with 10 eligible investors = 12.5 coins per eligible investor
  assert.equal(calculateNormalizedScore(125, 10), 12.5);
  // Zero coins
  assert.equal(calculateNormalizedScore(0, 10), 0);
});

test('computeLeaderboard uses section eligible investors count correctly', () => {
  const sampleGames: Game[] = [
    {
      id: 'g1',
      section: '8A',
      teamName: 'Team Alpha',
      student1: 'Tariq',
      student2: 'Omar',
      gameTitle: 'Sandstorm Racer',
      category: 'Racing',
      description: 'AI desert racer',
      netlifyUrl: 'https://sandstorm.netlify.app',
      isVerified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'g2',
      section: '8A',
      teamName: 'Team Beta',
      student1: 'Zaid',
      student2: 'Fahad',
      gameTitle: 'Falcon Flight',
      category: 'Arcade',
      description: 'Falcon simulator',
      netlifyUrl: 'https://falcon.netlify.app',
      isVerified: true,
      createdAt: new Date().toISOString()
    }
  ];

  const sampleInvestments: Investment[] = [
    {
      id: 'inv1',
      section: '8A',
      gameId: 'g1',
      investorId: 'stu-1',
      investorName: 'Investor 1',
      coins: 60,
      timestamp: new Date().toISOString()
    },
    {
      id: 'inv2',
      section: '8A',
      gameId: 'g1',
      investorId: 'stu-2',
      investorName: 'Investor 2',
      coins: 60,
      timestamp: new Date().toISOString()
    },
    {
      id: 'inv3',
      section: '8A',
      gameId: 'g2',
      investorId: 'stu-1',
      investorName: 'Investor 1',
      coins: 30,
      timestamp: new Date().toISOString()
    }
  ];

  // Section 8A has 12 eligible investors (not 2)
  const results = computeLeaderboard(sampleGames, sampleInvestments, { '8A': 12 });
  assert.equal(results[0].game.id, 'g1');
  assert.equal(results[0].rank, 1);
  assert.equal(results[0].totalCoins, 120);
  assert.equal(results[0].distinctInvestors, 2);
  assert.equal(results[0].normalizedScore, 10); // 120 / 12 = 10.0

  assert.equal(results[1].game.id, 'g2');
  assert.equal(results[1].rank, 2);
  assert.equal(results[1].totalCoins, 30);
  assert.equal(results[1].distinctInvestors, 1);
  assert.equal(results[1].normalizedScore, 2.5); // 30 / 12 = 2.5
});

test('sanitizeCSVField protects against spreadsheet formula injection', () => {
  assert.equal(sanitizeCSVField('=SUM(A1:A10)'), `"'=SUM(A1:A10)"`);
  assert.equal(sanitizeCSVField('+cmd|"/C calc"!A0'), ` "'+cmd|""/C calc""!A0"`.trim());
  assert.equal(sanitizeCSVField('-10+20'), `"'-10+20"`);
  assert.equal(sanitizeCSVField('@admin'), `"'@admin"`);
  assert.equal(sanitizeCSVField('Regular Name'), `"Regular Name"`);
  assert.equal(sanitizeCSVField(100), '100');
});

test('exportLeaderboardToCSV formats valid CSV string with sanitized fields', () => {
  const sampleGame: Game = {
    id: 'g1',
    section: '8A',
    teamName: '=Team "Alpha"',
    student1: '+Tariq',
    student2: 'Omar',
    gameTitle: '@Sandstorm, Desert',
    category: 'Racing',
    description: 'Fast game',
    netlifyUrl: 'https://sandstorm.netlify.app',
    isVerified: true,
    isFinalist: true,
    createdAt: new Date().toISOString()
  };

  const entries = [
    {
      rank: 1,
      game: sampleGame,
      totalCoins: 80,
      distinctInvestors: 2,
      normalizedScore: 6.67
    }
  ];

  const csv = exportLeaderboardToCSV(entries);
  assert.match(csv, /Rank,Game Title/);
  // Formula injection sanitized
  assert.match(csv, /"'@Sandstorm, Desert"/);
  assert.match(csv, /"'=Team ""Alpha"""/);
  assert.match(csv, /"'\+Tariq & Omar"/);
  assert.match(csv, /FINALIST/);
});

test('validatePTMInvestment enforces 500 VIP parent budget', () => {
  // Valid initial vote
  const res1 = validatePTMInvestment(100, 0, 0, 500);
  assert.equal(res1.valid, true);

  // Exceeds 500 budget
  const resOver = validatePTMInvestment(300, 0, 300, 500);
  assert.equal(resOver.valid, false);
  assert.match(resOver.error || '', /exceeds/i);

  // Negative or zero rejected
  const resZero = validatePTMInvestment(0, 0, 0, 500);
  assert.equal(resZero.valid, false);

  const resDecimal = validatePTMInvestment(50.5, 0, 0, 500);
  assert.equal(resDecimal.valid, false);
});
