/**
 * Accès à la configuration menu (MongoDB).
 */

import { connectDB } from '@/lib/db/mongodb';
import { MenuConfigModel } from '@/lib/db/models/MenuConfigModel';
import { getDefaultMenuConfig } from '@/lib/data/defaultMenuConfig';
import type { MenuConfig } from '@/lib/types/menuConfig';

const CONFIG_ID = 'default';

export async function getMenuConfig(): Promise<MenuConfig> {
  await connectDB();
  const doc = await MenuConfigModel.findOne().lean();
  if (!doc || !doc.categories?.length) {
    return getDefaultMenuConfig();
  }
  return {
    categories: doc.categories ?? [],
    drinks: doc.drinks ?? [],
    supplements: doc.supplements ?? [],
    sauces: doc.sauces ?? [],
  };
}

export async function updateMenuConfig(config: MenuConfig): Promise<MenuConfig> {
  await connectDB();
  await MenuConfigModel.findOneAndUpdate(
    {},
    {
      $set: {
        categories: config.categories,
        drinks: config.drinks,
        supplements: config.supplements,
        sauces: config.sauces,
      },
    },
    { upsert: true, new: true }
  );
  return config;
}
