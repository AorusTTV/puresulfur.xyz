
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Bell, Database, Globe, Settings, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MonitoringService {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date;
  endpoint: string;
  enabled: boolean;
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const MonitoringIntegration: React.FC = () => {
  const { toast } = useToast();
  
  const [services, setServices] = useState<MonitoringService[]>([
    {
      name: 'Prometheus',
      status: 'connected',
      lastSync: new Date(),
      endpoint: 'http://prometheus:9090',
      enabled: true
    },
    {
      name: 'Grafana',
      status: 'connected',
      lastSync: new Date(Date.now() - 60000),
      endpoint: 'http://grafana:3000',
      enabled: true
    },
    {
      name: 'AlertManager',
      status: 'connected',
      lastSync: new Date(Date.now() - 30000),
      endpoint: 'http://alertmanager:9093',
      enabled: true
    },
    {
      name: 'Loki (Logs)',
      status: 'connected',
      lastSync: new Date(Date.now() - 120000),
      endpoint: 'http://loki:3100',
      enabled: true
    }
  ]);

  const [alertRules, setAlertRules] = useState<AlertRule[]>([
    {
      id: 'auth_failures',
      name: 'Authentication Failures',
      condition: 'auth_failures_total > threshold',
      threshold: 20,
      enabled: true,
      severity: 'high'
    },
    {
      id: 'error_rate',
      name: '5xx Error Rate',
      condition: 'http_5xx_rate > threshold%',
      threshold: 5,
      enabled: true,
      severity: 'critical'
    },
    {
      id: 'response_time',
      name: 'Response Time',
      condition: 'avg_response_time > threshold ms',
      threshold: 2000,
      enabled: true,
      severity: 'medium'
    },
    {
      id: 'disk_usage',
      name: 'Disk Usage',
      condition: 'disk_usage > threshold%',
      threshold: 85,
      enabled: true,
      severity: 'high'
    }
  ]);

  const [dashboardConfig, setDashboardConfig] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    retentionDays: 30,
    compressionEnabled: true
  });

  const testConnection = async (serviceName: string) => {
    toast({
      title: 'Testing Connection',
      description: `Testing connection to ${serviceName}...`,
    });

    // Simulate connection test
    setTimeout(() => {
      setServices(prev => prev.map(service => 
        service.name === serviceName 
          ? { ...service, status: 'connected' as const, lastSync: new Date() }
          : service
      ));
      
      toast({
        title: 'Connection Successful',
        description: `${serviceName} is responding correctly.`,
      });
    }, 1500);
  };

  const toggleService = (serviceName: string) => {
    setServices(prev => prev.map(service => 
      service.name === serviceName 
        ? { ...service, enabled: !service.enabled }
        : service
    ));
  };

  const updateAlertRule = (ruleId: string, updates: Partial<AlertRule>) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, ...updates }
        : rule
    ));
    
    toast({
      title: 'Alert Rule Updated',
      description: 'Configuration saved successfully.',
    });
  };

  const exportConfig = () => {
    const config = {
      services,
      alertRules,
      dashboardConfig,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'monitoring-config.json';
    a.click();
    
    toast({
      title: 'Configuration Exported',
      description: 'Monitoring configuration downloaded successfully.',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'disconnected': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Monitoring Services</TabsTrigger>
          <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboard Config</TabsTrigger>
          <TabsTrigger value="export">Export/Import</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Monitoring Services Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.name} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{service.name}</h4>
                        <Badge variant={getStatusColor(service.status) as any}>
                          {service.status}
                        </Badge>
                      </div>
                      <Switch
                        checked={service.enabled}
                        onCheckedChange={() => toggleService(service.name)}
                      />
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p><strong>Endpoint:</strong> {service.endpoint}</p>
                      <p><strong>Last Sync:</strong> {service.lastSync.toLocaleString()}</p>
                    </div>

                    <Button
                      onClick={() => testConnection(service.name)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Test Connection
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Alert Rules Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant={getSeverityColor(rule.severity) as any}>
                          {rule.severity}
                        </Badge>
                      </div>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => updateAlertRule(rule.id, { enabled })}
                      />
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {rule.condition}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`threshold-${rule.id}`}>Threshold:</Label>
                        <Input
                          id={`threshold-${rule.id}`}
                          type="number"
                          value={rule.threshold}
                          onChange={(e) => updateAlertRule(rule.id, { threshold: Number(e.target.value) })}
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Dashboard Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Refresh</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically refresh dashboard data
                  </p>
                </div>
                <Switch
                  checked={dashboardConfig.autoRefresh}
                  onCheckedChange={(autoRefresh) => 
                    setDashboardConfig(prev => ({ ...prev, autoRefresh }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                <Input
                  id="refresh-interval"
                  type="number"
                  value={dashboardConfig.refreshInterval}
                  onChange={(e) => 
                    setDashboardConfig(prev => ({ 
                      ...prev, 
                      refreshInterval: Number(e.target.value) 
                    }))
                  }
                  className="w-32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention-days">Data Retention (days)</Label>
                <Input
                  id="retention-days"
                  type="number"
                  value={dashboardConfig.retentionDays}
                  onChange={(e) => 
                    setDashboardConfig(prev => ({ 
                      ...prev, 
                      retentionDays: Number(e.target.value) 
                    }))
                  }
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Data Compression</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable compression for historical data
                  </p>
                </div>
                <Switch
                  checked={dashboardConfig.compressionEnabled}
                  onCheckedChange={(compressionEnabled) => 
                    setDashboardConfig(prev => ({ ...prev, compressionEnabled }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Configuration Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={exportConfig} className="w-full">
                  Export Configuration
                </Button>
                <Button variant="outline" className="w-full">
                  Import Configuration
                </Button>
              </div>
              
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Configuration Summary</h4>
                <div className="text-sm space-y-1">
                  <p>• {services.filter(s => s.enabled).length} monitoring services enabled</p>
                  <p>• {alertRules.filter(r => r.enabled).length} alert rules active</p>
                  <p>• Dashboard refresh: {dashboardConfig.refreshInterval}s</p>
                  <p>• Data retention: {dashboardConfig.retentionDays} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
