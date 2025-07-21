import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SocialAccountsSection } from '@/components/settings/SocialAccountsSection';
import { SecuritySection } from '@/components/settings/SecuritySection';
import { SoundSettings } from '@/components/settings/SoundSettings';
import { Settings as SettingsIcon } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary text-xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            ACCOUNT SETTINGS
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-6">
        <SocialAccountsSection />
        <SecuritySection />
        <SoundSettings />
      </div>
    </div>
  );
};