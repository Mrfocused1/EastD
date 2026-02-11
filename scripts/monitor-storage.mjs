import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fhgvnjwiasusjfevimcw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ3ZuandpYXN1c2pmZXZpbWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzk5OTczNywiZXhwIjoyMDc5NTc1NzM3fQ.AV0knf3NjJrOgZkCTD-LDb3jozqT8_h8sxweCdbSw3E';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Storage limits by plan
const STORAGE_LIMITS = {
  free: 1 * 1024 * 1024 * 1024,      // 1 GB
  pro: 100 * 1024 * 1024 * 1024,     // 100 GB
  team: 100 * 1024 * 1024 * 1024,    // 100 GB
};

const CURRENT_PLAN = 'pro'; // Change this to your plan: 'free', 'pro', or 'team'
const WARNING_THRESHOLD = 0.8; // Warn at 80% usage
const DANGER_THRESHOLD = 0.9;  // Alert at 90% usage

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

async function monitorStorage() {
  console.log('📊 Storage Monitoring Report');
  console.log('═'.repeat(60));
  console.log(`Plan: ${CURRENT_PLAN.toUpperCase()}`);
  console.log(`Quota: ${formatBytes(STORAGE_LIMITS[CURRENT_PLAN])}`);
  console.log('');

  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error('Error fetching buckets:', bucketsError);
    return;
  }

  let totalSize = 0;
  const bucketStats = [];

  for (const bucket of buckets) {
    const files = await getAllFilesRecursively(bucket.name);
    const bucketSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);

    bucketStats.push({
      name: bucket.name,
      files: files.length,
      size: bucketSize
    });

    totalSize += bucketSize;
  }

  // Display bucket breakdown
  console.log('Bucket Breakdown:');
  bucketStats.forEach(bucket => {
    const percentage = ((bucket.size / totalSize) * 100).toFixed(1);
    console.log(`  ${bucket.name}: ${formatBytes(bucket.size)} (${bucket.files} files, ${percentage}%)`);
  });

  console.log('');
  console.log('─'.repeat(60));

  // Display total usage
  const usagePercentage = (totalSize / STORAGE_LIMITS[CURRENT_PLAN]) * 100;
  console.log(`Total Usage: ${formatBytes(totalSize)} / ${formatBytes(STORAGE_LIMITS[CURRENT_PLAN])} (${usagePercentage.toFixed(1)}%)`);

  // Status indicators
  if (usagePercentage >= DANGER_THRESHOLD * 100) {
    console.log(`\n🚨 DANGER: Storage at ${usagePercentage.toFixed(1)}%! Clean up immediately.`);
  } else if (usagePercentage >= WARNING_THRESHOLD * 100) {
    console.log(`\n⚠️  WARNING: Storage at ${usagePercentage.toFixed(1)}%. Consider cleanup soon.`);
  } else {
    console.log(`\n✅ HEALTHY: Storage usage is within safe limits.`);
  }

  // Recommendations
  console.log('\n💡 Recommendations:');

  if (usagePercentage >= WARNING_THRESHOLD * 100) {
    console.log('  • Run cleanup script to remove old duplicates');
    console.log('  • Compress large images before uploading');
    console.log('  • Consider implementing automatic image optimization');
  }

  // Find largest files
  console.log('\n📦 Top 5 Largest Files:');
  const allFiles = bucketStats.flatMap(bucket =>
    bucket.files > 0 ? getAllFilesRecursively(bucket.name) : []
  );

  const sortedFiles = (await Promise.all(allFiles)).flat()
    .sort((a, b) => (b.metadata?.size || 0) - (a.metadata?.size || 0))
    .slice(0, 5);

  sortedFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file.name} - ${formatBytes(file.metadata?.size || 0)}`);
  });

  console.log('\n═'.repeat(60));
  console.log(`Report generated: ${new Date().toLocaleString()}`);
}

monitorStorage().catch(console.error);
