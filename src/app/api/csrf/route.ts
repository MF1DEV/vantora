import { NextResponse } from 'next/server';
import { generateCsrfToken } from '@/lib/utils/csrf';

export async function GET() {
  try {
    const { token, signature } = await generateCsrfToken();
    
    // Return token to client, signature is already set as cookie
    const response = NextResponse.json({ token });
    
    // Set signature cookie
    response.cookies.set('vantora_csrf_token', signature, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });
    
    return response;
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
