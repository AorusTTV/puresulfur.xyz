
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, Key, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const AdminMFA: React.FC = () => {
  const { user } = useAuth();
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [qrCode, setQrCode] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMFAFactors();
  }, []);

  const loadMFAFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setMfaFactors(data?.totp || []);
    } catch (error) {
      console.error('Error loading MFA factors:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollMFA = async () => {
    try {
      setIsEnrolling(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Rust-Skins Admin',
        friendlyName: `Admin MFA - ${user?.email}`
      });
      
      if (error) throw error;
      
      // Access QR code from the correct property path
      const qrCodeUrl = data?.totp?.qr_code || '';
      setQrCode(qrCodeUrl);
      
      toast({
        title: 'MFA Enrollment Started',
        description: 'Scan the QR code with your authenticator app'
      });
    } catch (error) {
      console.error('Error enrolling MFA:', error);
      toast({
        title: 'MFA Enrollment Failed',
        description: 'Could not start MFA enrollment',
        variant: 'destructive'
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const verifyMFA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactors[0]?.id || qrCode,
        code: verificationCode
      });
      
      if (error) throw error;
      
      toast({
        title: 'MFA Verified Successfully',
        description: 'Multi-factor authentication is now active'
      });
      
      setQrCode('');
      setVerificationCode('');
      loadMFAFactors();
    } catch (error) {
      console.error('Error verifying MFA:', error);
      toast({
        title: 'Verification Failed',
        description: 'Invalid verification code',
        variant: 'destructive'
      });
    }
  };

  const unenrollMFA = async (factorId: string) => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      
      toast({
        title: 'MFA Removed',
        description: 'Multi-factor authentication has been disabled'
      });
      
      loadMFAFactors();
    } catch (error) {
      console.error('Error removing MFA:', error);
      toast({
        title: 'Error',
        description: 'Could not remove MFA',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div>Loading MFA settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Multi-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mfaFactors.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>MFA is enabled</span>
                  <Badge variant="secondary">TOTP</Badge>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => unenrollMFA(mfaFactors[0].id)}
                >
                  Disable MFA
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Your admin account is protected with multi-factor authentication.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-orange-500" />
                <span>MFA is not enabled</span>
                <Badge variant="destructive">Required</Badge>
              </div>
              
              {!qrCode ? (
                <Button
                  onClick={enrollMFA}
                  disabled={isEnrolling}
                  className="w-full"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Enable MFA
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="font-medium mb-2">Scan QR Code</p>
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Use Google Authenticator, Authy, or similar app
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      className="text-center"
                    />
                    <Button
                      onClick={verifyMFA}
                      disabled={verificationCode.length !== 6}
                      className="w-full"
                    >
                      Verify & Enable MFA
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
