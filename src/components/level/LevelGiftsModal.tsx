
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, Package } from 'lucide-react';
import { useLevelUpGifts } from '@/hooks/useLevelUpGifts';
import { LevelUpGift } from './LevelUpGift';
import { BanGuard } from '@/components/BanGuard';
import { SulfurIcon } from '@/components/ui/SulfurIcon';

interface LevelGiftsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LevelGiftsModal: React.FC<LevelGiftsModalProps> = ({
  open,
  onOpenChange
}) => {
  const { gifts, unclaimedGifts, hasUnclaimedGifts, loading, refreshGifts } = useLevelUpGifts();
  const [filter, setFilter] = useState<'all' | 'unclaimed' | 'claimed'>('all');

  const filteredGifts = gifts.filter(gift => {
    if (filter === 'unclaimed') return !gift.claimed;
    if (filter === 'claimed') return gift.claimed;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">Level Up Rewards</span>
              <span className="text-sm text-muted-foreground font-normal flex items-center gap-1">
                Claim your <SulfurIcon className="h-3 w-3" /> rewards for leveling up
              </span>
            </div>
            {hasUnclaimedGifts && (
              <Badge 
                variant="secondary" 
                className="ml-auto bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
              >
                {unclaimedGifts.length} New
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <BanGuard fallback={
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Level gifts are not available for banned accounts.</p>
          </div>
        }>
          <div className="space-y-4">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="h-8"
              >
                All ({gifts.length})
              </Button>
              <Button
                variant={filter === 'unclaimed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unclaimed')}
                className="h-8"
              >
                <Star className="h-3 w-3 mr-1" />
                Unclaimed ({unclaimedGifts.length})
              </Button>
              <Button
                variant={filter === 'claimed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('claimed')}
                className="h-8"
              >
                Claimed ({gifts.filter(g => g.claimed).length})
              </Button>
            </div>

            {/* Gifts List */}
            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground">Loading gifts...</div>
                </div>
              ) : filteredGifts.length > 0 ? (
                <div className="space-y-3">
                  {filteredGifts.map((gift) => (
                    <LevelUpGift
                      key={gift.id}
                      id={gift.id}
                      level={gift.level}
                      sulfurAmount={gift.sulfur_amount}
                      claimed={gift.claimed}
                      onClaim={refreshGifts}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    {filter === 'unclaimed' ? 'No unclaimed gifts available' :
                     filter === 'claimed' ? 'No claimed gifts yet' :
                     'No gifts available yet'}
                  </p>
                  {filter === 'all' && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Level up to earn rewards!
                    </p>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Info */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-primary">
                <SulfurIcon className="h-4 w-4" />
                <span className="font-medium">Rewards</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Each level rewards you with resources based on the level reached (0.5 × level). 
                Higher levels = bigger rewards!
              </p>
            </div>
          </div>
        </BanGuard>
      </DialogContent>
    </Dialog>
  );
};
