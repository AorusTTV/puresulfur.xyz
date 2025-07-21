
import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, AlertCircle, Gift, RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface LeaderboardActionsProps {
  onDistributePrizes: () => void;
  onResetLeaderboard: () => void;
  isDistributing: boolean;
  isResetting: boolean;
}

export const LeaderboardActions: React.FC<LeaderboardActionsProps> = ({
  onDistributePrizes,
  onResetLeaderboard,
  isDistributing,
  isResetting
}) => {
  return (
    <div className="pt-6 border-t border-primary/20">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        Manual Prize Distribution & Leaderboard Management
      </h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-yellow-400 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">
            These actions affect the leaderboard system. Use with caution in production.
          </span>
        </div>
        
        <div className="flex gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm"
                variant="outline" 
                className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/20 hover:text-yellow-300 interactive-glow"
              >
                <Gift className="h-4 w-4 mr-2" />
                Distribute Previous Month Prizes
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-primary/30">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Confirm Prize Distribution</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This action will distribute prizes to the top 10 players from the previous month's leaderboard. 
                  This should only be done once per month. Are you sure you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-secondary text-secondary-foreground border-border hover:bg-secondary/80">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={onDistributePrizes}
                  disabled={isDistributing}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isDistributing ? 'Distributing...' : 'Distribute Prizes'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm"
                variant="outline" 
                className="border-red-500/40 text-red-400 hover:bg-red-500/20 hover:text-red-300 interactive-glow"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Monthly Leaderboard
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-primary/30">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Confirm Monthly Leaderboard Reset</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This action will reset the current month's leaderboard by clearing all wagering data from this month only. 
                  Player's lifetime total wagered amounts and balances will not be affected. This action cannot be undone. Are you sure you want to proceed?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-secondary text-secondary-foreground border-border hover:bg-secondary/80">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={onResetLeaderboard}
                  disabled={isResetting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isResetting ? 'Resetting...' : 'Reset Monthly Leaderboard'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
