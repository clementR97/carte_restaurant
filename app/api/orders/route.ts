/**
 * API Commandes (MVC - View = réponse JSON)
 * POST /api/orders → créer une commande
 * GET  /api/orders → lister les commandes
 */

import { NextResponse } from 'next/server';
import { createOrder, listOrders } from '@/lib/controllers/orderController';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createOrder(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation échouée', details: result.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(result.order, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Requête invalide' },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const orders = listOrders();
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
