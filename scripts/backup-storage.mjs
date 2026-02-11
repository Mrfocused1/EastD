import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const SUPABASE_URL = 'https://fhgvnjwiasusjfevimcw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ3ZuandpYXN1c2pmZXZpbWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk5OTczNywiZXhwIjoyMDc5NTc1NzM3fQ.AV0knf3NjJrOgZkCTD-LDb3jozqT8_h8sxweCdbSw3E';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BACKUP_DIR = './storage-backups';

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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
      await getAllFilesRecursively(bucketName, itemPath, allFiles);
    } else {
      allFiles.push({
        ...item,
        path: itemPath
      });
    }
  }

  return allFiles;
}

async function backupBucket(bucketName, fileList = null) {
  console.log(`\n📦 Backing up bucket: ${bucketName}`);
  console.log('─'.repeat(60));

  const files = fileList || await getAllFilesRecursively(bucketName);

  if (files.length === 0) {
    console.log('  No files to backup.');
    return { success: 0, failed: 0, totalSize: 0 };
  }

  // Create backup directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = join(BACKUP_DIR, timestamp, bucketName);
  await mkdir(backupPath, { recursive: true });

  console.log(`  Backup location: ${backupPath}`);
  console.log(`  Files to backup: ${files.length}\n`);

  let success = 0;
  let failed = 0;
  let totalSize = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = file.path || file.name;

    try {
      // Download file from Supabase
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (error) throw error;

      // Create directory structure if needed
      const fileFullPath = join(backupPath, filePath);
      const fileDir = fileFullPath.substring(0, fileFullPath.lastIndexOf('/'));
      await mkdir(fileDir, { recursive: true });

      // Save file locally
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(fileFullPath, buffer);

      const size = buffer.length;
      totalSize += size;
      success++;

      console.log(`  ✅ [${i + 1}/${files.length}] ${filePath} (${formatBytes(size)})`);
    } catch (error) {
      failed++;
      console.log(`  ❌ [${i + 1}/${files.length}] ${filePath} - Error: ${error.message}`);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`  ✅ Success: ${success} files`);
  console.log(`  ❌ Failed: ${failed} files`);
  console.log(`  💾 Total size: ${formatBytes(totalSize)}`);

  return { success, failed, totalSize };
}

async function backupAll() {
  console.log('🔄 Starting Supabase Storage Backup');
  console.log('═'.repeat(60));

  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error('Error fetching buckets:', bucketsError);
    return;
  }

  if (!buckets || buckets.length === 0) {
    console.log('No buckets found.');
    return;
  }

  console.log(`Found ${buckets.length} bucket(s) to backup\n`);

  let totalSuccess = 0;
  let totalFailed = 0;
  let totalBackupSize = 0;

  for (const bucket of buckets) {
    const { success, failed, totalSize } = await backupBucket(bucket.name);
    totalSuccess += success;
    totalFailed += failed;
    totalBackupSize += totalSize;
  }

  console.log('\n' + '═'.repeat(60));
  console.log('🎉 Backup Complete!');
  console.log(`  Total files backed up: ${totalSuccess}`);
  console.log(`  Failed: ${totalFailed}`);
  console.log(`  Total size: ${formatBytes(totalBackupSize)}`);
  console.log(`  Location: ${BACKUP_DIR}`);
  console.log('═'.repeat(60));
}

async function backupSpecificFiles(filePaths) {
  console.log('🔄 Backing up specific files');
  console.log('═'.repeat(60));

  // Parse file paths (format: bucket/path/to/file)
  const filesByBucket = {};

  filePaths.forEach(path => {
    const [bucket, ...pathParts] = path.split('/');
    if (!filesByBucket[bucket]) {
      filesByBucket[bucket] = [];
    }
    filesByBucket[bucket].push({ path: pathParts.join('/'), name: pathParts[pathParts.length - 1] });
  });

  let totalSuccess = 0;
  let totalFailed = 0;
  let totalBackupSize = 0;

  for (const [bucket, files] of Object.entries(filesByBucket)) {
    const { success, failed, totalSize } = await backupBucket(bucket, files);
    totalSuccess += success;
    totalFailed += failed;
    totalBackupSize += totalSize;
  }

  console.log('\n' + '═'.repeat(60));
  console.log('🎉 Backup Complete!');
  console.log(`  Total files backed up: ${totalSuccess}`);
  console.log(`  Failed: ${totalFailed}`);
  console.log(`  Total size: ${formatBytes(totalBackupSize)}`);
  console.log(`  Location: ${BACKUP_DIR}`);
  console.log('═'.repeat(60));
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Supabase Storage Backup Tool

Usage:
  node scripts/backup-storage.mjs                    # Backup all buckets
  node scripts/backup-storage.mjs file1 file2 ...    # Backup specific files
  node scripts/backup-storage.mjs --help             # Show this help

Examples:
  # Backup everything
  node scripts/backup-storage.mjs

  # Backup specific files
  node scripts/backup-storage.mjs images/uploads/photo1.jpg images/uploads/photo2.jpg

Backups are saved to: ${BACKUP_DIR}/[timestamp]/[bucket-name]/
    `);
    return;
  }

  if (args.length > 0) {
    await backupSpecificFiles(args);
  } else {
    await backupAll();
  }
}

main().catch(console.error);
