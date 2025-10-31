import { z } from 'zod';
import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';

// ============================================
// SANITIZATION UTILITIES
// ============================================

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize text input - removes HTML and trims whitespace
 */
export function sanitizeText(input: string): string {
  const sanitized = sanitizeHtml(input);
  return validator.trim(sanitized);
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export function sanitizeUrl(url: string): string {
  const trimmed = validator.trim(url);
  
  // Block dangerous protocols
  if (
    trimmed.toLowerCase().startsWith('javascript:') ||
    trimmed.toLowerCase().startsWith('data:') ||
    trimmed.toLowerCase().startsWith('vbscript:')
  ) {
    return '';
  }
  
  return trimmed;
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

/**
 * User registration validation
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email too long')
    .refine((email) => validator.isEmail(email), {
      message: 'Invalid email format',
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .transform(sanitizeText),
});

/**
 * User login validation
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(128, 'Password too long'),
});

/**
 * Profile update validation
 */
export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .transform(sanitizeText)
    .optional(),
  display_name: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name too long')
    .transform(sanitizeText)
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be at most 500 characters')
    .transform(sanitizeText)
    .optional(),
  avatar_url: z
    .string()
    .url('Invalid URL')
    .max(1000, 'URL too long')
    .transform(sanitizeUrl)
    .optional()
    .nullable(),
  theme: z
    .enum(['default', 'dark', 'neon', 'minimal', 'gradient'])
    .optional(),
});

/**
 * Link creation/update validation
 */
export const linkSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters')
    .transform(sanitizeText),
  url: z
    .string()
    .min(1, 'URL is required')
    .max(2000, 'URL too long')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: 'Invalid URL. Must be a valid http or https URL' }
    )
    .transform(sanitizeUrl),
  icon: z
    .string()
    .max(50, 'Icon name too long')
    .transform(sanitizeText)
    .optional(),
  is_visible: z.boolean().optional(),
  order_index: z.number().int().min(0).optional(),
});

/**
 * Link bulk update validation (for reordering)
 */
export const linkBulkUpdateSchema = z.object({
  links: z.array(
    z.object({
      id: z.string().uuid('Invalid link ID'),
      order_index: z.number().int().min(0),
    })
  ),
});

/**
 * Analytics tracking validation
 */
export const analyticsTrackSchema = z.object({
  link_id: z.string().uuid('Invalid link ID').optional(),
  event_type: z.enum(['view', 'click']),
  user_agent: z.string().max(500).optional(),
  referrer: z.string().max(1000).transform(sanitizeUrl).optional(),
  country: z.string().max(2).optional(),
  city: z.string().max(100).transform(sanitizeText).optional(),
});

/**
 * File upload validation
 */
export const fileUploadSchema = z.object({
  file: z.custom<File>((file) => {
    if (!(file instanceof File)) return false;
    
    // Max 5MB
    if (file.size > 5 * 1024 * 1024) return false;
    
    // Allowed image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) return false;
    
    return true;
  }, {
    message: 'File must be an image (JPEG, PNG, GIF, or WebP) and less than 5MB',
  }),
});

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate and sanitize request body
 */
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError?.message || 'Validation failed',
      };
    }
    return { success: false, error: 'Invalid request data' };
  }
}

/**
 * Check if email is from a disposable domain (optional spam prevention)
 */
const disposableDomains = [
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
  'temp-mail.org',
  'mailinator.com',
];

export function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain || '');
}

/**
 * Rate limit key generator for IP-based limiting
 */
export function getRateLimitKey(ip: string, action: string): string {
  return `ratelimit:${action}:${ip}`;
}
