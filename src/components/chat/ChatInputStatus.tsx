
import React from 'react';

interface ChatInputStatusProps {
  message: string;
  isAdmin: boolean;
  isMuted: boolean;
}

export const useChatInputStatus = ({ 
  message, 
  isAdmin, 
  isMuted 
}: ChatInputStatusProps) => {
  const getPlaceholderText = () => {
    if (isMuted) {
      return "You are muted and cannot send messages";
    }
    return "Tell us how is your wipe so far...";
  };

  const getStatusText = () => {
    if (isAdmin && message.trim().startsWith('/gm ')) {
      return "Server Notification Mode";
    }
    if (isAdmin && message.trim().startsWith('/mute ')) {
      return "Mute Command Mode";
    }
    if (isAdmin && message.trim().startsWith('/unmute ')) {
      return "Unmute Command Mode";
    }
    if (isAdmin && message.trim() === '/clear') {
      return "Clear Messages Mode";
    }
    return null;
  };

  return {
    placeholderText: getPlaceholderText(),
    statusText: getStatusText()
  };
};
