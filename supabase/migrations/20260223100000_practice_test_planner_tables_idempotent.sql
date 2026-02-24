-- Idempotent version: safe to run even if some/all tables already exist.
-- Use this if you get "relation already exists" when running the original migration.

-- 1. Practice results
CREATE TABLE IF NOT EXISTS public.practice_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE SET NULL,
  routine_id UUID REFERENCES public.routines(id) ON DELETE SET NULL,
  engagement_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  motion_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  response_time_sec NUMERIC(10,2),
  total_time_sec NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.practice_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own practice_results" ON public.practice_results;
CREATE POLICY "Users can view own practice_results" ON public.practice_results FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own practice_results" ON public.practice_results;
CREATE POLICY "Users can insert own practice_results" ON public.practice_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Test results
CREATE TABLE IF NOT EXISTS public.test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  engagement NUMERIC(5,2) NOT NULL DEFAULT 0,
  motion_accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  time_efficiency NUMERIC(5,2) NOT NULL DEFAULT 0,
  final_score NUMERIC(5,2) NOT NULL,
  performance_tier TEXT NOT NULL,
  total_time_sec NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own test_results" ON public.test_results;
CREATE POLICY "Users can view own test_results" ON public.test_results FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own test_results" ON public.test_results;
CREATE POLICY "Users can insert own test_results" ON public.test_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Planner events
CREATE TABLE IF NOT EXISTS public.planner_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  activity_type TEXT,
  repeat_option TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own planner_events" ON public.planner_events;
CREATE POLICY "Users can view own planner_events" ON public.planner_events FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own planner_events" ON public.planner_events;
CREATE POLICY "Users can insert own planner_events" ON public.planner_events FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own planner_events" ON public.planner_events;
CREATE POLICY "Users can update own planner_events" ON public.planner_events FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own planner_events" ON public.planner_events;
CREATE POLICY "Users can delete own planner_events" ON public.planner_events FOR DELETE USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_planner_events_updated_at ON public.planner_events;
CREATE TRIGGER update_planner_events_updated_at BEFORE UPDATE ON public.planner_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. User badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_key)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own user_badges" ON public.user_badges;
CREATE POLICY "Users can view own user_badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own user_badges" ON public.user_badges;
CREATE POLICY "Users can insert own user_badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. User points
CREATE TABLE IF NOT EXISTS public.user_points (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own user_points" ON public.user_points;
CREATE POLICY "Users can view own user_points" ON public.user_points FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own user_points" ON public.user_points;
CREATE POLICY "Users can insert own user_points" ON public.user_points FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own user_points" ON public.user_points;
CREATE POLICY "Users can update own user_points" ON public.user_points FOR UPDATE USING (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_user_points_updated_at ON public.user_points;
CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON public.user_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
