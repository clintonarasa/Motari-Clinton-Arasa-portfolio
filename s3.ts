import { supabase } from "./src/integrations/supabase/client";

const BUCKET_NAME = "portfolio-assets";

/**
 * Uploads an image using the authenticated Supabase Storage session.
 */
export async function uploadImage(file: File, fileName: string): Promise<string> {
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  return data.publicUrl;
}