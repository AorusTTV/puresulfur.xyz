
import React, { useState, useEffect } from 'react';

interface CoinFlipAnimationProps {
  isFlipping: boolean;
  result?: 'heads' | 'tails';
  onAnimationComplete?: () => void;
}

export const CoinFlipAnimation: React.FC<CoinFlipAnimationProps> = ({
  isFlipping,
  result,
  onAnimationComplete
}) => {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'preparing' | 'flipping' | 'final' | 'result'>('idle');
  const [flipCount, setFlipCount] = useState(0);
  const [coinRotation, setCoinRotation] = useState(0);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (isFlipping && result) {
      setAnimationPhase('final');
      setCoinRotation(0);
      setShowParticles(false);
      // Animation sequence
      const startAnimation = () => {
        // Animate flips
        let flips = 0;
        const totalFlips = 3;
        const flipDuration = 500; // ms per flip
        const flipInterval = setInterval(() => {
          flips++;
          setCoinRotation(prev => prev + 360);
          setShowParticles(true);
          setTimeout(() => setShowParticles(false), 200);
          if (flips === totalFlips) {
            clearInterval(flipInterval);
            // Land on the correct result
            setTimeout(() => {
              setCoinRotation(totalFlips * 360 + (result === 'heads' ? 0 : 180));
              setAnimationPhase('final');
              setTimeout(() => {
                setAnimationPhase('result');
                setTimeout(() => {
                  onAnimationComplete?.();
                }, 4000);
              }, 2000); // Pause on result
            }, flipDuration);
          }
        }, flipDuration);
      };
      setTimeout(startAnimation, 500); // Short preparation
    }
  }, [isFlipping, result, onAnimationComplete]);

  if (!isFlipping && animationPhase === 'idle') {
    return (
      <div className="flex justify-center items-center p-8">
        <div 
          className="w-32 h-32 rounded-full shadow-lg transition-transform hover:scale-105"
          style={{
            backgroundImage: 'url(/lovable-uploads/a8097161-6529-41c0-9121-c0f289ee4923.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      </div>
    );
  }

  const getSideLabel = (side: 'heads' | 'tails') => {
    return side === 'heads' ? 'SULFUR' : 'SCRAP';
  };

  const getSideColor = (side: 'heads' | 'tails') => {
    return side === 'heads' ? 'text-primary' : 'text-destructive';
  };

  const getAnimationClass = () => {
    switch (animationPhase) {
      case 'preparing':
        return 'animate-pulse scale-110';
      case 'flipping':
        return 'animate-[coinFlipSmooth_3s_ease-in-out_infinite]';
      case 'final':
        return 'animate-[coinFlipFinal_3s_e ase-out] scale-150';
      default:
        return '';
    }
  };

  const getGlowClass = () => {
    switch (animationPhase) {
      case 'preparing':
        return 'shadow-lg shadow-primary/30';
      case 'flipping':
        return 'shadow-xl shadow-primary/50';
      case 'final':
        return 'shadow-2xl shadow-yellow-500/70 ring-4 ring-yellow-500/50';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 relative overflow-hidden">
      {/* Background effects */}
      {animationPhase !== 'idle' && (
        <div className="absolute inset-0 -z-10">
          {/* Animated background */}
          <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 ${
            animationPhase === 'flipping' ? 'animate-pulse' : ''
          }`} />
          
          {/* Particle effects */}
          {showParticles && (
            <div className="absolute inset-0">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                  style={{
                    left: `${25 + (i * 15)}%`,
                    top: `${35 + (i * 10)}%`,
                    animationDelay: `${i * 0.3}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main coin container */}
      <div className="relative">
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 ${
          animationPhase === 'preparing' ? 'bg-primary/40 scale-110' :
          animationPhase === 'flipping' ? 'bg-primary/60 scale-125' :
          animationPhase === 'final' ? 'bg-gradient-to-r from-yellow-500/80 via-orange-500/80 to-red-500/80 scale-150' :
          'opacity-0 scale-100'
        }`} />
        
        {/* Coin */}
        <div
          className={`w-32 h-32 rounded-full transition-transform duration-500 ease-in-out ${getGlowClass()}`}
          style={{
            transform: `rotateY(${coinRotation}deg)`,
            backgroundImage: ((coinRotation % 360 >= 90 && coinRotation % 360 < 270)
              ? 'url(/lovable-uploads/7facad7d-4471-4e0f-9dca-a2c9d41f56fe.png)' // tails
              : 'url(/lovable-uploads/a8097161-6529-41c0-9121-c0f289ee4923.png)'), // heads
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>
      
      {/* Status text */}
      {animationPhase !== 'idle' && animationPhase !== 'result' && (
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <div className={`text-xl font-bold animate-pulse ${
              animationPhase === 'final' ? 'text-yellow-500' :
              'text-foreground'
            }`}>
              {animationPhase === 'flipping' && '🔄 Flipping...'}
              {animationPhase === 'final' && '🎉 Final Flip! 🎉'}
            </div>
            <div className="text-sm text-muted-foreground">
              {animationPhase === 'flipping' && 'Watch the coin dance...'}
              {animationPhase === 'final' && 'The moment of truth!'}
            </div>
          </div>
        </div>
      )}
      
      {/* Result display */}
      {animationPhase === 'result' && result && (
        <div className="text-center space-y-6 animate-fade-in">
          {/* Winner announcement */}
          <div className="space-y-4">
            <div className="text-3xl font-bold text-foreground mb-4">
              🎉 WINNER! 🎉
            </div>
            <div className={`text-5xl font-bold ${getSideColor(result)} animate-bounce`}>
              {getSideLabel(result)}
            </div>
            <div className="text-lg text-muted-foreground">
              The coin has spoken!
            </div>
          </div>
          
          {/* Celebration effects */}
          <div className="flex items-center justify-center space-x-4">
            <div className="text-3xl animate-bounce" style={{ animationDelay: '0s' }}>🎊</div>
            <div className="text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🏆</div>
            <div className="text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>🎊</div>
          </div>
          
          {/* Stay tuned message */}
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <div className="text-sm text-muted-foreground">
              Amazing flip! Ready for another round? 🎮
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
