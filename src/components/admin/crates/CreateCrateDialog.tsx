
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CrateForm } from './CrateForm';

interface CreateCrateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCrate: (crateData: any) => Promise<void>;
}

export const CreateCrateDialog: React.FC<CreateCrateDialogProps> = ({
  open,
  onOpenChange,
  onCreateCrate,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Crate</DialogTitle>
        </DialogHeader>
        <CrateForm
          onSubmit={onCreateCrate}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
