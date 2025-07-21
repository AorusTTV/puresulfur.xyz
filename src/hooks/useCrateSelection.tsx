
import { useState } from 'react';
import { Crate } from '@/components/games/cratebattles/crateData';

export const useCrateSelection = () => {
  const [selectedCrate, setSelectedCrate] = useState<Crate | null>(null);

  const handleCrateSelect = (crate: Crate) => {
    setSelectedCrate(crate);
  };

  const clearSelection = () => {
    setSelectedCrate(null);
  };

  return {
    selectedCrate,
    setSelectedCrate,
    handleCrateSelect,
    clearSelection
  };
};
