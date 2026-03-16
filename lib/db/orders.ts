/**
 * Store des commandes (MongoDB Atlas).
 */

import type { Order, OrderStatus } from '@/lib/models/order';
import { connectDB } from '@/lib/db/mongodb';
import { OrderModel } from '@/lib/db/models/OrderModel';

/**
 * Génère un id unique en prenant le max existant en base + 1
 * (évite E11000 duplicate key au redémarrage du serveur).
 * Les documents dont l'id n'est pas un nombre (ex: cmd_xxx) sont ignorés.
 */
async function generateId(): Promise<string> {
  const result = await OrderModel.aggregate<{ maxId: number }>([
    {
      $addFields: {
        idNum: {
          $convert: { input: '$id', to: 'int', onError: null, onNull: null },
        },
      },
    },
    { $match: { idNum: { $ne: null } } },
    { $group: { _id: null, maxId: { $max: '$idNum' } } },
  ]);
  const nextNum = (result[0]?.maxId ?? 0) + 1;
  return nextNum <= 9999 ? nextNum.toString().padStart(4, '0') : nextNum.toString();
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
  const id = await generateId();
  const order: Order = {
    id,
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
