-- ============================================================
-- Serpientes y Escaleras — Supabase Migration
-- ============================================================

-- 1. Create the rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code     TEXT UNIQUE NOT NULL,
  players       JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_turn  TEXT,           -- player id whose turn it is
  dice_value    INT DEFAULT 0,
  last_move     TIMESTAMPTZ DEFAULT now(),
  winner        TEXT,           -- player id or null
  status        TEXT NOT NULL DEFAULT 'waiting',  -- waiting | playing | finished
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (permissive for prototype)
-- Everyone can read any room
CREATE POLICY "rooms_select_all" ON rooms
  FOR SELECT USING (true);

-- Everyone can create rooms
CREATE POLICY "rooms_insert_all" ON rooms
  FOR INSERT WITH CHECK (true);

-- Everyone can update rooms (turn validation on client side)
CREATE POLICY "rooms_update_all" ON rooms
  FOR UPDATE USING (true) WITH CHECK (true);

-- 4. Enable Realtime on the rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
