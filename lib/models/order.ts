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
  /** 'seul' ou 'cannette' */
  typeChoice?: 'seul' | 'cannette';
  /** Sauces choisies (max 3 côté front) */
  sauces?: string[];
  /** Boisson si typeChoice = 'cannette' */
  drink?: string;
  /** Suppléments (fromage, salade, etc.) */
  supplements?: string[];
}

export type OrderStatus = 'pending' | 'paid' | 'ready';

export type OrderType = 'emporter' | 'sur place';

export interface Order {
  id: string;
  client: Client;
  menuChoisi: MenuChoisi[];
  createdAt: string; // ISO date
  status: OrderStatus;
  /** À emporter ou sur place */
  orderType?: OrderType;
  /** Montant total de la commande (€) */
  totalAmount?: number;
  /** Token pour que le client consulte son statut sans auth (pas de données bancaires) */
  clientToken: string;
  /** Date d'envoi du message "commande prête" (admin) */
  notifiedReadyAt?: string;
}

export type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'status' | 'clientToken' | 'notifiedReadyAt'>;
