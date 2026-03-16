/**
 * API Commandes (MVC - View = réponse JSON)
 * POST /api/orders → créer une commande (client)
 * GET  /api/orders → lister les commandes (admin uniquement)
 */

import { NextResponse } from 'next/server';
import { createOrder, listOrders } from '@/lib/controllers/orderController';
import { isAdmin } from '@/lib/auth/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createOrder(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation échouée', details: result.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(result.order, { status: 201 });
  } catch (err) {
    console.error('POST /api/orders error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const orders = await listOrders();
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
