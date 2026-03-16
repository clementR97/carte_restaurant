/**
 * Modèle Mongoose pour les commandes (MongoDB Atlas).
 */

import mongoose, { Schema, model, models } from 'mongoose';

const clientSchema = new Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    telephone: { type: String, required: true },
    modePaiement: { type: String, required: true },
  },
  { _id: false }
);

const menuChoisiSchema = new Schema(
  {
    categoryId: { type: String, required: true },
    categoryName: { type: String, required: true },
    itemName: { type: String, required: true },
    price: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    typeChoice: { type: String, enum: ['seul', 'cannette'], required: false },
    sauces: [{ type: String }],
    drink: { type: String },
    supplements: [{ type: String }],
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    client: { type: clientSchema, required: true },
    menuChoisi: [menuChoisiSchema],
    createdAt: { type: String, required: true },
    status: { type: String, required: true, enum: ['pending', 'paid', 'ready'], default: 'pending' },
    orderType: { type: String, enum: ['emporter', 'sur place'] },
    totalAmount: { type: Number },
    clientToken: { type: String, required: true },
    notifiedReadyAt: { type: String },
  },
  { collection: 'orders' }
);

export const OrderModel = models.Order ?? model('Order', orderSchema);
