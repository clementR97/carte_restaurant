'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ORDER_CATEGORIES,
  SAUCES,
  BOISSONS,
  SUPPLEMENTS,
  type CategoryData,
  type MenuItemData,
} from '@/lib/data/menuData';
import { useOrderModal } from '@/app/context/OrderModalContext';

const MAX_SAUCES = 3;

type OrderType = 'emporter' | 'sur place';

type CartLine = {
  categoryId: string;
  categoryName: string;
  itemName: string;
  price: string;
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
  const [step, setStep] = useState(0);
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [optionsByIndex, setOptionsByIndex] = useState<Record<number, Partial<LineOptions>>>({});
  const [formData, setFormData] = useState({ nom: '', prenom: '', telephone: '' });
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetModal = useCallback(() => {
    setStep(0);
    setOrderType(null);
    setSelectedCategory(null);
    setCart([]);
    setOptionsByIndex({});
    setFormData({ nom: '', prenom: '', telephone: '' });
    setOrderId(null);
  }, []);

  const handleClose = useCallback(() => {
    resetModal();
    closeOrderModal();
  }, [closeOrderModal, resetModal]);

  const getQuantity = (item: MenuItemData) => {
    const line = cart.find((l) => l.itemName === item.name && l.categoryId === selectedCategory?.id);
    return line?.quantity ?? 0;
  };

  const addToCart = (item: MenuItemData) => {
    if (!selectedCategory) return;
    setCart((prev) => {
      const i = prev.findIndex((l) => l.itemName === item.name && l.categoryId === selectedCategory.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + 1 };
        return next;
      }
      return [...prev, { categoryId: selectedCategory.id, categoryName: selectedCategory.name, itemName: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (item: MenuItemData) => {
    if (!selectedCategory) return;
    setCart((prev) => {
      const i = prev.findIndex((l) => l.itemName === item.name && l.categoryId === selectedCategory.id);
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

  const canGoStep2 = cart.length > 0;
  const canGoStep3 = expandedCart.every((_, i) => {
    const opt = optionsByIndex[i] ?? {};
    const saucesOk = (opt.sauces?.length ?? 0) <= MAX_SAUCES;
    const typeOk = opt.type === 'seul' || (opt.type === 'cannette' && opt.drink);
    return saucesOk && typeOk;
  });

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    try {
      const menuChoisi = expandedCart.map((line) => ({
        categoryId: line.categoryId,
        categoryName: line.categoryName,
        itemName: line.itemName,
        price: line.price,
        quantity: 1,
      }));
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
        }),
      });
      if (!res.ok) throw new Error('Erreur envoi');
      const data = (await res.json()) as { id: string };
      setOrderId(data.id);
      setStep(4);
    } catch {
      alert('Erreur lors de l\'envoi de la commande.');
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
          <button type="button" onClick={handleClose} className="text-2xl leading-none text-gray-500 hover:text-black" aria-label="Fermer">×</button>
        </div>

        <div className="p-6">
          {/* Step 0: Emporter / Sur place */}
          {step === 0 && (
            <>
              <p className="text-gray-600 mb-4">Choisissez votre mode de consommation</p>
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

          {/* Step 1: Catégories puis menu avec +/- */}
          {step === 1 && (
            <>
              {!selectedCategory ? (
                <>
                  <p className="text-gray-600 mb-4">Choisissez une catégorie</p>
                  <div className="grid grid-cols-2 gap-3">
                    {ORDER_CATEGORIES.map((category, index) => {
                      const cat = ORDER_CATEGORIES[index];
                      if (!cat) return null;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCart([]);
                            setSelectedCategory(cat);
                          }}
                          className="py-3 px-4 rounded-xl bg-orange-50 border border-orange-200 font-medium text-gray-800 hover:bg-orange-100"
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <button type="button" onClick={() => setSelectedCategory(null)} className="text-sky-600 font-medium">← Retour</button>
                    <span className="font-bold">{selectedCategory.name}</span>
                  </div>
                  <div className="space-y-3">
                    {selectedCategory.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between py-2 border-b">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-600 ml-2">{item.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => removeFromCart(item)} className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">−</button>
                          <span className="w-8 text-center font-medium">{getQuantity(item)}</span>
                          <button type="button" onClick={() => addToCart(item)} className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold">+</button>
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
          {step === 2 && (
            <>
              <p className="text-gray-600 mb-4">Options pour chaque article (chaque unité a ses propres options)</p>
              <div className="space-y-6">
                {expandedCart.map((line, idx) => (
                  <div key={idx} className="border rounded-xl p-4 space-y-3">
                    <p className="font-bold">{line.itemName} <span className="text-gray-500 font-normal">(article {idx + 1})</span></p>
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
                          Avec cannette
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sauces (max {MAX_SAUCES})</label>
                      <div className="flex flex-wrap gap-2">
                        {SAUCES.map((s) => {
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
                          {BOISSONS.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Suppléments</label>
                      <div className="flex flex-wrap gap-2">
                        {SUPPLEMENTS.map((s) => {
                          const list = optionsByIndex[idx]?.supplements ?? [];
                          const checked = list.includes(s);
                          return (
                            <label key={s} className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => {
                                  const next = checked ? list.filter((x) => x !== s) : [...list, s];
                                  setOption(idx, 'supplements', next);
                                }}
                              />
                              <span className="text-sm">{s}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
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
