
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, Check, X, DollarSign } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LeaderboardPrize {
  id: string;
  rank: number;
  prize_amount: number;
}

interface PrizePoolTableProps {
  prizes: LeaderboardPrize[] | undefined;
  onUpdatePrize: (rank: number, amount: number) => Promise<void>;
  isUpdating: boolean;
}

export const PrizePoolTable: React.FC<PrizePoolTableProps> = ({
  prizes,
  onUpdatePrize,
  isUpdating
}) => {
  const [editingRank, setEditingRank] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '1st Place';
    if (rank === 2) return '2nd Place';
    if (rank === 3) return '3rd Place';
    return `${rank}th Place`;
  };

  const startEdit = (rank: number, currentAmount: number) => {
    setEditingRank(rank);
    setEditValue(currentAmount.toString());
  };

  const cancelEdit = () => {
    setEditingRank(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (editingRank && editValue) {
      const numericAmount = parseFloat(editValue);
      if (!isNaN(numericAmount) && numericAmount >= 0) {
        await onUpdatePrize(editingRank, numericAmount);
        setEditingRank(null);
        setEditValue('');
      }
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Gift className="h-5 w-5 text-primary" />
        Monthly Prize Pool Configuration
      </h3>
      
      <div className="overflow-x-auto rounded-lg border border-primary/20">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/5 border-primary/20 hover:bg-primary/10">
              <TableHead className="text-foreground font-semibold">Rank</TableHead>
              <TableHead className="text-foreground font-semibold">Position</TableHead>
              <TableHead className="text-foreground font-semibold">Prize Amount</TableHead>
              <TableHead className="text-foreground font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prizes?.map((prize) => (
              <TableRow key={prize.rank} className="border-primary/10 hover:bg-primary/5 transition-colors">
                <TableCell className="text-foreground font-medium">
                  #{prize.rank}
                </TableCell>
                
                <TableCell className="text-foreground font-medium">
                  {getRankDisplay(prize.rank)}
                </TableCell>

                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-medium">
                        ${prize.prize_amount.toFixed(2)}
                      </span>
                    </div>
                    
                    {editingRank === prize.rank && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">New amount:</span>
                        <div className="flex items-center gap-1">
                          <span className="text-primary">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="bg-background/50 border-primary/30 text-foreground w-24 h-8 text-sm focus:border-primary gaming-input"
                            placeholder="0.00"
                            autoFocus
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex gap-2">
                    {editingRank === prize.rank ? (
                      <>
                        <Button 
                          size="sm"
                          onClick={saveEdit} 
                          disabled={isUpdating}
                          className="border-primary/40 text-primary hover:bg-primary/20 hover:text-primary interactive-glow"
                          variant="outline"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline" 
                          onClick={cancelEdit}
                          className="border-destructive/40 text-destructive hover:bg-destructive/20 hover:text-destructive interactive-glow"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(prize.rank, prize.prize_amount)}
                        className="border-primary/40 text-primary hover:bg-primary/20 hover:text-primary interactive-glow"
                      >
                        <DollarSign className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
