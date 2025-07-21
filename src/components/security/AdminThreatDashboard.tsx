
import React, { useState, useEffect } from 'react';
import { useEDR } from './EDRProvider';
import { Shield, AlertTriangle, TrendingUp, Clock, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ThreatEvent {
  id: string;
  type: 'malware' | 'suspicious_behavior' | 'unauthorized_access' | 'data_exfiltration' | 'injection_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  source: string;
  details: Record<string, any>;
  automated_response?: string;
}

export const AdminThreatDashboard: React.FC = () => {
  const { metrics, getActiveThreats } = useEDR();
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const updateThreats = () => {
      const activeThreats = getActiveThreats();
      setThreats(activeThreats);
    };

    updateThreats();
    const interval = setInterval(updateThreats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [getActiveThreats]);

  const filteredThreats = threats.filter(threat => {
    const severityMatch = filterSeverity === 'all' || threat.severity === filterSeverity;
    const typeMatch = filterType === 'all' || threat.type === filterType;
    return severityMatch && typeMatch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const threatTypeStats = threats.reduce((acc, threat) => {
    acc[threat.type] = (acc[threat.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityStats = threats.reduce((acc, threat) => {
    acc[threat.severity] = (acc[threat.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.threatsDetected}</div>
            <p className="text-xs text-muted-foreground">
              All time detections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{threats.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Blocked</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.threatsBlocked}</div>
            <p className="text-xs text-muted-foreground">
              Automatically mitigated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {metrics.lastScanTime.toLocaleTimeString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toDateString() === metrics.lastScanTime.toDateString() ? 'Today' : metrics.lastScanTime.toDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="threats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="threats">Active Threats</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="patterns">Threat Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="threats" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Threat Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="suspicious_behavior">Suspicious Behavior</SelectItem>
                  <SelectItem value="injection_attempt">Injection Attempt</SelectItem>
                  <SelectItem value="unauthorized_access">Unauthorized Access</SelectItem>
                  <SelectItem value="data_exfiltration">Data Exfiltration</SelectItem>
                  <SelectItem value="malware">Malware</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Threats List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Threats ({filteredThreats.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredThreats.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No threats found matching the current filters.
                  </p>
                ) : (
                  filteredThreats.map((threat) => (
                    <div key={threat.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityColor(threat.severity) as any}>
                            {threat.severity.toUpperCase()}
                          </Badge>
                          <span className="font-medium">
                            {threat.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {threat.timestamp.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <p><strong>Source:</strong> {threat.source}</p>
                        <p><strong>Threat ID:</strong> {threat.id}</p>
                        {threat.automated_response && (
                          <p><strong>Response:</strong> {threat.automated_response}</p>
                        )}
                      </div>

                      <details className="text-sm">
                        <summary className="cursor-pointer text-primary">View Details</summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(threat.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Threats by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(threatTypeStats).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm">{type.replace('_', ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Threats by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(severityStats).map(([severity, count]) => (
                    <div key={severity} className="flex justify-between items-center">
                      <span className="text-sm">{severity}</span>
                      <Badge variant={getSeverityColor(severity) as any}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Attack Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-destructive pl-4">
                  <h4 className="font-medium">Rapid Request Patterns</h4>
                  <p className="text-sm text-muted-foreground">
                    Multiple users attempting rapid-fire requests (potential DDoS)
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium">Bot-like Behavior</h4>
                  <p className="text-sm text-muted-foreground">
                    Automated tools detected attempting to interact with games
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">Script Injection</h4>
                  <p className="text-sm text-muted-foreground">
                    Attempts to inject malicious scripts into the application
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
