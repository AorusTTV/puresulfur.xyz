
import React from 'react';
import { BanGuard } from '@/components/BanGuard';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, LogIn } from 'lucide-react';

interface GameGuardProps {
  children: React.ReactNode;
  gameName?: string;
}

export const GameGuard: React.FC<GameGuardProps> = ({ children, gameName = 'game' }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card className="bg-card/60 border-border/50 max-w-md mx-auto mt-8">
        <CardContent className="p-6 text-center">
          <LogIn className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Login Required
          </h3>
          <p className="text-muted-foreground">
            Please log in to play {gameName}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <BanGuard fallback={
      <Card className="bg-destructive/20 border-destructive/50 max-w-md mx-auto mt-8">
        <CardContent className="p-6 text-center">
          <Lock className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Access Restricted
          </h3>
          <p className="text-muted-foreground">
            You cannot access {gameName} while your account is banned.
          </p>
        </CardContent>
      </Card>
    }>
      {children}
    </BanGuard>
  );
};
