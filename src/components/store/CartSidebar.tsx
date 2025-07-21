
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingCart, Info } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SulfurIcon } from '@/components/ui/SulfurIcon';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TradeResult {
  success: boolean;
  error?: string;
  trade_id?: string;
  message?: string;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice, getTotalItems, getMaxCartItems } = useCart();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [withdrawalsEnabled, setWithdrawalsEnabled] = React.useState(true);

  // Check if store withdrawals are enabled
  React.useEffect(() => {
    const checkWithdrawalStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('are_store_withdrawals_enabled');
        if (!error && data !== null) {
          setWithdrawalsEnabled(data);
        }
      } catch (error) {
        console.error('Error checking withdrawal status:', error);
      }
    };

    if (isOpen) {
      checkWithdrawalStatus();
    }
  }, [isOpen]);

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'covert': return 'border-red-500 text-red-400 bg-red-500/10';
      case '★': return 'border-yellow-500 text-yellow-400 bg-yellow-500/10';
      case 'contraband': return 'border-purple-500 text-purple-400 bg-purple-500/10';
      case 'classified': return 'border-pink-500 text-pink-400 bg-pink-500/10';
      case 'restricted': return 'border-blue-500 text-blue-400 bg-blue-500/10';
      default: return 'border-gray-500 text-gray-400 bg-gray-500/10';
    }
  };

  const handleCheckout = async () => {
    if (!withdrawalsEnabled) {
      toast({
        title: 'Withdrawals Temporarily Disabled',
        description: 'Store withdrawals are currently disabled due to maintenance. Please try again later.',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to checkout',
        variant: 'destructive'
      });
      return;
    }

    if (!profile?.steam_trade_url) {
      toast({
        title: 'Steam Trade URL Required',
        description: 'Please set your Steam trade URL in your profile',
        variant: 'destructive'
      });
      return;
    }

    const totalPrice = getTotalPrice();
    if (!profile || profile.balance < totalPrice) {
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough balance for this purchase',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Double-check withdrawals are still enabled before processing
      const { data: currentStatus } = await supabase.rpc('are_store_withdrawals_enabled');
      if (!currentStatus) {
        toast({
          title: 'Withdrawals Disabled',
          description: 'Store withdrawals have been disabled. Please try again later.',
          variant: 'destructive'
        });
        return;
      }

      // Create trade record using the database function
      const tradeItems = items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const { data: tradeResult, error: tradeError } = await supabase
        .rpc('create_steam_trade', {
          p_user_id: user.id,
          p_trade_type: 'withdrawal',
          p_items: tradeItems,
          p_total_value: totalPrice
        });

      if (tradeError) {
        throw tradeError;
      }

      // Type cast the JSON result to our expected interface with unknown first
      const result = tradeResult as unknown as TradeResult;

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to create trade');
      }

      // Update user balance
      const newBalance = profile.balance - totalPrice;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Add items to user inventory
      for (const item of items) {
        const { error: inventoryError } = await supabase
          .from('user_inventory')
          .insert({
            user_id: user.id,
            item_id: item.id,
            quantity: item.quantity
          });

        if (inventoryError) {
          console.error('Inventory error:', inventoryError);
        }
      }

      toast({
        title: 'Checkout Successful!',
        description: `Purchase completed! Steam trade offer will be sent shortly.`,
      });

      clearCart();
      onClose();
      window.location.reload();

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: 'Failed to complete purchase. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const maxCartItems = getMaxCartItems();

  if (items.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground">Add some items to get started!</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart ({items.length} items)
          </SheetTitle>
          
          {/* Cart Limit Indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>{totalItems}/{maxCartItems} items in cart</span>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4 flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          {items.map((item) => (
            <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
              <img 
                src={item.image_url} 
                alt={item.name} 
                className="w-16 h-16 object-cover rounded flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0 space-y-2">
                <h4 className="font-medium text-sm">{item.name}</h4>
                <Badge variant="outline" className={`text-xs ${getRarityColor(item.rarity)}`}>
                  {item.rarity}
                </Badge>
                <div className="flex items-center">
                  <SulfurIcon className="h-4 w-4 mr-1" />
                  <span className="text-primary font-medium">{item.price.toFixed(2)}</span>
                </div>
                {/* Show stuck limit */}
                <div className="text-xs text-muted-foreground">
                  Max: {item.maxQuantity || 999} stuck
                </div>
              </div>

              <div className="flex flex-col items-end space-y-3 flex-shrink-0">
                {/* Quantity Controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={
                      item.quantity >= (item.maxQuantity || 999) || 
                      totalItems >= maxCartItems
                    }
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                {/* Remove Button */}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeFromCart(item.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <Separator />
          
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total:</span>
            <div className="flex items-center">
              <SulfurIcon className="h-5 w-5 mr-1" />
              {totalPrice.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            {!withdrawalsEnabled && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                <p className="text-sm text-red-400">
                  Store withdrawals are temporarily disabled
                </p>
              </div>
            )}
            
            <Button
              onClick={handleCheckout}
              disabled={isProcessing || !user || (profile && profile.balance < totalPrice) || !withdrawalsEnabled}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 gaming-button-enhanced"
            >
              {isProcessing ? 'Processing...' : withdrawalsEnabled ? 'Checkout' : 'Withdrawals Disabled'}
            </Button>
            
            <Button
              onClick={clearCart}
              variant="outline"
              className="w-full"
            >
              Clear Cart
            </Button>
          </div>

          {user && profile && profile.balance < totalPrice && (
            <p className="text-sm text-red-400 text-center">
              Insufficient balance. Need {(totalPrice - profile.balance).toFixed(2)} more sulfur.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
