
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

export const GameHeader: React.FC = () => {
  return (
    <div className="text-center mb-6">
      <div className="flex items-center justify-center gap-4 mb-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-orbitron gaming-text-glow">
          SULFUR WHEEL
        </h1>
        <Button variant="ghost" size="sm" className="text-primary hover:text-accent hover:bg-primary/10 gaming-glow">
          <HelpCircle className="h-5 w-5" />
          HELP
        </Button>
      </div>
      
      {/* Help Text */}
      <Card className="gaming-card-enhanced max-w-2xl mx-auto mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold gaming-glow">
              i
            </div>
            <p>Place your sulfur on the color slots. If the wheel lands on your selected number(s), you win!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
