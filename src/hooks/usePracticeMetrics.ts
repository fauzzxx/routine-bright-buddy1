import { useRef, useCallback } from "react";

export interface PracticeMetrics {
  engagementScore: number;
  motionScore: number;
  responseTimeSec: number;
  totalTimeSec: number;
}

const SAMPLE_INTERVAL_MS = 200;
const MOTION_THRESHOLD = 25;
const DOWNSCALE = 0.2;

/**
 * Uses canvas frame-diff to estimate motion (activity). Engagement is derived from
 * fraction of frames with motion (user "doing something" in frame). Response time
 * = time to first motion. No MediaPipe dependency; works in all environments.
 */
export function usePracticeMetrics() {
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<ImageData | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const startTimeRef = useRef<number>(0);
  const firstMotionAtRef = useRef<number | null>(null);
  const framesWithMotionRef = useRef(0);
  const totalFramesRef = useRef(0);
  const lastSampleRef = useRef<number>(0);

  const measureFrame = useCallback(
    (video: HTMLVideoElement): number => {
      if (video.readyState < 2 || video.videoWidth === 0) return 0;
      const w = Math.max(1, Math.floor(video.videoWidth * DOWNSCALE));
      const h = Math.max(1, Math.floor(video.videoHeight * DOWNSCALE));
      let ctx = ctxRef.current;
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvasRef.current = canvas;
        ctx = canvas.getContext("2d");
        ctxRef.current = ctx;
      }
      if (!ctx || !canvas) return 0;
      ctx.drawImage(video, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const last = lastFrameRef.current;
      let diff = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (last) {
          const r = Math.abs(data[i] - last.data[i]);
          const g = Math.abs(data[i + 1] - last.data[i + 1]);
          const b = Math.abs(data[i + 2] - last.data[i + 2]);
          if (r + g + b > MOTION_THRESHOLD) diff++;
        }
      }
      lastFrameRef.current = imageData;
      const totalPixels = (w * h);
      return totalPixels > 0 ? (diff / totalPixels) * 100 : 0;
    },
    []
  );

  const tick = useCallback(
    (video: HTMLVideoElement) => {
      const now = Date.now();
      if (now - lastSampleRef.current < SAMPLE_INTERVAL_MS) {
        rafRef.current = requestAnimationFrame(() => tick(video));
        return;
      }
      lastSampleRef.current = now;
      totalFramesRef.current += 1;
      const motionPct = measureFrame(video);
      const hasMotion = motionPct > 1;
      if (hasMotion) {
        framesWithMotionRef.current += 1;
        if (firstMotionAtRef.current === null) {
          firstMotionAtRef.current = (now - startTimeRef.current) / 1000;
        }
      }
      rafRef.current = requestAnimationFrame(() => tick(video));
    },
    [measureFrame]
  );

  const startTracking = useCallback((video: HTMLVideoElement) => {
    startTimeRef.current = Date.now();
    firstMotionAtRef.current = null;
    framesWithMotionRef.current = 0;
    totalFramesRef.current = 0;
    lastFrameRef.current = null;
    lastSampleRef.current = 0;
    rafRef.current = requestAnimationFrame(() => tick(video));
  }, [tick]);

  const stopTracking = useCallback((): PracticeMetrics => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    const totalSec = (Date.now() - startTimeRef.current) / 1000;
    const totalFrames = Math.max(1, totalFramesRef.current);
    const engagementScore = Math.min(
      100,
      Math.round((framesWithMotionRef.current / totalFrames) * 100)
    );
    const motionScore = engagementScore;
    const responseTimeSec =
      firstMotionAtRef.current !== null ? firstMotionAtRef.current : totalSec;
    ctxRef.current = null;
    canvasRef.current = null;
    lastFrameRef.current = null;
    return {
      engagementScore,
      motionScore,
      responseTimeSec: Math.round(responseTimeSec * 100) / 100,
      totalTimeSec: Math.round(totalSec * 100) / 100,
    };
  }, []);

  return { startTracking, stopTracking };
}
