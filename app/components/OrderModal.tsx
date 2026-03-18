'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useOrderModal } from '@/app/context/OrderModalContext';
import { formatPrice } from '@/lib/utils/price';
import type { MenuConfig, MenuConfigCategory, MenuConfigItem } from '@/lib/types/menuConfig';

const MAX_SAUCES = 3;
/** Quantité max par plat pour une même commande (évite abus, laisse un autre client commander) */
const MAX_QUANTITY_PER_ITEM = 20;

type OrderType = 'emporter' | 'sur place';

type CartLine = {
  categoryId: string;
  categoryName: string;
  itemName: string;
  price: string;
  priceNumber: number;
  quantity: number;
};

type LineOptions = {
  type: 'seul' | 'cannette';
  sauces: string[];
  drink: string;
  supplements: string[];
};

const defaultLineOptions: LineOptions = {
  type: 'seul',
  sauces: [],
  drink: '',
  supplements: [],
};

function OrderModal() {
  const { isOpen, closeOrderModal } = useOrderModal();
  const [menuConfig, setMenuConfig] = useState<MenuConfig | null>(null);
  const [step, setStep] = useState(0);
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [optionsByIndex, setOptionsByIndex] = useState<Record<number, Partial<LineOptions>>>({});
  const [formData, setFormData] = useState({ nom: '', prenom: '', telephone: '' });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/config/menu')
        .then((res) => res.json())
        .then((data) => setMenuConfig(data))
        .catch(() => setMenuConfig(null));
    }
  }, [isOpen]);

  const resetModal = useCallback(() => {
    setStep(0);
    setOrderType(null);
    setCart([]);
    setOptionsByIndex({});
    setFormData({ nom: '', prenom: '', telephone: '' });
    setOrderId(null);
    setClientToken(null);
  }, []);

  const handleClose = useCallback(() => {
    resetModal();
    closeOrderModal();
  }, [closeOrderModal, resetModal]);

  const getQuantity = (categoryId: string, itemName: string) => {
    const line = cart.find((l) => l.itemName === itemName && l.categoryId === categoryId);
    return line?.quantity ?? 0;
  };

  const addToCart = (category: MenuConfigCategory, item: MenuConfigItem) => {
    const currentQty = cart.find((l) => l.itemName === item.name && l.categoryId === category.id)?.quantity ?? 0;
    if (currentQty >= MAX_QUANTITY_PER_ITEM) return;
    const priceStr = formatPrice(item.price);
    setCart((prev) => {
      const i = prev.findIndex((l) => l.itemName === item.name && l.categoryId === category.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: Math.min(next[i].quantity + 1, MAX_QUANTITY_PER_ITEM) };
        return next;
      }
      return [...prev, { categoryId: category.id, categoryName: category.name, itemName: item.name, price: priceStr, priceNumber: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (categoryId: string, itemName: string) => {
    setCart((prev) => {
      const i = prev.findIndex((l) => l.itemName === itemName && l.categoryId === categoryId);
      if (i < 0) return prev;
      const next = [...prev];
      if (next[i].quantity <= 1) return next.filter((_, j) => j !== i);
      next[i] = { ...next[i], quantity: next[i].quantity - 1 };
      return next;
    });
  };

  const setOption = (lineIndex: number, field: keyof LineOptions, value: string | string[]) => {
    setOptionsByIndex((prev) => ({
      ...prev,
      [lineIndex]: { ...defaultLineOptions, ...prev[lineIndex], [field]: value },
    }));
  };

  /** Une ligne par unité (chaque bokit a ses propres options) */
  const expandedCart = useMemo(
    () =>
      cart.flatMap((line) =>
        Array.from({ length: line.quantity }, () => ({
          ...line,
          quantity: 1,
        }))
      ),
    [cart]
  );

  // Si le panier change (ajout/suppression), on repart sur des options vides.
  // Cela évite des décalages d'index entre `expandedCart` et `optionsByIndex`.
  useEffect(() => {
    setOptionsByIndex({});
  }, [cart]);

  /** Prix par ligne (base + cannette + suppléments) et total */
  const { lineTotals, totalAmount } = useMemo(() => {
    if (!menuConfig) return { lineTotals: [] as number[], totalAmount: 0 };
    const totals: number[] = expandedCart.map((line, i) => {
      const opt = optionsByIndex[i] ?? {};
      let sum = line.priceNumber;
      const isDessert = line.categoryId === 'dessert';
      if (opt.type === 'cannette' && opt.drink) {
        const drinkPrice = menuConfig.drinks.find((d) => d.name === opt.drink)?.price ?? 0;
        sum += drinkPrice;
      }
      // Les desserts n'ont ni sauce (pas d'impact prix ici) ni suppléments.
      if (!isDessert) {
        (opt.supplements ?? []).forEach((name) => {
          sum += menuConfig.supplements.find((s) => s.name === name)?.price ?? 0;
        });
      }
      return sum;
    });
    return { lineTotals: totals, totalAmount: totals.reduce((a, b) => a + b, 0) };
  }, [menuConfig, expandedCart, optionsByIndex]);

  const canGoStep2 = cart.length > 0;
  /** Type, sauces et suppléments sont optionnels : on peut passer sans rien modifier */
  const canGoStep3 = expandedCart.every((line, i) => {
    if (line.categoryId === 'dessert') return true;
    const opt = optionsByIndex[i] ?? {};
    return (opt.sauces?.length ?? 0) <= MAX_SAUCES;
  });

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    try {
      const menuChoisi = expandedCart.map((line, index) => {
        const opt = optionsByIndex[index] ?? {};
        const isDessert = line.categoryId === 'dessert';
        return {
          categoryId: line.categoryId,
          categoryName: line.categoryName,
          itemName: line.itemName,
          price: line.price,
          quantity: 1,
          typeChoice: (opt.type as 'seul' | 'cannette') ?? 'seul',
          sauces: isDessert ? [] : (opt.sauces ?? []),
          drink: opt.drink ?? '',
          supplements: isDessert ? [] : (opt.supplements ?? []),
        };
      });
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: {
            nom: formData.nom,
            prenom: formData.prenom,
            telephone: formData.telephone,
            modePaiement: 'carte',
          },
          menuChoisi,
          orderType: orderType ?? 'emporter',
          totalAmount: Math.round(totalAmount * 100) / 100,
        }),
      });
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { error?: string; details?: string[] };
        const message = errData.details?.length
          ? `${errData.error ?? 'Erreur'}: ${errData.details.join(', ')}`
          : errData.error ?? 'Erreur lors de l\'envoi de la commande.';
        throw new Error(message);
      }
      const data = (await res.json()) as { id: string; clientToken?: string };
      setOrderId(data.id);
      setClientToken(data.clientToken ?? null);
      setStep(4);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur lors de l\'envoi de la commande.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-h-[90vh] w-full max-w-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-bold">Commander</h2>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleClose} className="text-sm text-gray-500 hover:text-gray-800 underline" aria-label="Annuler">
              Annuler
            </button>
            <button type="button" onClick={handleClose} className="text-2xl leading-none text-gray-500 hover:text-black" aria-label="Fermer">×</button>
          </div>
        </div>

        <div className="p-6">
          {/* Step 0: Emporter / Sur place */}
          {step === 0 && (
            <>
              <p className="text-gray-600 mb-2">Choisissez votre mode de consommation</p>
              <p className="text-xs text-gray-400 mb-4">Vous pouvez fermer à tout moment pour laisser un autre client commander.</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => { setOrderType('emporter'); setStep(1); }}
                  className="py-4 px-6 rounded-xl border-2 border-sky-500 text-sky-600 font-semibold hover:bg-sky-50"
                >
                  Emporter
                </button>
                <button
                  type="button"
                  onClick={() => { setOrderType('sur place'); setStep(1); }}
                  className="py-4 px-6 rounded-xl border-2 border-sky-500 text-sky-600 font-semibold hover:bg-sky-50"
                >
                  Sur place
                </button>
              </div>
            </>
          )}

          {/* Step 1: Tous les menus (Bokit, Agoulou, Sandwiches, Desserts) avec +/- */}
          {step === 1 && (
            <>
              {!menuConfig ? (
                <p className="text-gray-500">Chargement du menu…</p>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">Choisissez vos articles</p>
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {menuConfig.categories.map((cat) => (
                      <div key={cat.id} className="bg-white border rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="font-bold text-lg text-gray-900">{cat.name}</div>
                            {cat.description && (
                              <div className="text-xs text-gray-500 mt-1">{cat.description}</div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {cat.items.map((item) => {
                            const qty = getQuantity(cat.id, item.name);
                            return (
                              <div
                                key={item.name}
                                className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 truncate">{item.name}</div>
                                  <div className="text-sm text-gray-600">{formatPrice(item.price)}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(cat.id, item.name)}
                                    disabled={qty <= 0}
                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    −
                                  </button>
                                  <span className="w-8 text-center font-medium">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={() => addToCart(cat, item)}
                                    disabled={qty >= MAX_QUANTITY_PER_ITEM}
                                    className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canGoStep2}
                    className="mt-6 w-full py-3 bg-sky-500 text-white font-medium rounded-xl disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </>
              )}
            </>
          )}

          {/* Step 2: Liste + Seul/Cannette, sauces (max 3), boisson, suppléments — une ligne par unité */}
          {step === 2 && !menuConfig && <p className="text-gray-500">Chargement du menu…</p>}
          {step === 2 && menuConfig && (
            <>
              <p className="text-gray-600 mb-4">Options pour chaque article (chaque unité a ses propres options)</p>
              <div className="space-y-6">
                {expandedCart.map((line, idx) => (
                  <div key={idx} className="border rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <p className="font-bold">{line.itemName} <span className="text-gray-500 font-normal">(article {idx + 1})</span></p>
                      <span className="font-semibold text-sky-600">{formatPrice(lineTotals[idx] ?? 0)}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setOption(idx, 'type', 'seul')}
                          className={`px-3 py-1.5 rounded-lg text-sm ${(optionsByIndex[idx]?.type ?? 'seul') === 'seul' ? 'bg-sky-500 text-white' : 'bg-gray-100'}`}
                        >
                          Seul
                        </button>
                        <button
                          type="button"
                          onClick={() => setOption(idx, 'type', 'cannette')}
                          className={`px-3 py-1.5 rounded-lg text-sm ${optionsByIndex[idx]?.type === 'cannette' ? 'bg-sky-500 text-white' : 'bg-gray-100'}`}
                        >
                          Avec cannette (+ {formatPrice(menuConfig.drinks[0]?.price ?? 0)})
                        </button>
                      </div>
                    </div>
                    <div>
                      {line.categoryId !== 'dessert' ? (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sauces (max {MAX_SAUCES})</label>
                          <div className="flex flex-wrap gap-2">
                            {menuConfig.sauces.map((s) => {
                              const list = optionsByIndex[idx]?.sauces ?? [];
                              const checked = list.includes(s);
                              const atMax = list.length >= MAX_SAUCES;
                              return (
                                <label
                                  key={s}
                                  className={`flex items-center gap-1 ${!checked && atMax ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={!checked && atMax}
                                    onChange={() => {
                                      const next = checked
                                        ? list.filter((x) => x !== s)
                                        : list.length < MAX_SAUCES
                                          ? [...list, s]
                                          : list;
                                      setOption(idx, 'sauces', next);
                                    }}
                                  />
                                  <span className="text-sm">{s}</span>
                                </label>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">Dessert : pas de sauce</p>
                      )}
                    </div>
                    {(optionsByIndex[idx]?.type === 'cannette') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Boisson</label>
                        <select
                          value={optionsByIndex[idx]?.drink ?? ''}
                          onChange={(e) => setOption(idx, 'drink', e.target.value)}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="">Choisir</option>
                          {menuConfig.drinks.map((b) => (
                            <option key={b.name} value={b.name}>{b.name} — {formatPrice(b.price)}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      {line.categoryId !== 'dessert' ? (
                        <>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Suppléments</label>
                          <div className="flex flex-wrap gap-2">
                            {menuConfig.supplements.map((s) => {
                              const list = optionsByIndex[idx]?.supplements ?? [];
                              const checked = list.includes(s.name);
                              return (
                                <label key={s.name} className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      const next = checked ? list.filter((x) => x !== s.name) : [...list, s.name];
                                      setOption(idx, 'supplements', next);
                                    }}
                                  />
                                  <span className="text-sm">{s.name} (+ {formatPrice(s.price)})</span>
                                </label>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500 mt-1">Dessert : pas de suppléments</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 py-2 border-t flex justify-end">
                <span className="font-semibold">Total : {formatPrice(totalAmount)}</span>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border rounded-xl font-medium">Retour</button>
                <button type="button" onClick={() => setStep(3)} disabled={!canGoStep3} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl disabled:opacity-50">Suivant</button>
              </div>
            </>
          )}

          {/* Step 3: Formulaire + Stripe placeholder */}
          {step === 3 && (
            <>
              <p className="text-gray-600 mb-4">Vos informations et paiement</p>
              <div className="mb-4 p-4 bg-sky-50 rounded-xl border border-sky-200">
                <p className="text-right font-bold text-lg text-sky-800">Total à payer : {formatPrice(totalAmount)}</p>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nom"
                  value={formData.nom}
                  onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Prénom"
                  value={formData.prenom}
                  onChange={(e) => setFormData((p) => ({ ...p, prenom: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <input
                  type="tel"
                  placeholder="Numéro de téléphone"
                  value={formData.telephone}
                  onChange={(e) => setFormData((p) => ({ ...p, telephone: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <div className="border rounded-lg p-4 bg-gray-50 text-center text-gray-600">
                  Paiement par Stripe (à configurer)
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 border rounded-xl font-medium">Retour</button>
                <button type="button" onClick={handleSubmitOrder} disabled={submitting || !formData.nom || !formData.prenom || !formData.telephone} className="flex-1 py-3 bg-sky-500 text-white font-medium rounded-xl disabled:opacity-50">
                  {submitting ? 'Envoi…' : 'Confirmer la commande'}
                </button>
              </div>
            </>
          )}

          {/* Step 4: Notification + numéro de commande */}
          {step === 4 && orderId && (
            <>
              <div className="text-center py-4">
                <p className="text-lg font-semibold text-green-600 mb-2">Commande en cours</p>
                <p className="text-gray-600 mb-1">Votre commande a bien été enregistrée.</p>
                <p className="text-xl font-bold mt-4">Numéro de commande : {orderId}</p>
                {clientToken && (
                  <a
                    href={`/commande/${orderId}?token=${encodeURIComponent(clientToken)}`}
                    className="inline-block mt-3 text-sky-600 font-medium hover:underline"
                  >
                    Suivre ma commande →
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-4">Fermez pour qu'un autre client puisse commander.</p>
              </div>
              <button type="button" onClick={handleClose} className="w-full mt-4 py-3 bg-sky-500 text-white font-medium rounded-xl">Fermer</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderModal;
