
import { useEffect } from 'react';

// Client-side security headers enforcement
export const SecurityHeaders = () => {
  useEffect(() => {
    // Set CSP via meta tag for additional client-side protection
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "img-src 'self' https://steamcdn-a.akamaihd.net https://steamcommunity-a.akamaihd.net data:",
      "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'", // Note: Remove unsafe-inline in production
      "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'"
    ].join('; ');
    
    document.head.appendChild(cspMeta);

    // Force HTTPS redirect on client side as backup
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      location.replace('https:' + window.location.href.substring(window.location.protocol.length));
    }

    // Set security-related attributes
    document.addEventListener('DOMContentLoaded', () => {
      // Disable right-click context menu in production
      if (import.meta.env.PROD) {
        document.addEventListener('contextmenu', (e) => e.preventDefault());
      }
    });

    return () => {
      // Cleanup
      const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingMeta) {
        existingMeta.remove();
      }
    };
  }, []);

  return null;
};
