import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a photo to Firebase Storage under the user's directory.
 * Returns the download URL.
 */
export async function uploadPhoto(
  uid: string,
  file: File,
  filename: string,
): Promise<string> {
  const storageRef = ref(storage, `users/${uid}/photos/${filename}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/**
 * Delete a photo from Firebase Storage.
 */
export async function deletePhoto(
  uid: string,
  filename: string,
): Promise<void> {
  const storageRef = ref(storage, `users/${uid}/photos/${filename}`);
  await deleteObject(storageRef);
}
