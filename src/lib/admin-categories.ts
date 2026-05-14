"use client";
import { databases, appwriteConfig, isAppwriteConfigured, ID, Query } from "./appwrite";
import type { Category } from "./types";
import { categories as seedCategories } from "./seed-data";

export async function listCategories(): Promise<Category[]> {
  if (!isAppwriteConfigured) return seedCategories;
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      [Query.limit(100)],
    );
    return res.documents as unknown as Category[];
  } catch {
    return seedCategories;
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const doc = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      id,
    );
    return doc as unknown as Category;
  } catch {
    return null;
  }
}

export async function createCategory(data: Omit<Category, "$id">) {
  return databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.categoriesCollectionId,
    ID.unique(),
    data,
  );
}

export async function updateCategory(id: string, data: Partial<Category>) {
  const payload: any = { ...data };
  delete payload.$id;
  return databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.categoriesCollectionId,
    id,
    payload,
  );
}

export async function deleteCategory(id: string) {
  return databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.categoriesCollectionId,
    id,
  );
}
