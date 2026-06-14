-- Supabase Dashboard の SQL Editor で実行してください
-- likesテーブル: 1ユーザーが1星座に1いいねのみ

CREATE TABLE IF NOT EXISTS likes (
  id           uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  constellation_id text NOT NULL REFERENCES constellations(id) ON DELETE CASCADE,
  user_id      text    NOT NULL,
  created_at   bigint  DEFAULT (extract(epoch from now()) * 1000)::bigint,
  UNIQUE (constellation_id, user_id)
);

-- RLS有効化
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 全員が読める (いいね数の表示に必要)
CREATE POLICY "likes_select_all" ON likes FOR SELECT USING (true);

-- ログイン済みユーザーは自分のいいねを追加・削除できる
CREATE POLICY "likes_insert_own" ON likes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "likes_delete_own" ON likes FOR DELETE
  USING (auth.uid()::text = user_id);
