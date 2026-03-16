/**
 * Types pour la configuration menu (prix en nombre pour les calculs).
 */

export type MenuConfigItem = {
  name: string;
  price: number;
  contents: string;
};

export type MenuConfigCategory = {
  id: string;
  name: string;
  description: string;
  priceFrom: string;
  image: string;
  items: MenuConfigItem[];
};

export type MenuConfigDrink = { name: string; price: number };
export type MenuConfigSupplement = { name: string; price: number };

export type MenuConfig = {
  categories: MenuConfigCategory[];
  drinks: MenuConfigDrink[];
  supplements: MenuConfigSupplement[];
  sauces: string[];
};
