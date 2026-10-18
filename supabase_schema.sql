-- ==========================================================
-- AI GAME ARENA: INVESTOR EDITION
-- Supabase PostgreSQL Schema & Row Level Security (RLS)
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS sections (
    section_id VARCHAR(5) PRIMARY KEY, -- e.g. '8A', '8B', ... '8L'
    status VARCHAR(30) NOT NULL DEFAULT 'not_started', -- 'not_started', 'investing_open', 'investing_closed', 'results_revealed'
    eligible_investors_count INT NOT NULL DEFAULT 12,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed all 12 sections 8A through 8L
INSERT INTO sections (section_id, status, eligible_investors_count) VALUES 
    ('8A', 'investing_open', 12),
    ('8B', 'not_started', 12),
    ('8C', 'not_started', 12),
    ('8D', 'not_started', 12),
    ('8E', 'not_started', 12),
    ('8F', 'not_started', 12),
    ('8G', 'not_started', 12),
    ('8H', 'not_started', 12),
    ('8I', 'not_started', 12),
    ('8J', 'not_started', 12),
    ('8K', 'not_started', 12),
    ('8L', 'not_started', 12)
ON CONFLICT (section_id) DO NOTHING;

-- 2. GAMES TABLE
CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(64) PRIMARY KEY,
    section VARCHAR(5) NOT NULL REFERENCES sections(section_id) ON DELETE CASCADE,
    team_name VARCHAR(120) NOT NULL,
    student1 VARCHAR(120) NOT NULL,
    student2 VARCHAR(120),
    game_title VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL,
    description TEXT,
    netlify_url TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_finalist BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_section ON games(section);
CREATE INDEX IF NOT EXISTS idx_games_finalist ON games(is_finalist);

-- 3. CLASSROOM INVESTMENTS (LEVEL 1)
CREATE TABLE IF NOT EXISTS investments (
    id VARCHAR(64) PRIMARY KEY,
    section VARCHAR(5) NOT NULL REFERENCES sections(section_id) ON DELETE CASCADE,
    game_id VARCHAR(64) NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    investor_id VARCHAR(64) NOT NULL,
    investor_name VARCHAR(120) NOT NULL,
    student_team_name VARCHAR(120),
    coins INT NOT NULL CHECK (coins >= 0 AND coins <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_investor_game UNIQUE (investor_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_investments_section ON investments(section);
CREATE INDEX IF NOT EXISTS idx_investments_game ON investments(game_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);

-- 4. PTM SHARK TANK INVESTMENTS (LEVEL 2)
CREATE TABLE IF NOT EXISTS ptm_investments (
    id VARCHAR(64) PRIMARY KEY,
    game_id VARCHAR(64) NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    investor_id VARCHAR(64) NOT NULL,
    parent_name VARCHAR(150) NOT NULL,
    coins INT NOT NULL CHECK (coins >= 0 AND coins <= 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_ptm_investor_game UNIQUE (investor_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_ptm_game ON ptm_investments(game_id);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptm_investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public sections are viewable by everyone" ON sections FOR SELECT USING (true);
CREATE POLICY "Public games are viewable by everyone" ON games FOR SELECT USING (true);
CREATE POLICY "Public investments are viewable by everyone" ON investments FOR SELECT USING (true);
CREATE POLICY "Public ptm investments are viewable by everyone" ON ptm_investments FOR SELECT USING (true);

CREATE POLICY "Allow student game registration" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow game modification" ON games FOR UPDATE USING (true);

CREATE POLICY "Allow student investment submission" ON investments FOR INSERT WITH CHECK (
    coins >= 0 AND coins <= 100
);
CREATE POLICY "Allow investment updates" ON investments FOR UPDATE USING (true);

CREATE POLICY "Allow parent PTM investment submission" ON ptm_investments FOR INSERT WITH CHECK (
    coins >= 0 AND coins <= 500
);
CREATE POLICY "Allow PTM investment updates" ON ptm_investments FOR UPDATE USING (true);

CREATE POLICY "Allow section status updates" ON sections FOR UPDATE USING (true);
