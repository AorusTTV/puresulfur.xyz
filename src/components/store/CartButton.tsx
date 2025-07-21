
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface CartButtonProps {
  onClick: () => void;
}

export const CartButton: React.FC<CartButtonProps> = ({ onClick }) => {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <div className="relative">
      <Button
        onClick={onClick}
        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 gaming-button-enhanced"
        size="lg"
      >
        <ShoppingCart className="h-5 w-5 mr-2" />
        Cart
      </Button>
      {totalItems > 0 && (
        <Badge 
          className="absolute -top-2 -right-2 bg-red-500 text-white min-w-[20px] h-5 flex items-center justify-center p-1 text-xs"
          variant="destructive"
        >
          {totalItems}
        </Badge>
      )}
    </div>
  );
};
