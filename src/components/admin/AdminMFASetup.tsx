
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MFASetupProps {
  onMFAVerified: () => void;
}

export const AdminMFASetup: React.FC<MFASetupProps> = ({ onMFAVerified }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'check' | 'setup' | 'verify'>('check');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMFA, setHasMFA] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      const hasActiveMFA = data?.totp?.some(factor => factor.status === 'verified') || false;
      setHasMFA(hasActiveMFA);
      
      if (hasActiveMFA) {
        onMFAVerified();
      } else {
        setStep('setup');
      }
    } catch (error) {
      console.error('Error checking MFA status:', error);
      setStep('setup');
    }
  };

  const setupMFA = async () => {
    try {
      setIsLoading(true);
      
      // First, try to clean up any existing unverified factors
      const { data: existingFactors } = await supabase.auth.mfa.listFactors();
      if (existingFactors?.totp) {
        for (const factor of existingFactors.totp) {
          if (factor.status !== 'verified') {
            try {
              await supabase.auth.mfa.unenroll({ factorId: factor.id });
            } catch (err) {
              console.log('Could not unenroll existing factor:', err);
            }
          }
        }
      }
      
      // Generate a unique friendly name
      const timestamp = Date.now();
      const friendlyName = `Admin MFA ${timestamp}`;
      
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'RustBet Admin Panel',
        friendlyName: friendlyName
      });
      
      if (error) {
        console.error('MFA enrollment error:', error);
        throw error;
      }
      
      console.log('MFA enrollment data:', data);
      
      setQrCodeUrl(data?.totp?.qr_code || '');
      setFactorId(data?.id || '');
      setStep('verify');
      
      toast({
        title: 'MFA Setup Started',
        description: 'Scan the QR code with your authenticator app'
      });
    } catch (error) {
      console.error('Error setting up MFA:', error);
      toast({
        title: 'MFA Setup Failed',
        description: error instanceof Error ? error.message : 'Could not set up MFA',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive'
      });
      return;
    }

    if (!factorId) {
      toast({
        title: 'Setup Error',
        description: 'MFA factor ID is missing. Please restart the setup process.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('Verifying MFA with factor ID:', factorId);
      console.log('Verification code:', verificationCode);
      
      // First create a challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factorId
      });
      
      if (challengeError) {
        console.error('Challenge error:', challengeError);
        throw challengeError;
      }
      
      console.log('Challenge created:', challengeData);
      
      // Then verify the challenge with the code
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorId,
        challengeId: challengeData.id,
        code: verificationCode
      });
      
      if (verifyError) {
        console.error('Verify error:', verifyError);
        throw verifyError;
      }
      
      console.log('MFA verification successful:', verifyData);
      
      setHasMFA(true);
      toast({
        title: 'MFA Enabled Successfully',
        description: 'Your admin account is now secured with multi-factor authentication'
      });
      
      onMFAVerified();
    } catch (error) {
      console.error('Error verifying MFA:', error);
      toast({
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Invalid verification code. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (hasMFA) {
    return (
      <Card className="border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-700 font-medium">MFA is enabled for your admin account</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <Shield className="h-5 w-5" />
          Admin Multi-Factor Authentication Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            MFA is required for all admin accounts. Please set it up to continue.
          </AlertDescription>
        </Alert>

        {step === 'setup' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We'll generate a QR code that you can scan with your authenticator app 
              (Google Authenticator, Authy, etc.)
            </p>
            <Button 
              onClick={setupMFA} 
              disabled={isLoading}
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              {isLoading ? 'Setting up...' : 'Setup MFA'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="font-medium mb-2">Scan this QR code</p>
              {qrCodeUrl && (
                <div className="bg-white p-4 rounded-lg inline-block border">
                  <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Use Google Authenticator, Authy, or similar app
              </p>
            </div>
            
            <div className="space-y-2">
              <Input
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-lg"
              />
              <Button
                onClick={verifyMFA}
                disabled={verificationCode.length !== 6 || isLoading}
                className="w-full"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                {isLoading ? 'Verifying...' : 'Verify & Enable MFA'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
