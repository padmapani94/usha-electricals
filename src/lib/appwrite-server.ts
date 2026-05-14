import { Client, Databases, Storage, ID, Query } from "node-appwrite";

export const serverConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  apiKey: process.env.APPWRITE_API_KEY!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  productsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID!,
  ordersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID!,
  categoriesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!,
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
};

export function getServerClient() {
  return new Client()
    .setEndpoint(serverConfig.endpoint)
    .setProject(serverConfig.projectId)
    .setKey(serverConfig.apiKey);
}

export function getServerDatabases() {
  return new Databases(getServerClient());
}

export function getServerStorage() {
  return new Storage(getServerClient());
}

export { ID, Query };
