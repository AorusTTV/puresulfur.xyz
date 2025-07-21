
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { MessageCircle, X } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2 text-primary text-base font-bold green-title">
        <MessageCircle className="h-5 w-5 text-primary" />
        Chat
      </CardTitle>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
