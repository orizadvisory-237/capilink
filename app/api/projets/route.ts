import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { projetCompletSchema } from '@/lib/validations/projet'
import { notifierPorteur } from '@/lib/notifications'
import { avecGuard } from '@/lib/security/api-guard'
import { z } from 'zod'

/**
 * POST /api/projets
 * Création d'un nouveau projet par un porteur authentifié.
 */
export const POST = avecGuard(
  {
    rolesAutorises: ['PORTEUR'],
    schema: projetCompletSchema,
    limiteur: 'api', // Limiter pour éviter le spam DB
  },
  async (req, { session, body }) => {
    try {
      const data = body as z.infer<typeof projetCompletSchema>;

      // Générer la référence unique CAP-YYYY-XXXX
      const year = new Date().getFullYear()
      const count = await prisma.projet.count()
      const reference = `CAP-${year}-${String(count + 1).padStart(4, '0')}`

      // Déterminer le montant du forfait
      const montantsForfait: Record<string, number> = {
        STARTER: 50000,
        GROWTH: 100000,
        PREMIUM: 250000,
      }

      const projet = await prisma.projet.create({
        data: {
          reference,
          titre: data.nomProjet,
          description: data.description,
          secteur: data.secteur,
          stade: data.stadeDeveloppement,
          zoneGeographique: data.zonesGeographiques,
          problemeResolu: data.problemeResolu,
          solution: data.solutionProposee,
          avantagesConcurrentiels: data.avantageConcurrentiel ?? null,
          typeFinancement: data.typeFinancement as 'EQUITY' | 'DETTE' | 'SUBVENTION' | 'LEASING' | 'MIXTE',
          montantRecherche: BigInt(data.montantRecherche),
          montantMin: BigInt(data.montantRecherche),
          montantMax: BigInt(data.montantRecherche),
          utilisationFonds: data.utilisationFonds,
          caActuel: data.chiffreAffaires,
          rentabilite: data.rentabilite,
          revenusGeneres: data.genereRevenus,
          projectionCA: data.projectionCA ? BigInt(data.projectionCA) : null,
          qualitePorteur: data.roleProjet,
          anneesExperience: data.anneesExperience,
          diplome: data.diplome,
          experienceEntreprise: data.dejaGereEntreprise,
          membresCles: data.membresEquipe && data.membres ? data.membres : undefined,
          structureJuridique: data.structureJuridique,
          numeroContribuable: data.numeroContribuable ?? null,
          contentieux: data.contentieux,
          forfait: data.forfait as 'STARTER' | 'GROWTH' | 'PREMIUM',
          montantForfait: montantsForfait[data.forfait] ?? 50000,
          porteurId: session.user.id,
          documents: data.documents && data.documents.length > 0 ? {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            create: data.documents.map((doc: any) => ({
              nom: doc.nom,
              type: doc.type,
              url: doc.url,
              taille: doc.taille,
              verifie: false
            }))
          } : undefined,
        },
      })

      // Notification accusé de réception (fire-and-forget)
      notifierPorteur(
        'ACCUSE_RECEPTION',
        projet.id,
        {
          prenomPorteur: (session.user as any).prenom as string,
          nomPorteur: (session.user as any).nom as string,
          referenceProjet: reference,
          titreProjet: data.nomProjet,
        },
        session.user.email ?? undefined,
      ).catch(console.error)

      return NextResponse.json(
        {
          success: true,
          projet: {
            id: projet.id,
            reference: projet.reference,
            titre: projet.titre,
            forfait: projet.forfait,
            montantForfait: projet.montantForfait,
          },
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('[Projet] Erreur création:', error)
      return NextResponse.json(
        { erreur: 'Erreur interne du serveur' },
        { status: 500 }
      )
    }
  }
)
