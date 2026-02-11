# Storage Management Policy

## 🎯 Goal
Keep Supabase storage under quota while maintaining all necessary files.

## 📋 Best Practices

### Before Uploading Images

1. **Always compress images before upload**
   - Use the `lib/image-optimizer.js` utility
   - Target: Keep images under 2 MB each
   - Current issue: Many images are 20-30 MB (10x too large)

2. **Use appropriate image formats**
   - Photos: JPEG (quality: 80-85)
   - Graphics/logos: PNG or WebP
   - Modern browsers: WebP (best compression)

3. **Create responsive versions**
   - Desktop: 1920x1080, quality 85
   - Mobile: 1080x1080, quality 80
   - Thumbnail: 300x300, quality 75

### File Naming Convention

Use descriptive, timestamped names:
```
[timestamp]-[descriptive-name]-[version].jpg

Example:
1767374925468-product-hero-mobile.jpg
1767374925468-product-hero-desktop.jpg
```

### Storage Monitoring

**Weekly:** Run storage monitor
```bash
node scripts/monitor-storage.mjs
```

**Monthly:** Run cleanup script
```bash
node scripts/cleanup-storage.mjs  # Dry run first!
```

**Set up alerts:**
- 80% usage → Schedule cleanup
- 90% usage → Immediate cleanup required

## 🗑️ Safe Deletion Process

### NEVER Delete Files Without:

1. **Running dry run first**
   ```bash
   node scripts/cleanup-storage.mjs  # Shows what WOULD be deleted
   ```

2. **Reviewing the deletion list**
   - Check each file to be deleted
   - Verify you have newer versions
   - Ensure files aren't in active use

3. **Creating a backup** (optional but recommended)
   - Download files before deletion
   - Or ensure files exist elsewhere

4. **Getting explicit confirmation**
   - Double-check the file list
   - Only then run: `node scripts/cleanup-storage.mjs --delete`

### Deletion Checklist

Before running `--delete`:
- [ ] Ran dry run and reviewed list
- [ ] Verified newer versions exist
- [ ] Checked app won't break without these files
- [ ] Know what's being deleted and why
- [ ] Have backup if needed

## 🔄 Automation Guidelines

### Safe to Automate
- ✅ Image compression on upload
- ✅ Creating multiple image versions
- ✅ Storage monitoring/alerts
- ✅ Generating cleanup reports

### NEVER Automate
- ❌ Actual file deletion
- ❌ Bulk operations without review
- ❌ Cleanup scripts without approval

## 📊 Storage Quota by Plan

| Plan | Storage Limit | Current Usage | Status |
|------|---------------|---------------|--------|
| Free | 1 GB | - | - |
| Pro | 100 GB | 704 MB | ✅ Safe |
| Team | 100 GB | - | - |

## 🚨 Emergency Procedures

### If Storage Exceeds Quota:

1. **Don't panic** - API may be temporarily restricted
2. **Upgrade temporarily** if needed for API access
3. **Run analysis script** to see current state
4. **Identify large/duplicate files** for removal
5. **Create deletion plan** with specific files
6. **Review plan carefully** before executing
7. **Delete only what's necessary** to get under quota
8. **Verify success** with monitoring script

### If Files Are Accidentally Deleted:

1. Check Supabase dashboard for recent activity
2. Contact Supabase support immediately
3. Check if project has point-in-time recovery (Pro/Team plans)
4. Restore from your local backups if available

## 🛠️ Useful Commands

```bash
# Check current storage usage
node scripts/monitor-storage.mjs

# Find duplicates (dry run - safe)
node scripts/cleanup-storage.mjs

# Actually delete files (CAREFUL!)
node scripts/cleanup-storage.mjs --delete

# Optimize a local image before upload
node -e "import('./lib/image-optimizer.js').then(m => m.optimizeImage(...))"
```

## 📝 Regular Maintenance Schedule

| Frequency | Task |
|-----------|------|
| Before upload | Compress/optimize images |
| Weekly | Run storage monitor |
| Monthly | Run cleanup dry run |
| Quarterly | Review storage policy |

## ⚠️ Red Flags

Watch for these warning signs:
- Storage growing >100 MB/week
- Individual files >5 MB
- Multiple versions of same file
- Files with generic names (image1.jpg, etc.)
- Uploads failing due to quota

## 💾 Backup Strategy

1. **Critical images:** Keep local copies
2. **Before major cleanup:** Download files to be deleted
3. **Regular exports:** Monthly export of all storage (if on Pro/Team)
4. **Version control:** Keep source files in separate location

---

**Last Updated:** 2026-02-11
**Owner:** Paul Bridges
**Review Date:** 2026-05-11 (quarterly)
