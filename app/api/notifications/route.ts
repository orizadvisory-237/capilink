import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const statut = searchParams.get("statut"); // EN_ATTENTE | ENVOYE | ECHEC
    const canal = searchParams.get("canal"); // EMAIL | WHATSAPP
    const type = searchParams.get("type"); // TypeNotification
    const q = searchParams.get("q");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (statut) where.statut = statut;
    if (canal) where.canal = canal;
    if (type) where.type = type;
    if (q) {
      where.OR = [
        { destinataire: { contains: q, mode: "insensitive" } },
        { contenu: { contains: q, mode: "insensitive" } },
      ];
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          projet: {
            select: {
              id: true,
              titre: true,
              reference: true,
            },
          },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    // Count by statut for badges
    const [countEnAttente, countEnvoye, countEchec] = await Promise.all([
      prisma.notification.count({ where: { statut: "EN_ATTENTE" } }),
      prisma.notification.count({ where: { statut: "ENVOYE" } }),
      prisma.notification.count({ where: { statut: "ECHEC" } }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      counts: {
        total,
        EN_ATTENTE: countEnAttente,
        ENVOYE: countEnvoye,
        ECHEC: countEchec,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API Notifications]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
