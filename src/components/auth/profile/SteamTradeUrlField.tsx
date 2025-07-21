
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';

interface SteamTradeUrlFieldProps {
  value: string;
  onChange: (value: string) => void;
  showValue: boolean;
  onToggleVisibility: () => void;
}

export const SteamTradeUrlField: React.FC<SteamTradeUrlFieldProps> = ({
  value,
  onChange,
  showValue,
  onToggleVisibility
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="steamTradeUrl">Steam Trade URL</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          asChild
          className="h-6 px-2 text-xs"
        >
          <a
            href="http://steamcommunity.com/my/tradeoffers/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            Get URL
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>
      <div className="relative">
        <Input
          id="steamTradeUrl"
          type={showValue ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=XXXXXXXX"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={onToggleVisibility}
        >
          {showValue ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Your Steam trade URL for depositing and withdrawing items. Find this in your Steam inventory privacy settings.
      </p>
    </div>
  );
};
