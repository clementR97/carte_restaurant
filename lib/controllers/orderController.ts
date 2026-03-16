/**
 * Controller des commandes (MVC - Controller)
 */

import type { Order } from '@/lib/models/order';
import { createOrderSchema, type CreateOrderSchemaType } from '@/lib/validation/orderSchema';
import { addOrder, getOrders } from '@/lib/db/orders';

export async function createOrder(
  body: unknown
): Promise<{ success: true; order: Order } | { success: false; errors: string[] }> {
  const result = createOrderSchema.safeParse(body);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    const messages = Object.entries(errors).flatMap(([field, msgs]) =>
      (msgs ?? []).map((m) => `${field}: ${m}`)
    );
    return { success: false, errors: messages };
  }
  const { client, menuChoisi, orderType, totalAmount } = result.data as CreateOrderSchemaType;
  const order = await addOrder(client, menuChoisi, orderType, totalAmount);
  return { success: true, order };
}

export async function listOrders(): Promise<Order[]> {
  return getOrders();
}
