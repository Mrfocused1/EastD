# Image Upload System - Complete Guide

## 🎯 Overview

Your image upload system now automatically:
- ✅ **Compresses images by 70-90%** before upload
- ✅ **Creates mobile-optimized versions** automatically
- ✅ **Deletes old images** when you upload new ones
- ✅ **Prevents storage bloat** by keeping only current versions

## 📊 What Changed

### Before
- Uploaded raw 20-30 MB images
- No compression
- Old images stayed forever
- Storage filled up quickly

### After
- Compresses to ~2-3 MB (90% smaller!)
- Creates desktop + mobile versions
- Auto-deletes old images
- Efficient storage usage

## 🔧 How It Works

### 1. Image Optimization (`lib/image-optimizer.js`)

Compresses images using these settings:
- **Desktop**: Max 1920x1080, quality 80%
- **Mobile**: Max 1080x1080, quality 80%
- **Thumbnail**: Max 300x300, quality 75% (optional)

### 2. Smart Upload (`lib/uploadImage.ts`)

When you upload a new image:
```typescript
await uploadImage(file, {
  oldImageUrl: 'https://.../old-image.jpg', // Old image to delete
  createMobileVersion: true,  // Create mobile version
  createThumbnail: false,     // Optional thumbnail
});
```

**Process:**
1. Compresses the new image
2. Uploads desktop version
3. Creates & uploads mobile version
4. **Deletes the old image** (only after successful upload)
5. Logs everything to console

### 3. Auto-Deletion

The system automatically deletes:
- ✅ The old desktop image
- ✅ The old mobile version (if it exists)

**Safety:** Old images are only deleted AFTER the new image successfully uploads.

## 💡 Usage Examples

### In Admin Pages (Already Integrated!)

The `ImageUpload` component already uses this system:

```tsx
<ImageUpload
  label="Hero Image"
  value={heroImage}
  onChange={setHeroImage}
/>
```

When a user uploads a new image:
- Old image is automatically deleted
- New compressed image is uploaded
- Mobile version is created
- Storage stays clean!

### Manual Upload (Advanced)

```typescript
import { uploadImage } from '@/lib/uploadImage';

const file = /* File from input */;

// Simple upload (with compression)
const url = await uploadImage(file);

// Upload with auto-delete
const url = await uploadImage(file, {
  oldImageUrl: currentImageUrl,
});

// Full options
const url = await uploadImage(file, {
  oldImageUrl: 'https://.../old.jpg',
  createMobileVersion: true,
  createThumbnail: true,
  quality: 85,
  maxWidth: 2400,
  maxHeight: 1800,
});
```

## 🎨 What You'll See

When uploading an image, check your browser console:

```
📤 Uploading image: photo.JPG (31.59 MB)
✨ Optimized: 31.59 MB → 2.14 MB (93.2% smaller)
✅ Uploaded desktop version: uploads/1234567890-abc123.JPG
✅ Uploaded mobile version: uploads/mobile/1234567890-abc123.JPG (845.23 KB)
🗑️  Deleted old image

📊 Upload Summary:
   Main URL: https://.../uploads/1234567890-abc123.JPG
   Mobile URL: https://.../uploads/mobile/1234567890-abc123.JPG
   Original size: 31.59 MB
   Optimized size: 2.14 MB
   Savings: 93.2%
   🗑️  Deleted old image
```

## 🛡️ Safety Features

1. **Upload First, Delete Second**
   - New image uploads completely before old one is deleted
   - If upload fails, old image is kept
   - No data loss

2. **Path Validation**
   - Validates old image URLs before deletion
   - Prevents accidental deletion of wrong files
   - Logs all actions for audit trail

3. **Error Handling**
   - Upload errors don't delete old images
   - Failed deletions are logged but don't break uploads
   - User always gets feedback

## 📋 File Structure

```
uploads/
├── image1.jpg              ← Desktop version (compressed)
├── image2.jpg
├── mobile/
│   ├── image1.jpg          ← Mobile version (smaller)
│   └── image2.jpg
└── thumbnails/             ← Optional thumbnails
    ├── image1.jpg
    └── image2.jpg
```

## 🔍 Monitoring Storage

### Check Current Usage
```bash
node scripts/monitor-storage.mjs
```

### Find & Remove Duplicates
```bash
# Dry run (safe)
node scripts/cleanup-storage.mjs

# Actually delete
node scripts/cleanup-storage.mjs --delete
```

## ⚙️ Configuration

### Adjust Compression Settings

Edit `lib/uploadImage.ts` defaults:

```typescript
const {
  createMobileVersion = true,    // Change to false to disable
  createThumbnail = false,       // Change to true to enable
  quality = 80,                  // 1-100 (higher = better quality, larger size)
  maxWidth = 1920,               // Max desktop width
  maxHeight = 1080,              // Max desktop height
} = options;
```

### Mobile Version Settings

In `lib/uploadImage.ts`, find:

```typescript
const mobileBuffer = await optimizeImage(originalBuffer, {
  maxWidth: 1080,   // Adjust mobile max width
  maxHeight: 1080,  // Adjust mobile max height
  quality: 80,      // Adjust mobile quality
  // ...
});
```

## 🎯 Best Practices

### DO:
- ✅ Use the ImageUpload component (it's already set up!)
- ✅ Let the system compress images automatically
- ✅ Check console logs to verify old images are deleted
- ✅ Run `monitor-storage.mjs` weekly

### DON'T:
- ❌ Manually compress images before upload (system does it)
- ❌ Disable mobile versions (saves mobile bandwidth)
- ❌ Set quality > 90 (diminishing returns, huge files)
- ❌ Skip the oldImageUrl parameter (causes storage bloat)

## 📈 Expected Results

With this system:
- **Storage usage**: Dramatically reduced
- **Page load times**: Faster (smaller images)
- **Mobile experience**: Better (optimized versions)
- **Storage costs**: Lower
- **Manual cleanup**: Rarely needed

## 🔧 Troubleshooting

### "Image not compressing enough"
- Lower the `quality` setting (try 70-75)
- Reduce `maxWidth` and `maxHeight`

### "Mobile version not created"
- Check browser console for errors
- Verify `sharp` package is installed
- Check Supabase storage permissions

### "Old image not deleted"
- Verify `oldImageUrl` is being passed
- Check console logs for deletion errors
- Ensure URL format matches pattern

### "Upload failed"
- Check Supabase storage quota
- Verify file type is supported (JPEG, PNG, WebP)
- Check browser console for specific error

## 📞 Support

If you encounter issues:
1. Check browser console for detailed logs
2. Verify storage quota: `node scripts/monitor-storage.mjs`
3. Review this guide
4. Check `STORAGE-POLICY.md` for best practices

---

**Last Updated:** 2026-02-11
**System Version:** 2.0 (Auto-compression + Auto-deletion)
