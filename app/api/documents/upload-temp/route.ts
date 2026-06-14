import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { avecGuard } from '@/lib/security/api-guard'

const BUCKET_NAME = 'documents-projets'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const TYPES_AUTORISES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]

/**
 * POST /api/documents/upload-temp
 * Upload temporaire d'un document avant création du projet.
 * Le fichier est stocké dans un dossier "temp/{userId}/..." sur Supabase Storage.
 */
export const POST = avecGuard(
  {
    rolesAutorises: ['PORTEUR', 'ADMIN', 'ANALYSTE'],
    limiteur: 'upload',
  },
  async (req, { session }) => {
    try {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      const typeDocument = formData.get('type') as string | null

      if (!file) {
        return NextResponse.json({ erreur: 'Fichier requis' }, { status: 400 })
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { erreur: 'Le fichier dépasse la taille maximale de 10 Mo' },
          { status: 400 }
        )
      }

      if (!TYPES_AUTORISES.includes(file.type)) {
        return NextResponse.json(
          { erreur: 'Type de fichier non autorisé. Formats acceptés : PDF, JPEG, PNG, Excel' },
          { status: 400 }
        )
      }

      const supabase = createServerSupabaseClient()
      const nomFichierNettoye = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
      const path = `temp/${session.user.id}/${Date.now()}_${nomFichierNettoye}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (error) {
        console.error('[Upload-Temp] Supabase error:', error)
        return NextResponse.json(
          { erreur: `Erreur d'upload: ${error.message}` },
          { status: 500 }
        )
      }

      // Récupérer l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path)

      return NextResponse.json({
        success: true,
        publicUrl: publicUrlData.publicUrl,
        path: data.path,
        nom: file.name,
        taille: file.size,
      })
    } catch (error) {
      console.error('[Upload-Temp] Erreur:', error)
      return NextResponse.json(
        { erreur: 'Erreur interne du serveur' },
        { status: 500 }
      )
    }
  }
)
