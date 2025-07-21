
import React, { useState } from 'react';
import { useRoleProtection } from '@/hooks/useRoleProtection';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Analytics } from '@/components/admin/Analytics';
import { UserManagement } from '@/components/admin/UserManagement';
import { GameManagement } from '@/components/admin/GameManagement';
import { StoreManagement } from '@/components/admin/StoreManagement';
import { CrateManagement } from '@/components/admin/CrateManagement';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { SecurityDashboard } from '@/components/admin/SecurityDashboard';
import { IncidentResponseSystem } from '@/components/security/IncidentResponseSystem';
import { MonitoringIntegration } from '@/components/security/MonitoringIntegration';
import { ComplianceChecker } from '@/components/security/ComplianceChecker';
import { EDRProvider } from '@/components/security/EDRProvider';
import { AdminSetup } from '@/components/admin/AdminSetup';
import { AdminMFA } from '@/components/admin/AdminMFA';
import { SteamBotManagement } from '@/components/admin/SteamBotManagement';
import { LeaderboardManagement } from '@/components/admin/LeaderboardManagement';
import { AdminCommandsPanel } from '@/components/admin/AdminCommandsPanel';
import { SteamTradesManagement } from '@/components/admin/SteamTradesManagement';

const AdminPage = () => {
  const { isAuthorized, isLoading } = useRoleProtection('admin');
  const [activeSection, setActiveSection] = useState('analytics');

  // Debug logging
  console.log('AdminPage rendered with activeSection:', activeSection);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You need administrator privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    console.log('🔥 RENDERING CONTENT FOR SECTION:', activeSection);
    
    switch (activeSection) {
      case 'analytics':
        console.log('📊 Rendering Analytics component');
        return <Analytics />;
      case 'users':
        console.log('👥 Rendering UserManagement component');
        return <UserManagement />;
      case 'games':
        console.log('🎮 Rendering GameManagement component');
        return <GameManagement />;
      case 'store':
        console.log('🏪 Rendering StoreManagement component');
        return <StoreManagement />;
      case 'crates':
        console.log('🎁 RENDERING CRATE MANAGEMENT COMPONENT!!!');
        return <CrateManagement />;
      case 'steam-bots':
        console.log('🤖 Rendering SteamBotManagement component');
        return <SteamBotManagement />;
      case 'steam-trades':
        console.log('📈 Rendering SteamTradesManagement component');
        return <SteamTradesManagement />;
      case 'leaderboards':
        console.log('🏆 Rendering LeaderboardManagement component');
        return <LeaderboardManagement />;
      case 'commands':
        console.log('⚡ Rendering AdminCommandsPanel component');
        return <AdminCommandsPanel />;
      case 'settings':
        console.log('⚙️ Rendering SystemSettings component');
        return <SystemSettings />;
      case 'security':
        console.log('🔒 Rendering SecurityDashboard component');
        return <SecurityDashboard />;
      case 'incidents':
        console.log('🚨 Rendering IncidentResponseSystem component');
        return <IncidentResponseSystem />;
      case 'monitoring':
        console.log('📊 Rendering MonitoringIntegration component');
        return <MonitoringIntegration />;
      case 'compliance':
        console.log('✅ Rendering ComplianceChecker component');
        return <ComplianceChecker />;
      case 'setup':
        console.log('🔧 Rendering AdminSetup component');
        return <AdminSetup />;
      case 'mfa':
        console.log('🔐 Rendering AdminMFA component');
        return <AdminMFA />;
      default:
        console.log('❓ DEFAULT CASE - rendering Analytics component');
        return <Analytics />;
    }
  };

  return (
    <EDRProvider>
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar 
            activeSection={activeSection} 
            onSectionChange={(section) => {
              console.log('🔄 SECTION CHANGED FROM', activeSection, 'TO', section);
              setActiveSection(section);
            }} 
          />
          <main className="flex-1">
            <div className="p-6">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </EDRProvider>
  );
};

export default AdminPage;
