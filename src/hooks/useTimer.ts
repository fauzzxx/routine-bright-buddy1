import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Simple elapsed timer: start, stop, reset. Returns elapsed seconds.
 */
export function useTimer() {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef(0);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    startTimeRef.current = Date.now();
    accumulatedRef.current = elapsedSec;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsedSec(
        accumulatedRef.current + (Date.now() - startTimeRef.current) / 1000
      );
    }, 100);
  }, [elapsedSec]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setElapsedSec(0);
    accumulatedRef.current = 0;
  }, [stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { elapsedSec, isRunning, start, stop, reset };
}
