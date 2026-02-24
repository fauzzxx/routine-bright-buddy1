import os
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from urllib.parse import unquote
from mangum import Mangum

app = FastAPI(title="RoutineAI Local Backend")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

API_DIR = os.path.dirname(os.path.abspath(__file__))
RECORDINGS_DIR = os.path.join(API_DIR, "recordings")

# Mapping of keywords to your filenames
PROMPT_TO_VIDEO = {
    "brushing your teeth": "brushing your teeth.mp4",
    "brush teeth flashcard": "brushing your teeth.mp4",
    "brush teeth": "brushing your teeth.mp4",
    "brush your teeth": "brushing your teeth.mp4",
    "teeth": "brushing your teeth.mp4",
    "brush": "brushing your teeth.mp4",
    "tooth": "brushing your teeth.mp4",
    "wakingup": "wakingup.mp4",
    "waking up": "wakingup.mp4",
    "wake up": "wakingup.mp4",
    "wake": "wakingup.mp4",
    "morning": "wakingup.mp4",
    "changing clothes": "changing clothes.mp4",
    "change clothes": "changing clothes.mp4",
    "get dressed": "changing clothes.mp4",
    "put on clothes": "changing clothes.mp4",
    "dress": "changing clothes.mp4",
    "wear": "changing clothes.mp4",
    "clothes": "changing clothes.mp4",
    "eating breakfast": "Eating breakfast.mp4",
    "eat breakfast": "Eating breakfast.mp4",
    "breakfast": "Eating breakfast.mp4",
    "eat": "Eating breakfast.mp4",
    "lunch": "Eating breakfast.mp4",
    "dinner": "Eating breakfast.mp4",
    "night clothes": "night clothes.mp4",
    "pajamas": "night clothes.mp4",
    "put on pajamas": "night clothes.mp4",
    "night": "night clothes.mp4",
    "reading a book": "reading a book.mp4",
    "read a book": "reading a book.mp4",
    "read": "reading a book.mp4",
    "book": "reading a book.mp4",
    "story": "reading a book.mp4",
}

@app.get("/")
def read_root():
    return {"status": "Online", "message": "RoutineAI API is working!", "dir": RECORDINGS_DIR}

@app.get("/api/health")
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/api/recordings/{filename}")
@app.get("/recordings/{filename}")
async def get_recording(filename: str):
    name = os.path.basename(unquote(filename))
    file_path = os.path.join(RECORDINGS_DIR, name)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail=f"File not found: {name}")
    return FileResponse(file_path, media_type="video/mp4")

@app.post("/api/generate-animation")
@app.post("/generate-animation")
async def generate_animation(prompt: str):
    print(f"➜ Matching prompt: '{prompt}'", flush=True)
    
    # Fuzzy matching logic
    pl = prompt.lower().strip()
    fname = None
    for keyword, video_file in sorted(PROMPT_TO_VIDEO.items(), key=lambda x: -len(x[0])):
        if keyword in pl:
            fname = video_file
            break
    
    if not fname:
        # One last try: individual words match
        words = [w for w in pl.replace(".", " ").replace(",", " ").split() if len(w) >= 3]
        for word in words:
            for keyword, video_file in PROMPT_TO_VIDEO.items():
                if word in keyword:
                    fname = video_file
                    break
            if fname: break
            
    if not fname:
        print(f"  ❓ No match found for: '{prompt}'", flush=True)
        raise HTTPException(status_code=404, detail=f"No video found for: {prompt}")
    
    print(f"  ✨ Found: {fname}", flush=True)
    return {"video_path": f"/api/recordings/{fname}"}

handler = Mangum(app)
