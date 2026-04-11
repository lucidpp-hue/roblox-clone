-- Developer Simulator Schema Migration
-- Adds tables and columns to support game lifecycle, groups, and developer mechanics

-- 1. Add columns to games table
ALTER TABLE games ADD COLUMN IF NOT EXISTS last_title_update TIMESTAMP DEFAULT NULL;
ALTER TABLE games ADD COLUMN IF NOT EXISTS has_revival_available BOOLEAN DEFAULT TRUE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS followers_boost_applied BOOLEAN DEFAULT FALSE;
ALTER TABLE games ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL;
ALTER TABLE games ADD COLUMN IF NOT EXISTS peak_players INTEGER DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS current_players INTEGER DEFAULT 0;
ALTER TABLE games ADD COLUMN IF NOT EXISTS created_day INTEGER DEFAULT 1;

-- 2. Developer Sessions Table
CREATE TABLE IF NOT EXISTS developer_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_day INTEGER NOT NULL DEFAULT 1,
  total_visits BIGINT DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- 3. Game Stats Table (historical tracking)
CREATE TABLE IF NOT EXISTS game_stats (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  day INTEGER NOT NULL,
  player_count INTEGER DEFAULT 0,
  visits BIGINT DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_id, day)
);

-- 4. Groups Table
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Group Members Table
CREATE TABLE IF NOT EXISTS group_members (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- 'owner', 'moderator', 'member'
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, user_id)
);

-- 6. Group Games Table
CREATE TABLE IF NOT EXISTS group_games (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, game_id)
);

-- 7. Gamepasses Table
CREATE TABLE IF NOT EXISTS gamepasses (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  sales INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Game Revival Used Table
CREATE TABLE IF NOT EXISTS game_revival_used (
  id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_id)
);

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_developer_sessions_user_id ON developer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_game_id ON game_stats(game_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_day ON game_stats(day);
CREATE INDEX IF NOT EXISTS idx_groups_creator_id ON groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_games_group_id ON group_games(group_id);
CREATE INDEX IF NOT EXISTS idx_group_games_game_id ON group_games(game_id);
CREATE INDEX IF NOT EXISTS idx_gamepasses_game_id ON gamepasses(game_id);
CREATE INDEX IF NOT EXISTS idx_games_group_id ON games(group_id);
