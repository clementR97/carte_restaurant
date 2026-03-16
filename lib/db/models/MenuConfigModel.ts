/**
 * Modèle Mongoose pour la configuration menu (un seul document).
 */

import { Schema, model, models } from 'mongoose';

const menuItemSchema = new Schema(
  { name: { type: String, required: true }, price: { type: Number, required: true }, contents: { type: String, default: '' } },
  { _id: false }
);

const categorySchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    priceFrom: { type: String, default: '' },
    image: { type: String, default: '' },
    items: [menuItemSchema],
  },
  { _id: false }
);

const drinkSchema = new Schema(
  { name: { type: String, required: true }, price: { type: Number, required: true } },
  { _id: false }
);

const supplementSchema = new Schema(
  { name: { type: String, required: true }, price: { type: Number, required: true } },
  { _id: false }
);

const menuConfigSchema = new Schema(
  {
    categories: [categorySchema],
    drinks: [drinkSchema],
    supplements: [supplementSchema],
    sauces: [String],
  },
  { collection: 'menuconfig', timestamps: true }
);

export const MenuConfigModel = models.MenuConfig ?? model('MenuConfig', menuConfigSchema);
