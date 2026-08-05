import { Client, Databases, ID, Query } from 'react-native-appwrite';
import * as ImagePicker from 'expo-image-picker';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const BUCKET_ID = '6a733f9b0016d752f026'; // skill_proofs bucket ID
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
 * Open Media Gallery with base64 enabled
 */
export const pickMediaFromGallery = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    alert('Permission to access media gallery is required!');
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images', 'videos'],
    quality: 0.7,
    allowsEditing: true,
    base64: true, // Key: Converts image directly to memory
  });

  if (!result.canceled && result.assets.length > 0) {
    return result.assets[0];
  }
  return null;
};

/**
 * Open Device Camera with base64 enabled
 */
export const captureMediaFromCamera = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    alert('Permission to access camera is required!');
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images', 'videos'],
    quality: 0.7,
    allowsEditing: true,
    base64: true, // Key: Converts image directly to memory
  });

  if (!result.canceled && result.assets.length > 0) {
    return result.assets[0];
  }
  return null;
};

/**
 * Reliable Direct Upload to Appwrite Storage & Database
 */
export const uploadSkillProof = async (
  userId: string,
  skillId: string,
  asset: ImagePicker.ImagePickerAsset,
  proofNotes: string = ''
): Promise<MediaLog> => {
  const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
  const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
  const fileId = ID.unique();
  const fileType = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');
  const fileName = `proof_${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`;

  // Step A: Convert asset URI to a raw Blob (Works 100% reliably across Android/iOS)
  const fileData = await fetch(asset.uri);
  const blob = await fileData.blob();

  // Step B: Build clean multipart body without React Native FormData bugs
  const formData = new FormData();
  formData.append('fileId', fileId);
  formData.append('file', blob, fileName);

  // Step C: Send directly to Appwrite REST Storage API
  const response = await fetch(`${endpoint}/storage/buckets/${BUCKET_ID}/files`, {
    method: 'POST',
    headers: {
      'X-Appwrite-Project': projectId,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(err.message || 'Failed to upload media.');
  }

  const uploadedFile = await response.json();
  // Inside uploadSkillProof in src/services/mediaService.ts:
    // Use /view instead of /preview to bypass image transformation restrictions
    const mediaUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view?project=${projectId}`;

  // Step D: Create Database Document
  const doc = await databases.createDocument(DB_ID, MEDIA_LOGS_COL_ID, ID.unique(), {
    userId,
    skillId,
    mediaUrl,
    mediaType: asset.type === 'video' ? 'video' : 'image',
    proofNotes,
    completedAt: new Date().toISOString(),
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
 * Fetch skill media logs
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
