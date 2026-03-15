/**
 * Données menu partagées (modal commande + page menu)
 */

export type MenuItemData = {
  name: string;
  price: string;
  contents: string;
};

export type CategoryData = {
  id: string;
  name: string;
  description: string;
  priceFrom: string;
  image: string;
  items: MenuItemData[];
};

export const ORDER_CATEGORIES: CategoryData[] = [
  {
    id: 'bokit',
    name: 'Bokit',
    description: 'Poulet croustillant, sauce maison',
    priceFrom: '5,50 €',
    image: '/bokit.png',
    items: [
      { name: 'Bokit Poulet', price: '5,50 €', contents: 'Poulet grillé, salade, tomate, oignon, sauce créole, pain bokit.' },
      { name: 'Bokit Morue', price: '6 €', contents: 'Morue frite, salade, tomate, sauce chien, pain bokit.' },
      { name: 'Bokit Crevette', price: '6,50 €', contents: 'Crevettes, salade, avocat, sauce créole, pain bokit.' },
    ],
  },
  {
    id: 'agoulou',
    name: 'Agoulou',
    description: 'Riz, haricots, sauce agoulou',
    priceFrom: '7 €',
    image: '/agoulou.png',
    items: [
      { name: 'Agoulou Poulet', price: '7 €', contents: 'Poulet, riz, haricots rouges, sauce agoulou, légumes.' },
      { name: 'Agoulou Poisson', price: '7,50 €', contents: 'Poisson, riz, haricots, sauce agoulou, banane plantain.' },
    ],
  },
  {
    id: 'sandwiches',
    name: 'Sandwiches',
    description: 'Pain frais, garnitures variées',
    priceFrom: '4 €',
    image: '/hero.png',
    items: [
      { name: 'Sandwich Poulet', price: '4,50 €', contents: 'Poulet, salade, tomate, mayonnaise, pain.' },
      { name: 'Sandwich Thon', price: '4 €', contents: 'Thon, maïs, salade, pain.' },
      { name: 'Sandwich Jambon-fromage', price: '4 €', contents: 'Jambon, fromage, beurre, pain.' },
    ],
  },
  {
    id: 'dessert',
    name: 'Desserts',
    description: 'Pâtisseries et douceurs des îles',
    priceFrom: '3 €',
    image: '/hero.png',
    items: [
      { name: 'Tourment d\'amour', price: '3 €', contents: 'Biscuit coco, confiture de goyave, noix de coco râpée.' },
      { name: 'Sorbet coco', price: '3,50 €', contents: 'Sorbet à la noix de coco fraîche.' },
      { name: 'Salade de fruits', price: '4 €', contents: 'Fruits de saison, sirop, menthe.' },
    ],
  },
];

export const SAUCES = ['Ketchup', 'Samouraï', 'Burger', 'Créole', 'Mayonnaise', 'Sans sauce'] as const;
export const BOISSONS = ['Coca-Cola', 'Sprite', 'Orange', 'Eau', 'Jus de fruits', 'Ice Tea'] as const;
export const SUPPLEMENTS = ['Fromage', 'Salade', 'Omelette', 'Saucisse', 'Steak', 'Oeuf', 'Bacon'] as const;
