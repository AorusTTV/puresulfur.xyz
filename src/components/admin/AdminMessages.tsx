
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus } from 'lucide-react';

interface AdminMessage {
  id: string;
  message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const AdminMessages: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('admin_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch admin messages',
        variant: 'destructive'
      });
    } else {
      setMessages(data || []);
    }
  };

  const createMessage = async () => {
    if (!newMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Message cannot be empty',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('admin_messages')
      .insert({
        message: newMessage.trim(),
        created_by: user?.id,
        is_active: true
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to create admin message',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Admin message created successfully'
      });
      setNewMessage('');
      fetchMessages();
    }
    setLoading(false);
  };

  const toggleMessage = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('admin_messages')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update message status',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: `Message ${!currentStatus ? 'activated' : 'deactivated'}`
      });
      fetchMessages();
    }
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase
      .from('admin_messages')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Message deleted successfully'
      });
      fetchMessages();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Admin Message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="message">Message</Label>
            <Input
              id="message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Enter admin message..."
              className="mt-1"
            />
          </div>
          <Button
            onClick={createMessage}
            disabled={loading || !newMessage.trim()}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Message'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Admin Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No admin messages found</p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{message.message}</p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={message.is_active ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleMessage(message.id, message.is_active)}
                    >
                      {message.is_active ? 'Active' : 'Inactive'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMessage(message.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
