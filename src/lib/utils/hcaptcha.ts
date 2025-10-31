/**
 * Verify hCaptcha token server-side
 */
export async function verifyHCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  
  if (!secret) {
    console.error('HCAPTCHA_SECRET_KEY is not configured');
    return false;
  }

  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('hCaptcha verification error:', error);
    return false;
  }
}

/**
 * Middleware to require hCaptcha verification
 */
export async function requireHCaptcha(request: Request): Promise<void> {
  const body = await request.json();
  const token = body.hcaptchaToken;

  if (!token) {
    throw new Error('hCaptcha token is required');
  }

  const isValid = await verifyHCaptcha(token);

  if (!isValid) {
    throw new Error('Invalid hCaptcha verification');
  }
}
