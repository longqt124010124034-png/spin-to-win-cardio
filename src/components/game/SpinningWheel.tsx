import React, { useState, useRef } from 'react';
import { useGame } from './GameContext';
import { Button } from '@/components/ui/button';
import { Play, Trophy } from 'lucide-react';

export const SpinningWheel: React.FC = () => {
  const { state, dispatch } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  if (state.currentScreen !== 'wheel') return null;

  const spinWheel = () => {
    if (isSpinning || state.availableSeats.length === 0) return;

    setIsSpinning(true);
    setSelectedNumber(null);

    // Random selection from available seats
    const randomIndex = Math.floor(Math.random() * state.availableSeats.length);
    const selectedSeat = state.availableSeats[randomIndex];

    // Calculate rotation (multiple full rotations + final position)
    const baseRotation = 1800; // 5 full rotations
    const segmentAngle = 360 / state.maxSeats; // Each number takes equal degrees
    const targetAngle = (state.maxSeats - selectedSeat) * segmentAngle + (segmentAngle / 2);
    const finalRotation = baseRotation + targetAngle;

    if (wheelRef.current) {
      wheelRef.current.style.setProperty('--final-rotation', `${finalRotation}deg`);
      wheelRef.current.classList.add('wheel-spin');
    }

    // Play spin sound (placeholder)
    setTimeout(() => {
      // Play stop sound (placeholder)
      setSelectedNumber(selectedSeat);
      setIsSpinning(false);
      
      if (wheelRef.current) {
        wheelRef.current.classList.remove('wheel-spin');
      }

      setTimeout(() => {
        dispatch({ type: 'SELECT_SEAT', payload: selectedSeat });
      }, 1000);
    }, 3000);
  };

  const renderWheelSegments = () => {
    const segments = [];
    for (let i = 1; i <= state.maxSeats; i++) {
      const angle = (i - 1) * (360 / state.maxSeats); // Equal degrees per segment
      const isBlue = i % 2 === 0;
      const isAvailable = state.availableSeats.includes(i);
      
      segments.push(
        <div
          key={i}
          className={`absolute w-1 h-20 origin-bottom ${
            isBlue ? 'bg-transparent' : 'bg-transparent'
          } ${!isAvailable ? 'opacity-30' : ''} flex items-start justify-center text-xs font-bold text-white`}
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: '50% 160px'
          }}
        >
          <span 
            className="mt-2 transform -rotate-90 bg-black/50 px-2 py-1 rounded text-white font-bold text-sm drop-shadow-lg"
            style={{ transform: `rotate(-${angle}deg)` }}
          >
            {i}
          </span>
        </div>
      );
    }
    return segments;
  };

  return (
    <div className="flex flex-col items-center space-y-8 py-8">
      {/* Wheel Container */}
      <div className={`relative wheel-container ${isSpinning ? 'spinning' : ''}`}>
        {/* Pointer Arrow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-30 wheel-pointer">
          <div className="w-0 h-0 border-l-8 border-r-8 border-b-20 border-l-transparent border-r-transparent border-b-game-gold drop-shadow-2xl glow"></div>
        </div>

        {/* Wheel */}
        <div className="relative flex items-center justify-center">
          <div
            ref={wheelRef}
            className={`relative w-80 h-80 rounded-full border-8 border-game-white wheel-glow neumorphism ${
              isSpinning ? '' : 'transition-transform duration-300 hover:scale-105'
            }`}
            style={{
              background: `conic-gradient(${Array.from({ length: state.maxSeats }, (_, i) => {
                const isBlue = (i + 1) % 2 === 0;
                const color = isBlue ? '#0074D9' : '#FF4136';
                const startAngle = (i * 360) / state.maxSeats;
                const endAngle = ((i + 1) * 360) / state.maxSeats;
                return `${color} ${startAngle}deg ${endAngle}deg`;
              }).join(', ')})`
            }}
          >
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-game-gold to-game-gold/80 rounded-full border-4 border-game-white flex items-center justify-center z-10 glow">
              <Trophy className="w-8 h-8 text-white drop-shadow-lg" />
            </div>

            {/* Wheel Segments with Numbers */}
            <div className="absolute inset-0">
              {renderWheelSegments()}
            </div>

            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-game-white/30"></div>
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <Button
        onClick={spinWheel}
        disabled={isSpinning || state.availableSeats.length === 0}
        size="lg"
        className={`
          px-12 py-6 text-2xl font-bold rounded-2xl transition-all duration-300
          ${isSpinning 
            ? 'bg-muted text-muted-foreground cursor-not-allowed' 
            : 'bg-game-gold hover:bg-game-gold/90 text-white neumorphism pulse-glow hover:scale-110'
          }
        `}
      >
        <Play className={`mr-2 h-6 w-6 ${isSpinning ? 'animate-spin' : ''}`} />
        {isSpinning ? 'ĐANG QUAY...' : 'QUAY'}
      </Button>

      {/* Result Display */}
      {selectedNumber && !isSpinning && (
        <div className="glassmorphism rounded-2xl p-6 bounce-in">
          <h2 className="text-2xl font-bold text-game-gold mb-2">
            🎉 Chúc mừng!
          </h2>
          <p className="text-xl text-game-white">
            Người chơi ghế số <span className="text-game-gold font-bold text-3xl">{selectedNumber}</span>
          </p>
          <p className="text-muted-foreground mt-2">
            Sẵn sàng trả lời câu hỏi thôi nào!
          </p>
        </div>
      )}

      {/* Available Seats Counter */}
      <div className="text-center">
        <p className="text-muted-foreground">
          Còn lại: <span className="text-game-gold font-bold">{state.availableSeats.length}</span> ghế
        </p>
      </div>
    </div>
  );
};