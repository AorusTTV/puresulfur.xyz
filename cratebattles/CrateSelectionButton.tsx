
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CrateSelectionModal } from './CrateSelectionModal';

interface CrateData {
  id: string;
  name: string;
  price: number;
  category: string[];
  rarity: string;
  image: string;
  items: Array<{
    name: string;
    chance: number;
    img: string;
  }>;
}

interface CrateSelectionButtonProps {
  onCratesSelected: (crates: CrateData[]) => void;
}

export const CrateSelectionButton: React.FC<CrateSelectionButtonProps> = ({
  onCratesSelected
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCratesSelected = (crates: CrateData[]) => {
    onCratesSelected(crates);
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold"
      >
        <Plus className="mr-2 h-4 w-4" />
        ADD CRATES
      </Button>

      <CrateSelectionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCratesSelected={handleCratesSelected}
      />
    </>
  );
};
