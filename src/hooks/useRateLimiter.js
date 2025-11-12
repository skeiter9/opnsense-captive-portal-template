import { useState, useEffect } from 'react';

export function useRateLimiter(maxAttempts = 5, delayMinutes = 10) {
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockUntil, setBlockUntil] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('loginAttempts');
    const storedBlock = localStorage.getItem('loginBlockedUntil');
    
    if (stored) setAttempts(parseInt(stored, 10));
    
    if (storedBlock) {
      const blockTime = new Date(storedBlock);
      if (blockTime > new Date()) {
        setIsBlocked(true);
        setBlockUntil(blockTime);
      } else {
        localStorage.removeItem('loginBlockedUntil');
        localStorage.removeItem('loginAttempts');
      }
    }
  }, []);

  const recordAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem('loginAttempts', newAttempts.toString());

    if (newAttempts >= maxAttempts) {
      const blockTime = new Date();
      blockTime.setMinutes(blockTime.getMinutes() + delayMinutes);
      setIsBlocked(true);
      setBlockUntil(blockTime);
      localStorage.setItem('loginBlockedUntil', blockTime.toISOString());
    }
  };

  const reset = () => {
    setAttempts(0);
    setIsBlocked(false);
    setBlockUntil(null);
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('loginBlockedUntil');
  };

  return {
    attempts,
    isBlocked,
    blockUntil,
    recordAttempt,
    reset,
    remainingAttempts: maxAttempts - attempts,
  };
}
