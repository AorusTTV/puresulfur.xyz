
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMuteStatus } from '@/hooks/useMuteStatus';
import { MuteCountdown } from './MuteCountdown';
import { useAdminCommands } from './AdminCommands';
import { useChatInputStatus } from './ChatInputStatus';
import { ChatInputForm } from './ChatInputForm';

interface SecureChatInputProps {
  onSendMessage: (message: string, isGlobalMessage?: boolean) => Promise<boolean>;
  disabled?: boolean;
}

export const SecureChatInput: React.FC<SecureChatInputProps> = ({ 
  onSendMessage, 
  disabled 
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();
  const muteStatus = useMuteStatus();

  // Check if user is admin (nickname === 'admin')
  const isAdmin = profile?.nickname === 'admin';

  // Determine if input should be disabled
  const isInputDisabled = disabled || isSubmitting || muteStatus.isMuted;

  // Clear message input when user gets muted
  useEffect(() => {
    if (muteStatus.isMuted && message.trim()) {
      setMessage('');
    }
  }, [muteStatus.isMuted]);

  const {
    handleUnmuteCommand,
    handleMuteByUserIdCommand,
    handleMuteCommand,
    handleClearCommand
  } = useAdminCommands({ profile, onSendMessage });

  const { placeholderText, statusText } = useChatInputStatus({ 
    message, 
    isAdmin, 
    isMuted: muteStatus.isMuted 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isInputDisabled) return;

    // Additional mute check before sending
    if (muteStatus.isMuted && !isAdmin) {
      toast({
        title: "You are muted",
        description: "You cannot send messages while muted",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Check for admin commands
      if (isAdmin && message.trim().startsWith('/')) {
        const command = message.trim();
        console.log('Processing admin command:', command);
        
        if (command.startsWith('/gm ')) {
          const globalMessage = command.substring(4).trim();
          if (!globalMessage) {
            toast({
              title: "Invalid Command",
              description: "Server notification cannot be empty",
              variant: "destructive",
            });
            return;
          }
          console.log('Sending global message:', globalMessage);
          const success = await onSendMessage(globalMessage, true);
          if (!success) {
            toast({
              title: "Error",
              description: "Failed to send global message",
              variant: "destructive",
            });
            return;
          }
        } else if (command.startsWith('/mute ')) {
          console.log('Processing mute command:', command);
          // Parse the command to determine if it's a user ID or username
          const parts = command.split(/\s+/);
          if (parts.length >= 2) {
            const target = parts[1];
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            
            if (uuidRegex.test(target)) {
              // It's a user ID
              console.log('Muting by user ID:', target);
              await handleMuteByUserIdCommand(command);
            } else {
              // It's a username
              console.log('Muting by username:', target);
              await handleMuteCommand(command);
            }
          } else {
            toast({
              title: "Invalid Command",
              description: "Usage: /mute user_id_or_@username duration(m/h/d) [reason]",
              variant: "destructive",
            });
            return;
          }
        } else if (command.startsWith('/unmute ')) {
          console.log('Processing unmute command:', command);
          await handleUnmuteCommand(command);
        } else if (command === '/clear') {
          console.log('Processing clear command');
          await handleClearCommand();
        } else {
          toast({
            title: "Unknown Command",
            description: "Available commands: /gm, /mute, /unmute, /clear",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Regular message
        console.log('Sending regular message:', message.trim());
        const success = await onSendMessage(message.trim(), false);
        if (!success) {
          toast({
            title: "Error",
            description: "Failed to send message",
            variant: "destructive",
          });
          return;
        }
      }
      
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: `Failed to process command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-3 space-y-3">
      {/* Show mute countdown if user is muted */}
      {muteStatus.isMuted && (
        <MuteCountdown 
          remainingTime={muteStatus.remainingTime} 
          reason={muteStatus.muteReason}
        />
      )}
      
      <ChatInputForm
        message={message}
        setMessage={setMessage}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        isInputDisabled={isInputDisabled}
        placeholderText={placeholderText}
        statusText={statusText}
        isMuted={muteStatus.isMuted}
      />
    </div>
  );
};
