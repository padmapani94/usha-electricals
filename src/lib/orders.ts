"use client";
import { databases, appwriteConfig, ID, Query } from "./appwrite";
import type { CartItem, Order, ShippingAddress } from "./types";

export async function createOrder(input: {
  userId: string;
  items: CartItem[];
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}): Promise<Order> {
  const doc = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    ID.unique(),
    {
      userId: input.userId,
      items: JSON.stringify(input.items),
      total: input.total,
      status: "pending",
      shippingAddress: JSON.stringify(input.shippingAddress),
      paymentMethod: input.paymentMethod,
    },
  );
  return doc as unknown as Order;
}

export async function listMyOrders(userId: string): Promise<Order[]> {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    [Query.equal("userId", userId), Query.orderDesc("$createdAt"), Query.limit(50)],
  );
  return res.documents as unknown as Order[];
}

export async function listAllOrders(): Promise<Order[]> {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    [Query.orderDesc("$createdAt"), Query.limit(200)],
  );
  return res.documents as unknown as Order[];
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  return databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    id,
    { status },
  );
}
