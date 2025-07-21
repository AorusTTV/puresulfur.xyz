
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

export const ChatToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-slate-300 hover:text-white hover:bg-slate-700/50"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </Button>
      
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
