# CSRF Protection & hCaptcha Setup Guide

This guide explains how to set up and use the CSRF protection and hCaptcha bot protection features.

## CSRF Protection

### What is CSRF Protection?

Cross-Site Request Forgery (CSRF) protection prevents attackers from making unauthorized requests on behalf of authenticated users. Our implementation uses token-based validation for all state-changing operations (POST, PUT, DELETE).

### How It Works

1. **Token Generation**: When a user loads a page with forms, a CSRF token is fetched from `/api/csrf`
2. **Token Storage**: The token signature is stored in an HttpOnly cookie (`vantora_csrf_token`)
3. **Token Transmission**: The token itself is sent in the `x-csrf-token` header with API requests
4. **Token Validation**: Server validates the token matches the signature before processing the request

### Implementation Details

**Client-Side (React Hook):**
```typescript
import { useCsrf } from '@/hooks/useCsrf';

function MyComponent() {
  const { csrfToken, getCsrfHeaders } = useCsrf();
  
  const handleSubmit = async () => {
    const response = await fetch('/api/some-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getCsrfHeaders(), // Adds x-csrf-token header
      },
      body: JSON.stringify(data),
    });
  };
}
```

**Server-Side (API Route):**
```typescript
import { requireCsrfToken } from '@/lib/utils/csrf';

export async function POST(request: Request) {
  try {
    // Validate CSRF token (automatically skips GET, HEAD, OPTIONS)
    await requireCsrfToken(request);
    
    // Your API logic here...
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
}
```

### Security Features

- **Timing-Safe Comparison**: Uses `crypto.timingSafeEqual()` to prevent timing attacks
- **HMAC Signature**: Tokens are signed with HMAC-SHA256 for integrity
- **HttpOnly Cookies**: Signature stored in HttpOnly cookie to prevent XSS attacks
- **Automatic Method Filtering**: GET, HEAD, OPTIONS requests bypass validation
- **7-Day Secret Rotation**: CSRF secret expires after 7 days

## hCaptcha Bot Protection

### What is hCaptcha?

hCaptcha is a bot protection service that prevents automated abuse of your authentication endpoints. It's privacy-focused and more developer-friendly than alternatives.

### Setup Instructions

1. **Create hCaptcha Account**:
   - Go to [https://www.hcaptcha.com/](https://www.hcaptcha.com/)
   - Sign up for a free account
   - Create a new site

2. **Get API Keys**:
   - After creating a site, you'll receive:
     - **Site Key**: Used in the frontend (public)
     - **Secret Key**: Used for server-side verification (private)

3. **Add to Environment Variables**:
   ```bash
   # .env.local
   NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_site_key_here
   HCAPTCHA_SECRET_KEY=your_secret_key_here
   ```

4. **Test Mode** (optional for development):
   - The default site key `10000000-ffff-ffff-ffff-000000000001` always passes
   - Use this for local testing without setting up hCaptcha

### How It Works

1. **Frontend Integration**: hCaptcha widget renders on login/register pages
2. **User Completes Challenge**: User solves the captcha (or passes automatically if trusted)
3. **Token Generation**: hCaptcha generates a one-time verification token
4. **Server Verification**: Backend verifies the token with hCaptcha API
5. **Request Processing**: If valid, the authentication proceeds

### Implementation Details

**Frontend (Login/Register Pages):**
```typescript
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useRef, useState } from 'react';

function LoginPage() {
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      <HCaptcha
        ref={captchaRef}
        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001'}
        onVerify={(token) => setCaptchaToken(token)}
        onExpire={() => setCaptchaToken(null)}
        theme="dark"
      />
      
      <button type="submit" disabled={!captchaToken}>
        Login
      </button>
    </form>
  );
}
```

**Backend (API Routes):**
```typescript
import { verifyHCaptcha } from '@/lib/utils/hcaptcha';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Verify hCaptcha token
  if (!body.hcaptchaToken) {
    return NextResponse.json(
      { error: 'Captcha verification is required' },
      { status: 400 }
    );
  }
  
  const isValid = await verifyHCaptcha(body.hcaptchaToken);
  
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid captcha verification' },
      { status: 400 }
    );
  }
  
  // Continue with authentication...
}
```

### Protected Endpoints

The following endpoints now require hCaptcha verification:

- **Registration** (`/api/auth/register`): Required - prevents automated bot signups
- **Login** (`/api/auth/login`): Optional - only validates if token is present

### Security Features

- **One-Time Tokens**: Each captcha token can only be used once
- **Server-Side Verification**: Token validation happens on the server, not client
- **Dark Theme**: Integrated with our dark UI design
- **Automatic Reset**: Captcha resets on form submission errors
- **Accessibility**: hCaptcha provides accessible alternatives for users with disabilities

## Testing

### CSRF Protection Testing

1. **Valid Request**:
   ```bash
   # Get CSRF token
   curl http://localhost:3000/api/csrf -c cookies.txt
   
   # Use token in request
   curl -X POST http://localhost:3000/api/auth/login \
     -b cookies.txt \
     -H "Content-Type: application/json" \
     -H "x-csrf-token: YOUR_TOKEN" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

2. **Invalid Request** (should return 403):
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

### hCaptcha Testing

1. **Test Mode**: Use site key `10000000-ffff-ffff-ffff-000000000001` (always passes)
2. **Production**: Use your real hCaptcha keys
3. **Manual Testing**: Try to register/login without completing captcha (should fail)

## Troubleshooting

### CSRF Issues

**Problem**: "Invalid CSRF token" error
- **Solution**: Make sure cookies are enabled
- **Solution**: Check that `x-csrf-token` header is being sent
- **Solution**: Verify the CSRF secret cookie is present

**Problem**: CSRF token not being generated
- **Solution**: Check `useCsrf()` hook is being called
- **Solution**: Verify `/api/csrf` endpoint is accessible

### hCaptcha Issues

**Problem**: Captcha not loading
- **Solution**: Check `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` is set
- **Solution**: Verify network connection (hCaptcha CDN accessible)
- **Solution**: Check browser console for errors

**Problem**: Server verification failing
- **Solution**: Verify `HCAPTCHA_SECRET_KEY` is set correctly
- **Solution**: Check that token is being sent in request body as `hcaptchaToken`
- **Solution**: Ensure token hasn't expired (valid for 2 minutes)

**Problem**: "Captcha verification is required" error
- **Solution**: User must complete the captcha before submitting
- **Solution**: Check that `captchaToken` state is being set on verify

## Performance Considerations

- **CSRF Tokens**: Cached for 1 hour, minimal overhead
- **hCaptcha**: Loads asynchronously, doesn't block page render
- **Rate Limiting**: Works in conjunction with existing rate limits

## Security Best Practices

1. **Never expose secret keys**: Keep `HCAPTCHA_SECRET_KEY` server-side only
2. **Use HTTPS in production**: CSRF protection requires secure cookies
3. **Monitor audit logs**: Track failed verification attempts
4. **Rotate secrets regularly**: Update hCaptcha keys periodically
5. **Test thoroughly**: Verify both valid and invalid scenarios

## Additional Resources

- [hCaptcha Documentation](https://docs.hcaptcha.com/)
- [CSRF Protection Explained](https://owasp.org/www-community/attacks/csrf)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
