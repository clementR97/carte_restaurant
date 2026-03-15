/**
 * Modèle Client / Commande (MVC - Model)
 * Représente une commande avec les infos client et le menu choisi.
 */

export type ModePaiement = 'especes' | 'carte' | 'mobile' | 'autre';

export interface Client {
  nom: string;
  prenom: string;
  telephone: string;
  modePaiement: ModePaiement;
}

export interface MenuChoisi {
  categoryId: string;   // ex: 'bokit', 'agoulou', 'sandwiches', 'dessert'
  categoryName: string;
  itemName: string;
  price: string;
  quantity?: number;
}

export interface Order {
  id: string;
  client: Client;
  menuChoisi: MenuChoisi[];
  createdAt: string; // ISO date
}

export type CreateOrderInput = Omit<Order, 'id' | 'createdAt'>;
