import { PrismaClient, Role, StatutScoring, TypeFinancement, TypeDocument, Forfait, PaiementStatut, StatutSuivi } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding de la base de données...')

  // Nettoyage préalable (ordre important pour les clés étrangères)
  await prisma.notification.deleteMany()
  await prisma.documentProjet.deleteMany()
  await prisma.contactInvestisseur.deleteMany()
  await prisma.scoreDetail.deleteMany()
  await prisma.projet.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('Oriz2026!', 10)
  const porteurPasswordHash = await bcrypt.hash('Porteur2026!', 10)

  // 1. Création des Administrateurs / Analystes
  console.log('👤 Création des admins...')
  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@oriz.cm',
      password: passwordHash,
      nom: 'Evina',
      prenom: 'Paul',
      role: Role.ADMIN,
      telephone: '+237699000001',
    }
  })

  const analyste1 = await prisma.user.create({
    data: {
      email: 'analyste1@oriz.cm',
      password: passwordHash,
      nom: 'Kamga',
      prenom: 'Alain',
      role: Role.ANALYSTE,
      telephone: '+237699000002',
    }
  })

  const analyste2 = await prisma.user.create({
    data: {
      email: 'analyste2@oriz.cm',
      password: passwordHash,
      nom: 'Manga',
      prenom: 'Chantal',
      role: Role.ANALYSTE,
      telephone: '+237699000003',
    }
  })

  // 2. Création des Porteurs de Projets
  console.log('👤 Création des porteurs...')
  const porteur1 = await prisma.user.create({
    data: {
      email: 'porteur1@example.cm',
      password: porteurPasswordHash,
      nom: 'Ndjomo',
      prenom: 'Benoit',
      role: Role.PORTEUR,
      telephone: '+237677000001',
      ville: 'Douala',
      qualitePorteur: 'DIRIGEANT_PME',
      secteurPrincipal: 'Agroalimentaire'
    }
  })

  const porteur2 = await prisma.user.create({
    data: {
      email: 'porteur2@example.cm',
      password: porteurPasswordHash,
      nom: 'Tchuente',
      prenom: 'Sylvie',
      role: Role.PORTEUR,
      telephone: '+237677000002',
      ville: 'Yaoundé',
      qualitePorteur: 'FONDATEUR_UNIQUE',
      secteurPrincipal: 'Technologie'
    }
  })

  // 3. Création des Projets
  console.log('📁 Création des projets...')
  const projet1 = await prisma.projet.create({
    data: {
      reference: 'CAP-2026-0001',
      titre: 'AgriTech Cameroun - Solutions de fertilisation',
      description: 'Nous développons des engrais bios à partir de déchets organiques pour améliorer les rendements agricoles...',
      secteur: 'AGROALIMENTAIRE',
      stade: 'CROISSANCE',
      zoneGeographique: ['Cameroun', 'CEMAC'],
      problemeResolu: 'Mauvaise qualité des sols locaux et coût exorbitant des engrais importés.',
      solution: 'Un engrais 100% organique, produit localement avec des rendements prouvés supérieurs de 15%.',
      typeFinancement: TypeFinancement.EQUITY,
      montantRecherche: 50000000n, // 50 millions FCFA
      montantMin: 20000000n,
      montantMax: 50000000n,
      utilisationFonds: ['Achat machine', 'BFR', 'Marketing'],
      caActuel: '20M_50M',
      rentabilite: 'EQUILIBRE',
      revenusGeneres: true,
      dureeRevenus: '3 ans',
      projectionCA: 150000000n,
      qualitePorteur: 'DIRIGEANT_PME',
      anneesExperience: '5-10 ans',
      diplome: 'Ingénieur Agronome',
      experienceEntreprise: true,
      structureJuridique: 'SARL',
      contentieux: 'Non',
      forfait: Forfait.PREMIUM,
      montantForfait: 250000,
      paiementStatut: PaiementStatut.CONFIRME,
      statutScoring: StatutScoring.PRIORITAIRE,
      scoreTotal: 85,
      published: true,
      publishedAt: new Date(),
      porteurId: porteur1.id,
      assigneA: analyste1.id,
    }
  })

  const projet2 = await prisma.projet.create({
    data: {
      reference: 'CAP-2026-0002',
      titre: 'E-Logistics CMR',
      description: 'Plateforme de gestion de flotte pour transporteurs inter-urbains au Cameroun.',
      secteur: 'TECHNOLOGIE',
      stade: 'DEMARRAGE',
      zoneGeographique: ['Cameroun'],
      problemeResolu: 'Pertes liées au manque de suivi des camions.',
      solution: 'Tracker GPS low-cost connecté à une application web locale.',
      typeFinancement: TypeFinancement.DETTE,
      montantRecherche: 25000000n,
      montantMin: 15000000n,
      montantMax: 25000000n,
      utilisationFonds: ['Développement App', 'Importation Tags GPS'],
      caActuel: 'MOINS_5M',
      rentabilite: 'DEFICITAIRE',
      revenusGeneres: true,
      qualitePorteur: 'FONDATEUR_UNIQUE',
      anneesExperience: '2-5 ans',
      diplome: 'Informatique',
      experienceEntreprise: false,
      structureJuridique: 'ENTREPRISE_INDIVIDUELLE',
      contentieux: 'Non',
      forfait: Forfait.GROWTH,
      montantForfait: 100000,
      paiementStatut: PaiementStatut.CONFIRME,
      statutScoring: StatutScoring.STANDARD,
      scoreTotal: 65,
      published: true,
      publishedAt: new Date(),
      porteurId: porteur2.id,
      assigneA: analyste2.id,
    }
  })

  // Projet en attente
  const projet3 = await prisma.projet.create({
    data: {
      reference: 'CAP-2026-0003',
      titre: 'Clinique Pro-Santé',
      description: 'Construction d\'une clinique spécialisée en maternité à Mbankolo.',
      secteur: 'SANTE',
      stade: 'IDEE',
      zoneGeographique: ['Yaoundé'],
      problemeResolu: 'Manque de lits maternité dans la zone.',
      solution: 'Clinique de 20 lits abordable.',
      typeFinancement: TypeFinancement.MIXTE,
      montantRecherche: 150000000n,
      montantMin: 100000000n,
      montantMax: 150000000n,
      utilisationFonds: ['Construction', 'Équipement'],
      caActuel: 'AUCUN',
      rentabilite: 'PAS_ACTIVITE',
      revenusGeneres: false,
      qualitePorteur: 'PROJET_COLLECTIF',
      anneesExperience: '10+ ans',
      diplome: 'Médecine',
      experienceEntreprise: true,
      structureJuridique: 'PAS_IMMATRICULEE',
      contentieux: 'Non',
      forfait: Forfait.STARTER,
      montantForfait: 50000,
      paiementStatut: PaiementStatut.EN_ATTENTE,
      statutScoring: StatutScoring.EN_ATTENTE,
      published: false,
      porteurId: porteur2.id,
    }
  })

  // 4. Création des ccorings
  console.log('📊 Création des scorings...')
  await prisma.scoreDetail.create({
    data: {
      projetId: projet1.id,
      analysteId: analyste1.id,
      d1ExperienceSectorielle: 8,
      d1CompetencesGestion: 7,
      d1ResilienceEngagement: 9,
      d2ClarteBM: 8,
      d2RealismeProjections: 7,
      d2StructurationFonds: 8,
      d3TailleMarche: 8,
      d3Traction: 7,
      d3AvantagesConcurrentiels: 6,
      d4StructureLegale: 4,
      d4DocumentsFinanciers: 4,
      d4AbsenceContentieux: 3,
      d5ClarteOffre: 4,
      d5PotentielRendement: 2,
      commentaireGlobal: "Projet très solide porté par un fondateur expérimenté. Le marché est grand, et la traction est là. Recommandé aux investisseurs visant l'impact local.",
      statutChoisi: StatutScoring.PRIORITAIRE,
      brouillon: false,
    }
  })

  await prisma.scoreDetail.create({
    data: {
      projetId: projet2.id,
      analysteId: analyste2.id,
      d1ExperienceSectorielle: 6,
      d1CompetencesGestion: 5,
      d1ResilienceEngagement: 7,
      d2ClarteBM: 6,
      d2RealismeProjections: 5,
      d2StructurationFonds: 6,
      d3TailleMarche: 7,
      d3Traction: 5,
      d3AvantagesConcurrentiels: 4,
      d4StructureLegale: 3,
      d4DocumentsFinanciers: 3,
      d4AbsenceContentieux: 3,
      d5ClarteOffre: 3,
      d5PotentielRendement: 2,
      commentaireGlobal: "Projet technologique intéressant, mais l'équipe manque d'expérience financière. Potentiel de croissance s'ils trouvent le product-market-fit.",
      statutChoisi: StatutScoring.STANDARD,
      brouillon: false,
    }
  })

  // 5. Création d'un contact investisseur
  console.log('🤝 Création des contacts investisseurs...')
  await prisma.contactInvestisseur.create({
    data: {
      projetId: projet1.id,
      prenom: 'Jean',
      nom: 'Dupont',
      email: 'j.dupont@invest-fond.com',
      telephone: '+33600000000',
      qualite: 'FONDS_INVESTISSEMENT',
      pays: 'France',
      ticketHabituel: '100k - 500k',
      message: 'Intéressé par le dossier d\'AgriTech Cameroun. Peux-t-on organiser un call avec le porteur ?',
      typeIntention: 'RENDEZ_VOUS',
      experienceAfrique: true,
      statutSuivi: StatutSuivi.NOUVEAU,
    }
  })

  console.log('✅ Seeding terminé.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
