
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import { CratesList } from './crates/CratesList';
import { CreateCrateDialog } from './crates/CreateCrateDialog';
import { EditCrateDialog } from './crates/EditCrateDialog';
import { useCrateManagement } from '@/hooks/admin/useCrateManagement';

export const CrateManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCrate, setEditingCrate] = useState<any>(null);
  
  const { 
    crates, 
    isLoading, 
    createCrate, 
    updateCrate, 
    deleteCrate,
    refetch 
  } = useCrateManagement();

  // Debug logging
  console.log('CrateManagement component rendered - CRATE MANAGEMENT PAGE');
  console.log('Crates data:', crates);
  console.log('Is loading:', isLoading);

  const handleCreateCrate = async (crateData: any) => {
    try {
      await createCrate(crateData);
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to create crate:', error);
    }
  };

  const handleUpdateCrate = async (crateData: any) => {
    try {
      await updateCrate(editingCrate.id, crateData);
      setEditingCrate(null);
      refetch();
    } catch (error) {
      console.error('Failed to update crate:', error);
    }
  };

  const handleDeleteCrate = async (crateId: string) => {
    try {
      await deleteCrate(crateId);
      refetch();
    } catch (error) {
      console.error('Failed to delete crate:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Very distinctive header to make it clear this is NOT Analytics */}
      <div className="bg-red-600 text-white p-6 mb-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-center">
          <Package className="h-8 w-8 mr-3" />
          <h1 className="text-4xl font-bold">🎁 CRATE MANAGEMENT SYSTEM 🎁</h1>
          <Package className="h-8 w-8 ml-3" />
        </div>
        <p className="text-center mt-2 text-red-100">
          This is definitely NOT the Analytics page - you are managing battle crates!
        </p>
      </div>

      <div className="space-y-6 px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-red-600">Battle Crate Management</h2>
            <p className="text-muted-foreground">
              Create, edit, and manage battle crates for your platform
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create New Crate
          </Button>
        </div>

        <Card className="border-red-200 shadow-lg">
          <CardHeader className="bg-red-50 border-b border-red-200">
            <CardTitle className="text-red-800 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Battle Crates List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <CratesList
              crates={crates}
              isLoading={isLoading}
              onEditCrate={setEditingCrate}
              onDeleteCrate={handleDeleteCrate}
            />
          </CardContent>
        </Card>

        <CreateCrateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateCrate={handleCreateCrate}
        />

        {editingCrate && (
          <EditCrateDialog
            crate={editingCrate}
            open={!!editingCrate}
            onOpenChange={(open) => !open && setEditingCrate(null)}
            onUpdateCrate={handleUpdateCrate}
          />
        )}
      </div>
    </div>
  );
};
