import { prisma } from '@/lib/prisma'

// Vérifier qu'un porteur accède uniquement à ses propres projets
export async function verifierProprietaireProjet(
  projetId: string,
  userId: string
): Promise<boolean> {
  const projet = await prisma.projet.findUnique({
    where: { id: projetId },
    select: { porteurId: true },
  })
  return projet?.porteurId === userId
}

// Vérifier qu'un porteur accède uniquement à ses propres documents
export async function verifierProprietaireDocument(
  documentId: string,
  userId: string
): Promise<boolean> {
  const document = await prisma.documentProjet.findUnique({
    where: { id: documentId },
    include: { projet: { select: { porteurId: true } } },
  })
  return document?.projet.porteurId === userId
}

// Guard générique de ressource
export async function exigerPropriete<T>(
  ressource: T | null,
  userId: string,
  getOwnerId: (r: T) => string,
  roleAdmin?: string
): Promise<T> {
  if (!ressource) {
    throw new Error('NOT_FOUND')
  }
  if (getOwnerId(ressource) !== userId && roleAdmin !== 'ADMIN') {
    throw new Error('FORBIDDEN')
  }
  return ressource
}
