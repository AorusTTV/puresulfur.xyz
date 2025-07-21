
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';

interface ApiKeyFieldProps {
  value: string;
  onChange: (value: string) => void;
  showValue: boolean;
  onToggleVisibility: () => void;
}

export const ApiKeyField: React.FC<ApiKeyFieldProps> = ({
  value,
  onChange,
  showValue,
  onToggleVisibility
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="apiKey">Steam API Key</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          asChild
          className="h-6 px-2 text-xs"
        >
          <a
            href="https://steamcommunity.com/dev/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            Get API Key
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>
      <div className="relative">
        <Input
          id="apiKey"
          type={showValue ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your Steam API key"
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
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          Your Steam API key is required to fetch your inventory from Steam Community.
        </p>
        <p>
          <strong>How to get your API key:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Visit <a href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">steamcommunity.com/dev/apikey</a></li>
          <li>Enter any domain name (e.g., "localhost" or your website)</li>
          <li>Copy the generated API key and paste it here</li>
          <li>Save your profile to enable inventory sync</li>
        </ol>
      </div>
    </div>
  );
};
