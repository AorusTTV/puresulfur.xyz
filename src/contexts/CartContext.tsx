
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  rarity: string;
  quantity: number;
  maxQuantity?: number; // Maximum allowed quantity for this item
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getMaxCartItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const MAX_CART_ITEMS = 10;

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('rustGamble_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('rustGamble_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(cartItem => cartItem.id === item.id);
      const totalCurrentItems = currentItems.reduce((total, cartItem) => total + cartItem.quantity, 0);
      
      // Check global cart limit
      if (!existingItem && totalCurrentItems >= MAX_CART_ITEMS) {
        toast({
          title: 'Cart Full',
          description: `Maximum ${MAX_CART_ITEMS} items allowed in cart`,
          variant: 'destructive'
        });
        return currentItems;
      }
      
      if (existingItem) {
        // Check if we can increase quantity
        const maxQuantity = item.maxQuantity || 999;
        if (existingItem.quantity >= maxQuantity) {
          toast({
            title: 'Maximum Reached',
            description: `Maximum ${maxQuantity} ${item.name} allowed in cart`,
            variant: 'destructive'
          });
          return currentItems;
        }
        
        // Check global cart limit when adding to existing item
        if (totalCurrentItems >= MAX_CART_ITEMS) {
          toast({
            title: 'Cart Full',
            description: `Maximum ${MAX_CART_ITEMS} items allowed in cart`,
            variant: 'destructive'
          });
          return currentItems;
        }
        
        toast({
          title: 'Item Updated',
          description: `${item.name} quantity increased in cart`,
        });
        return currentItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        toast({
          title: 'Item Added',
          description: `${item.name} added to cart`,
        });
        return [...currentItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems(currentItems => {
      const item = currentItems.find(cartItem => cartItem.id === id);
      if (item) {
        toast({
          title: 'Item Removed',
          description: `${item.name} removed from cart`,
        });
      }
      return currentItems.filter(cartItem => cartItem.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems(currentItems => {
      const item = currentItems.find(cartItem => cartItem.id === id);
      if (!item) return currentItems;
      
      const maxQuantity = item.maxQuantity || 999;
      const totalOtherItems = currentItems
        .filter(cartItem => cartItem.id !== id)
        .reduce((total, cartItem) => total + cartItem.quantity, 0);
      
      // Check individual item limit
      if (quantity > maxQuantity) {
        toast({
          title: 'Maximum Reached',
          description: `Maximum ${maxQuantity} ${item.name} allowed in cart`,
          variant: 'destructive'
        });
        return currentItems;
      }
      
      // Check global cart limit
      if (totalOtherItems + quantity > MAX_CART_ITEMS) {
        toast({
          title: 'Cart Full',
          description: `Maximum ${MAX_CART_ITEMS} items allowed in cart`,
          variant: 'destructive'
        });
        return currentItems;
      }
      
      return currentItems.map(cartItem =>
        cartItem.id === id
          ? { ...cartItem, quantity }
          : cartItem
      );
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('rustGamble_cart');
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getMaxCartItems = () => {
    return MAX_CART_ITEMS;
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getMaxCartItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
