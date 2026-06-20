import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Trouver l'utilisateur case-insensitively
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: 'mbalanti25@gmail.com',
          mode: 'insensitive'
        }
      }
    });

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Aucun utilisateur trouvé avec l'email contenant 'mbalanti25@gmail.com'"
      });
    }

    // Mettre à jour son rôle en ADMIN
    const updated = await prisma.user.updateMany({
      where: {
        email: {
          contains: 'mbalanti25@gmail.com',
          mode: 'insensitive'
        }
      },
      data: {
        role: 'ADMIN'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Rôle mis à jour pour ${updated.count} utilisateur(s) !`,
      users: users.map(u => ({ email: u.email, prenom: u.prenom, nom: u.nom, role: 'ADMIN' }))
    });
  } catch (error: any) {
    console.error('[Setup Admin Error]', error);
    return NextResponse.json({ success: false, erreur: error.message }, { status: 500 });
  }
}
