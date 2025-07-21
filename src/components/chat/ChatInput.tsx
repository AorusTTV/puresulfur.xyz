
import React from 'react';
import { SecureChatInput } from './SecureChatInput';

interface ChatInputProps {
  onSendMessage: (message: string, isGlobalMessage?: boolean) => Promise<boolean>;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  return <SecureChatInput onSendMessage={onSendMessage} disabled={disabled} />;
};
