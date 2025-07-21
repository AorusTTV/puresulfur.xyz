
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AgeGateProps {
  children: React.ReactNode;
}

export const AgeGate: React.FC<AgeGateProps> = ({ children }) => {
  const { user, profile } = useAuth();
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [birthDate, setBirthDate] = useState<Date>();
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [jurisdictionConfirmed, setJurisdictionConfirmed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (user && profile) {
      // Check if user has completed age verification using the new column
      const hasAgeVerification = (profile as any).age_verified === true;
      if (!hasAgeVerification) {
        setShowAgeGate(true);
      }
    }
  }, [user, profile]);

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    
    return age;
  };

  const handleSubmit = async () => {
    if (!birthDate) {
      toast({
        title: 'Birth Date Required',
        description: 'Please enter your birth date to continue',
        variant: 'destructive'
      });
      return;
    }

    const age = calculateAge(birthDate);
    
    if (age < 18) {
      toast({
        title: 'Age Requirement Not Met',
        description: 'You must be 18 years or older to access this platform',
        variant: 'destructive'
      });
      return;
    }

    if (!ageConfirmed || !termsAccepted || !jurisdictionConfirmed) {
      toast({
        title: 'Verification Incomplete',
        description: 'Please complete all verification requirements',
        variant: 'destructive'
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Update user profile with age verification using the new columns
      const updateData: any = {
        age_verified: true,
        birth_date: birthDate.toISOString().split('T')[0],
        terms_accepted_at: new Date().toISOString(),
        jurisdiction_confirmed: true
      };

      const { error } = await supabase
        .from('profiles')  
        .update(updateData)
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Verification Complete', 
        description: 'Age verification completed successfully'
      });

      setShowAgeGate(false);
      
      // Log compliance event
      if ((window as any).logSecurityEvent) {
        (window as any).logSecurityEvent({
          type: 'compliance_verification',
          severity: 'low',
          details: { 
            action: 'age_verification_completed', 
            userId: user?.id,
            age: age 
          },
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Age verification error:', error);
      toast({
        title: 'Verification Failed',
        description: 'Could not complete age verification',
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (!showAgeGate) {
    return <>{children}</>;
  }

  return (
    <>
      <Dialog open={showAgeGate} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Age Verification Required
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-800">
                <strong>Legal Requirement:</strong> You must be 18 years or older to access this gambling platform.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="birthdate" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date of Birth
                </Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={birthDate ? birthDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setBirthDate(new Date(e.target.value))}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="age-confirm"
                    checked={ageConfirmed}
                    onCheckedChange={(checked) => setAgeConfirmed(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="age-confirm" className="text-sm font-medium">
                      Age Confirmation
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      I confirm that I am 18 years of age or older
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="jurisdiction"
                    checked={jurisdictionConfirmed}
                    onCheckedChange={(checked) => setJurisdictionConfirmed(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="jurisdiction" className="text-sm font-medium">
                      Jurisdiction Compliance
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      I confirm that online gambling is legal in my jurisdiction
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="terms" className="text-sm font-medium">
                      Terms & Conditions
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      I have read and agree to the Terms of Service and Privacy Policy
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={!birthDate || !ageConfirmed || !termsAccepted || !jurisdictionConfirmed || isVerifying}
                className="min-w-32"
              >
                {isVerifying ? 'Verifying...' : 'Verify Age & Continue'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
