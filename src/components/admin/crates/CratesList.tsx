import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Crate {
  id: string;
  name: string;
  description?: string;
  price: number;
  rarity: string;
  min_value: number;
  max_value: number;
  risk_level: string;
  is_active: boolean;
  created_at: string;
}

interface CratesListProps {
  crates: Crate[];
  isLoading: boolean;
  onEditCrate: (crate: Crate) => void;
  onDeleteCrate: (crateId: string) => void;
}

export const CratesList: React.FC<CratesListProps> = ({
  crates,
  isLoading,
  onEditCrate,
  onDeleteCrate,
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'bg-yellow-500';
      case 'epic': return 'bg-purple-500';
      case 'rare': return 'bg-blue-500';
      case 'uncommon': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'HIGH RISK': return 'bg-red-500';
      case 'MEDIUM RISK': return 'bg-orange-500';
      default: return 'bg-green-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!crates || crates.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No crates found. Create your first crate to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Value Range</TableHead>
          <TableHead>Rarity</TableHead>
          <TableHead>Risk Level</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {crates.map((crate) => (
          <TableRow key={crate.id}>
            <TableCell>
              <div>
                <div className="font-medium">{crate.name}</div>
                {crate.description && (
                  <div className="text-sm text-muted-foreground">
                    {crate.description}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>${crate.price}</TableCell>
            <TableCell>
              ${crate.min_value} - ${crate.max_value}
            </TableCell>
            <TableCell>
              <Badge className={getRarityColor(crate.rarity)}>
                {crate.rarity}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={getRiskColor(crate.risk_level)}>
                {crate.risk_level}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={crate.is_active ? 'default' : 'secondary'}>
                {crate.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditCrate(crate)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteCrate(crate.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
