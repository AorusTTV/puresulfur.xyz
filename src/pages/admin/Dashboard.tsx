
import React from 'react';
import { AdminMFAGuard } from '@/components/admin/AdminMFAGuard';
import { RoleGuard } from '@/components/admin/RoleGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Analytics } from '@/components/admin/Analytics';
import { UserManagement } from '@/components/admin/UserManagement';
import { GameManagement } from '@/components/admin/GameManagement';
import { GameSettings } from '@/components/admin/GameSettings';
import { StoreManagement } from '@/components/admin/StoreManagement';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import { IncidentResponseSystem } from '@/components/security/IncidentResponseSystem';
import { MonitoringIntegration } from '@/components/security/MonitoringIntegration';
import { ComplianceChecker } from '@/components/security/ComplianceChecker';
import { AdminMFASetup } from '@/components/admin/AdminMFASetup';
import { AdminSetup } from '@/components/admin/AdminSetup';
import { SteamBotManagement } from '@/components/admin/SteamBotManagement';
import { SteamTradesManagement } from '@/components/admin/SteamTradesManagement';
import { LeaderboardManagement } from '@/components/admin/LeaderboardManagement';
import { PromotionalCodeManagement } from '@/components/admin/PromotionalCodeManagement';
import { SecurityAlerting } from '@/components/security/SecurityAlerting';
import { useState } from 'react';

export const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('analytics');
  const [mfaVerified, setMfaVerified] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'analytics':
        return <Analytics />;
      case 'users':
        return <UserManagement />;
      case 'games':
        return <GameManagement />;
      case 'game-settings':
        return <GameSettings />;
      case 'store':
        return <StoreManagement />;
      case 'promo-codes':
        return <PromotionalCodeManagement />;
      case 'steam-bots':
        return <SteamBotManagement />;
      case 'steam-trades':
        return <SteamTradesManagement />;
      case 'leaderboards':
        return <LeaderboardManagement />;
      case 'settings':
        return <SystemSettings />;
      case 'security':
        return <SecurityDashboard />;
      case 'incidents':
        return <IncidentResponseSystem />;
      case 'monitoring':
        return <MonitoringIntegration />;
      case 'compliance':
        return <ComplianceChecker />;
      case 'setup':
        return <AdminSetup />;
      case 'mfa':
        return <AdminMFASetup onMFAVerified={() => setMfaVerified(true)} />;
      default:
        return <Analytics />;
    }
  };

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-background">
        <SecurityAlerting />
        
        {/* Show MFA setup if not verified, otherwise show full admin dashboard */}
        {!mfaVerified ? (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel Access</h1>
              <AdminMFASetup onMFAVerified={() => setMfaVerified(true)} />
            </div>
          </div>
        ) : (
          <div className="flex">
            <AdminSidebar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection} 
            />
            <main className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              </div>
              {renderContent()}
            </main>
          </div>
        )}
      </div>
    </RoleGuard>
  );
};

export default AdminDashboard;
