/**
 * Schéma de validation des commandes (Zod)
 */

import { z } from 'zod';

const modePaiementEnum = z.enum(['especes', 'carte', 'mobile', 'autre']);

export const menuChoisiSchema = z.object({
  categoryId: z.string().min(1, 'Catégorie requise'),
  categoryName: z.string().min(1),
  itemName: z.string().min(1, 'Nom du plat requis'),
  price: z.string().min(1, 'Prix requis'),
  quantity: z.number().int().positive().optional().default(1),
});

export const clientSchema = z.object({
  nom: z.string().min(1, 'Nom requis').max(100),
  prenom: z.string().min(1, 'Prénom requis').max(100),
  telephone: z.string().min(8, 'Numéro de téléphone invalide').max(20),
  modePaiement: modePaiementEnum,
});

export const createOrderSchema = z.object({
  client: clientSchema,
  menuChoisi: z.array(menuChoisiSchema).min(1, 'Au moins un plat requis'),
});

export type CreateOrderSchemaType = z.infer<typeof createOrderSchema>;
