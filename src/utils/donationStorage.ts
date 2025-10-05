import { supabase } from "@/integrations/supabase/client";

/**
 * Gets a signed URL for a donation receipt
 * This ensures users can only access their own receipts (or admins can access all)
 * RLS policies enforce access control automatically
 */
export const getDonationReceiptUrl = async (
  receiptPath: string,
  expiresIn: number = 3600 // Default: 1 hour
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('donation-receipts')
    .createSignedUrl(receiptPath, expiresIn);

  if (error) {
    console.error('Error creating signed URL for donation receipt:', error);
    throw new Error('No se pudo acceder al comprobante de donación');
  }

  if (!data?.signedUrl) {
    throw new Error('URL del comprobante no disponible');
  }

  return data.signedUrl;
};

/**
 * Downloads a donation receipt file
 * RLS policies automatically restrict access to owner and admins
 */
export const downloadDonationReceipt = async (
  receiptPath: string
): Promise<Blob> => {
  const { data, error } = await supabase.storage
    .from('donation-receipts')
    .download(receiptPath);

  if (error) {
    console.error('Error downloading donation receipt:', error);
    throw new Error('No se pudo descargar el comprobante de donación');
  }

  if (!data) {
    throw new Error('Comprobante no encontrado');
  }

  return data;
};

/**
 * Lists all donation receipts for the current user
 * Admins will see all receipts, users only see their own
 */
export const listUserDonationReceipts = async (
  userId?: string
): Promise<string[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  const effectiveUserId = userId || user?.id;

  if (!effectiveUserId) {
    throw new Error('Usuario no autenticado');
  }

  const { data, error } = await supabase.storage
    .from('donation-receipts')
    .list(effectiveUserId);

  if (error) {
    console.error('Error listing donation receipts:', error);
    throw new Error('No se pudieron cargar los comprobantes');
  }

  return data?.map(file => `${effectiveUserId}/${file.name}`) || [];
};
