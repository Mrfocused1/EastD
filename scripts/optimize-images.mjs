import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = './public';
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 80;

async function optimizeImage(inputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  const stats = fs.statSync(inputPath);
  const sizeMB = stats.size / (1024 * 1024);

  // Only optimize images larger than 500KB
  if (stats.size < 500 * 1024) {
    console.log(`  Skipping ${path.basename(inputPath)} (${sizeMB.toFixed(2)}MB - already small)`);
    return;
  }

  console.log(`  Processing ${path.basename(inputPath)} (${sizeMB.toFixed(2)}MB)...`);

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    // Resize if wider than MAX_WIDTH
    let pipeline = image;
    if (metadata.width && metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
    }

    // Compress based on format
    if (ext === '.png') {
      pipeline = pipeline.png({ quality: JPEG_QUALITY, compressionLevel: 9 });
    } else {
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
    }

    // Write to buffer first, then overwrite file
    const buffer = await pipeline.toBuffer();
    fs.writeFileSync(inputPath, buffer);

    const newStats = fs.statSync(inputPath);
    const newSizeMB = newStats.size / (1024 * 1024);
    const saved = ((stats.size - newStats.size) / stats.size * 100).toFixed(1);

    console.log(`    ✓ Compressed to ${newSizeMB.toFixed(2)}MB (saved ${saved}%)`);
  } catch (err) {
    console.error(`    ✗ Error: ${err.message}`);
  }
}

async function processDirectory(dir) {
  console.log(`\nScanning: ${dir}`);

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      await optimizeImage(fullPath);
    }
  }
}

console.log('=== Image Optimization Script ===');
console.log(`Max width: ${MAX_WIDTH}px, JPEG quality: ${JPEG_QUALITY}`);

await processDirectory(PUBLIC_DIR);

console.log('\n=== Optimization Complete ===');
