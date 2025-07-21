
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface BioFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const BioField: React.FC<BioFieldProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="bio">Bio</Label>
      <Textarea
        id="bio"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tell us about yourself"
        maxLength={200}
        rows={3}
      />
      <p className="text-xs text-muted-foreground">
        Max 200 characters, basic formatting allowed
      </p>
    </div>
  );
};
