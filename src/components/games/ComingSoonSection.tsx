
import React from 'react';
import { Gamepad2 } from 'lucide-react';

export const ComingSoonSection: React.FC = () => {
  return (
    <div className="mt-16 text-center">
      <div className="bg-card/60 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto border border-border/50">
        <Gamepad2 className="h-16 w-16 text-primary mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-foreground mb-2">More Games Coming Soon!</h3>
        <p className="text-foreground/80">
          We're constantly working on new and exciting games. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
};
