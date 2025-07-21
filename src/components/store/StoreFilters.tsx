
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ArrowUpDown } from 'lucide-react';

interface StoreFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  priceFilter: string;
  setPriceFilter: (filter: string) => void;
  filteredItemsCount: number;
}

export const StoreFilters = ({
  searchTerm,
  setSearchTerm,
  priceFilter,
  setPriceFilter,
  filteredItemsCount
}: StoreFiltersProps) => {
  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border text-foreground"
            />
          </div>
          
          <Select value={priceFilter} onValueChange={setPriceFilter}>
            <SelectTrigger className="w-full md:w-48 bg-background/50 border-border text-foreground">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by Price" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="high-to-low" className="text-foreground">
                Price: High to Low
              </SelectItem>
              <SelectItem value="low-to-high" className="text-foreground">
                Price: Low to High
              </SelectItem>
            </SelectContent>
          </Select>
          
          <div className="text-muted-foreground text-sm whitespace-nowrap">
            {filteredItemsCount} items found
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
