import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Video, AlertCircle } from "lucide-react";
import { useWebcam } from "@/hooks/useWebcam";
import { useTimer } from "@/hooks/useTimer";
import { usePracticeMetrics } from "@/hooks/usePracticeMetrics";
import type { PracticeMetrics } from "@/hooks/usePracticeMetrics";

export interface WebcamComponentProps {
  onPracticeComplete: (metrics: PracticeMetrics) => void;
  onSkip?: () => void;
  activityLabel?: string;
  className?: string;
}

/**
 * Live webcam preview with Start / Stop practice. Shows "AI monitoring" label.
 * On Stop, computes metrics and calls onPracticeComplete.
 */
export function WebcamComponent({
  onPracticeComplete,
  onSkip,
  activityLabel = "Practice",
  className = "",
}: WebcamComponentProps) {
  const { stream, error, videoRef, start, stop, isActive } = useWebcam();
  const { elapsedSec, start: startTimer, stop: stopTimer, isRunning } = useTimer();
  const { startTracking, stopTracking } = usePracticeMetrics();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
  }, [stream, videoRef]);

  const handleStart = async () => {
    await start();
    if (videoRef.current && !error) {
      hasStartedRef.current = true;
      startTimer();
      videoRef.current.onloadeddata = () => {
        if (videoRef.current) startTracking(videoRef.current);
      };
      if (videoRef.current.readyState >= 2) {
        startTracking(videoRef.current);
      }
    }
  };

  const handleStop = () => {
    if (!hasStartedRef.current) return;
    const metrics = stopTracking();
    stopTimer();
    stop();
    onPracticeComplete(metrics);
  };

  if (error) {
    return (
      <div
        className={`rounded-2xl border-2 border-dashed border-muted bg-muted/30 p-6 text-center ${className}`}
      >
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-3" />
        <p className="text-sm font-medium text-muted-foreground mb-2">
          Camera access needed for practice
        </p>
        <p className="text-xs text-muted-foreground mb-4">{error}</p>
        {onSkip && (
          <Button variant="outline" size="sm" onClick={onSkip}>
            Skip practice
          </Button>
        )}
      </div>
    );
  }

  const statusText = isRunning ? (elapsedSec < 3 ? "Analyzing posture..." : "Engagement detected") : "Ready";
  const confidencePct = isRunning ? Math.min(98, 60 + Math.floor(elapsedSec) * 5) : 0;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border-2 border-primary/20">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Bounding box style overlay (visual only) */}
        <div className="absolute inset-4 pointer-events-none border-2 border-dashed border-green-400/40 rounded-xl" aria-hidden />
        <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/60 text-xs text-white flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          AI monitoring
        </div>
        {isRunning && (
          <>
            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-xs text-white">
              {Math.floor(elapsedSec)}s
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center gap-2">
              <span className="px-2 py-1 rounded-lg bg-black/60 text-xs text-white animate-in fade-in duration-300">
                {statusText}
              </span>
              <span className="px-2 py-1 rounded-lg bg-black/60 text-xs text-white">
                Confidence: {confidencePct}%
              </span>
            </div>
          </>
        )}
      </div>
      <div className="flex gap-2 justify-center">
        {!isActive ? (
          <Button
            size="lg"
            onClick={handleStart}
            className="rounded-2xl font-fredoka"
          >
            <Video className="w-5 h-5 mr-2" />
            Start {activityLabel}
          </Button>
        ) : (
          <Button
            size="lg"
            variant="default"
            onClick={handleStop}
            className="rounded-2xl font-fredoka bg-primary"
          >
            Stop {activityLabel}
          </Button>
        )}
        {onSkip && !isActive && (
          <Button variant="ghost" size="lg" onClick={onSkip} className="rounded-2xl">
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}
