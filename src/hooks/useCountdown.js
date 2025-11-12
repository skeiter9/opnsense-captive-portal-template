import { useState, useEffect, useRef } from 'react';

export function useCountdown(endTime) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeRemaining = () => {
      const now = Date.now();
      const end = new Date(endTime).getTime();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      return remaining;
    };

    setTimeRemaining(calculateTimeRemaining());

    intervalRef.current = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        window.location.reload();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [endTime]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isExpired: timeRemaining <= 0,
  };
}
