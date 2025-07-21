
import React, { useState } from 'react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { SteamLoginDebug } from '@/components/auth/SteamLoginDebug';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Welcome Back</h1>
            <p className="text-muted-foreground mb-6">Sign in to your PureSulfur account</p>
            <LoginDialog>
              <Button className="w-full">Sign In</Button>
            </LoginDialog>
          </CardContent>
        </Card>
        
        {/* Debug Tools Toggle */}
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {showDebug ? 'Hide' : 'Show'} Debug Tools
            <Badge variant="secondary" className="text-xs">DEV</Badge>
          </Button>
        </div>
        
        {/* Debug Component */}
        {showDebug && <SteamLoginDebug />}
      </div>
    </div>
  );
};

export default LoginPage;
