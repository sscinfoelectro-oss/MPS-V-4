import { useState, useEffect } from 'react';

const TimerDisplay = ({ startTime, maxHours, onComplete }) => {
  const [elapsed, setElapsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Use UTC to match SQLite datetime('now') which stores UTC
      const start = Date.UTC(
        parseInt(startTime.substring(0, 4)),
        parseInt(startTime.substring(5, 7)) - 1,
        parseInt(startTime.substring(8, 10)),
        parseInt(startTime.substring(11, 13)),
        parseInt(startTime.substring(14, 16)),
        parseInt(startTime.substring(17, 19))
      );
      const now = new Date();
      const nowUtc = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      );
      const elapsedSeconds = Math.floor((nowUtc - start) / 1000);
      const maxSeconds = maxHours * 3600;
      
      if (elapsedSeconds >= maxSeconds) {
        if (!isComplete) {
          setIsComplete(true);
          if (onComplete) onComplete();
        }
        setElapsed(maxSeconds);
      } else {
        setElapsed(elapsedSeconds);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, maxHours, isComplete]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = maxHours > 0 ? Math.min((elapsed / (maxHours * 3600)) * 100, 100) : 0;

  return (
    <span style={{ 
      fontFamily: 'monospace', 
      fontSize: '1.1rem', 
      fontWeight: 'bold',
      color: isComplete ? '#ef4444' : progress > 80 ? '#f59e0b' : '#22c55e',
      backgroundColor: '#1e293b',
      padding: '4px 10px',
      borderRadius: '6px',
      border: isComplete ? '1px solid #ef4444' : '1px solid transparent',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      {isComplete ? '⏰' : '⏱️'} {formatTime(elapsed)} / {maxHours}h
    </span>
  );
};

export default TimerDisplay;