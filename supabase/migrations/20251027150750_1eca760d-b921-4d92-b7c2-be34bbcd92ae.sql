-- Create default_routines table for pre-existing routine templates
CREATE TABLE public.default_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  flashcards JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.default_routines ENABLE ROW LEVEL SECURITY;

-- Everyone can view default routines
CREATE POLICY "Anyone can view default routines"
  ON public.default_routines
  FOR SELECT
  USING (true);

-- Insert some default routines
INSERT INTO public.default_routines (title, category, icon, description, flashcards) VALUES
(
  'Morning Routine',
  'Daily Life',
  '🌅',
  'Start your day with a structured morning routine',
  '[
    {"title": "Wake Up", "description": "Open your eyes and sit up in bed"},
    {"title": "Use the Bathroom", "description": "Go to the toilet and wash your hands"},
    {"title": "Brush Teeth", "description": "Brush your teeth for 2 minutes"},
    {"title": "Get Dressed", "description": "Put on your clothes for the day"},
    {"title": "Eat Breakfast", "description": "Have a healthy breakfast"}
  ]'::jsonb
),
(
  'Bedtime Routine',
  'Daily Life',
  '🌙',
  'Wind down with a calming bedtime routine',
  '[
    {"title": "Put on Pajamas", "description": "Change into comfortable sleepwear"},
    {"title": "Brush Teeth", "description": "Clean your teeth before bed"},
    {"title": "Read a Story", "description": "Enjoy a bedtime story"},
    {"title": "Lights Out", "description": "Turn off the lights and go to sleep"}
  ]'::jsonb
),
(
  'Hand Washing',
  'Hygiene',
  '🧼',
  'Learn the proper way to wash hands',
  '[
    {"title": "Turn on Water", "description": "Turn on the tap with warm water"},
    {"title": "Apply Soap", "description": "Put soap on your hands"},
    {"title": "Scrub", "description": "Rub your hands together for 20 seconds"},
    {"title": "Rinse", "description": "Wash all the soap off with water"},
    {"title": "Dry", "description": "Dry your hands with a towel"}
  ]'::jsonb
),
(
  'Going to School',
  'Education',
  '🎒',
  'Prepare for a successful school day',
  '[
    {"title": "Pack Backpack", "description": "Put books and supplies in your bag"},
    {"title": "Put on Shoes", "description": "Wear comfortable shoes"},
    {"title": "Say Goodbye", "description": "Hug your family goodbye"},
    {"title": "Walk to Bus", "description": "Go to the bus stop or car"},
    {"title": "Enter School", "description": "Walk into your classroom"}
  ]'::jsonb
),
(
  'Meal Time',
  'Daily Life',
  '🍽️',
  'Follow steps for a pleasant mealtime',
  '[
    {"title": "Wash Hands", "description": "Clean your hands before eating"},
    {"title": "Sit at Table", "description": "Take your seat at the dining table"},
    {"title": "Wait for Food", "description": "Stay seated while food is served"},
    {"title": "Eat Slowly", "description": "Take small bites and chew well"},
    {"title": "Clean Up", "description": "Put your dishes in the sink"}
  ]'::jsonb
),
(
  'Getting a Haircut',
  'Social',
  '💇',
  'Stay calm during a haircut',
  '[
    {"title": "Enter Salon", "description": "Walk into the hair salon"},
    {"title": "Sit in Chair", "description": "Sit still in the special chair"},
    {"title": "Wear Cape", "description": "Let them put a cape around you"},
    {"title": "Haircut Time", "description": "Stay calm while hair is cut"},
    {"title": "Look in Mirror", "description": "See your new haircut and say thank you"}
  ]'::jsonb
);