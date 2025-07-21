
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, ShieldX } from 'lucide-react';

export type GameMode = 'low' | 'medium' | 'high';

interface GameModeSelectorProps {
  selectedMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export const GameModeSelector = ({ selectedMode, onModeChange }: GameModeSelectorProps) => {
  const modes = [
    {
      id: 'low' as GameMode,
      name: 'Low Risk',
      icon: Shield,
      description: 'Higher win chance, lower multipliers',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30'
    },
    {
      id: 'medium' as GameMode,
      name: 'Medium Risk',
      icon: ShieldAlert,
      description: 'Balanced risk and reward',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/30'
    },
    {
      id: 'high' as GameMode,
      name: 'High Risk',
      icon: ShieldX,
      description: 'Lower win chance, massive multipliers',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30'
    }
  ];

  return (
    <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-primary text-xl font-bold">Game Mode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <Button
              key={mode.id}
              variant="outline"
              onClick={() => onModeChange(mode.id)}
              className={`w-full p-4 h-auto text-left transition-all ${
                isSelected 
                  ? `${mode.bgColor} ${mode.borderColor} ring-2 ring-offset-2 ring-offset-background` 
                  : 'bg-muted border-border hover:bg-muted/80'
              }`}
            >
              <div className="flex items-start space-x-3">
                <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? mode.color : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold ${isSelected ? mode.color : 'text-foreground'}`}>
                    {mode.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {mode.description}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};
