
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedBotManagement } from './EnhancedBotManagement';
import { DebugPricingTester } from '@/components/admin/DebugPricingTester';
import { PricingVerificationRunner } from '@/components/admin/PricingVerificationRunner';
import { PricingDiagnostics } from '@/components/admin/PricingDiagnostics';
import { PricingPipelineDiagnostics } from '@/components/admin/PricingPipelineDiagnostics';
import { StoreNamesDiagnostics } from '@/components/admin/StoreNamesDiagnostics';
import { QuickDiagnosticsRunner } from '@/components/admin/QuickDiagnosticsRunner';
import { NameMatchingDiagnostics } from '@/components/admin/NameMatchingDiagnostics';
import { Bot, Wrench, DollarSign, CheckCircle, Search, AlertTriangle, Database, Zap, Settings } from 'lucide-react';

export const SteamBotManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Bot className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Steam Bot Management</h1>
      </div>

      <div className="grid gap-6">
        {/* Enhanced Bot Management Panel */}
        <EnhancedBotManagement />

        {/* Steam Bot Controls Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-green-500" />
              Bot Configuration & Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• <strong>Add Bot:</strong> Securely store Steam credentials with encryption</p>
              <p>• <strong>Test Login:</strong> Verify credentials before saving</p>
              <p>• <strong>Sync Inventory:</strong> Trigger manual inventory synchronization</p>
              <p>• <strong>Toggle Status:</strong> Activate/deactivate bots for automated operations</p>
              <p>• <strong>Delete Bot:</strong> Remove bot and all associated inventory data</p>
            </div>
          </CardContent>
        </Card>

        {/* Name Matching Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-500" />
              Name Matching Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NameMatchingDiagnostics />
          </CardContent>
        </Card>

        {/* Quick Diagnostics Runner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-500" />
              Quick Diagnostics Runner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuickDiagnosticsRunner />
          </CardContent>
        </Card>

        {/* Pricing Pipeline Fix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Pricing Pipeline Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PricingPipelineDiagnostics />
          </CardContent>
        </Card>

        {/* Store Names Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Store Names Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StoreNamesDiagnostics />
          </CardContent>
        </Card>

        {/* General Pipeline Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              General Pipeline Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PricingDiagnostics />
          </CardContent>
        </Card>

        {/* Final Pricing Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Final Pricing Pipeline Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PricingVerificationRunner />
          </CardContent>
        </Card>

        {/* Debug Individual Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Debug Individual Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DebugPricingTester />
          </CardContent>
        </Card>

        {/* Additional Steam Bot Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Price Update Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Additional Steam bot management tools and price update controls will be available here.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
