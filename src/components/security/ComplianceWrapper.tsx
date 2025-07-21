
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Shield, Users, CreditCard } from 'lucide-react';

interface ComplianceState {
  ageVerified: boolean;
  jurisdictionAccepted: boolean;
  kycCompleted: boolean;
  responsibleGamblingAccepted: boolean;
}

interface ComplianceWrapperProps {
  children: React.ReactNode;
}

export const ComplianceWrapper: React.FC<ComplianceWrapperProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const [complianceState, setComplianceState] = useState<ComplianceState>({
    ageVerified: false,
    jurisdictionAccepted: false,
    kycCompleted: false,
    responsibleGamblingAccepted: false
  });
  const [showComplianceModal, setShowComplianceModal] = useState(false);

  useEffect(() => {
    if (user && profile) {
      // Check compliance status from profile or localStorage
      const storedCompliance = localStorage.getItem(`compliance_${user.id}`);
      if (storedCompliance) {
        try {
          const parsed = JSON.parse(storedCompliance);
          setComplianceState(parsed);
          
          // Check if all requirements are met
          const allCompliant = Object.values(parsed).every(Boolean);
          if (!allCompliant) {
            setShowComplianceModal(true);
          }
        } catch {
          setShowComplianceModal(true);
        }
      } else {
        setShowComplianceModal(true);
      }
    }
  }, [user, profile]);

  const handleComplianceUpdate = (key: keyof ComplianceState, value: boolean) => {
    setComplianceState(prev => {
      const updated = { ...prev, [key]: value };
      if (user) {
        localStorage.setItem(`compliance_${user.id}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleSubmitCompliance = () => {
    const allCompliant = Object.values(complianceState).every(Boolean);
    if (allCompliant) {
      setShowComplianceModal(false);
      
      // Log compliance acceptance
      if ((window as any).logSecurityEvent) {
        (window as any).logSecurityEvent({
          type: 'auth_attempt',
          severity: 'low',
          details: { action: 'compliance_accepted', userId: user?.id },
          timestamp: new Date()
        });
      }
    }
  };

  const isCompliant = Object.values(complianceState).every(Boolean);

  return (
    <>
      {children}
      
      <Dialog open={showComplianceModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Compliance & Age Verification Required
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-semibold mb-1">Legal Compliance Required</p>
                  <p>You must verify your eligibility before accessing gambling services.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Age Verification */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="age-verify"
                  checked={complianceState.ageVerified}
                  onCheckedChange={(checked) => 
                    handleComplianceUpdate('ageVerified', checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="age-verify" className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Age Verification (18+ Required)
                  </label>
                  <p className="text-xs text-muted-foreground">
                    I confirm that I am at least 18 years old and legally allowed to participate in gambling activities.
                  </p>
                </div>
              </div>

              {/* Jurisdiction */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="jurisdiction"
                  checked={complianceState.jurisdictionAccepted}
                  onCheckedChange={(checked) => 
                    handleComplianceUpdate('jurisdictionAccepted', checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="jurisdiction" className="text-sm font-medium">
                    Jurisdiction Compliance
                  </label>
                  <p className="text-xs text-muted-foreground">
                    I confirm that online gambling is legal in my jurisdiction and I am not accessing this site from a restricted territory.
                  </p>
                </div>
              </div>

              {/* KYC */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="kyc"
                  checked={complianceState.kycCompleted}
                  onCheckedChange={(checked) => 
                    handleComplianceUpdate('kycCompleted', checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="kyc" className="text-sm font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Know Your Customer (KYC)
                  </label>
                  <p className="text-xs text-muted-foreground">
                    I understand that identity verification may be required for withdrawals and compliance purposes.
                  </p>
                </div>
              </div>

              {/* Responsible Gambling */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="responsible"
                  checked={complianceState.responsibleGamblingAccepted}
                  onCheckedChange={(checked) => 
                    handleComplianceUpdate('responsibleGamblingAccepted', checked as boolean)
                  }
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="responsible" className="text-sm font-medium">
                    Responsible Gambling
                  </label>
                  <p className="text-xs text-muted-foreground">
                    I acknowledge the risks of gambling and agree to gamble responsibly. I understand that gambling can be addictive.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={handleSubmitCompliance}
                disabled={!isCompliant}
                className="bg-primary hover:bg-primary/90"
              >
                Accept & Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
