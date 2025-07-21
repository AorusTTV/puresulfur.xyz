
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bot, ExternalLink, Upload, DollarSign, Loader2, AlertTriangle } from 'lucide-react';

interface SteamItem {
  assetid: string;
  market_hash_name: string;
  icon_url: string;
  tradable: boolean;
  marketable: boolean;
  estimated_value: number;
  name: string;
}

interface SteamTradeResponse {
  success: boolean;
  trade_id?: string;
  error?: string;
  message?: string;
}

export const SteamTradeBot: React.FC = () => {
  const [tradeUrl, setTradeUrl] = useState('');
  const [items, setItems] = useState<SteamItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const parseTradeUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const partner = urlObj.searchParams.get('partner');
      const token = urlObj.searchParams.get('token');
      
      if (!partner || !token) {
        throw new Error('Invalid trade URL format');
      }
      
      // Convert partner to SteamID64
      const steamId64 = (BigInt(partner) + BigInt('76561197960265728')).toString();
      
      return { partnerId: partner, token, steamId64 };
    } catch (error) {
      throw new Error('Invalid trade URL format');
    }
  };

  const handleInventoryLoad = async () => {
    if (!tradeUrl) {
      toast({
        title: 'Error',
        description: 'Please enter your Steam trade URL',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to load inventory',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Parse trade URL to get Steam ID
      const { steamId64 } = parseTradeUrl(tradeUrl);
      
      // Call Steam API edge function to fetch real inventory
      const { data, error } = await supabase.functions.invoke('steam-api', {
        body: {
          action: 'getInventory',
          steamId: steamId64
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch inventory');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch inventory');
      }
      
      setItems(data.items || []);
      
      if (data.items?.length > 0) {
        toast({
          title: 'Success',
          description: `Loaded ${data.items.length} tradable items from your inventory`,
        });
      } else {
        toast({
          title: 'No Items Found',
          description: 'No tradable Rust items found in your inventory',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load inventory. Make sure your inventory is public.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (assetId: string) => {
    setSelectedItems(prev => 
      prev.includes(assetId)
        ? prev.filter(item => item !== assetId)
        : [...prev, assetId]
    );
  };

  const calculateTotalValue = () => {
    return selectedItems.reduce((total, assetId) => {
      const item = items.find(i => i.assetid === assetId);
      return total + (item?.estimated_value || 0);
    }, 0);
  };

  const handleDeposit = async () => {
    if (!user || selectedItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select items to deposit',
        variant: 'destructive'
      });
      return;
    }

    setDepositing(true);
    try {
      const totalValue = calculateTotalValue();
      const selectedItemsData = items.filter(item => 
        selectedItems.includes(item.assetid)
      );

      // Parse trade URL for partner info
      const { partnerId, token } = parseTradeUrl(tradeUrl);

      // Create Steam trade record
      const { data, error } = await supabase.rpc('create_steam_trade', {
        p_user_id: user.id,
        p_trade_type: 'deposit',
        p_items: selectedItemsData as any,
        p_total_value: totalValue
      });

      if (error) throw error;

      const response = data as unknown as SteamTradeResponse;

      if (response.success) {
        // Create actual trade offer via Steam API
        try {
          const { data: tradeData, error: tradeError } = await supabase.functions.invoke('steam-api', {
            body: {
              action: 'createTradeOffer',
              partnerId,
              token,
              items: selectedItemsData
            }
          });

          if (tradeError || !tradeData.success) {
            throw new Error(tradeData?.error || 'Failed to create trade offer');
          }

          toast({
            title: 'Trade Offer Sent!',
            description: `Trade offer created for $${totalValue.toFixed(2)} worth of items. Check your Steam for the trade offer.`,
          });

          // Update user balance immediately for demo purposes
          // In production, this would happen when the trade is accepted
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single();

          if (currentProfile) {
            const { error: balanceError } = await supabase
              .from('profiles')
              .update({ 
                balance: currentProfile.balance + totalValue * 0.8 // 20% fee
              })
              .eq('id', user.id);

            if (balanceError) {
              console.error('Balance update error:', balanceError);
            }
          }

          setSelectedItems([]);
          setItems([]);
          setTradeUrl('');
        } catch (tradeError) {
          console.error('Trade offer creation failed:', tradeError);
          toast({
            title: 'Trade Offer Failed',
            description: 'Failed to create Steam trade offer. Please try again.',
            variant: 'destructive'
          });
        }
      } else {
        throw new Error(response.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error creating deposit:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate deposit. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDepositing(false);
    }
  };

  return (
    <Card className="bg-card/60 border-border backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Bot className="h-5 w-5" />
          Steam Deposit Bot
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send your Rust skins to our bot and receive instant site balance
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Important Notes:</span>
          </div>
          <ul className="text-sm text-yellow-600 mt-2 space-y-1 list-disc list-inside">
            <li>Your Steam inventory must be public to load items</li>
            <li>Only tradable Rust items will be shown</li>
            <li>You'll receive 80% of the estimated market value</li>
            <li>Trade offers must be accepted within 15 minutes</li>
          </ul>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-foreground font-medium">Steam Trade URL</label>
          <div className="flex gap-2">
            <Input
              value={tradeUrl}
              onChange={(e) => setTradeUrl(e.target.value)}
              placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
              className="bg-input border-border text-foreground"
            />
            <Button
              onClick={handleInventoryLoad}
              disabled={loading || !tradeUrl}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Find your trade URL in Steam → Inventory → Trade Offers → Who can send me Trade Offers?
          </p>
        </div>

        {items.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Select Items to Deposit</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {items.map((item) => (
                <div
                  key={item.assetid}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedItems.includes(item.assetid)
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-border/70'
                  }`}
                  onClick={() => handleItemSelect(item.assetid)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center overflow-hidden">
                        {item.icon_url ? (
                          <img 
                            src={item.icon_url} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="text-foreground text-sm font-medium">
                          {item.name}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.tradable ? 'Tradable' : 'Not Tradable'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.marketable ? 'Marketable' : 'Not Marketable'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-primary font-medium">
                      <DollarSign className="h-4 w-4 inline mr-1" />
                      {item.estimated_value.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedItems.length > 0 && (
              <div className="space-y-3">
                <div className="bg-muted/30 p-4 rounded-lg border border-border/30">
                  <div className="text-foreground text-sm">
                    Total Value: <span className="text-primary font-bold">
                      ${calculateTotalValue().toFixed(2)}
                    </span>
                  </div>
                  <div className="text-muted-foreground text-xs mt-1">
                    You'll receive: ${(calculateTotalValue() * 0.8).toFixed(2)} (20% fee)
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {selectedItems.length} item(s) selected
                  </div>
                </div>

                <Button
                  onClick={handleDeposit}
                  disabled={depositing}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {depositing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Trade Offer...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Send Trade Offer for {selectedItems.length} Item{selectedItems.length > 1 ? 's' : ''}
                    </div>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {items.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Enter your Steam trade URL above to load your Rust inventory</p>
            <p className="text-xs mt-2">Make sure your Steam inventory is set to public</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
