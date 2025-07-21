
import React, { useState } from 'react';
import { CrateCard } from './CrateCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { rustCrates } from './rustCrateData';

interface CrateGridProps {
  selectedCrate: any | null;
  onCrateSelect: (crate: any) => void;
  onAddToBattle?: (crate: any, quantity: number) => void;
}

export const CrateGrid: React.FC<CrateGridProps> = ({ 
  selectedCrate, 
  onCrateSelect, 
  onAddToBattle 
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Select Your Crate</h2>
        <div className="text-sm text-muted-foreground">
          {rustCrates.length} crate available
        </div>
      </div>

      {/* Crate Grid - Centered layout for single crate */}
      <div className="flex justify-center">
        {rustCrates.map((crate) => (
          <CrateCard
            key={crate.id}
            crate={crate}
            isSelected={selectedCrate?.id === crate.id}
            onSelect={onCrateSelect}
            onAddToBattle={onAddToBattle}
          />
        ))}
      </div>

      {rustCrates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No crates available.</p>
        </div>
      )}
    </div>
  );
};
