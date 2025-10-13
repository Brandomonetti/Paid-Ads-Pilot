import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UploadedFile {
  name: string;
  url: string;
}

export type UploadedFilesStructure = Record<string, UploadedFile[]>;

export async function uploadFile(
  file: File,
  bucket: string,
  folder: string
): Promise<UploadedFile> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    name: file.name,
    url: publicUrl
  };
}

export async function deleteFile(bucket: string, filePath: string): Promise<void> {
  const pathParts = filePath.split('/');
  const fileName = pathParts[pathParts.length - 1];
  
  // Extract folder and filename from the URL if it's a full URL
  let filePathToDelete = filePath;
  if (filePath.includes(supabaseUrl)) {
    const urlParts = filePath.split('/storage/v1/object/public/');
    if (urlParts[1]) {
      const pathWithBucket = urlParts[1];
      filePathToDelete = pathWithBucket.replace(`${bucket}/`, '');
    }
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePathToDelete]);

  if (error) {
    throw error;
  }
}
