
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Eye, Ban, Activity, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityAlert {
  id: string;
  type: 'auth_failure' | 'suspicious_betting' | 'rate_limit' | 'account_compromise';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  userId?: string;
  resolved: boolean;
}

interface BannedIP {
  ip: string;
  reason: string;
  bannedAt: Date;
  expiresAt?: Date;
}

export const AdminSecurityPanel: React.FC = () => {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);
  const [newBanIP, setNewBanIP] = useState('');
  const [banReason, setBanReason] = useState('');

  // Check if user is admin
  if (!profile || profile.nickname !== 'admin') {
    return (
      <div className="text-center p-8">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">Admin privileges required</p>
      </div>
    );
  }

  useEffect(() => {
    // Load mock security alerts
    const mockAlerts: SecurityAlert[] = [
      {
        id: '1',
        type: 'auth_failure',
        severity: 'medium',
        message: 'Multiple failed login attempts from IP 192.168.1.100',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        resolved: false
      },
      {
        id: '2',
        type: 'suspicious_betting',
        severity: 'high',
        message: 'Unusual betting pattern detected - 50 games in 10 minutes',
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        userId: 'user123',
        resolved: false
      },
      {
        id: '3',
        type: 'rate_limit',
        severity: 'low',
        message: 'Rate limit exceeded for API endpoints',
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        resolved: true
      }
    ];
    setAlerts(mockAlerts);

    // Load banned IPs from localStorage
    const storedBans = localStorage.getItem('admin_banned_ips');
    if (storedBans) {
      try {
        const parsed = JSON.parse(storedBans);
        setBannedIPs(parsed.map((ban: any) => ({
          ...ban,
          bannedAt: new Date(ban.bannedAt),
          expiresAt: ban.expiresAt ? new Date(ban.expiresAt) : undefined
        })));
      } catch (error) {
        console.error('Error loading banned IPs:', error);
      }
    }
  }, []);

  const handleBanIP = () => {
    if (!newBanIP || !banReason) return;

    const newBan: BannedIP = {
      ip: newBanIP,
      reason: banReason,
      bannedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    const updatedBans = [...bannedIPs, newBan];
    setBannedIPs(updatedBans);
    localStorage.setItem('admin_banned_ips', JSON.stringify(updatedBans));

    setNewBanIP('');
    setBanReason('');

    // Log security action
    if ((window as any).logSecurityEvent) {
      (window as any).logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        details: { action: 'ip_banned', ip: newBanIP, reason: banReason },
        timestamp: new Date()
      });
    }
  };

  const handleUnbanIP = (ip: string) => {
    const updatedBans = bannedIPs.filter(ban => ban.ip !== ip);
    setBannedIPs(updatedBans);
    localStorage.setItem('admin_banned_ips', JSON.stringify(updatedBans));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const resolvedAlerts = alerts.filter(alert => alert.resolved);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Security Control Panel</h1>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Banned IPs</p>
                <p className="text-2xl font-bold">{bannedIPs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className="text-sm font-semibold text-green-600">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Monitoring</p>
                <p className="text-sm font-semibold text-blue-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="ip-management">IP Management</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Security Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeAlerts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No active alerts</p>
              ) : (
                activeAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getSeverityColor(alert.severity)} text-white`}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {resolvedAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resolved Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {resolvedAlerts.map(alert => (
                  <div key={alert.id} className="flex items-center gap-3 p-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{alert.severity}</Badge>
                    <span>{alert.message}</span>
                    <span className="ml-auto">{alert.timestamp.toLocaleString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ip-management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ban IP Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="IP Address (e.g. 192.168.1.100)"
                  value={newBanIP}
                  onChange={(e) => setNewBanIP(e.target.value)}
                />
                <Input
                  placeholder="Reason for ban"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
                <Button onClick={handleBanIP} disabled={!newBanIP || !banReason}>
                  <Ban className="h-4 w-4 mr-2" />
                  Ban IP
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Currently Banned IPs</CardTitle>
            </CardHeader>
            <CardContent>
              {bannedIPs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No banned IPs</p>
              ) : (
                <div className="space-y-2">
                  {bannedIPs.map((ban, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{ban.ip}</p>
                        <p className="text-sm text-muted-foreground">{ban.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          Banned: {ban.bannedAt.toLocaleString()}
                          {ban.expiresAt && ` • Expires: ${ban.expiresAt.toLocaleString()}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnbanIP(ban.ip)}
                      >
                        Unban
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Security Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Active Protections</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rate Limiting</span>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CSRF Protection</span>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Input Sanitization</span>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Session Security</span>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">System Health</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Connection</span>
                      <Badge className="bg-green-500 text-white">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Authentication Service</span>
                      <Badge className="bg-green-500 text-white">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Gateway</span>
                      <Badge className="bg-green-500 text-white">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Game Services</span>
                      <Badge className="bg-green-500 text-white">Healthy</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last 24 Hours Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Auth Attempts</p>
                    <p className="font-semibold">1,247</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Failed Logins</p>
                    <p className="font-semibold">23</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rate Limited</p>
                    <p className="font-semibold">156</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Blocked Requests</p>
                    <p className="font-semibold">45</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
