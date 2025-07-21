
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CrateForm } from './CrateForm';

interface EditCrateDialogProps {
  crate: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCrate: (crateData: any) => Promise<void>;
}

export const EditCrateDialog: React.FC<EditCrateDialogProps> = ({
  crate,
  open,
  onOpenChange,
  onUpdateCrate,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Crate</DialogTitle>
        </DialogHeader>
        <CrateForm
          initialData={crate}
          onSubmit={onUpdateCrate}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
