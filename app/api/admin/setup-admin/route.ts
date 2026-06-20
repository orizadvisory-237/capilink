import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Récupérer tous les utilisateurs
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        name: true,
        role: true,
      }
    });

    const targetEmail = 'mbalanti25@gmail.com';
    const foundUser = allUsers.find(u => u.email.toLowerCase().includes(targetEmail.toLowerCase()));

    if (foundUser) {
      await prisma.user.update({
        where: { id: foundUser.id },
        data: { role: 'ADMIN' }
      });
      return NextResponse.json({
        success: true,
        message: `Rôle mis à jour en ADMIN pour l'utilisateur ${foundUser.email} !`,
        allUsers
      });
    }

    return NextResponse.json({
      success: false,
      message: `Aucun utilisateur contenant '${targetEmail}' n'a été trouvé.`,
      allUsers
    });
  } catch (error: any) {
    console.error('[Setup Admin Error]', error);
    return NextResponse.json({ success: false, erreur: error.message }, { status: 500 });
  }
}
