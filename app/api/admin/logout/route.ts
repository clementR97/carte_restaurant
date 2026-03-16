import { NextResponse } from 'next/server';
import { adminCookieName } from '@/lib/auth/admin';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(adminCookieName(), '', { maxAge: 0, path: '/' });
  return res;
}
