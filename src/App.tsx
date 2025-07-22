import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleProvider } from "@/middleware/RoleMiddleware";
import { CartProvider } from "@/contexts/CartContext";
import { MaintenanceProvider } from "@/contexts/MaintenanceContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationContainer } from "@/components/notifications/NotificationContainer";
import { BanGuard } from "@/components/BanGuard";
import { MaintenanceWrapper } from "@/components/maintenance/MaintenanceWrapper";
import { ComplianceWrapper } from "@/components/compliance/ComplianceWrapper";
import { FixedChatToggle } from "@/components/chat/FixedChatToggle";
import { SecurityProvider } from "@/components/security/SecurityProvider";
import { EDRProvider } from "@/components/security/EDRProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNotificationListeners } from "@/hooks/useNotificationListeners";
import Index from "./pages/Index";
import Store from "./pages/Store";
import Games from "./pages/Games";
import Inventory from "./pages/Inventory";
import Leaderboards from "./pages/Leaderboards";
import ProfilePage from "./pages/ProfilePage";
import Affiliate from "./pages/Affiliate";
import { Settings } from "./pages/Settings";
import SitePoliciesPage from "./pages/SitePoliciesPage";
import RedeemCodePage from "./pages/RedeemCodePage";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/admin/Dashboard";
import DiscordReturn from "./pages/DiscordReturn";

import "./App.css";

const queryClient = new QueryClient();

// Component to initialize notification listeners
const NotificationListenersProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useNotificationListeners();
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <RoleProvider>
                <EDRProvider>
                  <SecurityProvider>
                    <MaintenanceProvider>
                      <NotificationProvider>
                        <NotificationListenersProvider>
                          <CartProvider>
                            <ComplianceWrapper>
                              <div className="min-h-screen bg-background">
                                <Navigation />
                                <MaintenanceWrapper>
                                  <BanGuard>
                                    <Routes>
                                      <Route path="/" element={<Index />} />
                                      <Route
                                        path="/store"
                                        element={<Store />}
                                      />
                                      <Route
                                        path="/games"
                                        element={<Games />}
                                      />
                                      <Route
                                        path="/inventory"
                                        element={<Inventory />}
                                      />
                                      <Route
                                        path="/leaderboards"
                                        element={<Leaderboards />}
                                      />
                                      <Route
                                        path="/profile"
                                        element={<ProfilePage />}
                                      />
                                      <Route
                                        path="/affiliate"
                                        element={<Affiliate />}
                                      />
                                      <Route
                                        path="/settings"
                                        element={<Settings />}
                                      />
                                      <Route
                                        path="/redeem"
                                        element={<RedeemCodePage />}
                                      />
                                      <Route
                                        path="/site-policies"
                                        element={<SitePoliciesPage />}
                                      />
                                      <Route
                                        path="/admin"
                                        element={<Admin />}
                                      />
                                      <Route
                                        path="/admin/dashboard"
                                        element={<AdminDashboard />}
                                      />
                                      <Route
                                        path="/auth/discord/return"
                                        element={<DiscordReturn />}
                                      />
                                      <Route path="*" element={<NotFound />} />
                                    </Routes>
                                    <FixedChatToggle />
                                    <NotificationContainer />
                                  </BanGuard>
                                </MaintenanceWrapper>
                              </div>
                            </ComplianceWrapper>
                          </CartProvider>
                        </NotificationListenersProvider>
                      </NotificationProvider>
                    </MaintenanceProvider>
                  </SecurityProvider>
                </EDRProvider>
              </RoleProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
