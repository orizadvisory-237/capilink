import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { inscriptionInvestisseurSchema } from "@/lib/validations/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const parsed = inscriptionInvestisseurSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { erreur: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, nom, prenom, telephone } = parsed.data;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json(
        { erreur: "Un compte existe déjà avec cette adresse email." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le compte
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nom,
        prenom,
        telephone,
        role: "INVESTISSEUR",
        emailVerified: new Date(), // En prod, on enverrait un lien d'activation
      },
    });

    // Étape cruciale : Lier les anciennes demandes de contact à ce nouveau compte
    await prisma.contactInvestisseur.updateMany({
      where: { email },
      data: { investisseurId: user.id },
    });

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register Investisseur] Erreur:", error);
    return NextResponse.json(
      { erreur: "Erreur interne du serveur. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
