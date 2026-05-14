"use client";
import { databases, appwriteConfig, ID } from "./appwrite";
import type { Product } from "./types";

export async function createProduct(data: Omit<Product, "$id" | "$createdAt">) {
  return databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    ID.unique(),
    {
      ...data,
      specs: typeof data.specs === "object" ? JSON.stringify(data.specs) : data.specs,
    },
  );
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const payload: any = { ...data };
  if (payload.specs && typeof payload.specs === "object") payload.specs = JSON.stringify(payload.specs);
  delete payload.$id; delete payload.$createdAt;
  return databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    id,
    payload,
  );
}

export async function deleteProduct(id: string) {
  return databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    id,
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const doc = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      id,
    );
    return doc as unknown as Product;
  } catch {
    return null;
  }
}
