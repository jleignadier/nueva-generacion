# Donation Receipt Storage Security

## Overview
Donation receipts are stored in the `donation-receipts` bucket with comprehensive Row-Level Security (RLS) policies to prevent unauthorized access to sensitive financial documents.

## Security Architecture

### Storage Bucket Configuration
- **Bucket Name**: `donation-receipts`
- **Visibility**: Private (not publicly accessible)
- **File Size Limit**: 8 MB
- **Allowed Types**: PDF, JPEG, PNG

### Folder Structure
Files are organized by user ID to enforce access control:
```
donation-receipts/
  └── {user_id}/
      ├── receipt_abc123.pdf
      ├── receipt_def456.pdf
      └── ...
```

### RLS Policies

#### 1. User Upload Policy
**Policy**: "Users can upload their own donation receipts"
- **Action**: INSERT
- **Who**: Authenticated users
- **Rule**: Can only upload to their own user_id folder
- **Purpose**: Prevents users from uploading files to other users' folders

#### 2. User View Policy
**Policy**: "Users can view their own donation receipts"
- **Action**: SELECT
- **Who**: Authenticated users
- **Rule**: Can only view files in their own user_id folder
- **Purpose**: Prevents users from viewing other users' receipts

#### 3. Admin View Policy
**Policy**: "Admins can view all donation receipts"
- **Action**: SELECT
- **Who**: Admin users
- **Rule**: Can view all receipts in any folder
- **Purpose**: Allows admins to review and verify donations

#### 4. Admin Delete Policy
**Policy**: "Admins can delete donation receipts"
- **Action**: DELETE
- **Who**: Admin users
- **Rule**: Can delete any receipt
- **Purpose**: Allows admins to remove invalid or duplicate receipts

#### 5. Admin Update Policy
**Policy**: "Admins can update donation receipts"
- **Action**: UPDATE
- **Who**: Admin users
- **Rule**: Can update metadata on any receipt
- **Purpose**: Allows admins to manage receipt metadata

## Usage Guide

### Uploading Receipts

```typescript
import { uploadFile } from '@/utils/fileUpload';

// Upload a donation receipt
const result = await uploadFile('donation-receipts', file);
// File will automatically be uploaded to: {userId}/{randomName}.pdf
// Returns: { url: 'signed-url', path: 'userId/filename.pdf' }
```

### Retrieving Receipt URLs

```typescript
import { getDonationReceiptUrl } from '@/utils/donationStorage';

// Get a fresh signed URL (expires in 1 hour by default)
const receiptUrl = await getDonationReceiptUrl(receiptPath);

// Custom expiration (e.g., 24 hours)
const receiptUrl = await getDonationReceiptUrl(receiptPath, 86400);
```

### Downloading Receipts

```typescript
import { downloadDonationReceipt } from '@/utils/donationStorage';

// Download the receipt file
const blob = await downloadDonationReceipt(receiptPath);

// Create a download link
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'receipt.pdf';
link.click();
```

### Listing User Receipts

```typescript
import { listUserDonationReceipts } from '@/utils/donationStorage';

// List current user's receipts
const receipts = await listUserDonationReceipts();

// Admin listing specific user's receipts
const userReceipts = await listUserDonationReceipts(userId);
```

## Security Best Practices

### ✅ DO:
- Always use the `uploadFile` utility which enforces proper folder structure
- Use signed URLs for private receipt access
- Refresh signed URLs before they expire (default 1 hour)
- Validate file types before upload (PDF, JPEG, PNG only)
- Check file size before upload (max 8 MB)

### ❌ DON'T:
- Don't use `getPublicUrl()` for donation receipts (bucket is private)
- Don't hardcode file paths - always use user ID folders
- Don't store receipts in public buckets
- Don't share receipt URLs with unauthorized users
- Don't bypass the RLS policies

## Database Integration

The `donations` table stores receipt metadata:

```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  receipt_path TEXT NOT NULL,  -- Path in storage: {userId}/filename.pdf
  receipt_url TEXT NOT NULL,   -- Signed URL (may need refreshing)
  -- ... other fields
);
```

### Syncing with Database

When uploading a receipt:
1. Upload file using `uploadFile()` → returns `{ url, path }`
2. Store both `path` and `url` in donations table
3. When displaying, refresh URL if needed using `getDonationReceiptUrl(path)`

## Testing Access Control

### Test as Regular User:
1. Upload a receipt → Should succeed
2. View your own receipt → Should succeed
3. Attempt to access another user's receipt → Should fail (403)

### Test as Admin:
1. View any user's receipt → Should succeed
2. Delete any receipt → Should succeed
3. Update receipt metadata → Should succeed

## Monitoring & Auditing

Monitor for:
- Failed access attempts (403 errors)
- Unusual download patterns
- Large file uploads
- Expired signed URLs causing errors

## Compliance Notes

This security setup ensures:
- **Data Privacy**: Users cannot access other users' financial documents
- **Audit Trail**: Admin actions can be tracked
- **Secure Storage**: Files are encrypted at rest by Supabase
- **Access Control**: Multiple layers of security (RLS + signed URLs)
- **GDPR Compliance**: Users control their own data, admins have legitimate access

## Troubleshooting

### Issue: "403 Forbidden" when accessing receipt
**Cause**: RLS policy blocking access
**Solution**: Verify user owns the receipt or is an admin

### Issue: "URL expired" or blank image
**Cause**: Signed URL has expired
**Solution**: Call `getDonationReceiptUrl()` to get fresh URL

### Issue: Upload fails silently
**Cause**: File being uploaded to wrong folder
**Solution**: Use `uploadFile()` utility, don't construct paths manually

### Issue: Can't delete receipt as admin
**Cause**: Missing admin role
**Solution**: Verify user has admin role in `user_roles` table
