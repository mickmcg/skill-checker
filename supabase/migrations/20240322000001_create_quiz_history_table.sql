-- Create quiz_history table
CREATE TABLE IF NOT EXISTS quiz_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  subject TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_taken INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  questions JSONB
);

-- Enable realtime
alter publication supabase_realtime add table quiz_history;

-- Create policies
DROP POLICY IF EXISTS "Users can view their own quiz history";
CREATE POLICY "Users can view their own quiz history"
ON quiz_history FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own quiz history";
CREATE POLICY "Users can insert their own quiz history"
ON quiz_history FOR INSERT
WITH CHECK (auth.uid() = user_id);
