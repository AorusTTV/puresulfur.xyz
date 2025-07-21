
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Bug, 
  DollarSign, 
  Clock, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Mail
} from 'lucide-react';

const BugBountyPage = () => {
  const rewardTiers = [
    {
      severity: 'Critical',
      reward: '$500 - $2,000',
      color: 'destructive',
      description: 'Remote Code Execution, SQL Injection, Authentication Bypass, Payment System Vulnerabilities'
    },
    {
      severity: 'High', 
      reward: '$200 - $500',
      color: 'destructive',
      description: 'Privilege Escalation, Sensitive Data Exposure, Game Logic Manipulation'
    },
    {
      severity: 'Medium',
      reward: '$50 - $200', 
      color: 'default',
      description: 'XSS, CSRF, Information Disclosure, Rate Limiting Bypass'
    },
    {
      severity: 'Low',
      reward: '$10 - $50',
      color: 'secondary',
      description: 'Minor Information Leaks, UI/UX Issues with Security Impact'
    }
  ];

  const scopeIncludes = [
    'Main application (*.rustbetgame.com)',
    'API endpoints and authentication systems',
    'Payment processing and wallet systems',
    'Game logic and payout mechanisms',
    'User authentication and session management',
    'Admin panel and privileged operations'
  ];

  const scopeExcludes = [
    'Third-party services (Steam, payment providers)',
    'Physical attacks or social engineering',
    'DoS/DDoS attacks',
    'Spam or content issues',
    'Issues requiring user interaction with malicious content',
    'Testing on production user accounts without permission'
  ];

  const submissionGuidelines = [
    'Provide clear steps to reproduce the vulnerability',
    'Include proof-of-concept code or screenshots',
    'Report only one vulnerability per submission',
    'Allow reasonable time for fix before public disclosure',
    'Do not access user data or disrupt service operations',
    'Follow responsible disclosure practices'
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          Bug Bounty Program
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Help us keep RustBet secure. Report security vulnerabilities and earn rewards.
        </p>
        <Badge variant="default" className="text-sm">
          Private Beta Program • Invitation Only
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scope">Scope</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="submit">Submit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="text-center">
                <Bug className="w-8 h-8 mx-auto text-primary" />
                <CardTitle>Find Bugs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Discover security vulnerabilities in our platform
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <DollarSign className="w-8 h-8 mx-auto text-green-500" />
                <CardTitle>Earn Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Get paid for valid security findings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Shield className="w-8 h-8 mx-auto text-blue-500" />
                <CardTitle>Help Secure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Contribute to a safer gaming platform
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Response SLA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Initial Response</h4>
                  <p className="text-sm text-muted-foreground">
                    We acknowledge all submissions within <strong>24 hours</strong>
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Triage & Assessment</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete triage within <strong>72 hours</strong> for critical issues
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Resolution Timeline</h4>
                  <p className="text-sm text-muted-foreground">
                    Critical: <strong>7 days</strong> | High: <strong>30 days</strong> | Others: <strong>90 days</strong>
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Reward Payment</h4>
                  <p className="text-sm text-muted-foreground">
                    Payments processed within <strong>30 days</strong> of resolution
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scope" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  In Scope
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scopeIncludes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="w-4 h-4 mt-1 text-green-500" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Out of Scope
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scopeExcludes.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-1 text-red-500" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Submission Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {submissionGuidelines.map((guideline, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-1 text-primary" />
                    <span className="text-sm">{guideline}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewardTiers.map((tier, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant={tier.color as any}>{tier.severity}</Badge>
                    </CardTitle>
                    <div className="text-lg font-bold text-green-600">
                      {tier.reward}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reward Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Bonus Multipliers</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• First reporter: +50% bonus</li>
                    <li>• Detailed exploit: +25% bonus</li>
                    <li>• Multiple vectors: +25% bonus</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Payment Methods</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• PayPal (preferred)</li>
                    <li>• Bank transfer</li>
                    <li>• Cryptocurrency</li>
                    <li>• Platform credits</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Submit a Vulnerability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Private Beta Only</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This bug bounty program is currently in private beta. 
                      Only invited security researchers can participate.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Email Submission</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send your vulnerability report to:
                  </p>
                  <div className="bg-muted p-3 rounded-lg">
                    <code className="text-sm font-mono">security@rustbetgame.com</code>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Required Information</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Vulnerability type and severity assessment</li>
                    <li>• Detailed steps to reproduce</li>
                    <li>• Proof-of-concept code or screenshots</li>
                    <li>• Potential impact and affected systems</li>
                    <li>• Your contact information for follow-up</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">PGP Encryption (Optional)</h4>
                  <p className="text-sm text-muted-foreground">
                    For sensitive reports, encrypt your submission using our PGP key.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Download PGP Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Triage Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">1</div>
                  <div>
                    <h4 className="font-medium">Initial Review</h4>
                    <p className="text-sm text-muted-foreground">
                      Security team acknowledges submission and performs initial assessment
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-600">2</div>
                  <div>
                    <h4 className="font-medium">Reproduction</h4>
                    <p className="text-sm text-muted-foreground">
                      Technical team attempts to reproduce the vulnerability
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">3</div>
                  <div>
                    <h4 className="font-medium">Severity Assessment</h4>
                    <p className="text-sm text-muted-foreground">
                      Impact analysis and severity classification using CVSS scoring
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-600">4</div>
                  <div>
                    <h4 className="font-medium">Resolution & Reward</h4>
                    <p className="text-sm text-muted-foreground">
                      Fix deployment and reward payment processing
                    </p>
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

export default BugBountyPage;
