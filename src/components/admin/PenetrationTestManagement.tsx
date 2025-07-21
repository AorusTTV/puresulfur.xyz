
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  FileText, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Download,
  Upload,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PenTestProvider {
  name: string;
  accreditation: string[];
  website: string;
  specialties: string[];
  estimatedCost: string;
  timeline: string;
}

interface TestingPhase {
  phase: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  startDate?: Date;
  endDate?: Date;
  findings: number;
  description: string;
}

interface SecurityFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  status: 'open' | 'in-progress' | 'fixed' | 'mitigated';
  description: string;
  remediation: string;
  assignee: string;
  dueDate: Date;
}

export const PenetrationTestManagement: React.FC = () => {
  const { toast } = useToast();
  
  const [providers] = useState<PenTestProvider[]>([
    {
      name: 'CyberSec Pro',
      accreditation: ['CREST', 'OSCP', 'CEH'],
      website: 'https://cybersecpro.com',
      specialties: ['Web Applications', 'Gaming Platforms', 'Payment Systems'],
      estimatedCost: '$8,000 - $12,000',
      timeline: '3-4 weeks'
    },
    {
      name: 'PentestCorp',
      accreditation: ['CISSP', 'GSEC', 'CREST'],
      website: 'https://pentestcorp.com',
      specialties: ['Financial Services', 'Cloud Security', 'API Testing'],
      estimatedCost: '$10,000 - $15,000',
      timeline: '4-5 weeks'
    },
    {
      name: 'RedTeam Security',
      accreditation: ['OSCP', 'OSCE', 'CISSP'],
      website: 'https://redteamsec.com',
      specialties: ['Gaming Security', 'Blockchain', 'Real-time Systems'],
      estimatedCost: '$12,000 - $18,000',
      timeline: '3-6 weeks'
    }
  ]);

  const [testingPhases] = useState<TestingPhase[]>([
    {
      phase: 'Pre-engagement',
      status: 'completed',
      startDate: new Date(2024, 11, 1),
      endDate: new Date(2024, 11, 3),
      findings: 0,
      description: 'Scope definition, contract signing, and test environment setup'
    },
    {
      phase: 'Reconnaissance',
      status: 'completed',
      startDate: new Date(2024, 11, 4),
      endDate: new Date(2024, 11, 6),
      findings: 3,
      description: 'Information gathering and attack surface mapping'
    },
    {
      phase: 'Vulnerability Assessment',
      status: 'in-progress',
      startDate: new Date(2024, 11, 7),
      findings: 8,
      description: 'Automated and manual vulnerability identification'
    },
    {
      phase: 'Exploitation',
      status: 'pending',
      findings: 0,
      description: 'Attempt to exploit identified vulnerabilities'
    },
    {
      phase: 'Post-Exploitation',
      status: 'pending',
      findings: 0,
      description: 'Privilege escalation and lateral movement testing'
    },
    {
      phase: 'Reporting',
      status: 'pending',
      findings: 0,
      description: 'Final report preparation and findings documentation'
    }
  ]);

  const [findings] = useState<SecurityFinding[]>([
    {
      id: 'PEN-001',
      severity: 'high',
      title: 'SQL Injection in User Profile Endpoint',
      status: 'in-progress',
      description: 'Parameterized queries not used in profile update functionality',
      remediation: 'Implement parameterized queries and input validation',
      assignee: 'Backend Team',
      dueDate: new Date(2024, 11, 20)
    },
    {
      id: 'PEN-002',
      severity: 'medium',
      title: 'Cross-Site Scripting in Chat Messages',
      status: 'fixed',
      description: 'User input not properly sanitized in chat system',
      remediation: 'Implement DOMPurify for message sanitization',
      assignee: 'Frontend Team',
      dueDate: new Date(2024, 11, 15)
    },
    {
      id: 'PEN-003',
      severity: 'critical',
      title: 'Authentication Bypass in Admin Panel',
      status: 'open',
      description: 'JWT validation bypassed through header manipulation',
      remediation: 'Strengthen JWT validation and implement proper RBAC',
      assignee: 'Security Team',
      dueDate: new Date(2024, 11, 18)
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'fixed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'pending':
      case 'open':
        return 'outline';
      case 'blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleProviderSelect = (provider: PenTestProvider) => {
    toast({
      title: 'Provider Selected',
      description: `Initiating contract process with ${provider.name}`,
    });
  };

  const handleUploadReport = () => {
    toast({
      title: 'Report Upload',
      description: 'Penetration test report uploaded successfully',
    });
  };

  const criticalFindings = findings.filter(f => f.severity === 'critical' && f.status !== 'fixed');
  const highFindings = findings.filter(f => f.severity === 'high' && f.status !== 'fixed');

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Progress</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65%</div>
            <p className="text-xs text-muted-foreground">3 of 6 phases complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Findings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalFindings.length}</div>
            <p className="text-xs text-muted-foreground">Require immediate fix</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Findings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highFindings.length}</div>
            <p className="text-xs text-muted-foreground">Need urgent attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Until final report</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Test Progress</TabsTrigger>
          <TabsTrigger value="findings">Security Findings</TabsTrigger>
          <TabsTrigger value="providers">Provider Selection</TabsTrigger>
          <TabsTrigger value="reports">Reports & Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testing Phases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testingPhases.map((phase, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        phase.status === 'completed' ? 'bg-green-500' :
                        phase.status === 'in-progress' ? 'bg-blue-500' :
                        phase.status === 'blocked' ? 'bg-red-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <h4 className="font-medium">{phase.phase}</h4>
                        <p className="text-sm text-muted-foreground">{phase.description}</p>
                        {phase.startDate && (
                          <p className="text-xs text-muted-foreground">
                            Started: {phase.startDate.toLocaleDateString()}
                            {phase.endDate && ` • Completed: ${phase.endDate.toLocaleDateString()}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(phase.status) as any}>
                        {phase.status}
                      </Badge>
                      {phase.findings > 0 && (
                        <Badge variant="secondary">
                          {phase.findings} findings
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Security Findings</CardTitle>
              <Button onClick={handleUploadReport} size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Update Findings
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {findings.map((finding) => (
                  <div key={finding.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{finding.id}</Badge>
                        <Badge variant={getSeverityColor(finding.severity) as any}>
                          {finding.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={getStatusColor(finding.status) as any}>
                          {finding.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Due: {finding.dueDate.toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1">{finding.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{finding.description}</p>
                      <p className="text-sm"><strong>Remediation:</strong> {finding.remediation}</p>
                      <p className="text-sm"><strong>Assigned to:</strong> {finding.assignee}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {providers.map((provider, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {provider.name}
                    <Button
                      onClick={() => handleProviderSelect(provider)}
                      size="sm"
                      variant="outline"
                    >
                      Select
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium">Accreditations</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {provider.accreditation.map((cert, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium">Specialties</h4>
                    <ul className="text-xs text-muted-foreground mt-1">
                      {provider.specialties.map((specialty, i) => (
                        <li key={i}>• {specialty}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Cost:</span>
                      <br />
                      <span className="text-muted-foreground">{provider.estimatedCost}</span>
                    </div>
                    <div>
                      <span className="font-medium">Timeline:</span>
                      <br />
                      <span className="text-muted-foreground">{provider.timeline}</span>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="w-full">
                    <ExternalLink className="w-3 h-3 mr-2" />
                    Visit Website
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Documentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Required Deliverables</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Signed contract / Statement of Work
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Test plan & scheduled dates
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      Final report with executive summary
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      Proof of HIGH/CRITICAL fixes
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Report Downloads</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Interim Report (Week 2)
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                      <FileText className="w-4 h-4 mr-2" />
                      Final Report (Pending)
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Remediation Evidence
                    </Button>
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
