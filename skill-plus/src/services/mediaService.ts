import { Client, Databases, ID, Query } from 'react-native-appwrite';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const BUCKET_ID = '6a733f9b0016d752f026';
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

// 1. Pick media from phone library
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
  });

  if (!result.canceled && result.assets.length > 0) {
    return result.assets[0];
  }
  return null;
};

// 2. Capture media using phone camera
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
  });

  if (!result.canceled && result.assets.length > 0) {
    return result.assets[0];
  }
  return null;
};

// 3. Upload file to Appwrite Storage & save metadata in DB
export const uploadSkillProof = async (
  userId: string,
  skillId: string,
  asset: ImagePicker.ImagePickerAsset,
  proofNotes: string = ''
): Promise<MediaLog> => {
  const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
  const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
  const fileId = ID.unique();

  const ext = asset.type === 'video' ? 'mp4' : 'jpg';
  const fileName = `proof_${Date.now()}.${ext}`;
  const mimeType = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');

  const uploadUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files`;

  let uploadedFile: any;

  if (Platform.OS === 'android') {
    // Native upload bypassing React Native JS bridge
    const uploadResult = await FileSystem.uploadAsync(uploadUrl, asset.uri, {
      httpMethod: 'POST',
      uploadType: 1 as any, // 1 = MULTIPART
      fieldName: 'file',
      mimeType: mimeType,
      parameters: {
        fileId: fileId,
      },
      headers: {
        'X-Appwrite-Project': projectId,
      },
    });

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      throw new Error(`Upload failed (${uploadResult.status}): ${uploadResult.body}`);
    }

    uploadedFile = JSON.parse(uploadResult.body);
  } else {
    // Standard iOS FormData execution
    const formData = new FormData();
    formData.append('fileId', fileId);
    formData.append('file', {
      uri: asset.uri,
      name: fileName,
      type: mimeType,
    } as any);

    const response = await fetch(uploadUrl, {
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

    uploadedFile = await response.json();
  }

  const mediaUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view?project=${projectId}`;

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

// 4. Retrieve uploaded media logs for a specific skill
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