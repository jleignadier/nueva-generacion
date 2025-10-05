import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export interface UploadResult {
  url: string;
  path: string;
}

export const uploadFile = async (
  bucket: string,
  file: File,
  folder?: string,
  userId?: string
): Promise<UploadResult> => {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`El archivo excede el tamaño máximo de 8MB`);
  }

  // Get current user ID if not provided
  const { data: { user } } = await supabase.auth.getUser();
  const effectiveUserId = userId || user?.id;

  if (!effectiveUserId) {
    throw new Error('Usuario no autenticado');
  }

  // Create file path with user ID folder for proper RLS
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = folder 
    ? `${folder}/${fileName}` 
    : `${effectiveUserId}/${fileName}`;

  // Upload file with upsert to handle updates
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      upsert: true
    });

  if (uploadError) {
    throw uploadError;
  }

  // For private buckets (like donation-receipts), create signed URL
  // For public buckets, use public URL
  const publicBuckets = ['event-photos', 'organization-logos', 'user-avatars', 'legal-documents'];
  
  let url: string;
  if (publicBuckets.includes(bucket)) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    url = data.publicUrl;
  } else {
    // Create a signed URL that expires in 1 year for private buckets
    const { data, error: signError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds
    
    if (signError) throw signError;
    url = data?.signedUrl || '';
  }

  return {
    url,
    path: filePath,
  };
};

export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw error;
  }
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
