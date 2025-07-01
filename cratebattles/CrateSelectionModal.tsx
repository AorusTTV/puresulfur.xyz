
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import './crate-battles.css';

interface CrateItem {
  name: string;
  chance: number;
  img: string;
}

interface CrateData {
  id: string;
  name: string;
  price: number;
  category: string[];
  rarity: string;
  image: string;
  items: CrateItem[];
}

interface CrateSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCratesSelected: (crates: CrateData[]) => void;
}

export const CrateSelectionModal: React.FC<CrateSelectionModalProps> = ({
  open,
  onOpenChange,
  onCratesSelected
}) => {
  const { toast } = useToast();
  const [crates, setCrates] = useState<CrateData[]>([]);
  const [filteredCrates, setFilteredCrates] = useState<CrateData[]>([]);
  const [selectedCrates, setSelectedCrates] = useState<CrateData[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showItemPreview, setShowItemPreview] = useState<CrateData | null>(null);

  const filters = [
    { key: 'popular', label: 'POPULAR' },
    { key: 'new', label: 'NEW' },
    { key: 'high_risk', label: 'HIGH RISK' },
    { key: 'low_risk', label: 'LOW RISK' },
    { key: 'cheap', label: 'CHEAP' }
  ];

  // Load crates data
  useEffect(() => {
    const loadCrates = async () => {
      try {
        const response = await fetch('/data/crates.json');
        const cratesData = await response.json();
        setCrates(cratesData);
        setFilteredCrates(cratesData);
      } catch (error) {
        console.error('Failed to load crates:', error);
        toast({
          title: 'Error',
          description: 'Failed to load crates data',
          variant: 'destructive'
        });
      }
    };

    if (open) {
      loadCrates();
    }
  }, [open, toast]);

  // Filter and sort crates
  useEffect(() => {
    let filtered = [...crates];

    // Apply category filter
    if (activeFilter) {
      filtered = filtered.filter(crate => crate.category.includes(activeFilter));
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(crate => 
        crate.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });

    setFilteredCrates(filtered);
  }, [crates, activeFilter, searchTerm, sortOrder]);

  const handleFilterClick = (filterKey: string) => {
    setActiveFilter(activeFilter === filterKey ? '' : filterKey);
  };

  const handleAddCrate = (crate: CrateData) => {
    setSelectedCrates(prev => [...prev, crate]);
  };

  const handleShowPreview = (crate: CrateData) => {
    setShowItemPreview(crate);
  };

  const handleConfirmSelection = () => {
    onCratesSelected(selectedCrates);
    onOpenChange(false);
    setSelectedCrates([]);
    setActiveFilter('');
    setSearchTerm('');
    setSortOrder('asc');
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedCrates([]);
    setActiveFilter('');
    setSearchTerm('');
    setSortOrder('asc');
  };

  const totalPrice = selectedCrates.reduce((sum, crate) => sum + crate.price, 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="modal max-w-4xl w-[96%] max-h-[90vh] bg-[#0d0d0e] border-[#222]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">Configure Crate Battle</DialogTitle>
          </DialogHeader>

          {/* Filter Bar */}
          <div className="filter-bar">
            {filters.map(filter => (
              <button
                key={filter.key}
                onClick={() => handleFilterClick(filter.key)}
                className={`filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
              >
                {filter.label}
              </button>
            ))}

            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger className="w-48 bg-[#111] border-[#222]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Price (low → high)</SelectItem>
                <SelectItem value="desc">Price (high → low)</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#111] border-[#222]"
              />
            </div>
          </div>

          {/* Crates Grid */}
          <div id="crateGrid" className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 h-[65vh] overflow-y-auto">
            {filteredCrates.map(crate => (
              <article
                key={crate.id}
                className="crate-card"
                data-id={crate.id}
              >
                <img
                  src={crate.image}
                  alt={crate.name}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                <h3 className="text-sm font-medium text-foreground">{crate.name}</h3>
                
                <span className="price sulfur flex items-center justify-center gap-1 text-sm font-bold text-primary">
                  <img 
                    src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                    alt="Sulfur" 
                    className="h-4 w-4" 
                  />
                  {crate.price.toFixed(2)}
                </span>

                <button
                  onClick={() => handleAddCrate(crate)}
                  className="add-btn"
                >
                  + ADD
                </button>
                
                <button
                  onClick={() => handleShowPreview(crate)}
                  className="info-btn"
                >
                  <Eye className="h-3 w-3 text-white" />
                </button>
              </article>
            ))}
          </div>

          {/* Summary Bar */}
          <footer id="crateSummary" className="flex justify-between items-center p-3 border-t border-[#222] font-semibold">
            <span className="text-muted-foreground">
              {selectedCrates.length} crates
            </span>
            
            <span className="sulfur flex items-center gap-1 text-primary">
              <img 
                src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                alt="Sulfur" 
                className="h-4 w-4" 
              />
              {totalPrice.toFixed(2)}
            </span>

            <div className="flex gap-2">
              <button
                onClick={handleConfirmSelection}
                disabled={selectedCrates.length === 0}
                className="bg-[#2a801e] hover:bg-[#2a801e]/80 text-white font-bold px-4 py-2 rounded disabled:opacity-50"
              >
                ADD
              </button>
              <button
                onClick={handleCancel}
                className="alt bg-transparent border border-[#222] text-muted-foreground hover:bg-[#222] px-4 py-2 rounded"
              >
                CANCEL
              </button>
            </div>
          </footer>
        </DialogContent>
      </Dialog>

      {/* Item Preview Modal */}
      {showItemPreview && (
        <Dialog open={!!showItemPreview} onOpenChange={() => setShowItemPreview(null)}>
          <DialogContent className="max-w-md bg-[#0d0d0e] border-[#222]">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">
                {showItemPreview.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-3">
              <div className="text-center">
                <img
                  src={showItemPreview.image}
                  alt={showItemPreview.name}
                  className="w-20 h-20 object-contain mx-auto mb-2"
                />
                <div className="flex items-center justify-center gap-1 text-primary font-bold">
                  <img 
                    src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                    alt="Sulfur" 
                    className="h-4 w-4" 
                  />
                  {showItemPreview.price.toFixed(2)}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Items in this crate:</h4>
                <ul className="space-y-2 text-left">
                  {showItemPreview.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      <span className="text-muted-foreground">
                        {item.name} – {(item.chance * 100).toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setShowItemPreview(null)}
                  className="bg-primary hover:bg-primary/80"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
