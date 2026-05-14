"use client";
import { Account, Client, Databases, Storage, ID, Query } from "appwrite";

export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "placeholder",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "usha_db",
  productsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID || "products",
  ordersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID || "orders",
  categoriesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID || "categories",
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "product_images",
};

export const isAppwriteConfigured =
  !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID !== "your_project_id";

export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query };
