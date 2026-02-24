// When empty, use same-origin /api (Vercel). When set (e.g. http://localhost:8000), use that backend.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";

export async function requestGenerateAnimation(prompt: string): Promise<{ video_path: string }> {
  const base = BACKEND_URL ? BACKEND_URL.replace(/\/$/, "") : "";
  const path = "/api/generate-animation";
  // If base exists, we use it directly: http://127.0.0.1:8000/api/generate-animation
  const url = base ? `${base}${path}?prompt=${encodeURIComponent(prompt)}` : `${path}?prompt=${encodeURIComponent(prompt)}`;
  console.log("🎬 Requesting animation from:", url);
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const j = JSON.parse(text) as { detail?: string };
      if (typeof j.detail === "string") message = j.detail;
    } catch {
      /* use text as-is */
    }
    throw new Error(message || `Failed to load recording (${res.status})`);
  }
  return res.json();
}