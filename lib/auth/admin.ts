/**
 * Vérification admin (cookie)
 * À configurer : ADMIN_SECRET dans .env (ex: openssl rand -hex 32)
 */

const ADMIN_COOKIE = 'admin_token';

export function getAdminToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${ADMIN_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function isAdmin(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  return getAdminToken(request) === secret;
}

export function adminCookieName(): string {
  return ADMIN_COOKIE;
}
