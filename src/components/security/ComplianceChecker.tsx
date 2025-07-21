
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Shield, FileText, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ComplianceCheck {
  id: string;
  category: 'security' | 'privacy' | 'gambling' | 'technical';
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  priority: 'critical' | 'high' | 'medium' | 'low';
  lastCheck: Date;
  autoCheck: boolean;
}

export const ComplianceChecker: React.FC = () => {
  const { toast } = useToast();
  
  const [checks, setChecks] = useState<ComplianceCheck[]>([
    {
      id: 'auth_mfa',
      category: 'security',
      name: 'Multi-Factor Authentication',
      description: 'Admin accounts must use MFA',
      status: 'passed',
      priority: 'critical',
      lastCheck: new Date(),
      autoCheck: true
    },
    {
      id: 'data_encryption',
      category: 'security',
      name: 'Data Encryption at Rest',
      description: 'All sensitive data must be encrypted',
      status: 'passed',
      priority: 'critical',
      lastCheck: new Date(),
      autoCheck: true
    },
    {
      id: 'ssl_certificate',
      category: 'security',
      name: 'SSL Certificate Valid',
      description: 'Valid SSL certificate with proper configuration',
      status: 'passed',
      priority: 'critical',
      lastCheck: new Date(),
      autoCheck: true
    },
    {
      id: 'age_verification',
      category: 'gambling',
      name: 'Age Verification System',
      description: 'Users must verify age before gambling',
      status: 'passed',
      priority: 'critical',
      lastCheck: new Date(),
      autoCheck: false
    },
    {
      id: 'responsible_gambling',
      category: 'gambling',
      name: 'Responsible Gambling Tools',
      description: 'Self-exclusion and limits available',
      status: 'passed',
      priority: 'high',
      lastCheck: new Date(),
      autoCheck: false
    },
    {
      id: 'data_retention',
      category: 'privacy',
      name: 'Data Retention Policy',
      description: 'Personal data retention limits enforced',
      status: 'passed',
      priority: 'high',
      lastCheck: new Date(),
      autoCheck: true
    },
    {
      id: 'gdpr_compliance',
      category: 'privacy',
      name: 'GDPR Compliance',
      description: 'EU data protection requirements met',
      status: 'warning',
      priority: 'high',
      lastCheck: new Date(Date.now() - 86400000),
      autoCheck: false
    },
    {
      id: 'backup_testing',
      category: 'technical',
      name: 'Backup Recovery Testing',
      description: 'Regular backup restoration tests',
      status: 'pending',
      priority: 'high',
      lastCheck: new Date(Date.now() - 604800000),
      autoCheck: false
    },
    {
      id: 'security_headers',
      category: 'security',
      name: 'Security Headers',
      description: 'Proper HTTP security headers configured',
      status: 'passed',
      priority: 'medium',
      lastCheck: new Date(),
      autoCheck: true
    },
    {
      id: 'vulnerability_scan',
      category: 'security',
      name: 'Vulnerability Scanning',
      description: 'Regular security vulnerability assessments',
      status: 'passed',
      priority: 'high',
      lastCheck: new Date(Date.now() - 86400000),
      autoCheck: true
    }
  ]);

  const [complianceScore, setComplianceScore] = useState(0);

  useEffect(() => {
    const calculateScore = () => {
      const totalChecks = checks.length;
      const passedChecks = checks.filter(check => check.status === 'passed').length;
      const warningChecks = checks.filter(check => check.status === 'warning').length;
      
      // Passed = 100%, Warning = 50%, Failed/Pending = 0%
      const score = ((passedChecks + (warningChecks * 0.5)) / totalChecks) * 100;
      setComplianceScore(Math.round(score));
    };

    calculateScore();
  }, [checks]);

  const runCheck = async (checkId: string) => {
    const check = checks.find(c => c.id === checkId);
    if (!check) return;

    toast({
      title: 'Running Compliance Check',
      description: `Checking: ${check.name}`,
    });

    // Simulate check execution
    setTimeout(() => {
      const possibleResults: ComplianceCheck['status'][] = ['passed', 'warning', 'failed'];
      const randomResult = possibleResults[Math.floor(Math.random() * possibleResults.length)];
      
      setChecks(prev => prev.map(c => 
        c.id === checkId 
          ? { ...c, status: randomResult, lastCheck: new Date() }
          : c
      ));

      toast({
        title: 'Check Complete',
        description: `${check.name}: ${randomResult}`,
        variant: randomResult === 'failed' ? 'destructive' : 'default'
      });
    }, 2000);
  };

  const runAllChecks = async () => {
    toast({
      title: 'Running All Compliance Checks',
      description: 'This may take a few minutes...',
    });

    // Simulate running all checks
    for (let i = 0; i < checks.length; i++) {
      setTimeout(() => {
        const check = checks[i];
        runCheck(check.id);
      }, i * 500);
    }
  };

  const getStatusIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'passed': return 'default';
      case 'failed': return 'destructive';
      case 'warning': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: ComplianceCheck['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: ComplianceCheck['category']) => {
    switch (category) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'privacy': return <FileText className="w-4 h-4" />;
      case 'technical': return <Database className="w-4 h-4" />;
      case 'gambling': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const criticalFailures = checks.filter(c => c.status === 'failed' && c.priority === 'critical').length;
  const highPriorityIssues = checks.filter(c => (c.status === 'failed' || c.status === 'warning') && c.priority === 'high').length;

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{complianceScore}%</div>
            <Progress value={complianceScore} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${criticalFailures > 0 ? 'text-destructive' : 'text-green-600'}`}>
              {criticalFailures}
            </div>
            <p className="text-xs text-muted-foreground">
              Must fix before launch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{highPriorityIssues}</div>
            <p className="text-xs text-muted-foreground">
              Issues to address
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Check</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {Math.max(...checks.map(c => c.lastCheck.getTime())) === Math.max(...checks.map(c => c.lastCheck.getTime())) 
                ? new Date(Math.max(...checks.map(c => c.lastCheck.getTime()))).toLocaleTimeString()
                : 'Never'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Latest compliance check
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Checks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Compliance Checks</CardTitle>
          <Button onClick={runAllChecks}>
            Run All Checks
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checks.map((check) => (
              <div key={check.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <h4 className="font-medium">{check.name}</h4>
                      <p className="text-sm text-muted-foreground">{check.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(check.priority) as any}>
                      {check.priority}
                    </Badge>
                    <Badge variant={getStatusColor(check.status) as any}>
                      {check.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(check.category)}
                      <span className="capitalize">{check.category}</span>
                    </div>
                    <span>Last check: {check.lastCheck.toLocaleString()}</span>
                    {check.autoCheck && (
                      <Badge variant="outline" className="text-xs">
                        Auto
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => runCheck(check.id)}
                    variant="outline"
                    size="sm"
                  >
                    Run Check
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Launch Readiness */}
      {criticalFailures === 0 && complianceScore >= 90 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Launch Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              🎉 Congratulations! Your application meets all critical compliance requirements and is ready for public launch.
            </p>
          </CardContent>
        </Card>
      )}

      {criticalFailures > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Launch Blocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              ⚠️ Critical compliance issues must be resolved before launch. Please address all failed critical checks above.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
