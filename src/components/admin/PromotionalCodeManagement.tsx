import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Users, Clock, DollarSign, AlertTriangle } from 'lucide-react';

interface PromotionalCode {
  id: string;
  code: string;
  balance_amount: number;
  max_uses: number;
  current_uses: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export const PromotionalCodeManagement: React.FC = () => {
  const [codes, setCodes] = useState<PromotionalCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state for creating new codes
  const [newCode, setNewCode] = useState({
    code: '',
    balance_amount: '',
    max_uses: '',
    expires_at: ''
  });

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching codes:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch promotional codes',
          variant: 'destructive'
        });
        return;
      }

      setCodes(data || []);
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(prev => ({ ...prev, code: result }));
  };

  const handleCreateCode = async () => {
    if (!newCode.code || !newCode.balance_amount || !newCode.max_uses || !newCode.expires_at) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('promotional_codes')
        .insert({
          code: newCode.code.toUpperCase(),
          balance_amount: parseFloat(newCode.balance_amount),
          max_uses: parseInt(newCode.max_uses),
          expires_at: new Date(newCode.expires_at).toISOString(),
          created_by: user?.id
        });

      if (error) {
        console.error('Error creating code:', error);
        toast({
          title: 'Error',
          description: error.message.includes('duplicate') 
            ? 'This code already exists. Please use a different code.'
            : 'Failed to create promotional code',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Promotional code created successfully!'
      });

      // Reset form and close dialog
      setNewCode({ code: '', balance_amount: '', max_uses: '', expires_at: '' });
      setShowCreateDialog(false);
      
      // Refresh codes list
      fetchCodes();
    } catch (error) {
      console.error('Error creating code:', error);
      toast({
        title: 'Error',
        description: 'Failed to create promotional code',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCode = async (codeId: string, codeName: string) => {
    if (!confirm(`Are you sure you want to delete the code "${codeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('promotional_codes')
        .delete()
        .eq('id', codeId);

      if (error) {
        console.error('Error deleting code:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete promotional code',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Promotional code deleted successfully!'
      });

      // Refresh codes list
      fetchCodes();
    } catch (error) {
      console.error('Error deleting code:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete promotional code',
        variant: 'destructive'
      });
    }
  };

  const toggleCodeStatus = async (codeId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promotional_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId);

      if (error) {
        console.error('Error updating code status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update code status',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Success',
        description: `Code ${!currentStatus ? 'activated' : 'deactivated'} successfully!`
      });

      // Refresh codes list
      fetchCodes();
    } catch (error) {
      console.error('Error updating code status:', error);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const isFullyUsed = (currentUses: number, maxUses: number) => {
    return currentUses >= maxUses;
  };

  // Set default expiration to 30 days from now
  const getDefaultExpiration = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              PROMOTIONAL CODE MANAGEMENT
            </CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Create Promotional Code</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Create a new promotional code for users to redeem
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="code" className="text-foreground">Code</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="code"
                        value={newCode.code}
                        onChange={(e) => setNewCode(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="Enter code (e.g., WELCOME50)"
                        className="bg-input border-border text-foreground"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateRandomCode}
                        className="border-border text-foreground hover:bg-accent/10"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="balance_amount" className="text-foreground">Balance Amount ($)</Label>
                    <Input
                      id="balance_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newCode.balance_amount}
                      onChange={(e) => setNewCode(prev => ({ ...prev, balance_amount: e.target.value }))}
                      placeholder="10.00"
                      className="bg-input border-border text-foreground mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_uses" className="text-foreground">Maximum Uses</Label>
                    <Input
                      id="max_uses"
                      type="number"
                      min="1"
                      value={newCode.max_uses}
                      onChange={(e) => setNewCode(prev => ({ ...prev, max_uses: e.target.value }))}
                      placeholder="100"
                      className="bg-input border-border text-foreground mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expires_at" className="text-foreground">Expires At</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={newCode.expires_at || getDefaultExpiration()}
                      onChange={(e) => setNewCode(prev => ({ ...prev, expires_at: e.target.value }))}
                      className="bg-input border-border text-foreground mt-1"
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false);
                      setNewCode({ code: '', balance_amount: '', max_uses: '', expires_at: '' });
                    }}
                    className="border-border text-foreground hover:bg-accent/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCode}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    Create Code
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading promotional codes...</div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No promotional codes found. Create your first code to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Code</TableHead>
                  <TableHead className="text-muted-foreground">Balance</TableHead>
                  <TableHead className="text-muted-foreground">Usage</TableHead>
                  <TableHead className="text-muted-foreground">Expires</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((code) => (
                  <TableRow key={code.id} className="border-border">
                    <TableCell className="font-mono font-bold text-foreground">
                      {code.code}
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {code.balance_amount.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {code.current_uses}/{code.max_uses}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(code.expires_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!code.is_active && (
                          <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
                            Inactive
                          </Badge>
                        )}
                        {isExpired(code.expires_at) && (
                          <Badge variant="destructive" className="bg-red-500/20 text-red-400">
                            Expired
                          </Badge>
                        )}
                        {isFullyUsed(code.current_uses, code.max_uses) && (
                          <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-400">
                            Full
                          </Badge>
                        )}
                        {code.is_active && !isExpired(code.expires_at) && !isFullyUsed(code.current_uses, code.max_uses) && (
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-400">
                            Active
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCodeStatus(code.id, code.is_active)}
                          className="border-border text-foreground hover:bg-accent/10"
                        >
                          {code.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCode(code.id, code.code)}
                          className="border-destructive text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card className="bg-card/60 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{codes.length}</div>
              <div className="text-sm text-muted-foreground">Total Codes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {codes.filter(c => c.is_active && !isExpired(c.expires_at) && !isFullyUsed(c.current_uses, c.max_uses)).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Codes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {codes.reduce((sum, code) => sum + code.current_uses, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Redemptions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                ${codes.reduce((sum, code) => sum + (code.balance_amount * code.current_uses), 0).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Distributed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};