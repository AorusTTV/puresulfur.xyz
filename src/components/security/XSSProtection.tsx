
import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface XSSProtectionProps {
  html: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
}

// Secure HTML renderer that sanitizes content before display
export const SecureHTMLRenderer: React.FC<XSSProtectionProps> = ({ 
  html, 
  className = '', 
  tag: Tag = 'div' 
}) => {
  const sanitizedHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });

  return (
    <Tag 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

// Hook for sanitizing user input
export const useSanitizedInput = () => {
  const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  };

  const sanitizeAndValidate = (input: string, maxLength: number = 500): { 
    sanitized: string; 
    isValid: boolean; 
    error?: string 
  } => {
    const sanitized = sanitizeInput(input);
    
    if (sanitized.length > maxLength) {
      return {
        sanitized: sanitized.substring(0, maxLength),
        isValid: false,
        error: `Input too long (max ${maxLength} characters)`
      };
    }

    // Check for potential XSS patterns even after sanitization
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    const hasXSSPattern = xssPatterns.some(pattern => pattern.test(input));
    
    if (hasXSSPattern) {
      return {
        sanitized,
        isValid: false,
        error: 'Input contains potentially harmful content'
      };
    }

    return {
      sanitized,
      isValid: true
    };
  };

  return { sanitizeInput, sanitizeAndValidate };
};

// Enhanced Input Sanitizer class
export class EnhancedInputSanitizer {
  static sanitizeUserContent(content: string): string {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
      SANITIZE_DOM: true
    });
  }

  static sanitizeChatMessage(message: string): string {
    const sanitized = DOMPurify.sanitize(message.trim(), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });

    // Additional chat-specific validation
    if (sanitized.length > 500) {
      throw new Error('Message too long');
    }

    return sanitized;
  }

  static sanitizeProfileBio(bio: string): string {
    const sanitized = DOMPurify.sanitize(bio.trim(), {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });

    if (sanitized.length > 200) {
      throw new Error('Bio too long');
    }

    return sanitized;
  }

  static sanitizeNickname(nickname: string): string {
    const sanitized = DOMPurify.sanitize(nickname.trim(), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });

    // Only allow alphanumeric, spaces, and basic punctuation
    const cleaned = sanitized.replace(/[^a-zA-Z0-9\s\-_\.]/g, '');
    
    if (cleaned.length < 3 || cleaned.length > 20) {
      throw new Error('Nickname must be 3-20 characters');
    }

    return cleaned;
  }
}
