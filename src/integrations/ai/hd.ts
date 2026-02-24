type Frame = { title: string; description: string };

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";
const API_BASE = BACKEND_URL ? BACKEND_URL.replace(/\/$/, "") : "";
const API_PREFIX = API_BASE ? "" : "/api";

export async function requestHdVideo(
  routineId: string,
  title: string,
  frames: Frame[],
  durationSec = 8,
  aspectRatio = "16:9"
): Promise<{ job_id: string }> {
  const res = await fetch(`${API_BASE}${API_PREFIX}/generate-video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routine_id: routineId, title, frames, duration_sec: durationSec, aspect_ratio: aspectRatio }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to start HD video generation: ${text}`);
  }
  return res.json();
}

export async function checkHdVideoStatus(jobId: string): Promise<{ status: string; url?: string }> {
  const res = await fetch(`${API_BASE}${API_PREFIX}/video-status/${jobId}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to check HD video status: ${text}`);
  }
  return res.json();
}

export async function requestHfVideoSync(
  routineId: string,
  frames: { title: string; description: string; image_url?: string | null }[],
  prompt?: string,
  fps = 7
): Promise<{ status: string; url?: string }>{
  const res = await fetch(`${API_BASE}${API_PREFIX}/generate-video-hf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ routine_id: routineId, frames, prompt, fps }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to generate HF video: ${text}`);
  }
  return res.json();
}