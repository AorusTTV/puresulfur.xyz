
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AdminMessage {
  id: string;
  message: string;
  created_at: string;
}

export const AdminMessageBanner: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('admin_messages')
        .select('id, message, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('admin_messages_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_messages' },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleDismiss = (messageId: string) => {
    setDismissedMessages(prev => new Set(prev).add(messageId));
  };

  const visibleMessages = messages.filter(msg => !dismissedMessages.has(msg.id));

  if (!user || visibleMessages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {visibleMessages.map((message) => (
        <Alert key={message.id} variant="destructive" className="border-red-600 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="flex items-center justify-between text-red-800 dark:text-red-200">
            <span className="font-medium">{message.message}</span>
            <button
              onClick={() => handleDismiss(message.id)}
              className="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
            >
              <X className="h-4 w-4" />
            </button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
