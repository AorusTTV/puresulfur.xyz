
import React from 'react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card/60 border-border/50 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Join PureSulfur</h1>
          <p className="text-muted-foreground mb-6">Create your account to get started</p>
          <LoginDialog>
            <Button className="w-full">Create Account</Button>
          </LoginDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
