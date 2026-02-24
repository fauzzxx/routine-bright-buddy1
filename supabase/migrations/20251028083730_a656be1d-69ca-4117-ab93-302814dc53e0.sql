-- Fix RLS policy for default_routines to be permissive
DROP POLICY IF EXISTS "Anyone can view default routines" ON default_routines;
CREATE POLICY "Anyone can view default routines" 
ON default_routines 
FOR SELECT 
TO public
USING (true);

-- Add icon field to flashcards table
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS icon text DEFAULT '📝';