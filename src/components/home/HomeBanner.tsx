
import React from 'react';
import { Home } from 'lucide-react';

export const HomeBanner: React.FC = () => {
  return (
    <div 
      className="relative h-64 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(/lovable-uploads/c453d037-e0b6-48b4-bda7-3480e562faba.png)` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Banner Content */}
      <div className="relative h-full flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Home className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-orbitron gaming-text-glow">
              PURESULFUR
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">The ultimate Rust gambling experience</p>
        </div>
      </div>
    </div>
  );
};
