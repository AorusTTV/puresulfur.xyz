
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Search } from 'lucide-react';
import { CrateContentsDisplay } from './CrateContentsDisplay';
import { RotatingSkinDisplay } from './RotatingSkinDisplay';
import { CrateInspectModal } from './CrateInspectModal';

interface CrateCardProps {
  crate: any;
  isSelected?: boolean;
  onSelect?: (crate: any) => void;
  onAddToBattle?: (crate: any, quantity: number) => void;
}

export const CrateCard: React.FC<CrateCardProps> = ({ 
  crate, 
  isSelected = false, 
  onSelect, 
  onAddToBattle 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [showContents, setShowContents] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);

  const handleSelect = () => {
    onSelect?.(crate);
  };

  const handleAddToBattle = () => {
    if (onAddToBattle) {
      onAddToBattle(crate, quantity);
    }
  };

  const increaseQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const handleInspect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInspectModal(true);
  };

  return (
    <>
      <Card 
        className={`
          relative overflow-hidden transition-all duration-300 cursor-pointer group
          bg-[#1a1a1a] border-[#333] hover:border-primary/50
          ${isSelected 
            ? 'border-primary shadow-lg shadow-primary/30 scale-105' 
            : 'hover:shadow-md'
          }
        `}
        onClick={handleSelect}
      >
        <div className="p-4">
          {/* Crate Header */}
          <div className="text-center mb-4">
            <div className="relative mb-3">
              {/* Enhanced Crate Image */}
              <div className="relative w-32 h-32 mx-auto mb-2">
                <img 
                  src={crate.image} 
                  alt={crate.name}
                  className="w-full h-full object-cover rounded-lg border border-[#333] transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Overlay with rotating skins */}
                <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <RotatingSkinDisplay crateId={crate.id} />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">{crate.name}</h3>
              
              {/* Price */}
              <div className="flex items-center justify-center space-x-1 mb-3">
                <img 
                  src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                  alt="Sulfur" 
                  className="h-5 w-5" 
                />
                <span className="text-lg font-bold text-primary">
                  {crate.price?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          {onAddToBattle && (
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  decreaseQuantity();
                }}
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-[#333] border-[#555] hover:bg-[#444]"
              >
                <Minus className="h-4 w-4 text-white" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Qty:</span>
                <Badge className="bg-primary/20 text-primary border-primary/50 px-3 py-1">
                  {quantity}
                </Badge>
              </div>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  increaseQuantity();
                }}
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-[#333] border-[#555] hover:bg-[#444]"
              >
                <Plus className="h-4 w-4 text-white" />
              </Button>
            </div>
          )}

          {/* Total Cost */}
          {onAddToBattle && quantity > 1 && (
            <div className="text-center mb-4">
              <div className="text-sm text-gray-400">Total Cost:</div>
              <div className="flex items-center justify-center space-x-1">
                <img 
                  src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                  alt="Sulfur" 
                  className="h-4 w-4" 
                />
                <span className="text-lg font-bold text-primary">
                  {(crate.price * quantity).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="flex space-x-2 mb-4">
            {/* ADD Button (styled like in the image) */}
            {onAddToBattle && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToBattle();
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-sm py-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                ADD
              </Button>
            )}
            
            {/* Inspect Button */}
            <Button
              onClick={handleInspect}
              variant="outline"
              size="icon"
              className="bg-[#333] border-[#555] hover:bg-[#444] p-2"
            >
              <Search className="h-4 w-4 text-white" />
            </Button>
          </div>

          {/* Select Button */}
          <Button
            onClick={handleSelect}
            variant={isSelected ? "default" : "outline"}
            className={`w-full ${
              isSelected 
                ? 'bg-primary hover:bg-primary/80' 
                : 'bg-[#333] border-[#555] hover:bg-[#444] text-white'
            }`}
          >
            {isSelected ? 'Selected' : 'Select Crate'}
          </Button>

          {/* Crate Contents Display (existing) */}
          <CrateContentsDisplay
            crateId={crate.id}
            isExpanded={showContents}
            onToggle={() => {
              setShowContents(!showContents);
            }}
          />
        </div>

        {/* Selection Glow Effect */}
        {isSelected && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 animate-pulse" />
        )}
      </Card>

      {/* Inspect Modal */}
      <CrateInspectModal
        open={showInspectModal}
        onOpenChange={setShowInspectModal}
        crate={crate}
      />
    </>
  );
};
