
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Clock, Users, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface SecurityIncident {
  id: string;
  type: 'breach' | 'ddos' | 'malware' | 'data_leak' | 'auth_compromise';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  timestamp: Date;
  description: string;
  affectedSystems: string[];
  assignedTo?: string;
  actions: string[];
}

export const IncidentResponseSystem: React.FC = () => {
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<SecurityIncident[]>([
    {
      id: 'INC-001',
      type: 'auth_compromise',
      severity: 'high',
      status: 'investigating',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      description: 'Multiple failed login attempts from suspicious IPs',
      affectedSystems: ['Authentication Service', 'User Database'],
      assignedTo: 'Security Team',
      actions: ['IP blocking enabled', 'Monitoring increased', 'Logs collected']
    }
  ]);

  const [responseTeam, setResponseTeam] = useState([
    { name: 'Security Lead', contact: '+1-555-SECURITY', role: 'primary' },
    { name: 'DevOps Engineer', contact: '+1-555-DEVOPS', role: 'technical' },
    { name: 'Legal Counsel', contact: '+1-555-LEGAL', role: 'compliance' }
  ]);

  const createIncident = (type: SecurityIncident['type'], severity: SecurityIncident['severity'], description: string) => {
    const newIncident: SecurityIncident = {
      id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
      type,
      severity,
      status: 'open',
      timestamp: new Date(),
      description,
      affectedSystems: [],
      actions: ['Incident created', 'Initial assessment started']
    };

    setIncidents(prev => [newIncident, ...prev]);
    
    // Log security incident
    logger.securityEvent(`Security incident created: ${type}`, severity, {
      incident_id: newIncident.id,
      description,
      auto_created: true
    });

    // Auto-escalate critical incidents
    if (severity === 'critical') {
      escalateIncident(newIncident.id);
    }

    toast({
      title: 'Security Incident Created',
      description: `${newIncident.id}: ${description}`,
      variant: severity === 'critical' ? 'destructive' : 'default'
    });
  };

  const escalateIncident = (incidentId: string) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, actions: [...incident.actions, 'Escalated to senior management', 'Emergency contacts notified'] }
        : incident
    ));

    // Simulate emergency notifications
    responseTeam.forEach(member => {
      console.log(`🚨 CRITICAL INCIDENT ALERT: Contacting ${member.name} at ${member.contact}`);
    });

    toast({
      title: 'Incident Escalated',
      description: 'Emergency response team has been notified',
      variant: 'destructive'
    });
  };

  const updateIncidentStatus = (incidentId: string, newStatus: SecurityIncident['status']) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { 
            ...incident, 
            status: newStatus,
            actions: [...incident.actions, `Status updated to: ${newStatus}`]
          }
        : incident
    ));

    toast({
      title: 'Incident Updated',
      description: `Status changed to: ${newStatus}`,
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'investigating': return 'default';
      case 'contained': return 'secondary';
      case 'resolved': return 'outline';
      default: return 'outline';
    }
  };

  // Auto-create incidents based on security events (simulation)
  useEffect(() => {
    const checkForThreats = () => {
      // Simulate random security events for demo
      const events = [
        { type: 'ddos' as const, severity: 'high' as const, desc: 'Unusual traffic spike detected' },
        { type: 'malware' as const, severity: 'critical' as const, desc: 'Suspicious file upload detected' },
        { type: 'data_leak' as const, severity: 'medium' as const, desc: 'Potential data exposure in logs' }
      ];

      // 5% chance of creating a new incident every 30 seconds (for demo)
      if (Math.random() < 0.05) {
        const event = events[Math.floor(Math.random() * events.length)];
        createIncident(event.type, event.severity, event.desc);
      }
    };

    const interval = setInterval(checkForThreats, 30000);
    return () => clearInterval(interval);
  }, [incidents.length]);

  return (
    <div className="space-y-6">
      {/* Incident Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {incidents.filter(i => i.status === 'open').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investigating</CardTitle>
            <Shield className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {incidents.filter(i => i.status === 'investigating').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.5m</div>
            <p className="text-xs text-muted-foreground">Response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Status</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">Response team</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Incidents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Security Incidents</CardTitle>
          <Button 
            onClick={() => createIncident('breach', 'critical', 'Manual test incident')}
            variant="outline"
            size="sm"
          >
            Create Test Incident
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incidents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No active security incidents. System is secure.
              </p>
            ) : (
              incidents.map((incident) => (
                <div key={incident.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{incident.id}</Badge>
                      <Badge variant={getSeverityColor(incident.severity) as any}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge variant={getStatusColor(incident.status) as any}>
                        {incident.status.toUpperCase()}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {incident.timestamp.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium mb-1">
                      {incident.type.replace('_', ' ').toUpperCase()}: {incident.description}
                    </h4>
                    {incident.affectedSystems.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Affected: {incident.affectedSystems.join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => updateIncidentStatus(incident.id, 'investigating')}
                      variant="outline"
                      size="sm"
                      disabled={incident.status === 'investigating'}
                    >
                      Start Investigation
                    </Button>
                    <Button
                      onClick={() => updateIncidentStatus(incident.id, 'contained')}
                      variant="outline"
                      size="sm"
                      disabled={incident.status === 'contained'}
                    >
                      Mark Contained
                    </Button>
                    <Button
                      onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                      variant="outline"
                      size="sm"
                      disabled={incident.status === 'resolved'}
                    >
                      Resolve
                    </Button>
                    {incident.severity === 'critical' && (
                      <Button
                        onClick={() => escalateIncident(incident.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Escalate
                      </Button>
                    )}
                  </div>

                  <details className="text-sm">
                    <summary className="cursor-pointer text-primary">Response Actions</summary>
                    <ul className="mt-2 space-y-1 ml-4">
                      {incident.actions.map((action, index) => (
                        <li key={index} className="text-muted-foreground">• {action}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Response Team */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Response Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {responseTeam.map((member, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <Users className="w-5 h-5" />
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.contact}</p>
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
