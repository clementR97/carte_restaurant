/**
 * Store des commandes (en mémoire pour l'instant).
 * Tu peux remplacer par Prisma + PostgreSQL/SQLite plus tard.
 */

import type { Order } from '@/lib/models/order';

const orders: Order[] = [];

function generateId(): string {
  return `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function addOrder(client: Order['client'], menuChoisi: Order['menuChoisi']): Order {
  const order: Order = {
    id: generateId(),
    client,
    menuChoisi,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
}

export function getOrders(): Order[] {
  return [...orders];
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}
