
import React from 'react';
import { Settings, Wrench } from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-secondary flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        {/* Swedish Key (Wrench) Icon */}
        <div className="flex justify-center">
          <Wrench className="h-24 w-24 text-primary" />
        </div>
        
        {/* Spinning Gears */}
        <div className="flex justify-center space-x-4">
          <Settings className="h-16 w-16 text-primary animate-spin" />
          <Settings className="h-20 w-20 text-accent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
          <Settings className="h-16 w-16 text-primary animate-spin" style={{ animationDuration: '2s' }} />
        </div>
        
        {/* Maintenance Message with green styling */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white neon-text font-orbitron">
            MAINTENANCE MODE
          </h1>
          <div className="gaming-border rounded-lg p-6 bg-card/60 backdrop-blur-sm">
            <p className="text-xl text-foreground max-w-md mx-auto font-rajdhani">
              The server is currently under maintenance. Please check back later.
            </p>
            <div className="text-sm text-muted-foreground mt-4 font-rajdhani">
              We're working hard to improve your experience!
            </div>
          </div>
          
          {/* Gaming scan line effect */}
          <div className="gaming-scan-line"></div>
        </div>
        
        {/* Additional gaming effects */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};
