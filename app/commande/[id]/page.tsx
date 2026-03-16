'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type OrderView = {
  id: string;
  status: string;
  client: { nom: string; prenom: string; telephone: string };
  menuChoisi: Array<{ itemName: string; price: string; quantity?: number }>;
  createdAt: string;
  notifiedReadyAt?: string;
};

export default function CommandeStatusPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const token =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('token')
        : null;
    if (!token) {
      setError('Lien invalide (token manquant)');
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${id}?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Commande introuvable');
        return res.json();
      })
      .then(setOrder)
      .catch(() => setError('Commande introuvable'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Chargement…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-red-600">{error || 'Commande introuvable'}</p>
      </div>
    );
  }

  const statusLabel =
    order.status === 'ready'
      ? 'Votre commande est prête'
      : order.status === 'paid'
        ? 'Commande en cours de préparation'
        : 'En attente de paiement';

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-bold mb-2">Suivi de commande</h1>
        <p className="text-gray-600 mb-4">Numéro : <strong>{order.id}</strong></p>
        <p
          className={`mb-4 px-3 py-2 rounded-lg font-medium ${
            order.status === 'ready'
              ? 'bg-green-100 text-green-800'
              : order.status === 'paid'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusLabel}
        </p>
        <div className="text-sm text-gray-600 mb-2">
          {order.client.prenom} {order.client.nom} — {order.client.telephone}
        </div>
        <ul className="border-t pt-2 space-y-1">
          {order.menuChoisi.map((item, i) => (
            <li key={i}>
              {item.itemName} — {item.price}
              {item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ''}
            </li>
          ))}
        </ul>
        {order.notifiedReadyAt && (
          <p className="text-sm text-green-600 mt-3">
            Nous vous avons notifié que votre commande était prête.
          </p>
        )}
      </div>
    </div>
  );
}
