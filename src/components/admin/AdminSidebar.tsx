
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Users, 
  Gamepad2, 
  Store, 
  Settings, 
  Shield, 
  AlertTriangle,
  Activity,
  CheckSquare,
  Wrench,
  Lock,
  Bot,
  Trophy,
  
  Package,
  ArrowUpCircle,
  Gift
} from 'lucide-react';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sidebarItems = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'games', label: 'Game Management', icon: Gamepad2 },
  // { id: 'game-settings', label: 'Game Settings', icon: Settings },
  { id: 'store', label: 'Store Management', icon: Store },
  { id: 'crates', label: 'Crate Management', icon: Package },
  { id: 'promo-codes', label: 'Promotional Codes', icon: Gift },
  { id: 'steam-bots', label: 'Steam Bots', icon: Bot },
  { id: 'steam-trades', label: 'Steam Trades', icon: ArrowUpCircle },
  { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
  
  { id: 'settings', label: 'System Settings', icon: Settings },
  { id: 'security', label: 'Security Dashboard', icon: Shield },
  { id: 'incidents', label: 'Incident Response', icon: AlertTriangle },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'compliance', label: 'Compliance', icon: CheckSquare },
  { id: 'setup', label: 'Admin Setup', icon: Wrench },
  { id: 'mfa', label: 'MFA Setup', icon: Lock },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  return (
    <div className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Admin Panel</h2>
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
