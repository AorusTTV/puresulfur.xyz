
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Crate {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  rarity: string;
  min_value: number;
  max_value: number;
  risk_level: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface CrateItem {
  id?: string;
  crate_id?: string;
  name: string;
  image_url?: string;
  value: number;
  drop_chance: number;
  rarity: string;
}

export const useCrateManagement = () => {
  const [crates, setCrates] = useState<Crate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCrates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('battle_crates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCrates(data || []);
    } catch (error) {
      console.error('Error fetching crates:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch crates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCrate = async (crateData: {
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    rarity: string;
    min_value: number;
    max_value: number;
    risk_level: string;
    is_active: boolean;
    items: CrateItem[];
  }) => {
    try {
      // Create the crate first
      const { data: crateResult, error: crateError } = await supabase
        .from('battle_crates')
        .insert({
          name: crateData.name,
          description: crateData.description,
          price: crateData.price,
          image_url: crateData.image_url,
          rarity: crateData.rarity,
          min_value: crateData.min_value,
          max_value: crateData.max_value,
          risk_level: crateData.risk_level,
          is_active: crateData.is_active,
        })
        .select()
        .single();

      if (crateError) throw crateError;

      // Create the items if any
      if (crateData.items && crateData.items.length > 0) {
        const itemsToInsert = crateData.items.map(item => ({
          crate_id: crateResult.id,
          name: item.name,
          image_url: item.image_url,
          value: item.value,
          drop_chance: item.drop_chance,
          rarity: item.rarity,
        }));

        const { error: itemsError } = await supabase
          .from('battle_crate_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast({
        title: 'Success',
        description: 'Crate created successfully',
      });
    } catch (error) {
      console.error('Error creating crate:', error);
      toast({
        title: 'Error',
        description: 'Failed to create crate',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateCrate = async (crateId: string, crateData: any) => {
    try {
      // Update the crate
      const { error: crateError } = await supabase
        .from('battle_crates')
        .update({
          name: crateData.name,
          description: crateData.description,
          price: crateData.price,
          image_url: crateData.image_url,
          rarity: crateData.rarity,
          min_value: crateData.min_value,
          max_value: crateData.max_value,
          risk_level: crateData.risk_level,
          is_active: crateData.is_active,
        })
        .eq('id', crateId);

      if (crateError) throw crateError;

      // Delete existing items and recreate them (simpler approach)
      const { error: deleteError } = await supabase
        .from('battle_crate_items')
        .delete()
        .eq('crate_id', crateId);

      if (deleteError) throw deleteError;

      // Create new items if any
      if (crateData.items && crateData.items.length > 0) {
        const itemsToInsert = crateData.items.map((item: CrateItem) => ({
          crate_id: crateId,
          name: item.name,
          image_url: item.image_url,
          value: item.value,
          drop_chance: item.drop_chance,
          rarity: item.rarity,
        }));

        const { error: itemsError } = await supabase
          .from('battle_crate_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      toast({
        title: 'Success',
        description: 'Crate updated successfully',
      });
    } catch (error) {
      console.error('Error updating crate:', error);
      toast({
        title: 'Error',
        description: 'Failed to update crate',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteCrate = async (crateId: string) => {
    try {
      const { error } = await supabase
        .from('battle_crates')
        .delete()
        .eq('id', crateId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Crate deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting crate:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete crate',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCrates();
  }, []);

  return {
    crates,
    isLoading,
    createCrate,
    updateCrate,
    deleteCrate,
    refetch: fetchCrates,
  };
};
