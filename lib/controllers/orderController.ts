/**
 * Controller des commandes (MVC - Controller)
 */

import { createOrderSchema, type CreateOrderSchemaType } from '@/lib/validation/orderSchema';
import { addOrder, getOrders } from '@/lib/db/orders';

export function createOrder(body: unknown): { success: true; order: ReturnType<typeof addOrder> } | { success: false; errors: string[] } {
  const result = createOrderSchema.safeParse(body);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const messages = Object.entries(errors).flatMap(([field, msgs]) =>
      (msgs ?? []).map((m) => `${field}: ${m}`)
    );
    return { success: false, errors: messages };
  }
  const { client, menuChoisi } = result.data as CreateOrderSchemaType;
  const order = addOrder(client, menuChoisi);
  return { success: true, order };
}

export function listOrders() {
  return getOrders();
}
