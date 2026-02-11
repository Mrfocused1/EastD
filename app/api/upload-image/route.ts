import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fhgvnjwiasusjfevimcw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ3ZuandpYXN1c2pmZXZpbWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk5OTczNywiZXhwIjoyMDc5NTc1NzM3fQ.AV0knf3NjJrOgZkCTD-LDb3jozqT8_h8sxweCdbSw3E';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function extractPathFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/images\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function deleteOldImage(imageUrl: string): Promise<boolean> {
  const path = extractPathFromUrl(imageUrl);
  if (!path) {
    console.warn('Could not extract path from URL:', imageUrl);
    return false;
  }

  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([path]);

    if (error) {
      console.error('Error deleting old image:', error);
      return false;
    }

    console.log(`✅ Deleted old image: ${path}`);
    return true;
  } catch (err) {
    console.error('Failed to delete old image:', err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const oldImageUrl = formData.get('oldImageUrl') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileSize = buffer.length;

    console.log(`📤 Uploading image: ${file.name} (${formatBytes(fileSize)})`);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileName = `${timestamp}-${randomId}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Upload failed', details: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    const newUrl = urlData.publicUrl;
    console.log(`✅ Uploaded: ${filePath}`);

    // Delete old image if provided (only after successful upload)
    let deletedOldImage = false;
    if (oldImageUrl && oldImageUrl.trim() !== '') {
      deletedOldImage = await deleteOldImage(oldImageUrl);

      // Also try to delete old mobile version if it exists
      const oldPath = extractPathFromUrl(oldImageUrl);
      if (oldPath) {
        const oldMobilePath = oldPath.replace('uploads/', 'uploads/mobile/');
        await supabase.storage.from('images').remove([oldMobilePath]);
      }
    }

    console.log('\n📊 Upload Summary:');
    console.log(`   URL: ${newUrl}`);
    console.log(`   Size: ${formatBytes(fileSize)}`);
    if (deletedOldImage) console.log(`   🗑️  Deleted old image`);
    console.log('');

    return NextResponse.json({
      success: true,
      url: newUrl,
      originalSize: fileSize,
      deletedOldImage,
    });

  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
