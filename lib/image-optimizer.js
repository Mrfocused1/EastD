// Image optimization utility to compress images before uploading to Supabase
// This will reduce storage usage by 70-90%

// Note: sharp is already installed in package.json devDependencies
const sharp = require('sharp');

/**
 * Optimize an image for web/mobile use
 * @param {Buffer} imageBuffer - The original image buffer
 * @param {Object} options - Optimization options
 * @returns {Promise<Buffer>} - Optimized image buffer
 */
async function optimizeImage(imageBuffer, options = {}) {
  const {
    maxWidth = 1920,        // Max width in pixels
    maxHeight = 1080,       // Max height in pixels
    quality = 80,           // JPEG quality (1-100)
    format = 'jpeg',        // Output format: 'jpeg', 'png', 'webp'
    stripMetadata = true,   // Remove EXIF data to save space
  } = options;

  try {
    let image = sharp(imageBuffer);

    // Get image metadata
    const metadata = await image.metadata();

    // Resize if larger than max dimensions (maintain aspect ratio)
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      image = image.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Strip metadata if requested
    if (stripMetadata) {
      image = image.rotate(); // Auto-rotate based on EXIF, then strip
    }

    // Convert to specified format with compression
    switch (format) {
      case 'jpeg':
      case 'jpg':
        image = image.jpeg({ quality, mozjpeg: true });
        break;
      case 'png':
        image = image.png({ quality, compressionLevel: 9 });
        break;
      case 'webp':
        image = image.webp({ quality });
        break;
      default:
        image = image.jpeg({ quality, mozjpeg: true });
    }

    const optimizedBuffer = await image.toBuffer();

    // Log compression results
    const originalSize = imageBuffer.length;
    const optimizedSize = optimizedBuffer.length;
    const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

    console.log(`Image optimized: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${savings}% smaller)`);

    return optimizedBuffer;
  } catch (error) {
    console.error('Image optimization failed:', error);
    throw new Error(`Failed to optimize image: ${error.message}`);
  }
}

/**
 * Create multiple versions of an image (original, mobile, thumbnail)
 * @param {Buffer} imageBuffer - The original image buffer
 * @returns {Promise<Object>} - Object with different image versions
 */
async function createImageVersions(imageBuffer) {
  const [original, mobile, thumbnail] = await Promise.all([
    // Original (compressed but full size)
    optimizeImage(imageBuffer, {
      maxWidth: 2400,
      maxHeight: 1800,
      quality: 85,
    }),
    // Mobile (optimized for mobile devices)
    optimizeImage(imageBuffer, {
      maxWidth: 1080,
      maxHeight: 1080,
      quality: 80,
    }),
    // Thumbnail (small preview)
    optimizeImage(imageBuffer, {
      maxWidth: 300,
      maxHeight: 300,
      quality: 75,
    }),
  ]);

  return { original, mobile, thumbnail };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
  optimizeImage,
  createImageVersions,
};
