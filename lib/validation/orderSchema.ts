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
  typeChoice: z.enum(['seul', 'cannette']).optional(),
  sauces: z.array(z.string()).optional(),
  drink: z.string().optional(),
  supplements: z.array(z.string()).optional(),
});

export const clientSchema = z.object({
  nom: z.string().trim().min(1, 'Nom requis').max(100),
  prenom: z.string().trim().min(1, 'Prénom requis').max(100),
  telephone: z.string().trim().min(8, 'Numéro de téléphone invalide (min. 8 caractères)').max(20),
  modePaiement: modePaiementEnum,
});

export const createOrderSchema = z.object({
  client: clientSchema,
  menuChoisi: z.array(menuChoisiSchema).min(1, 'Au moins un plat requis'),
  orderType: z.enum(['emporter', 'sur place']).optional(),
  totalAmount: z.number().min(0).optional().nullable().transform((v) => (v == null ? undefined : v)),
});

export type CreateOrderSchemaType = z.infer<typeof createOrderSchema>;
