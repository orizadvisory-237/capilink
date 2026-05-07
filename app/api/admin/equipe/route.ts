import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * GET /api/admin/equipe
 * Liste les utilisateurs avec rôle ADMIN ou ANALYSTE
 * et le nombre de dossiers assignés à chacun.
 */
export async function GET() {
  try {
    const analystes = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "ANALYSTE"] },
      },
      select: {
        id: true,
        prenom: true,
        nom: true,
        email: true,
        role: true,
        derniereConnexionAt: true,
        createdAt: true,
        _count: {
          select: {
            scoringsRealises: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = analystes.map((a: any) => ({
      id: a.id,
      prenom: a.prenom || "—",
      nom: a.nom || "—",
      email: a.email,
      role: a.role,
      dossiersAssignes: a._count.scoringsRealises,
      derniereConnexion: a.derniereConnexionAt
        ? new Date(a.derniereConnexionAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Jamais",
      createdAt: a.createdAt,
    }));

    return NextResponse.json({ success: true, analystes: result });
  } catch (error) {
    console.error("[API Equipe GET]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/equipe
 * Créer un nouvel analyste avec un mot de passe temporaire.
 * Body: { email: string, role: "ADMIN" | "ANALYSTE", prenom?: string, nom?: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role, prenom, nom } = body;

    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: "Email et rôle requis" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "ANALYSTE"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Rôle invalide" },
        { status: 400 }
      );
    }

    // Vérifier si l'email est déjà utilisé
    const existant = await prisma.user.findUnique({ where: { email } });
    if (existant) {
      return NextResponse.json(
        { success: false, error: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Mot de passe temporaire
    const motDePasseTemp = `Oriz-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const hash = await bcrypt.hash(motDePasseTemp, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hash,
        role,
        prenom: prenom || null,
        nom: nom || null,
      },
    });

    return NextResponse.json({
      success: true,
      analyste: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        prenom: newUser.prenom,
        nom: newUser.nom,
      },
      motDePasseTemporaire: motDePasseTemp,
    });
  } catch (error) {
    console.error("[API Equipe POST]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
