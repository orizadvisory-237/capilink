import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ville" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "qualitePorteur" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "secteurPrincipal" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sourceConnaissance" TEXT;
    `);
    
    return NextResponse.json({ success: true, message: 'Base de données mise à jour avec succès !' });
  } catch (error: any) {
    console.error('[Migration Error]', error);
    return NextResponse.json({ success: false, erreur: error.message }, { status: 500 });
  }
}
