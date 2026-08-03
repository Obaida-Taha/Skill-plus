import 'react-native-url-polyfill/auto';
import { Client, Account, Databases, ID } from 'react-native-appwrite';

export const client = new Client();

client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1') // Updated to fra.cloud.appwrite.io
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '6a6fbe6500378f261f00');

export const account = new Account(client);
export const databases = new Databases(client);
export { ID };