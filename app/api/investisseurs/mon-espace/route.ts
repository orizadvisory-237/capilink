import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "INVESTISSEUR") {
      return NextResponse.json({ erreur: "Non autorisé" }, { status: 403 });
    }

    // Récupérer le profil de l'investisseur
    const profil = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
      },
    });

    if (!profil) {
      return NextResponse.json({ erreur: "Profil introuvable" }, { status: 404 });
    }

    // Ses contacts/projets suivis
    const contacts = await prisma.contactInvestisseur.findMany({
      where: {
        OR: [
          { investisseurId: session.user.id },
          { email: profil.email }, // Securité / au cas où non rattachés
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        projet: {
          select: {
            id: true,
            titre: true,
            reference: true,
            secteur: true,
            montantRecherche: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      investisseur: profil,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contacts: contacts.map((c: any) => ({
        id: c.id,
        projetId: c.projetId,
        projetTitre: c.projet.titre,
        projetRef: c.projet.reference,
        projetSecteur: c.projet.secteur,
        // Conversion BigInt manuelle au cas où
        projetMontant: c.projet.montantRecherche ? c.projet.montantRecherche.toString() : null,
        statutSuivi: c.statutSuivi,
        typeIntention: c.typeIntention,
        experienceAfrique: c.experienceAfrique,
        alerteSecteurs: c.alerteSecteurs,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    console.error("[Investisseur Mon Espace] Erreur:", error);
    return NextResponse.json(
      { erreur: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
