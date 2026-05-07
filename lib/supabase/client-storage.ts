import { createBrowserSupabaseClient } from "./client";

const BUCKET_NAME = 'documents-projets';

/**
 * Upload un fichier vers Supabase Storage directement depuis le navigateur.
 * Fonction sécurisée qui dépend de la configuration RLS ou d'un bucket public pour des documents d'entrée.
 */
export async function uploadDocumentClient(file: File, refId: string): Promise<{ publicUrl: string, path: string }> {
  const supabase = createBrowserSupabaseClient();
  const nomFichierNettoye = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const path = `${refId}/${Date.now()}_${nomFichierNettoye}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error("Erreur d'upload Supabase (client):", error);
    throw new Error(`Échec de l'envoi du document ${file.name}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return { publicUrl: publicUrlData.publicUrl, path: data.path };
}
