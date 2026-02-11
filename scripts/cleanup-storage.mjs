import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://fhgvnjwiasusjfevimcw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ3ZuandpYXN1c2pmZXZpbWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk5OTczNywiZXhwIjoyMDc5NTc1NzM3fQ.AV0knf3NjJrOgZkCTD-LDb3jozqT8_h8sxweCdbSw3E';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function to format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleString();
}

async function listAllBucketsAndFiles() {
  console.log('🔍 Fetching storage buckets...\n');

  // List all buckets
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error('Error fetching buckets:', bucketsError);
    return;
  }

  if (!buckets || buckets.length === 0) {
    console.log('No storage buckets found.');
    return;
  }

  console.log(`Found ${buckets.length} bucket(s):\n`);

  let grandTotalSize = 0;
  const allFiles = [];

  for (const bucket of buckets) {
    console.log(`\n📦 Bucket: ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
    console.log('─'.repeat(80));

    // Recursively get all files (including nested folders)
    const allBucketFiles = await getAllFilesRecursively(bucket.name, '');

    let bucketTotalSize = 0;

    if (allBucketFiles.length === 0) {
      console.log('  (empty bucket)');
    } else {
      // Sort by size (largest first)
      allBucketFiles.sort((a, b) => (b.metadata?.size || 0) - (a.metadata?.size || 0));

      console.log(`\n  Total files: ${allBucketFiles.length}\n`);
      console.log('  Top files by size:');

      // Show top 20 largest files
      const topFiles = allBucketFiles.slice(0, 20);

      topFiles.forEach((file, index) => {
        const size = file.metadata?.size || 0;
        const sizeFormatted = formatBytes(size);
        const created = file.created_at ? formatDate(file.created_at) : 'N/A';
        const updated = file.updated_at ? formatDate(file.updated_at) : 'N/A';

        console.log(`  ${index + 1}. ${file.name}`);
        console.log(`     Path: ${file.path || file.name}`);
        console.log(`     Size: ${sizeFormatted}`);
        console.log(`     Created: ${created}`);
        console.log(`     Updated: ${updated}`);
        console.log('');

        bucketTotalSize += size;
        allFiles.push({
          bucket: bucket.name,
          ...file,
          size: size
        });
      });

      // If there are more files, still count their sizes
      if (allBucketFiles.length > 20) {
        console.log(`  ... and ${allBucketFiles.length - 20} more file(s)\n`);

        for (let i = 20; i < allBucketFiles.length; i++) {
          const size = allBucketFiles[i].metadata?.size || 0;
          bucketTotalSize += size;
          allFiles.push({
            bucket: bucket.name,
            ...allBucketFiles[i],
            size: size
          });
        }
      }
    }

    console.log(`\n  Bucket total: ${formatBytes(bucketTotalSize)}`);
    grandTotalSize += bucketTotalSize;
  }

  console.log('\n' + '═'.repeat(80));
  console.log(`\n📊 TOTAL STORAGE USAGE: ${formatBytes(grandTotalSize)}`);
  console.log(`   Target: Under 1 GB (1,073,741,824 bytes)`);
  console.log(`   Current: ${formatBytes(grandTotalSize)}`);

  if (grandTotalSize > 1073741824) {
    const excess = grandTotalSize - 1073741824;
    console.log(`   ⚠️  OVER QUOTA by: ${formatBytes(excess)}\n`);
  } else {
    console.log(`   ✅ Under quota\n`);
  }

  return { buckets, allFiles, grandTotalSize };
}

// Recursively get all files from a bucket (including nested folders)
async function getAllFilesRecursively(bucketName, path = '', allFiles = []) {
  const { data: items, error } = await supabase.storage
    .from(bucketName)
    .list(path, {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) {
    console.error(`Error listing files in ${bucketName}/${path}:`, error);
    return allFiles;
  }

  for (const item of items) {
    const itemPath = path ? `${path}/${item.name}` : item.name;

    if (item.id === null) {
      // It's a folder, recurse into it
      await getAllFilesRecursively(bucketName, itemPath, allFiles);
    } else {
      // It's a file
      allFiles.push({
        ...item,
        path: itemPath
      });
    }
  }

  return allFiles;
}

// Find duplicate/similar files
async function findDuplicates(allFiles) {
  console.log('\n🔍 Analyzing for duplicates and similar files...\n');

  // Group files by name (ignoring path)
  const filesByName = {};

  allFiles.forEach(file => {
    const fileName = file.name;
    if (!filesByName[fileName]) {
      filesByName[fileName] = [];
    }
    filesByName[fileName].push(file);
  });

  // Find files with same name
  const duplicates = Object.entries(filesByName)
    .filter(([name, files]) => files.length > 1)
    .map(([name, files]) => ({
      name,
      files: files.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }));

  if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} file name(s) with multiple versions:\n`);

    duplicates.forEach(({ name, files }) => {
      console.log(`📄 ${name} (${files.length} versions):`);
      files.forEach((file, index) => {
        const isNewest = index === 0;
        console.log(`  ${isNewest ? '✅ KEEP' : '🗑️  OLD '} - ${file.path || file.name}`);
        console.log(`     Size: ${formatBytes(file.size)}`);
        console.log(`     Created: ${formatDate(file.created_at)}`);
        console.log(`     Bucket: ${file.bucket}`);
      });
      console.log('');
    });
  } else {
    console.log('No duplicate file names found.\n');
  }

  return duplicates;
}

