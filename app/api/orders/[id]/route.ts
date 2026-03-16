/**
 * GET /api/orders/[id] — Admin (cookie) : détail complet. Client (?token=xxx) : statut + recap (pas de données bancaires).
 * POST /api/orders/[id]/pay — Simule le paiement (status → paid).
 */

import { NextResponse } from 'next/server';
import { getOrderById, getOrderByClientToken, updateOrderStatus } from '@/lib/db/orders';
import { isAdmin } from '@/lib/auth/admin';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (isAdmin(request)) {
      const order = await getOrderById(id);
      if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
      return NextResponse.json(order);
    }

    if (token) {
      const order = await getOrderByClientToken(id, token);
      if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
      return NextResponse.json({
        id: order.id,
        status: order.status,
        client: order.client,
        menuChoisi: order.menuChoisi,
        createdAt: order.createdAt,
        notifiedReadyAt: order.notifiedReadyAt,
      });
    }

    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    if (order.status !== 'pending') return NextResponse.json({ error: 'Déjà payée' }, { status: 400 });

    const updated = await updateOrderStatus(id, 'paid');
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
