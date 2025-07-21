
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// Enhanced validation schemas for gambling site
export const ValidationSchemas = {
  // User input validation
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscore, and dash'),
  
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email too long'),
  
  // Gambling-specific validation
  betAmount: z.number()
    .positive('Bet amount must be positive')
    .max(10000, 'Bet amount too large')
    .multipleOf(0.01, 'Invalid bet amount precision'),
  
  // Chat message validation
  chatMessage: z.string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message too long')
    .refine(
      (msg) => !containsProfanity(msg),
      'Message contains inappropriate content'
    ),
  
  // Steam trade URL validation
  steamTradeUrl: z.string()
    .url('Invalid URL format')
    .refine(
      (url) => url.includes('steamcommunity.com/tradeoffer'),
      'Must be a valid Steam trade URL'
    ),
};

// Profanity filter (basic implementation)
const profanityList = [
  'scam', 'hack', 'cheat', 'exploit', 'bot', 'fake', 'steal'
  // Add more terms as needed
];

function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
}

// Sanitization utilities
export class InputSanitizer {
  static sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }

  static sanitizeAndValidate<T>(
    input: unknown,
    schema: z.ZodSchema<T>
  ): { success: true; data: T } | { success: false; error: string } {
    try {
      // First sanitize if it's a string
      let sanitized = input;
      if (typeof input === 'string') {
        sanitized = this.sanitizeHtml(input).trim();
      }

      // Then validate with schema
      const result = schema.safeParse(sanitized);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { 
          success: false, 
          error: result.error.errors[0]?.message || 'Validation failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Sanitization failed' 
      };
    }
  }

  static sanitizeBetAmount(amount: string | number): number | null {
    try {
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      if (isNaN(num) || !isFinite(num)) {
        return null;
      }

      // Round to 2 decimal places to prevent precision attacks
      return Math.round(num * 100) / 100;
    } catch {
      return null;
    }
  }

  static sanitizeGameInput(input: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeHtml(value);
      } else if (typeof value === 'number') {
        sanitized[key] = this.sanitizeBetAmount(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? this.sanitizeHtml(item) : item
        );
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}
