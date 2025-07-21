
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Eye, EyeOff, Loader2 } from 'lucide-react';

interface AddBotDialogProps {
  onBotAdded: () => void;
}

// Validation functions
const isValidApiKey = (key: string): boolean => {
  return /^[a-f0-9]{32}$/i.test(key);
};

const isValidBase64 = (str: string): boolean => {
  if (!str) return true; // Optional fields
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
};

const validateBotForm = (formData: any) => {
  const errors: string[] = [];
  
  if (!formData.label.trim()) {
    errors.push('Bot label is required');
  }
  
  if (!formData.steamLogin.trim()) {
    errors.push('Steam login is required');
  }
  
  if (!formData.password.trim()) {
    errors.push('Steam password is required');
  }
  
  if (formData.apiKey && !isValidApiKey(formData.apiKey.trim())) {
    errors.push('Steam API key must be 32 hexadecimal characters');
  }
  
  if (formData.sharedSecret && !isValidBase64(formData.sharedSecret.trim())) {
    errors.push('Shared secret must be valid Base64');
  }
  
  if (formData.identitySecret && !isValidBase64(formData.identitySecret.trim())) {
    errors.push('Identity secret must be valid Base64');
  }
  
  return errors;
};

export const AddBotDialog: React.FC<AddBotDialogProps> = ({ onBotAdded }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testingLogin, setTestingLogin] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    sharedSecret: false,
    identitySecret: false,
    apiKey: false
  });
  const [formData, setFormData] = useState({
    label: '',
    steamLogin: '',
    steamId: '',
    password: '',
    sharedSecret: '',
    identitySecret: '',
    apiKey: ''
  });
  const { toast } = useToast();

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTestLogin = async () => {
    // Validate required fields for test
    if (!formData.steamLogin.trim() || !formData.password.trim()) {
      toast({
        title: 'Missing Credentials',
        description: 'Steam login and password are required for testing',
        variant: 'destructive'
      });
      return;
    }

    setTestingLogin(true);
    console.log('[ADD-BOT] Testing Steam login...');

    try {
      const { data, error } = await supabase.functions.invoke('steam-bot-manager', {
        body: {
          action: 'test_login',
          credentials: {
            steam_login: formData.steamLogin.trim(),
            password: formData.password.trim(),
            steam_id:formData.steamId.trim(),
            shared_secret: formData.sharedSecret.trim() || null,
            identity_secret: formData.identitySecret.trim() || null,
            api_key: formData.apiKey.trim() || null
          }
        }
      });

      if (error) {
        console.error('[ADD-BOT] Edge function error:', error);
        toast({
          title: 'Test Failed',
          description: error.message || 'Failed to test Steam login credentials',
          variant: 'destructive'
        });
        return;
      }

      if (data?.success) {
        toast({
          title: 'Login Test Successful',
          description: data.message || 'Steam credentials are working correctly'
        });
      } else {
        toast({
          title: 'Login Test Failed',
          description: data?.error || 'Unable to authenticate with Steam',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('[ADD-BOT] Login test failed:', error);
      toast({
        title: 'Test Failed',
        description: 'Failed to test Steam login credentials',
        variant: 'destructive'
      });
    } finally {
      setTestingLogin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim all inputs
    const trimmedData = {
      label: formData.label.trim(),
      steamLogin: formData.steamLogin.trim(),
      password: formData.password.trim(),
      sharedSecret: formData.sharedSecret.trim(),
      identitySecret: formData.identitySecret.trim(),
      apiKey: formData.apiKey.trim()
    };

    // Client-side validation
    const validationErrors = validateBotForm(trimmedData);
    if (validationErrors.length > 0) {
      toast({
        title: 'Validation Error',
        description: validationErrors[0],
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    console.log('[ADD-BOT] Creating new Steam bot...');

    try {
      const { data, error } = await supabase.functions.invoke('steam-bot-manager', {
        body: {
          action: 'create_bot',
          botData: {
            label: trimmedData.label,
            steam_login: trimmedData.steamLogin,
            password: trimmedData.password,
            shared_secret: trimmedData.sharedSecret || null,
            identity_secret: trimmedData.identitySecret || null,
            api_key: trimmedData.apiKey || null
          }
        }
      });

      if (error) {
        console.error('[ADD-BOT] Edge function error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to add Steam bot',
          variant: 'destructive'
        });
        return;
      }

      if (data?.success) {
        toast({
          title: 'Success',
          description: data.message || 'Steam bot added successfully'
        });
        setFormData({
          label: '',
          steamLogin: '',
          steamId: '',
          password: '',
          sharedSecret: '',
          identitySecret: '',
          apiKey: ''
        });
        setOpen(false);
        onBotAdded();
      } else {
        // Display the specific error message from the backend
        const errorMessage = data?.error || 'Failed to add Steam bot';
        toast({
          title: 'Bot Creation Failed',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('[ADD-BOT] Failed to add bot:', error);
      toast({
        title: 'Error',
        description: 'Failed to add Steam bot - please check your connection',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Steam Bot
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Steam Bot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="label">Bot Label *</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="e.g., Primary Bot"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="steamLogin">Steam Login *</Label>
            <Input
              id="steamLogin"
              value={formData.steamLogin}
              onChange={(e) => setFormData(prev => ({ ...prev, steamLogin: e.target.value }))}
              placeholder="Steam username"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPasswords.password ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Steam password"
                required
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => togglePasswordVisibility('password')}
                disabled={loading}
              >
                {showPasswords.password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="password">Steam ID *</Label>
            <div className="relative">
              <Input
                id="steamId"
                value={formData.steamId}
                onChange={(e) => setFormData(prev => ({ ...prev, steamId: e.target.value }))}
                placeholder="Steam Id"
                required
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => togglePasswordVisibility('password')}
                disabled={loading}
              >
                {showPasswords.password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="sharedSecret">Shared Secret</Label>
            <div className="relative">
              <Input
                id="sharedSecret"
                type={showPasswords.sharedSecret ? 'text' : 'password'}
                value={formData.sharedSecret}
                onChange={(e) => setFormData(prev => ({ ...prev, sharedSecret: e.target.value }))}
                placeholder="Steam Guard shared secret (Base64)"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => togglePasswordVisibility('sharedSecret')}
                disabled={loading}
              >
                {showPasswords.sharedSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="identitySecret">Identity Secret</Label>
            <div className="relative">
              <Input
                id="identitySecret"
                type={showPasswords.identitySecret ? 'text' : 'password'}
                value={formData.identitySecret}
                onChange={(e) => setFormData(prev => ({ ...prev, identitySecret: e.target.value }))}
                placeholder="Steam Guard identity secret (Base64)"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => togglePasswordVisibility('identitySecret')}
                disabled={loading}
              >
                {showPasswords.identitySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="apiKey">Steam API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showPasswords.apiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Steam Web API key (32 hex chars)"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => togglePasswordVisibility('apiKey')}
                disabled={loading}
              >
                {showPasswords.apiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              32 hexadecimal characters (0-9, A-F)
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestLogin}
              disabled={testingLogin || loading || !formData.steamLogin || !formData.password}
              className="flex-1"
            >
              {testingLogin ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Login'
              )}
            </Button>
            <Button type="submit" disabled={loading || testingLogin} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Bot'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
