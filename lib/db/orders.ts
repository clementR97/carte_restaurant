/**
 * Store des commandes (MongoDB Atlas).
 */

import type { Order, OrderStatus } from '@/lib/models/order';
import { connectDB } from '@/lib/db/mongodb';
import { OrderModel } from '@/lib/db/models/OrderModel';

let currentDayKey = new Date().toISOString().slice(0, 10); // AAAA-MM-JJ
let dailyCounter = 0;

function generateId(): string {
  const todayKey = new Date().toISOString().slice(0, 10);
  if (todayKey !== currentDayKey) {
    currentDayKey = todayKey;
    dailyCounter = 0;
  }
  dailyCounter += 1;
  if (dailyCounter > 9999) {
    // Sécurité : on reboucle si plus de 9999 commandes dans la journée
    dailyCounter = 1;
  }
  // 4 chiffres, ex: 0001, 0023, 1234
  return dailyCounter.toString().padStart(4, '0');
}

function generateClientToken(): string {
  return Math.random().toString(36).slice(2, 15) + Math.random().toString(36).slice(2, 15);
}

export async function addOrder(
  client: Order['client'],
  menuChoisi: Order['menuChoisi'],
  orderType?: Order['orderType'],
  totalAmount?: number
): Promise<Order> {
  await connectDB();
  const order: Order = {
    id: generateId(),
    client,
    menuChoisi,
    createdAt: new Date().toISOString(),
    status: 'paid',
    orderType: orderType ?? 'emporter',
    totalAmount,
    clientToken: generateClientToken(),
  };
  await OrderModel.create(order);
  return order;
}

export async function getOrders(): Promise<Order[]> {
  await connectDB();
  const todayKey = new Date().toISOString().slice(0, 10); // AAAA-MM-JJ
  const docs = await OrderModel.find({
    createdAt: { $regex: `^${todayKey}` },
  })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((d) => ({
    id: d.id,
    client: d.client,
    menuChoisi: d.menuChoisi,
    createdAt: d.createdAt,
    status: d.status,
    orderType: d.orderType,
    totalAmount: d.totalAmount,
    clientToken: d.clientToken,
    notifiedReadyAt: d.notifiedReadyAt,
  })) as Order[];
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  await connectDB();
  const doc = await OrderModel.findOne({ id }).lean();
  if (!doc) return undefined;
  return {
    id: doc.id,
    client: doc.client,
    menuChoisi: doc.menuChoisi,
    createdAt: doc.createdAt,
    status: doc.status,
    orderType: doc.orderType,
    totalAmount: doc.totalAmount,
    clientToken: doc.clientToken,
    notifiedReadyAt: doc.notifiedReadyAt,
  } as Order;
}

export async function getOrderByClientToken(
  id: string,
  token: string
): Promise<Order | undefined> {
  await connectDB();
  const doc = await OrderModel.findOne({ id, clientToken: token }).lean();
  if (!doc) return undefined;
  return {
    id: doc.id,
    client: doc.client,
    menuChoisi: doc.menuChoisi,
    createdAt: doc.createdAt,
    status: doc.status,
    orderType: doc.orderType,
    totalAmount: doc.totalAmount,
    clientToken: doc.clientToken,
    notifiedReadyAt: doc.notifiedReadyAt,
  } as Order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | undefined> {
  await connectDB();
  const doc = await OrderModel.findOneAndUpdate(
    { id },
    { status },
    { new: true }
  ).lean();
  if (!doc) return undefined;
  return doc as unknown as Order;
}

export async function markOrderReady(id: string): Promise<Order | undefined> {
  await connectDB();
  const doc = await OrderModel.findOneAndUpdate(
    { id },
    { status: 'ready', notifiedReadyAt: new Date().toISOString() },
    { new: true }
  ).lean();
  if (!doc) return undefined;
  return doc as unknown as Order;
}
