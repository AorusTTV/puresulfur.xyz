
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Terminal, MessageSquare, Shield, Info } from 'lucide-react';

interface Command {
  command: string;
  description: string;
  usage: string;
  permission: 'admin' | 'moderator' | 'all';
  category: 'chat' | 'moderation' | 'system';
}

const commands: Command[] = [
  {
    command: '/gm',
    description: 'This command is used in the global chat for writing a server notification to catch users\' eyes',
    usage: '/gm <message>',
    permission: 'admin',
    category: 'chat'
  },
  // Add more commands here as they are implemented
];

export const AdminCommandsPanel: React.FC = () => {
  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin': return 'bg-red-500';
      case 'moderator': return 'bg-yellow-500';
      case 'all': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chat': return MessageSquare;
      case 'moderation': return Shield;
      case 'system': return Terminal;
      default: return Info;
    }
  };

  const groupedCommands = commands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Terminal className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Admin Commands Control Panel</h1>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedCommands).map(([category, categoryCommands]) => {
          const CategoryIcon = getCategoryIcon(category);
          
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <CategoryIcon className="h-5 w-5" />
                  {category} Commands
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryCommands.map((command) => (
                    <div
                      key={command.command}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                            {command.command}
                          </code>
                          <Badge className={`${getPermissionColor(command.permission)} text-white text-xs`}>
                            {command.permission.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {command.description}
                        </p>
                        
                        <div className="text-xs">
                          <span className="font-medium">Usage: </span>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            {command.usage}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {commands.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Commands Available</h3>
            <p className="text-muted-foreground">
              No admin commands have been implemented yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Command Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Command Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <h4 className="font-semibold mb-2">Permission Levels:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <Badge className="bg-red-500 text-white text-xs mr-2">ADMIN</Badge> - Full administrative access</li>
              <li>• <Badge className="bg-yellow-500 text-white text-xs mr-2">MODERATOR</Badge> - Moderation capabilities</li>
              <li>• <Badge className="bg-green-500 text-white text-xs mr-2">ALL</Badge> - Available to all users</li>
            </ul>
          </div>
          
          <div className="text-sm">
            <h4 className="font-semibold mb-2">Usage Notes:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Commands are case-sensitive and must start with "/"</li>
              <li>• Server notifications appear with special red formatting</li>
              <li>• Unauthorized command usage will show an error message</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
