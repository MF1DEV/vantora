import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_SECRET_COOKIE = 'vantora_csrf_secret';
const CSRF_TOKEN_HEADER = 'x-csrf-token';

/**
 * Generate a random CSRF token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate HMAC signature for token validation
 */
function generateSignature(token: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

/**
 * Get or create CSRF secret from cookies
 */
async function getOrCreateSecret(): Promise<string> {
  const cookieStore = await cookies();
  const existingSecret = cookieStore.get(CSRF_SECRET_COOKIE)?.value;
  
  if (existingSecret) {
    return existingSecret;
  }
  
  // Generate new secret
  const secret = crypto.randomBytes(32).toString('hex');
  
  cookieStore.set(CSRF_SECRET_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  
  return secret;
}

/**
 * Generate a CSRF token for the current session
 * Returns token and signature (send signature as cookie, token to client)
 */
export async function generateCsrfToken(): Promise<{ token: string; signature: string }> {
  const secret = await getOrCreateSecret();
  const token = generateToken();
  const signature = generateSignature(token, secret);
  
  return { token, signature };
}

/**
 * Validate CSRF token from request
 * Checks token from header against signature from cookie
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const secret = cookieStore.get(CSRF_SECRET_COOKIE)?.value;
    const token = request.headers.get(CSRF_TOKEN_HEADER);
    
    if (!secret || !token) {
      return false;
    }
    
    // Get expected signature
    const expectedSignature = generateSignature(token, secret);
    
    // Get actual signature from cookie (set by client after receiving token)
    const actualSignature = cookieStore.get('vantora_csrf_token')?.value;
    
    if (!actualSignature) {
      return false;
    }
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(actualSignature)
    );
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
}

/**
 * Middleware helper to validate CSRF and throw if invalid
 */
export async function requireCsrfToken(request: Request): Promise<void> {
  // Skip CSRF for GET, HEAD, OPTIONS
  const method = request.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return;
  }
  
  const isValid = await validateCsrfToken(request);
  
  if (!isValid) {
    throw new Error('Invalid or missing CSRF token');
  }
}
