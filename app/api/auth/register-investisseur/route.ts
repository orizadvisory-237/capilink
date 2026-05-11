import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inscriptionInvestisseurSchema } from "@/lib/validations/auth";
import { avecGuard } from "@/lib/security/api-guard";
import { hasherMotDePasse } from "@/lib/security/password";
import { envoyerNotification } from "@/lib/notifications";

/**
 * POST /api/auth/register-investisseur
 * Inscription d'un nouvel investisseur.
 * SEC-06: Refactoré avec avecGuard (rate limiting + validation Zod)
 *         et anti-énumération de comptes (réponse identique).
 */
export const POST = avecGuard(
  {
    schema: inscriptionInvestisseurSchema,
    limiteur: 'inscription',
  },
  async (req, { body }) => {
    const { email, password, nom, prenom, telephone } = body as any;

    // Toujours hasher pour timing constant (même si le compte existe)
    const hashedPassword = await hasherMotDePasse(password);

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      // Anti-énumération : envoyer un email d'alerte et retourner la même réponse
      try {
        await envoyerNotification({
          destinataireEmail: email,
          canaux: ['EMAIL'],
          type: 'ALERTE_DOSSIER_URGENT',
          contexte: {
            titreProjet: 'Tentative création compte investisseur (Déjà existant)',
            prenomPorteur: prenom,
            referenceProjet: 'N/A',
          },
        });
      } catch {}

      return NextResponse.json(
        { success: true, message: "Si l'email est valide, un lien vous a été envoyé." },
        { status: 201 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        telephone,
        role: "INVESTISSEUR",
      },
    });

    // Lier les anciennes demandes de contact à ce nouveau compte
    await prisma.contactInvestisseur.updateMany({
      where: { email },
      data: { investisseurId: user.id },
    });

    return NextResponse.json(
      { success: true, message: "Si l'email est valide, un lien vous a été envoyé." },
      { status: 201 }
    );
  }
);
