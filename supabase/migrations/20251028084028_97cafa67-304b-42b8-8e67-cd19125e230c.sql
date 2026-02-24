-- Update default routines to add icons to flashcards
UPDATE default_routines 
SET flashcards = '[
  {"title": "Wake Up", "description": "Open your eyes and sit up in bed", "icon": "👁️"},
  {"title": "Use the Bathroom", "description": "Go to the toilet and wash your hands", "icon": "🚽"},
  {"title": "Brush Teeth", "description": "Brush your teeth for 2 minutes", "icon": "🪥"},
  {"title": "Get Dressed", "description": "Put on your clothes for the day", "icon": "👕"},
  {"title": "Eat Breakfast", "description": "Have a healthy breakfast", "icon": "🍳"}
]'::jsonb
WHERE title = 'Morning Routine';

UPDATE default_routines 
SET flashcards = '[
  {"title": "Put on Pajamas", "description": "Change into comfortable sleepwear", "icon": "👔"},
  {"title": "Brush Teeth", "description": "Clean your teeth before bed", "icon": "🪥"},
  {"title": "Read a Story", "description": "Enjoy a bedtime story", "icon": "📖"},
  {"title": "Lights Out", "description": "Turn off the lights and go to sleep", "icon": "🌙"}
]'::jsonb
WHERE title = 'Bedtime Routine';

UPDATE default_routines 
SET flashcards = '[
  {"title": "Turn on Water", "description": "Turn on the tap with warm water", "icon": "💧"},
  {"title": "Apply Soap", "description": "Put soap on your hands", "icon": "🧴"},
  {"title": "Scrub", "description": "Rub your hands together for 20 seconds", "icon": "🤲"},
  {"title": "Rinse", "description": "Wash all the soap off with water", "icon": "💦"},
  {"title": "Dry", "description": "Dry your hands with a towel", "icon": "🧻"}
]'::jsonb
WHERE title = 'Hand Washing';

UPDATE default_routines 
SET flashcards = '[
  {"title": "Pack Backpack", "description": "Put books and supplies in your bag", "icon": "🎒"},
  {"title": "Put on Shoes", "description": "Wear comfortable shoes", "icon": "👟"},
  {"title": "Say Goodbye", "description": "Hug your family goodbye", "icon": "👋"},
  {"title": "Walk to Bus", "description": "Go to the bus stop or car", "icon": "🚌"},
  {"title": "Enter School", "description": "Walk into your classroom", "icon": "🏫"}
]'::jsonb
WHERE title = 'Going to School';

UPDATE default_routines 
SET flashcards = '[
  {"title": "Wash Hands", "description": "Clean your hands before eating", "icon": "🧼"},
  {"title": "Sit at Table", "description": "Take your seat at the dining table", "icon": "🪑"},
  {"title": "Wait for Food", "description": "Stay seated while food is served", "icon": "⏳"},
  {"title": "Eat Slowly", "description": "Take small bites and chew well", "icon": "🍴"},
  {"title": "Clean Up", "description": "Put your dishes in the sink", "icon": "🧽"}
]'::jsonb
WHERE title = 'Meal Time';

UPDATE default_routines 
SET flashcards = '[
  {"title": "Enter Salon", "description": "Walk into the hair salon", "icon": "🏪"},
  {"title": "Sit in Chair", "description": "Sit still in the special chair", "icon": "💺"},
  {"title": "Wear Cape", "description": "Let them put a cape around you", "icon": "🦸"},
  {"title": "Haircut Time", "description": "Stay calm while hair is cut", "icon": "✂️"},
  {"title": "Look in Mirror", "description": "See your new haircut and say thank you", "icon": "🪞"}
]'::jsonb
WHERE title = 'Getting a Haircut';