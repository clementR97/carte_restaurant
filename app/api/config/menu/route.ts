/**
 * GET  /api/config/menu → configuration menu (catégories, boissons, suppléments, sauces)
 * PATCH /api/config/menu → modifier la config (admin uniquement)
 */

import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth/admin';
import { getMenuConfig, updateMenuConfig } from '@/lib/db/menuConfig';

export async function GET() {
  try {
    const config = await getMenuConfig();
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

function isValidConfig(body: unknown): body is { categories: unknown[]; drinks: unknown[]; supplements: unknown[]; sauces: unknown[] } {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return Array.isArray(b.categories) && Array.isArray(b.drinks) && Array.isArray(b.supplements) && Array.isArray(b.sauces);
}

export async function PATCH(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (!isValidConfig(body)) {
      return NextResponse.json({ error: 'Format config invalide' }, { status: 400 });
    }
    const config = await updateMenuConfig(body as Parameters<typeof updateMenuConfig>[0]);
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
