import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Simple password authentication endpoint
 * 
 * Checks if provided password matches APP_ACCESS_PASSWORD environment variable
 * If correct, sets a cookie for subsequent requests
 */
export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const accessPassword = process.env.APP_ACCESS_PASSWORD;

    // If no password is configured, allow access
    if (!accessPassword) {
      return NextResponse.json({ success: true });
    }

    // Check if password matches
    if (password === accessPassword) {
      const response = NextResponse.json({ success: true });
      
      // Set auth cookie (expires in 1 day)
      const cookieStore = await cookies();
      cookieStore.set('app-auth', password, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      return response;
    }

    // Password incorrect
    return NextResponse.json(
      { success: false, error: 'Incorrect password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

/**
 * Check if user is authenticated
 */
export async function GET() {
  const accessPassword = process.env.APP_ACCESS_PASSWORD;
  
  // If no password is configured, always return authenticated
  if (!accessPassword) {
    return NextResponse.json({ authenticated: true });
  }

  const cookieStore = await cookies();
  const authCookie = cookieStore.get('app-auth');

  const authenticated = authCookie?.value === accessPassword;
  
  return NextResponse.json({ authenticated });
}

