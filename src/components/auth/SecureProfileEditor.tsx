
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from './profile/ProfileForm';

export const SecureProfileEditor: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <ProfileForm />
      </CardContent>
    </Card>
  );
};