// Delete old versions of duplicate files
async function deleteOldVersions(duplicates, dryRun = true) {
  const filesToDelete = [];

  duplicates.forEach(({ name, files }) => {
    // Keep the newest (first in sorted array), mark others for deletion
    files.slice(1).forEach(file => {
      filesToDelete.push(file);
    });
  });

  if (filesToDelete.length === 0) {
    console.log('No files to delete.\n');
    return { deleted: [], totalSaved: 0 };
  }

  const totalSizeToDelete = filesToDelete.reduce((sum, file) => sum + file.size, 0);

  console.log('\n🗑️  FILES TO DELETE:\n');
  console.log(`Total files: ${filesToDelete.length}`);
  console.log(`Total space to free: ${formatBytes(totalSizeToDelete)}\n`);

  if (dryRun) {
    console.log('DRY RUN - No files will be deleted. Files that would be deleted:\n');

    filesToDelete.forEach((file, index) => {
      console.log(`${index + 1}. ${file.path || file.name}`);
      console.log(`   Bucket: ${file.bucket}`);
      console.log(`   Size: ${formatBytes(file.size)}`);
      console.log(`   Created: ${formatDate(file.created_at)}`);
      console.log('');
    });

    console.log('\n⚠️  This is a DRY RUN. To actually delete these files, run:');
    console.log('   node scripts/cleanup-storage.mjs --delete\n');

    return { deleted: [], totalSaved: 0 };
  }

  // Actually delete files
  console.log('⚠️  DELETING FILES...\n');

  const deleted = [];
  const failed = [];

  for (const file of filesToDelete) {
    const { error } = await supabase.storage
      .from(file.bucket)
      .remove([file.path || file.name]);

    if (error) {
      console.log(`❌ Failed to delete: ${file.path || file.name}`);
      console.log(`   Error: ${error.message}`);
      failed.push({ file, error });
    } else {
      console.log(`✅ Deleted: ${file.path || file.name} (${formatBytes(file.size)})`);
      deleted.push(file);
    }
  }

  const totalSaved = deleted.reduce((sum, file) => sum + file.size, 0);

  console.log('\n' + '═'.repeat(80));
  console.log(`\n✅ Successfully deleted: ${deleted.length} file(s)`);
  console.log(`❌ Failed to delete: ${failed.length} file(s)`);
  console.log(`💾 Space freed: ${formatBytes(totalSaved)}\n`);

  return { deleted, failed, totalSaved };
}

// Main function
async function main() {
  const shouldDelete = process.argv.includes('--delete');
  const showHelp = process.argv.includes('--help') || process.argv.includes('-h');

  if (showHelp) {
    console.log(`
Supabase Storage Cleanup Tool

Usage:
  node scripts/cleanup-storage.mjs           # Analyze storage (dry run)
  node scripts/cleanup-storage.mjs --delete  # Actually delete old files
  node scripts/cleanup-storage.mjs --help    # Show this help

This script will:
1. List all storage buckets and files
2. Show file sizes and dates
3. Identify duplicate files (same name, different paths/dates)
4. Delete older versions (keeping the newest)
5. Show storage savings
    `);
    return;
  }

  console.log('🚀 Supabase Storage Cleanup Tool\n');
  console.log('═'.repeat(80));

  // Step 1: List all files
  const { buckets, allFiles, grandTotalSize } = await listAllBucketsAndFiles();

  if (!allFiles || allFiles.length === 0) {
    console.log('No files found in storage.');
    return;
  }

  // Step 2: Find duplicates
  const duplicates = await findDuplicates(allFiles);

  // Step 3: Delete old versions (or dry run)
  if (duplicates.length > 0) {
    const { deleted, failed, totalSaved } = await deleteOldVersions(duplicates, !shouldDelete);

    if (shouldDelete && deleted.length > 0) {
      // Show new total
      const newTotal = grandTotalSize - totalSaved;
      console.log(`\n📊 NEW STORAGE USAGE: ${formatBytes(newTotal)}`);
      console.log(`   Target: Under 1 GB (1,073,741,824 bytes)`);

      if (newTotal > 1073741824) {
        const excess = newTotal - 1073741824;
        console.log(`   ⚠️  Still over quota by: ${formatBytes(excess)}\n`);
        console.log('   💡 You may need to manually delete more files.');
      } else {
        console.log(`   ✅ Now under quota!\n`);
      }
    }
  }

  console.log('═'.repeat(80));
  console.log('✨ Done!\n');
}

// Run the script
main().catch(console.error);
