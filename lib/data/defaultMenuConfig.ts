/**
 * Configuration menu par défaut (à partir de menuData).
 */

import { ORDER_CATEGORIES, SAUCES, BOISSONS, SUPPLEMENTS } from './menuData';
import { parsePrice } from '@/lib/utils/price';
import type { MenuConfig } from '@/lib/types/menuConfig';

const DEFAULT_DRINK_PRICE = 1.5;
const DEFAULT_SUPPLEMENT_PRICE = 0.5;

export function getDefaultMenuConfig(): MenuConfig {
  const categories = ORDER_CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    priceFrom: cat.priceFrom,
    image: cat.image,
    items: cat.items.map((item) => ({
      name: item.name,
      price: parsePrice(item.price),
      contents: item.contents,
    })),
  }));

  const drinks = BOISSONS.map((name) => ({ name, price: DEFAULT_DRINK_PRICE }));
  const supplements = SUPPLEMENTS.map((name) => ({ name, price: DEFAULT_SUPPLEMENT_PRICE }));

  return {
    categories,
    drinks,
    supplements,
    sauces: [...SAUCES],
  };
}
