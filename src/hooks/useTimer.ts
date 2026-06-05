import { useEffect, useRef } from 'react';

export function useTimer(
  isActive: boolean,
  timeLeft: number,
  onTick: (time: number) => void,
  onTimeout: () => void
) {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        onTick(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      onTimeout();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, onTick, onTimeout]);

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  return { stopTimer };
}
