import 'react-native-url-polyfill/auto';
import { Client, Account, Databases, Storage, ID } from 'react-native-appwrite';

export const client = new Client();

client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '6a6fbe6500378f261f00');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client); // 👈 Added Storage instance

export { ID };

// Database & Collection IDs
export const DATABASE_ID = 'skills-collection';
export const USER_PROFILES_COLLECTION_ID = 'user_profiles';
export const DISCOVER_SKILLS_COLLECTION_ID = 'discover_skills';
export const USER_SKILLS_COLLECTION_ID = 'user_skills';
export const MEDIA_LOGS_COLLECTION_ID = 'media_logs';

// Storage Buckets
export const SKILL_PROOFS_BUCKET_ID = 'skill_proofs';