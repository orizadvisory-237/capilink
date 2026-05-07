import { createServerSupabaseClient } from './server'

const BUCKET_NAME = 'documents-projets'

interface UploadResult {
  success: boolean
  url?: string
  path?: string
  erreur?: string
}

/**
 * Upload un document vers Supabase Storage.
 * Organise les fichiers par projet : documents-projets/{projetId}/{filename}
 */
export async function uploadDocument(
  projetId: string,
  file: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  try {
    const supabase = createServerSupabaseClient()
    const path = `${projetId}/${Date.now()}-${filename}`

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        contentType,
        upsert: false,
      })

    if (error) {
      return { success: false, erreur: error.message }
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path)

    return {
      success: true,
      url: urlData.publicUrl,
      path,
    }
  } catch (error) {
    console.error('[Storage] Erreur upload:', error)
    return {
      success: false,
      erreur: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Supprime un document de Supabase Storage.
 */
export async function deleteDocument(path: string): Promise<boolean> {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      console.error('[Storage] Erreur suppression:', error.message)
      return false
    }

    return true
  } catch (error) {
    console.error('[Storage] Erreur suppression:', error)
    return false
  }
}

/**
 * Génère une URL signée (temporaire) pour un document privé.
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600 // 1 heure par défaut
): Promise<string | null> {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error('[Storage] Erreur signed URL:', error.message)
      return null
    }

    return data.signedUrl
  } catch {
    return null
  }
}
