/**
 * Client-side image upload function with automatic old file deletion
 * Sends images to server-side API route for upload to Supabase
 */

interface UploadOptions {
  oldImageUrl?: string; // If provided, will delete the old image after successful upload
}

interface UploadResult {
  success: boolean;
  url: string;
  originalSize: number;
  deletedOldImage?: boolean;
  error?: string;
}

/**
 * Upload an image with automatic old image deletion
 * When you upload a new image, the old one is automatically deleted
 * This prevents storage bloat and keeps only the latest version
 */
export async function uploadImage(
  file: File,
  options: UploadOptions = {}
): Promise<string | null> {
  try {
    const { oldImageUrl = '' } = options;

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('oldImageUrl', oldImageUrl);

    // Send to server-side API route
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });

    const result: UploadResult = await response.json();

    if (!response.ok || !result.success) {
      console.error('Upload failed:', result.error);
      return null;
    }

    // Log success
    console.log('✅ Image uploaded successfully');
    console.log(`   Size: ${formatBytes(result.originalSize)}`);
    if (result.deletedOldImage) {
      console.log(`   🗑️  Old image deleted`);
    }

    return result.url;
  } catch (err) {
    console.error('Upload failed:', err);
    return null;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
