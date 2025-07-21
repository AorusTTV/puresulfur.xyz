
import React from 'react';

interface AdminMessageProps {
  message: string;
  username: string;
  nickname?: string;
  avatarUrl?: string;
  timestamp: string;
}

export const AdminMessage: React.FC<AdminMessageProps> = ({
  message,
  username,
  nickname,
  avatarUrl,
  timestamp
}) => {
  return (
    <div className="flex flex-col py-2 px-3 bg-red-500/20 border border-red-500/30 rounded-lg my-2">
      <div className="text-center mb-2">
        <span className="text-red-400 font-bold text-sm uppercase tracking-wide">
          Server Notification
        </span>
      </div>
      
      <div className="text-sm text-red-100 leading-relaxed break-words text-left">
        {message}
      </div>
    </div>
  );
};
