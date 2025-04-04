-- Add new columns
ALTER TABLE public.quiz_history
ADD COLUMN topic TEXT,
ADD COLUMN category TEXT;

-- Backfill data from the existing subject column
-- This assumes the format is "Topic (Category)" or just "Topic"
-- It handles potential leading/trailing spaces
UPDATE public.quiz_history
SET
  topic = CASE
    WHEN subject LIKE '%(%)%' THEN trim(substring(subject from '^(.*?)\s*\('))
    ELSE trim(subject)
  END,
  category = CASE
    WHEN subject LIKE '%(%)%' THEN trim(substring(subject from '\(([^)]+)\)$'))
    ELSE NULL
  END;

-- Add NOT NULL constraint to topic after backfilling
ALTER TABLE public.quiz_history
ALTER COLUMN topic SET NOT NULL;

-- Drop the old subject column
ALTER TABLE public.quiz_history
DROP COLUMN subject;
