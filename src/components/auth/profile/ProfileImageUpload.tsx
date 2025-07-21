
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ImageCropper } from './ImageCropper';
import { ImageUrlTester } from './ImageUrlTester';

export const ProfileImageUpload: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Don't show upload option for non-Steam users or Steam users
  if (!user || !profile) {
    return null;
  }

  // Remove upload functionality entirely - all users now get default images
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Profile images are automatically assigned.
      </p>

      {profile.avatar_url && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-2">
            Current image URL: {profile.avatar_url}
          </p>
          <ImageUrlTester url={profile.avatar_url} />
        </div>
      )}
    </div>
  );
};
