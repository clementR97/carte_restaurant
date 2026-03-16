/**
 * Modèle Mongoose pour les admins (connexion sécurisée avec bcrypt).
 */

import { Schema, model, models } from 'mongoose';

const adminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
  },
  { collection: 'admins' }
);

export const AdminModel = models.Admin ?? model('Admin', adminSchema);
