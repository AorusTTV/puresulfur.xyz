
// Enhanced logger with structured logging for Grafana/Loki integration
interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  category: 'auth' | 'game' | 'error' | 'security' | 'system';
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ip?: string;
  metadata?: Record<string, any>;
}

class CentralizedLogger {
  private logEndpoint = '/api/logs'; // This would be your log shipping endpoint
  private buffer: LogEntry[] = [];
  private flushInterval = 5000; // 5 seconds
  private maxBufferSize = 100;

  constructor() {
    this.startPeriodicFlush();
    this.setupErrorHandlers();
  }

  private createLogEntry(
    level: LogEntry['level'], 
    message: string, 
    category: LogEntry['category'],
    metadata?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      category,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      ip: 'client-side', // Will be populated server-side
      metadata: {
        url: window.location.href,
        ...metadata
      }
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get from auth context or localStorage
    try {
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.user?.id;
      }
    } catch (e) {
      // Ignore parsing errors
    }
    return undefined;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('log_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('log_session_id', sessionId);
    }
    return sessionId;
  }

  private async flushLogs() {
    if (this.buffer.length === 0) return;

    const logsToSend = [...this.buffer];
    this.buffer = [];

    try {
      // In production, this would send to your log aggregation service
      console.log('📊 Flushing logs to centralized system:', logsToSend);
      
      // Send to backend log endpoint
      await fetch(this.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logsToSend })
      }).catch(err => {
        console.error('Failed to send logs:', err);
        // Re-add logs to buffer on failure
        this.buffer.unshift(...logsToSend);
      });
    } catch (error) {
      console.error('Log flush error:', error);
      // Re-add logs to buffer on failure
      this.buffer.unshift(...logsToSend);
    }
  }

  private startPeriodicFlush() {
    setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
  }

  private setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.error('Uncaught error', 'error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', 'error', {
        reason: event.reason,
        promise: event.promise
      });
    });
  }

  private addToBuffer(entry: LogEntry) {
    this.buffer.push(entry);
    
    // Flush immediately for errors
    if (entry.level === 'error') {
      this.flushLogs();
    }
    
    // Flush if buffer is full
    if (this.buffer.length >= this.maxBufferSize) {
      this.flushLogs();
    }
  }

  // Public logging methods
  error(message: string, category: LogEntry['category'] = 'error', metadata?: Record<string, any>) {
    const entry = this.createLogEntry('error', message, category, metadata);
    this.addToBuffer(entry);
    console.error(`[${category.toUpperCase()}] ${message}`, metadata);
  }

  warn(message: string, category: LogEntry['category'] = 'system', metadata?: Record<string, any>) {
    const entry = this.createLogEntry('warn', message, category, metadata);
    this.addToBuffer(entry);
    console.warn(`[${category.toUpperCase()}] ${message}`, metadata);
  }

  info(message: string, category: LogEntry['category'] = 'system', metadata?: Record<string, any>) {
    const entry = this.createLogEntry('info', message, category, metadata);
    this.addToBuffer(entry);
    console.info(`[${category.toUpperCase()}] ${message}`, metadata);
  }

  debug(message: string, category: LogEntry['category'] = 'system', metadata?: Record<string, any>) {
    const entry = this.createLogEntry('debug', message, category, metadata);
    this.addToBuffer(entry);
    console.debug(`[${category.toUpperCase()}] ${message}`, metadata);
  }

  // Specialized logging methods
  authEvent(event: string, success: boolean, metadata?: Record<string, any>) {
    this.info(`Auth event: ${event}`, 'auth', {
      success,
      event,
      ...metadata
    });
  }

  gameEvent(event: string, gameType: string, metadata?: Record<string, any>) {
    this.info(`Game event: ${event}`, 'game', {
      event,
      gameType,
      ...metadata
    });
  }

  securityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', metadata?: Record<string, any>) {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    this[level](`Security event: ${event}`, 'security', {
      event,
      severity,
      ...metadata
    });
  }
}

export const logger = new CentralizedLogger();

// Export for backward compatibility
export default logger;
