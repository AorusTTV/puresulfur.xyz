
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

export const FixedChatToggle: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Fixed Chat Button - Bottom Left, positioned away from chat window */}
      <div className="fixed bottom-6 z-50" style={{ left: isOpen ? '400px' : '20px' }}>
        <Button
          variant="default"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-200 gaming-glow interactive-glow"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-primary-foreground" />
          ) : (
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
          )}
        </Button>
      </div>
      
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
