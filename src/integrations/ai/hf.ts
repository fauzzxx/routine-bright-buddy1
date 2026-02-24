// When empty, use same-origin /api (Vercel). When set (e.g. http://localhost:8000), use that backend.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";

export async function requestGenerateAnimation(prompt: string): Promise<{ video_path: string }> {
  const base = BACKEND_URL ? BACKEND_URL.replace(/\/$/, "") : "";
  const path = "/api/generate-animation";
  const url = base ? `${base}${path}?prompt=${encodeURIComponent(prompt)}` : `${path}?prompt=${encodeURIComponent(prompt)}`;
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to generate animation: ${text}`);
  }
  return res.json();
}