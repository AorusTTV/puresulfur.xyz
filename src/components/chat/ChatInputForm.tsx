
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputFormProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isInputDisabled: boolean;
  placeholderText: string;
  statusText: string | null;
  isMuted: boolean;
}

export const ChatInputForm: React.FC<ChatInputFormProps> = ({
  message,
  setMessage,
  onSubmit,
  onKeyDown,
  isInputDisabled,
  placeholderText,
  statusText,
  isMuted
}) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col space-y-2">
      {statusText && (
        <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
          {statusText}
        </div>
      )}
      
      <div className="flex space-x-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholderText}
          disabled={isInputDisabled}
          className={`flex-1 min-h-[40px] max-h-[120px] resize-none ${
            isMuted 
              ? 'bg-red-950/20 border-red-800/30 text-red-400 placeholder-red-400/70' 
              : ''
          }`}
          rows={1}
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={isInputDisabled || !message.trim()}
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};
