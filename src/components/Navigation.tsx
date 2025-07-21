
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Store, Package, Gamepad2, Trophy, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/components/auth/UserProfile';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { LevelDisplay } from '@/components/level/LevelDisplay';
import { useAffiliateCodeFromUrl } from '@/hooks/useAffiliateCodeFromUrl';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { affiliateCode } = useAffiliateCodeFromUrl();

  // Check if user is admin - updated logic to be more comprehensive
  const isAdmin = user && profile && (
    profile.steam_id === 'YOUR_STEAM_ID' || 
    profile.nickname === 'admin' ||
    user.email === 'shaybuskila999@gmail.com' ||
    user.email?.includes('admin')
  );

  console.log('Navigation - User:', user?.email);
  console.log('Navigation - Profile:', profile);
  console.log('Navigation - Is Admin:', isAdmin);
  console.log('Navigation - Affiliate Code from URL:', affiliateCode);

  // If user exists but no profile, they have a deleted account - show sign out option
  const hasDeletedAccount = user && !profile;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/store', label: 'Store', icon: Store },
    { path: '/games', label: 'Games', icon: Gamepad2 },
    { path: '/leaderboards', label: 'Leaderboards', icon: Trophy },
    ...(user && profile ? [
      { path: '/inventory', label: 'Inventory', icon: Package }
    ] : []),
    ...(isAdmin ? [{ path: '/admin/dashboard', label: 'Admin', icon: Shield }] : [])
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="bg-gradient-to-br from-background via-card to-secondary border-b border-border backdrop-blur-sm fixed top-0 left-0 right-0 z-50 h-20">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo/Brand and Navigation Items */}
          <div className="flex items-center space-x-6">
            {/* Brand Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/lovable-uploads/4f18be95-65b9-4861-9c2b-179fcd7b6a15.png" 
                  alt="PureSulfur Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                PureSulfur
              </span>
            </div>
            
            {/* Navigation Items */}
            <div className="flex items-center space-x-4">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Button
                  key={path}
                  variant={location.pathname === path ? "default" : "ghost"}
                  onClick={() => handleNavigation(path)}
                  className={`flex items-center space-x-2 transition-all duration-200 ${
                    location.pathname === path
                      ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                      : 'text-foreground hover:text-primary hover:bg-primary/20'
                  } ${path === '/admin/dashboard' ? 'border border-primary/50' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* User Section - Right */}
          <div className="flex items-center space-x-4">
            {user && profile ? (
              <>
                {/* Balance Display */}
                <div className="flex items-center bg-card/50 border border-border rounded-lg px-3 py-2">
                  <img 
                    src="/lovable-uploads/d002df3d-7dea-48f3-8165-cd9430051c53.png" 
                    alt="Sulfur" 
                    className="h-8 w-8 mr-2" 
                  />
                  <span className="text-primary font-medium">
                    {profile?.balance?.toFixed(2) || '0.00'}
                  </span>
                </div>
                
                {/* Level Display */}
                <LevelDisplay 
                  experience={profile.experience || 0}
                  level={profile.level || 1}
                  compact={true}
                />
                
                {/* User Profile */}
                <UserProfile />
              </>
            ) : hasDeletedAccount ? (
              // User has auth but no profile - show sign out button
              <div className="flex items-center space-x-2">
                <span className="text-sm text-destructive">Account Deleted</span>
                <Button 
                  onClick={signOut}
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {affiliateCode && (
                  <div className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                    Referred by: {affiliateCode}
                  </div>
                )}
                <LoginDialog>
                  <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                    Login
                  </Button>
                </LoginDialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
