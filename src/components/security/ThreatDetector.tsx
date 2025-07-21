
import React, { useEffect, useState } from 'react';
import { useEDR } from './EDRProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertTriangle, Activity, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const ThreatDetector: React.FC = () => {
  const { metrics, getActiveThreats, reportThreat } = useEDR();
  const { user } = useAuth();
  const [activeThreats, setActiveThreats] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Update active threats count every 30 seconds
    const interval = setInterval(() => {
      const threats = getActiveThreats();
      setActiveThreats(threats.length);
    }, 30000);

    return () => clearInterval(interval);
  }, [getActiveThreats]);

  useEffect(() => {
    // Perform initial behavioral analysis
    setIsScanning(true);
    
    const performInitialScan = async () => {
      // Check for suspicious browser extensions
      try {
        const extensions = await new Promise<any[]>((resolve) => {
          // This is a simplified check - in production you'd use more sophisticated detection
          const suspiciousExtensions = [];
          
          // Check for common suspicious patterns in the DOM
          const scripts = document.querySelectorAll('script[src]');
          scripts.forEach((script) => {
            const src = (script as HTMLScriptElement).src;
            if (src.includes('adblock') || src.includes('tampermonkey') || src.includes('greasemonkey')) {
              suspiciousExtensions.push({
                type: 'script_injection',
                source: src
              });
            }
          });
          
          resolve(suspiciousExtensions);
        });

        if (extensions.length > 0) {
          reportThreat({
            type: 'suspicious_behavior',
            severity: 'medium',
            source: 'extension_detector',
            details: {
              detected_extensions: extensions,
              user_id: user?.id || 'anonymous'
            }
          });
        }

        // Check for debugging tools
        const devToolsOpen = () => {
          const threshold = 160;
          return window.outerHeight - window.innerHeight > threshold ||
                 window.outerWidth - window.innerWidth > threshold;
        };

        if (devToolsOpen()) {
          reportThreat({
            type: 'suspicious_behavior',
            severity: 'low',
            source: 'devtools_detector',
            details: {
              window_dimensions: {
                outer: { width: window.outerWidth, height: window.outerHeight },
                inner: { width: window.innerWidth, height: window.innerHeight }
              },
              user_id: user?.id || 'anonymous'
            }
          });
        }

        // Check for automated tools/bots
        const isBot = () => {
          // Check for headless browser indicators
          return !window.navigator.webdriver === undefined ||
                 window.navigator.languages.length === 0 ||
                 !window.navigator.plugins.length;
        };

        if (isBot()) {
          reportThreat({
            type: 'suspicious_behavior',
            severity: 'high',
            source: 'bot_detector',
            details: {
              webdriver: window.navigator.webdriver,
              languages: window.navigator.languages,
              plugins: window.navigator.plugins.length,
              user_agent: navigator.userAgent,
              user_id: user?.id || 'anonymous'
            }
          });
        }

      } catch (error) {
        console.warn('[EDR] Initial scan error:', error);
      } finally {
        setIsScanning(false);
      }
    };

    performInitialScan();
  }, [user, reportThreat]);

  // Advanced behavioral monitoring
  useEffect(() => {
    let mouseMovements = 0;
    let keystrokes = 0;
    let rapidClicks = 0;
    let lastClickTime = 0;

    const handleMouseMove = () => {
      mouseMovements++;
      
      // Reset counter every 10 seconds
      setTimeout(() => mouseMovements--, 10000);
      
      // Detect suspiciously linear mouse movements (bot-like)
      if (mouseMovements > 1000) {
        reportThreat({
          type: 'suspicious_behavior',
          severity: 'medium',
          source: 'mouse_tracker',
          details: {
            pattern: 'excessive_mouse_movements',
            count: mouseMovements,
            user_id: user?.id || 'anonymous'
          }
        });
      }
    };

    const handleKeyPress = () => {
      keystrokes++;
      
      setTimeout(() => keystrokes--, 60000); // Reset every minute
      
      // Detect rapid automated typing
      if (keystrokes > 200) {
        reportThreat({
          type: 'suspicious_behavior',
          severity: 'medium',
          source: 'keyboard_tracker',
          details: {
            pattern: 'rapid_typing',
            count: keystrokes,
            user_id: user?.id || 'anonymous'
          }
        });
      }
    };

    const handleClick = () => {
      const now = Date.now();
      
      if (now - lastClickTime < 100) {
        rapidClicks++;
        
        if (rapidClicks > 10) {
          reportThreat({
            type: 'suspicious_behavior',
            severity: 'medium',
            source: 'click_tracker',
            details: {
              pattern: 'rapid_clicking',
              count: rapidClicks,
              interval: now - lastClickTime,
              user_id: user?.id || 'anonymous'
            }
          });
        }
      } else {
        rapidClicks = 0;
      }
      
      lastClickTime = now;
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keypress', handleKeyPress);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keypress', handleKeyPress);
      document.removeEventListener('click', handleClick);
    };
  }, [user, reportThreat]);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* EDR Status Card */}
      <Card className="w-64 bg-card/95 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-green-500" />
            EDR Monitor
            {isScanning && <Activity className="w-3 h-3 animate-pulse text-blue-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Threats Detected:</span>
            <Badge variant={metrics.threatsDetected > 0 ? "destructive" : "secondary"}>
              {metrics.threatsDetected}
            </Badge>
          </div>
          <div className="flex justify-between text-xs">
            <span>Threats Blocked:</span>
            <Badge variant={metrics.threatsBlocked > 0 ? "default" : "secondary"}>
              {metrics.threatsBlocked}
            </Badge>
          </div>
          <div className="flex justify-between text-xs">
            <span>Active Threats:</span>
            <Badge variant={activeThreats > 0 ? "destructive" : "secondary"}>
              {activeThreats}
            </Badge>
          </div>
          <div className="flex justify-between text-xs">
            <span>Last Scan:</span>
            <span className="text-muted-foreground">
              {metrics.lastScanTime.toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Active Threats Alert */}
      {activeThreats > 0 && (
        <Card className="w-64 bg-destructive/10 border-destructive/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                {activeThreats} Active Threat{activeThreats > 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monitoring Status */}
      <Card className="w-64 bg-green-500/10 border-green-500/20">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">
              Real-time Protection Active
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
