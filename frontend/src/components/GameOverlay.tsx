// components/GameOverlay.js
import { useEffect } from 'react';
import { setTimeout, clearTimeout } from 'worker-timers';

interface GameOverlayProps{
  onComplete: () => void;
  roundNo: number
}

function GameOverlay({ onComplete, roundNo }: GameOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 1000); // 1s duration for animation
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-r from-primary to-secondary z-50">
      <div className="relative text-white font-bold text-6xl flex items-center space-x-4">
        <span className="animate-slideInRight">Round</span>
        <span className="animate-slideInLeft">{roundNo}</span>
      </div>
    </div>
  );
}


export default GameOverlay;