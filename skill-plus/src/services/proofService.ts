import {
  databases,
  storage,
  DATABASE_ID,
  MEDIA_LOGS_COLLECTION_ID,
  SKILL_PROOFS_BUCKET_ID,
  ID,
} from '../lib/appwrite';
import { Query } from 'react-native-appwrite';

export interface MediaProof {
  $id?: string;
  userId: string;
  skillId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  proofNotes?: string;
  completedAt: string;
}

/**
 * Uploads a photo/video to Appwrite Storage and logs reference in media_logs collection.
 */
export async function uploadSkillProof({
  userId,
  skillId,
  fileUri,
  mediaType,
  proofNotes = '',
}: {
  userId: string;
  skillId: string;
  fileUri: string;
  mediaType: 'image' | 'video';
  proofNotes?: string;
}) {
  try {
    const filename = fileUri.split('/').pop() || `proof_${Date.now()}`;
    const fileExtension = filename.split('.').pop() || (mediaType === 'image' ? 'jpg' : 'mp4');
    const mimeType = mediaType === 'image' ? `image/${fileExtension}` : `video/${fileExtension}`;

    const fileToUpload = {
      name: filename,
      type: mimeType,
      size: 0,
      uri: fileUri,
    };

    // 1. Upload to Appwrite Storage
    const storageResult = await storage.createFile(
      SKILL_PROOFS_BUCKET_ID,
      ID.unique(),
      fileToUpload as any
    );

    // 2. Generate view URL string
    const mediaUrl = storage.getFileView(SKILL_PROOFS_BUCKET_ID, storageResult.$id);

    // 3. Create document in media_logs
    const mediaLogDoc = await databases.createDocument(
      DATABASE_ID,
      MEDIA_LOGS_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        skillId,
        mediaUrl: String(mediaUrl),
        mediaType,
        proofNotes,
        completedAt: new Date().toISOString(),
      }
    );

    return mediaLogDoc;
  } catch (error: any) {
    console.error('Failed to upload skill proof:', error?.message || error);
    throw error;
  }
}

/**
 * Fetches all media proofs attached to a specific skill.
 */
export async function getSkillProofs(skillId: string): Promise<MediaProof[]> {
  try {
    const response = await databases.listDocuments(DATABASE_ID, MEDIA_LOGS_COLLECTION_ID, [
      Query.equal('skillId', skillId),
      Query.orderDesc('completedAt'),
    ]);
    return response.documents as unknown as MediaProof[];
  } catch (error: any) {
    console.error('Failed to fetch skill proofs:', error?.message || error);
    return [];
  }
}