
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload } from 'lucide-react';

interface SkinDepositContentProps {
  onSuccess?: () => void;
  onClose: () => void;
}

export const SkinDepositContent = ({ onSuccess, onClose }: SkinDepositContentProps) => {
  const [loading, setLoading] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [itemRarity, setItemRarity] = useState('');
  const [itemCategory, setItemCategory] = useState('weapon');
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDeposit = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to deposit items',
        variant: 'destructive'
      });
      return;
    }

    if (!itemName || !itemValue || !itemRarity) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    const value = parseFloat(itemValue);
    if (isNaN(value) || value <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid item value',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating store item:', { itemName, value, itemRarity, itemCategory });
      
      // Create the item in store_items table first
      const { data: storeItem, error: storeError } = await supabase
        .from('store_items')
        .insert({
          name: itemName,
          price: value,
          rarity: itemRarity,
          category: itemCategory,
          description: `User deposited item: ${itemName}`,
          image_url: null
        })
        .select()
        .single();

      if (storeError) {
        console.error('Store item creation error:', storeError);
        throw storeError;
      }

      console.log('Store item created:', storeItem);

      // Add item to user inventory
      const { error: inventoryError } = await supabase
        .from('user_inventory')
        .insert({
          user_id: user.id,
          item_id: storeItem.id,
          market_hash_name: itemName,
          tradable: true,
          quantity: 1
        });

      if (inventoryError) {
        console.error('Inventory creation error:', inventoryError);
        throw inventoryError;
      }

      console.log('Added to inventory');

      // Update user balance
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (profileFetchError) {
        console.error('Profile fetch error:', profileFetchError);
        throw profileFetchError;
      }

      const newBalance = (profile.balance || 0) + value;
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (balanceError) {
        console.error('Balance update error:', balanceError);
        throw balanceError;
      }

      console.log('Balance updated to:', newBalance);

      toast({
        title: 'Success!',
        description: `Successfully deposited ${itemName} for $${value.toFixed(2)}`,
      });

      // Reset form
      setItemName('');
      setItemValue('');
      setItemRarity('');
      setItemCategory('weapon');
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error depositing items:', error);
      toast({
        title: 'Error',
        description: 'Failed to deposit item. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="space-y-2">
        <Label htmlFor="itemName" className="text-foreground">Item Name</Label>
        <Input
          id="itemName"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="AK-47 | Redline"
          className="bg-muted/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemValue" className="text-foreground">Item Value ($)</Label>
        <Input
          id="itemValue"
          type="number"
          value={itemValue}
          onChange={(e) => setItemValue(e.target.value)}
          placeholder="25.50"
          min="0"
          step="0.01"
          className="bg-muted/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemRarity" className="text-foreground">Rarity</Label>
        <Select value={itemRarity} onValueChange={setItemRarity}>
          <SelectTrigger className="bg-muted/50 border-border/50 text-foreground">
            <SelectValue placeholder="Select rarity" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border/50">
            <SelectItem value="Common">Common</SelectItem>
            <SelectItem value="Uncommon">Uncommon</SelectItem>
            <SelectItem value="Rare">Rare</SelectItem>
            <SelectItem value="Epic">Epic</SelectItem>
            <SelectItem value="Legendary">Legendary</SelectItem>
            <SelectItem value="Mythical">Mythical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemCategory" className="text-foreground">Category</Label>
        <Select value={itemCategory} onValueChange={setItemCategory}>
          <SelectTrigger className="bg-muted/50 border-border/50 text-foreground">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-background border-border/50">
            <SelectItem value="weapon">Weapon</SelectItem>
            <SelectItem value="clothing">Clothing</SelectItem>
            <SelectItem value="building">Building</SelectItem>
            <SelectItem value="tools">Tools</SelectItem>
            <SelectItem value="misc">Miscellaneous</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleDeposit}
        disabled={loading || !itemName || !itemValue || !itemRarity}
        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold py-4 text-lg border border-primary/30 shadow-lg"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Deposit Item
          </div>
        )}
      </Button>
    </div>
  );
};
