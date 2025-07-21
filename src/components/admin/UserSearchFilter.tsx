
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UserSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const UserSearchFilter: React.FC<UserSearchFilterProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by username or nickname..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-background/50 border-primary/30 text-foreground placeholder:text-muted-foreground focus:border-primary gaming-input"
        />
      </div>
    </div>
  );
};
