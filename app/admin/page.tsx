'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils/price';
import type { MenuConfig } from '@/lib/types/menuConfig';

type OrderItem = {
  itemName: string;
  price: string;
  quantity?: number;
  typeChoice?: 'seul' | 'cannette';
  sauces?: string[];
  drink?: string;
  supplements?: string[];
};

type Order = {
  id: string;
  client: { nom: string; prenom: string; telephone: string };
  menuChoisi: OrderItem[];
  status: string;
  orderType?: 'emporter' | 'sur place';
  totalAmount?: number;
  createdAt: string;
  notifiedReadyAt?: string;
};

type Tab = 'commandes' | 'config';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('commandes');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [config, setConfig] = useState<MenuConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    fetch('/api/orders', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login');
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        else setError('Erreur chargement');
      })
      .catch(() => setError('Erreur réseau'))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (tab === 'config') {
      setConfigLoading(true);
      setConfigError('');
      fetch('/api/config/menu', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => setConfig(data))
        .catch(() => setConfigError('Erreur chargement config'))
        .finally(() => setConfigLoading(false));
    }
  }, [tab]);

  async function markReady(id: string) {
    try {
      const res = await fetch(`/api/orders/${id}/ready`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!res.ok) return;
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch {
      // ignore
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    router.push('/admin/login');
    router.refresh();
  }

  function handleSaveConfig() {
    if (!config) return;
    setConfigSaving(true);
    setConfigError('');
    fetch('/api/config/menu', {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        if (!res.ok) throw new Error('Erreur enregistrement');
        return res.json();
      })
      .then(() => setConfigError(''))
      .catch(() => setConfigError('Erreur lors de l\'enregistrement'))
      .finally(() => setConfigSaving(false));
  }

  const dailyTotal = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Chargement…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Déconnexion
          </button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            type="button"
            onClick={() => setTab('commandes')}
            className={`px-4 py-2 font-medium rounded-t-lg ${tab === 'commandes' ? 'bg-white border border-b-0 border-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Commandes
          </button>
          <button
            type="button"
            onClick={() => setTab('config')}
            className={`px-4 py-2 font-medium rounded-t-lg ${tab === 'config' ? 'bg-white border border-b-0 border-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Configurations
          </button>
        </div>

        {tab === 'commandes' && (
          <>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <p className="text-gray-600 mb-2">
              Nom, prénom, téléphone et menu à préparer. Aucune donnée bancaire.
            </p>
            {orders.length > 0 && (
              <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
                <p className="text-lg font-bold text-gray-800">
                  Total du jour : {formatPrice(dailyTotal)}
                </p>
              </div>
            )}
            <div className="space-y-4">
              {orders.length === 0 ? (
                <p className="text-gray-500">Aucune commande.</p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow p-4 border border-gray-200"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div>
                        <span className="font-bold text-lg">#{order.id}</span>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded text-sm ${
                            order.status === 'ready'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status === 'ready' ? 'Prête' : 'En cours de préparation'}
                        </span>
                        {order.totalAmount != null && (
                          <span className="ml-2 font-semibold text-sky-700">
                            Total : {formatPrice(order.totalAmount)}
                          </span>
                        )}
                      </div>
                      {order.status === 'paid' && (
                        <button
                          type="button"
                          onClick={() => markReady(order.id)}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                        >
                          Marquer prête (message envoyé)
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Client : </span>
                        {order.client.prenom} {order.client.nom}
                      </div>
                      <div>
                        <span className="text-gray-500">Tél : </span>
                        {order.client.telephone}
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-gray-500">Consommation : </span>
                        <span className="font-semibold">
                          {order.orderType === 'sur place' ? 'Sur place' : 'À emporter'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="text-gray-600 font-bold text-base mb-2">Menu à préparer</div>
                      <ul className="list-disc list-inside space-y-2">
                        {order.menuChoisi.map((item, i) => (
                          <li key={i} className="text-base">
                            <div className="font-semibold text-lg text-gray-900">
                              {item.itemName} — {item.price}
                              {item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ''}
                            </div>
                            <div className="text-sm text-gray-600 mt-0.5 ml-4">
                              {item.typeChoice && (
                                <span>
                                  <span className="font-bold">Type</span> : {item.typeChoice === 'cannette' ? 'Avec boisson' : 'Seul'}
                                </span>
                              )}
                              {item.drink && (
                                <span>
                                  {item.typeChoice ? ' · ' : ''}<span className="font-bold">Boisson</span> : {item.drink}
                                </span>
                              )}
                              {item.sauces && item.sauces.length > 0 && (
                                <span> · <span className="font-bold">Sauce</span> : {item.sauces.join(', ')}</span>
                              )}
                              {item.supplements && item.supplements.length > 0 && (
                                <span> · <span className="font-bold">Supplément</span> : {item.supplements.join(', ')}</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {order.notifiedReadyAt && (
                      <p className="text-xs text-green-600 mt-2">
                        Message « commande prête » enregistré le{' '}
                        {new Date(order.notifiedReadyAt).toLocaleString('fr-FR')}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {tab === 'config' && (
          <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
            {configError && <p className="text-red-600 mb-4">{configError}</p>}
            {configLoading ? (
              <p className="text-gray-500">Chargement de la configuration…</p>
            ) : config ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold mb-3">Menus (catégories et plats)</h2>
                  {config.categories.map((cat, ci) => (
                    <div key={cat.id} className="mb-6 p-4 border rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        <input
                          className="border rounded px-2 py-1"
                          value={cat.name}
                          onChange={(e) => {
                            const next = { ...config };
                            next.categories[ci] = { ...cat, name: e.target.value };
                            setConfig(next);
                          }}
                          placeholder="Nom catégorie"
                        />
                        <input
                          className="border rounded px-2 py-1"
                          value={cat.description}
                          onChange={(e) => {
                            const next = { ...config };
                            next.categories[ci] = { ...cat, description: e.target.value };
                            setConfig(next);
                          }}
                          placeholder="Description"
                        />
                      </div>
                      <ul className="space-y-2">
                        {cat.items.map((item, ii) => (
                          <li key={ii} className="flex flex-wrap gap-2 items-center border-b pb-2">
                            <input
                              className="border rounded px-2 py-1 w-48"
                              value={item.name}
                              onChange={(e) => {
                                const next = { ...config };
                                next.categories[ci].items[ii] = { ...item, name: e.target.value };
                                setConfig(next);
                              }}
                              placeholder="Nom plat"
                            />
                            <input
                              type="number"
                              step="0.01"
                              className="border rounded px-2 py-1 w-20"
                              value={item.price}
                              onChange={(e) => {
                                const next = { ...config };
                                next.categories[ci].items[ii] = { ...item, price: parseFloat(e.target.value) || 0 };
                                setConfig(next);
                              }}
                              placeholder="Prix"
                            />
                            <input
                              className="border rounded px-2 py-1 flex-1 min-w-[200px]"
                              value={item.contents}
                              onChange={(e) => {
                                const next = { ...config };
                                next.categories[ci].items[ii] = { ...item, contents: e.target.value };
                                setConfig(next);
                              }}
                              placeholder="Description"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = {
                                  ...config,
                                  categories: config.categories.map((c, i) =>
                                    i === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c
                                  ),
                                };
                                setConfig(next);
                              }}
                              className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                              title="Supprimer ce plat"
                            >
                              Supprimer
                            </button>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => {
                          const next = {
                            ...config,
                            categories: config.categories.map((c, i) =>
                              i === ci ? { ...c, items: [...c.items, { name: '', price: 0, contents: '' }] } : c
                            ),
                          };
                          setConfig(next);
                        }}
                        className="mt-2 px-3 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                      >
                        + Ajouter un plat dans {cat.name}
                      </button>
                    </div>
                  ))}
                </div>

                <div>
                  <h2 className="text-lg font-bold mb-3">Boissons (prix cannette)</h2>
                  <ul className="space-y-2">
                    {config.drinks.map((d, i) => (
                      <li key={i} className="flex flex-wrap gap-2 items-center">
                        <input
                          className="border rounded px-2 py-1 w-40"
                          value={d.name}
                          onChange={(e) => {
                            const next = { ...config };
                            next.drinks[i] = { ...d, name: e.target.value };
                            setConfig(next);
                          }}
                        />
                        <input
                          type="number"
                          step="0.01"
                          className="border rounded px-2 py-1 w-24"
                          value={d.price}
                          onChange={(e) => {
                            const next = { ...config };
                            next.drinks[i] = { ...d, price: parseFloat(e.target.value) || 0 };
                            setConfig(next);
                          }}
                        />
                        <span className="text-gray-500">€</span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = { ...config, drinks: config.drinks.filter((_, j) => j !== i) };
                            setConfig(next);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                          title="Supprimer cette boisson"
                        >
                          Supprimer
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...config, drinks: [...config.drinks, { name: '', price: 0 }] };
                      setConfig(next);
                    }}
                    className="mt-2 px-3 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                  >
                    + Ajouter une boisson
                  </button>
                </div>

                <div>
                  <h2 className="text-lg font-bold mb-3">Suppléments (prix unitaire)</h2>
                  <ul className="space-y-2">
                    {config.supplements.map((s, i) => (
                      <li key={i} className="flex flex-wrap gap-2 items-center">
                        <input
                          className="border rounded px-2 py-1 w-40"
                          value={s.name}
                          onChange={(e) => {
                            const next = { ...config };
                            next.supplements[i] = { ...s, name: e.target.value };
                            setConfig(next);
                          }}
                        />
                        <input
                          type="number"
                          step="0.01"
                          className="border rounded px-2 py-1 w-24"
                          value={s.price}
                          onChange={(e) => {
                            const next = { ...config };
                            next.supplements[i] = { ...s, price: parseFloat(e.target.value) || 0 };
                            setConfig(next);
                          }}
                        />
                        <span className="text-gray-500">€</span>
                        <button
                          type="button"
                          onClick={() => {
                            const next = { ...config, supplements: config.supplements.filter((_, j) => j !== i) };
                            setConfig(next);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                          title="Supprimer ce supplément"
                        >
                          Supprimer
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...config, supplements: [...config.supplements, { name: '', price: 0 }] };
                      setConfig(next);
                    }}
                    className="mt-2 px-3 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                  >
                    + Ajouter un supplément
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={configSaving}
                  className="px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 disabled:opacity-50"
                >
                  {configSaving ? 'Enregistrement…' : 'Enregistrer la configuration'}
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Aucune configuration.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
