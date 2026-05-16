import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { avecGuard } from "@/lib/security/api-guard";
import { z } from "zod";

/**
 * GET /api/admin/equipe
 * Liste les utilisateurs avec rôle ADMIN ou ANALYSTE
 * et le nombre de dossiers assignés à chacun.
 */
export const GET = avecGuard(
  { rolesAutorises: ["ADMIN"] },
  async () => {
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
  }
);

const equipeCreationSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["ADMIN", "ANALYSTE"], { message: "Rôle invalide" }),
  prenom: z.string().optional(),
  nom: z.string().optional(),
});

/**
 * POST /api/admin/equipe
 * Créer un nouvel analyste avec un mot de passe temporaire.
 */
export const POST = avecGuard(
  {
    rolesAutorises: ["ADMIN"],
    schema: equipeCreationSchema,
  },
  async (req, { body }) => {
    const { email, role, prenom, nom } = body as z.infer<typeof equipeCreationSchema>;

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
  }
);
