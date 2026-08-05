import { Platform } from 'react-native';
import { Client, Storage, Databases, ID, Query } from 'react-native-appwrite';
import * as ImagePicker from 'expo-image-picker';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const storage = new Storage(client);
const databases = new Databases(client);

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const BUCKET_ID = '6a733f9b0016d752f026'; // skill_proofs
const MEDIA_LOGS_COL_ID = 'media_logs';

export type MediaLog = {
  $id: string;
  userId: string;
  skillId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  proofNotes?: string;
  completedAt: string;
};

/**
 * Pick an image or video from the user's gallery
 */
export const pickMediaFromGallery = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    alert('Permission to access media gallery is required!');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images', 'videos'],
    quality: 0.8,
    allowsEditing: true,
  });

  if (!result.canceled && result.assets.length > 0) {
    return result.assets[0];
  }
  return null;
};

/**
 * Capture a photo or video directly with the device camera
 */
export const captureMediaFromCamera = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    alert('Permission to access camera is required!');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images', 'videos'],
    quality: 0.8,
    allowsEditing: true,
  });

  if (!result.canceled && result.assets.length > 0) {
    return result.assets[0];
  }
  return null;
};

/**
 * Upload local file asset to Appwrite Storage and create a media_logs document
 */
export const uploadSkillProof = async (
  userId: string,
  skillId: string,
  asset: ImagePicker.ImagePickerAsset,
  proofNotes: string = ''
): Promise<MediaLog> => {
  const ext = asset.uri.split('.').pop() || (asset.type === 'video' ? 'mp4' : 'jpg');
  const fileName = `proof_${Date.now()}.${ext}`;
  const fileType = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');

  // Fix Android FormData error while retaining TypeScript compatibility with Appwrite SDK
  const cleanUri = Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', '');

  const fileToUpload = {
    name: fileName,
    type: fileType,
    size: asset.fileSize || 10000,
    uri: cleanUri,
  };

  // 1. Upload file object to Appwrite Storage
  const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), fileToUpload);

  // 2. Construct view URL
  const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
  const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
  const mediaUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view?project=${projectId}`;

  // 3. Save database entry
  const nowISO = new Date().toISOString();
  const doc = await databases.createDocument(DB_ID, MEDIA_LOGS_COL_ID, ID.unique(), {
    userId,
    skillId,
    mediaUrl,
    mediaType: asset.type === 'video' ? 'video' : 'image',
    proofNotes,
    completedAt: nowISO,
  });

  return {
    $id: doc.$id,
    userId: doc.userId,
    skillId: doc.skillId,
    mediaUrl: doc.mediaUrl,
    mediaType: doc.mediaType,
    proofNotes: doc.proofNotes,
    completedAt: doc.completedAt,
  };
};

/**
 * Fetch all media logs for a specific skill
 */
export const getSkillMediaLogs = async (skillId: string): Promise<MediaLog[]> => {
  const response = await databases.listDocuments(DB_ID, MEDIA_LOGS_COL_ID, [
    Query.equal('skillId', skillId),
    Query.orderDesc('$createdAt'),
  ]);

  return response.documents.map((doc: any) => ({
    $id: doc.$id,
    userId: doc.userId,
    skillId: doc.skillId,
    mediaUrl: doc.mediaUrl,
    mediaType: doc.mediaType,
    proofNotes: doc.proofNotes,
    completedAt: doc.completedAt,
  }));
};