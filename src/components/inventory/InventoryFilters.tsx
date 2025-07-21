
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface InventoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filteredItemsCount: number;
  totalItemsCount: number;
}

export const InventoryFilters = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filteredItemsCount,
  totalItemsCount
}: InventoryFiltersProps) => {
  return (
    <Card className="bg-card/60 border-border backdrop-blur-sm mb-8 gaming-card-enhanced">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border text-foreground gaming-input"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-input border-border text-foreground gaming-input">
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="tradable">Tradable Only</SelectItem>
              <SelectItem value="marketable">Marketable Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="mt-4 text-center text-muted-foreground text-sm">
          {filteredItemsCount} unique items found ({totalItemsCount} total items)
        </div>
      </CardContent>
    </Card>
  );
};
