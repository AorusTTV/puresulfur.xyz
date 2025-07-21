
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoneyDepositContent } from './MoneyDepositContent';
import { SkinDepositContent } from './SkinDepositContent';
import { Package, DollarSign } from 'lucide-react';

interface DepositDialogProps {
  children: React.ReactNode;
  onDepositSuccess?: () => void;
  depositType?: 'money' | 'skins';
}

export const DepositDialog = ({ children, onDepositSuccess, depositType = 'money' }: DepositDialogProps) => {
  const [open, setOpen] = useState(false);

  const getDialogTitle = () => {
    if (depositType === 'money') {
      return (
        <>
          <DollarSign className="h-6 w-6 text-green-400" />
          <span className="text-white">Money Deposit</span>
        </>
      );
    } else {
      return (
        <>
          <Package className="h-6 w-6 text-green-400" />
          <span className="text-white">Skin Deposit</span>
        </>
      );
    }
  };

  const getDialogContent = () => {
    if (depositType === 'money') {
      return <MoneyDepositContent />;
    } else {
      return (
        <SkinDepositContent 
          onSuccess={onDepositSuccess}
          onClose={() => setOpen(false)}
        />
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-card via-card/95 to-background border-2 border-primary/30 text-foreground max-w-2xl backdrop-blur-sm shadow-2xl shadow-primary/20">
        <DialogHeader className="border-b border-border/30 pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="pt-2">
          {getDialogContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
