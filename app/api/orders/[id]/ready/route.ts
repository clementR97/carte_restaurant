/**
 * PATCH /api/orders/[id]/ready — Admin : marquer la commande comme prête et enregistrer l'envoi du message.
 */

import { NextResponse } from 'next/server';
import { getOrderById, markOrderReady } from '@/lib/db/orders';
import { isAdmin } from '@/lib/auth/admin';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });

    const updated = await markOrderReady(id);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
