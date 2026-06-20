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

    const targetEmails = ['fabriceloic25@gmail.com', 'mbalanti25@gmail.com'];
    const foundUsers = allUsers.filter(u => targetEmails.map(e => e.toLowerCase()).includes(u.email.toLowerCase()));

    if (foundUsers.length > 0) {
      await prisma.user.updateMany({
        where: {
          id: { in: foundUsers.map(u => u.id) }
        },
        data: { role: 'ADMIN' }
      });
      return NextResponse.json({
        success: true,
        message: `Rôle mis à jour en ADMIN pour: ${foundUsers.map(u => u.email).join(', ')} !`,
        allUsers
      });
    }

    return NextResponse.json({
      success: false,
      message: `Aucun utilisateur dans la liste des cibles n'a été trouvé.`,
      allUsers
    });
  } catch (error: any) {
    console.error('[Setup Admin Error]', error);
    return NextResponse.json({ success: false, erreur: error.message }, { status: 500 });
  }
}
