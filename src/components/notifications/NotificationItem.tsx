
import React, { useEffect, useState } from 'react';
import { X, DollarSign, VolumeX, Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Notification } from '@/contexts/NotificationContext';

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(notification.id), 200);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        if (notification.title.includes('Tip')) {
          return <DollarSign className="h-5 w-5 text-green-500" />;
        }
        if (notification.title.includes('Unmuted')) {
          return <Volume2 className="h-5 w-5 text-green-500" />;
        }
        return <Volume2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <VolumeX className="h-5 w-5 text-orange-500" />;
      case 'error':
        return <VolumeX className="h-5 w-5 text-red-500" />;
      default:
        return <DollarSign className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-orange-500';
      case 'error':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <Card 
      className={`
        w-80 border-l-4 ${getBorderColor()} bg-card/95 backdrop-blur-sm shadow-lg
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isLeaving ? '-translate-x-full' : ''}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
