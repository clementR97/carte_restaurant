'use client';

import { useState, useEffect } from 'react';
import type { MenuConfigCategory, MenuConfigItem } from '@/lib/types/menuConfig';
import { formatPrice } from '@/lib/utils/price';
import { useOrderModal } from '@/app/context/OrderModalContext';

export default function Menu() {
  const [categories, setCategories] = useState<MenuConfigCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MenuConfigCategory | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuConfigItem | null>(null);
  const { openOrderModal } = useOrderModal();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/config/menu')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const openCategory = (cat: MenuConfigCategory) => {
    setSelectedCategory(cat);
    setModalOpen(true);
    setDetailModalOpen(false);
    setSelectedItem(null);
  };

  const openItemDetail = (item: MenuConfigItem) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const closeModals = () => {
    setModalOpen(false);
    setDetailModalOpen(false);
    setSelectedCategory(null);
    setSelectedItem(null);
  };

  return (
    <div className="w-full min-h-[400px] bg-[#FDF5ED] flex flex-col items-center justify-start p-6">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Nos Menu</h2>

      {loading ? (
        <p className="text-gray-500">Chargement du menu…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-4xl">
          {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => openCategory(cat)}
            className="bg-white rounded-2xl shadow-md overflow-hidden text-left hover:shadow-lg transition-all border-0 flex flex-col"
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-2xl">
              <span className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-gray-700 text-white text-base font-medium px-4 py-1.5 rounded-full">
                Aperçu
              </span>
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 flex flex-col items-center text-center">
              <h3 className="text-2xl font-bold text-gray-900">{cat.name}</h3>
            </div>
          </button>
          ))}
        </div>
      )}

      {/* Modal 1 : liste + prix + bouton Commander */}
      {modalOpen && selectedCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeModals}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold">{selectedCategory.name}</h3>
              <button
                type="button"
                onClick={closeModals}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-3">
                {selectedCategory.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-4 py-2 border-b border-gray-100"
                  >
                    <button
                      type="button"
                      onClick={() => openItemDetail(item)}
                      className="font-bold text-gray-900 hover:text-sky-600 text-left flex-1"
                    >
                      {item.name}
                    </button>
                    <span className="text-gray-700 font-medium shrink-0">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <button
                type="button"
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-full"
                onClick={() => { openOrderModal(); setMenuOpen(false); }}
              >
                Commander
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2 : détail (contenu du plat) */}
      {detailModalOpen && selectedItem && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          onClick={() => { setDetailModalOpen(false); setSelectedItem(null); }}
          role="dialog"
          aria-modal="true"
          aria-label="Détail du plat"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-xl font-bold mb-2">{selectedItem.name}</h4>
            <p className="text-gray-600 mb-4">{selectedItem.contents}</p>
            <p className="text-lg font-semibold text-gray-800 mb-4">
              {formatPrice(selectedItem.price)}
            </p>
            <button
              type="button"
              onClick={() => { setDetailModalOpen(false); setSelectedItem(null); }}
              className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-full font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
