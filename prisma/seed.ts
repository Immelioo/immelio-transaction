import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Garde-fou : ce script supprime les biens/programmes/lots existants et recrée des
  // comptes avec des mots de passe faibles connus du code source. Strictement réservé
  // au seed de démo en développement — jamais en production.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Le seed de démo est bloqué en production (NODE_ENV=production). " +
      "Utilise `npm run create-admin` pour créer un compte administrateur en production."
    );
  }

  console.log("🌱 Seeding database...");

  // Nettoyer les données existantes (sauf users)
  await prisma.activite.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.optionLot.deleteMany();
  await prisma.lot.deleteMany();
  await prisma.photoProgramme.deleteMany();
  await prisma.documentProgramme.deleteMany();
  await prisma.programme.deleteMany();
  await prisma.document.deleteMany();
  await prisma.demandeVisite.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.bien.deleteMany();
  console.log("🧹 Données existantes nettoyées");

  // Hash des mots de passe avec bcrypt
  const adminPassword = await bcrypt.hash("admin123", 12);
  const partnerPassword = await bcrypt.hash("partner123", 12);

  // Créer un admin (upsert pour éviter les conflits)
  const admin = await prisma.user.upsert({
    where: { email: "admin@immelio.fr" },
    update: { password: adminPassword },
    create: {
      email: "admin@immelio.fr",
      password: adminPassword,
      nom: "Admin",
      prenom: "Tao",
      role: "ADMIN",
      telephone: "0771556483",
    },
  });

  // Upsert admin principal aussi
  await prisma.user.upsert({
    where: { email: "tf.immopro@gmail.com" },
    update: { password: adminPassword },
    create: {
      email: "tf.immopro@gmail.com",
      password: adminPassword,
      nom: "Giachino",
      prenom: "Tao",
      role: "ADMIN",
      telephone: "0771556483",
    },
  });

  // Créer un partenaire (upsert)
  const partenaire = await prisma.user.upsert({
    where: { email: "partenaire@exemple.fr" },
    update: { password: partnerPassword },
    create: {
      email: "partenaire@exemple.fr",
      password: partnerPassword,
      nom: "Dupont",
      prenom: "Jean",
      role: "PARTENAIRE",
      entreprise: "Dupont Immobilier",
      codeAcces: "PRO-2024-001",
      telephone: "0612345678",
    },
  });

  // Créer des biens avec commissions partenaires
  const biens = await Promise.all([
    prisma.bien.create({
      data: {
        titre: "Magnifique T3 lumineux - Cœur de Paris",
        description: "Superbe appartement de 3 pièces entièrement rénové, situé au 4ème étage avec ascenseur. Cuisine ouverte sur séjour, deux chambres, salle de bain moderne. Parquet massif, double vitrage, cave. Proche métro et commerces.",
        type: "APPARTEMENT",
        transaction: "VENTE",
        prix: 485000,
        surface: 65,
        nbPieces: 3,
        nbChambres: 2,
        etage: 4,
        adresse: "45 Rue de Rivoli",
        codePostal: "75004",
        ville: "Paris",
        disponible: true,
        enVedette: true,
        dpe: "C",
        ges: "B",
        anneeConstruction: 1920,
        ascenseur: true,
        cave: true,
        parking: false,
        chargesmensuelles: 250,
        commissionPartenaire: 2.5,
      },
    }),
    prisma.bien.create({
      data: {
        titre: "Studio meublé - Quartier Latin",
        description: "Charmant studio entièrement meublé et équipé, idéal pour étudiant ou investissement locatif. Kitchenette équipée, salle d'eau avec WC, rangements. Immeuble calme, digicode.",
        type: "STUDIO",
        transaction: "LOCATION",
        prix: 950,
        surface: 22,
        nbPieces: 1,
        nbChambres: 0,
        etage: 2,
        adresse: "12 Rue Mouffetard",
        codePostal: "75005",
        ville: "Paris",
        disponible: true,
        enVedette: true,
        dpe: "D",
        meuble: true,
        chargesmensuelles: 50,
        commissionPartenaire: 1.5,
      },
    }),
    prisma.bien.create({
      data: {
        titre: "Maison familiale avec jardin - Boulogne",
        description: "Belle maison de ville sur 3 niveaux avec jardin privatif de 80m². Séjour double, cuisine équipée, 4 chambres, 2 salles de bain, bureau, garage. Quartier résidentiel calme, proche écoles et transports.",
        type: "MAISON",
        transaction: "VENTE",
        prix: 1250000,
        surface: 180,
        nbPieces: 7,
        nbChambres: 4,
        adresse: "8 Allée des Roses",
        codePostal: "92100",
        ville: "Boulogne-Billancourt",
        disponible: true,
        enVedette: true,
        dpe: "B",
        anneeConstruction: 2005,
        parking: true,
        terrasse: true,
        cave: true,
        gardien: false,
        commissionPartenaire: 3.0,
      },
    }),
    prisma.bien.create({
      data: {
        titre: "Loft contemporain - Montreuil",
        description: "Ancien atelier d'artiste transformé en loft contemporain. Espace ouvert de 120m² avec mezzanine, verrière, cuisine américaine haut de gamme. Hauteur sous plafond 4m. Place de parking en sous-sol.",
        type: "LOFT",
        transaction: "VENTE",
        prix: 620000,
        surface: 120,
        nbPieces: 4,
        nbChambres: 2,
        etage: 0,
        adresse: "15 Rue de Paris",
        codePostal: "93100",
        ville: "Montreuil",
        disponible: true,
        enVedette: true,
        dpe: "C",
        anneeConstruction: 1950,
        parking: true,
        commissionPartenaire: 2.0,
      },
    }),
    prisma.bien.create({
      data: {
        titre: "T4 standing - Vue Tour Eiffel",
        description: "Appartement d'exception au 8ème étage avec vue imprenable sur la Tour Eiffel. 4 pièces luxueusement agencées, terrasse de 15m², 2 places de parking, cave. Résidence de standing avec gardien, piscine et salle de sport.",
        type: "APPARTEMENT",
        transaction: "VENTE",
        prix: 1850000,
        surface: 110,
        nbPieces: 4,
        nbChambres: 3,
        etage: 8,
        adresse: "2 Avenue de Suffren",
        codePostal: "75007",
        ville: "Paris",
        disponible: true,
        enVedette: true,
        dpe: "A",
        anneeConstruction: 2018,
        parking: true,
        terrasse: true,
        ascenseur: true,
        gardien: true,
        piscine: true,
        cave: true,
        chargesmensuelles: 800,
        commissionPartenaire: 2.5,
      },
    }),
    prisma.bien.create({
      data: {
        titre: "Local commercial - Marais",
        description: "Local commercial de 85m² en rez-de-chaussée avec grande vitrine sur rue passante. Idéal boutique, restauration ou bureau. Bon état général, WC, point d'eau.",
        type: "COMMERCE",
        transaction: "LOCATION",
        prix: 3500,
        surface: 85,
        nbPieces: 2,
        nbChambres: 0,
        etage: 0,
        adresse: "28 Rue des Francs-Bourgeois",
        codePostal: "75003",
        ville: "Paris",
        disponible: true,
        enVedette: false,
        dpe: "E",
        commissionPartenaire: 1.5,
      },
    }),
    prisma.bien.create({
      data: {
        titre: "T2 rénové - Lyon 6ème",
        description: "Bel appartement T2 entièrement rénové dans le 6ème arrondissement de Lyon. Séjour lumineux, chambre avec placards, cuisine équipée neuve, salle de bain avec douche italienne. Proximité Parc de la Tête d'Or.",
        type: "APPARTEMENT",
        transaction: "VENTE",
        prix: 295000,
        surface: 48,
        nbPieces: 2,
        nbChambres: 1,
        etage: 3,
        adresse: "14 Rue Duquesne",
        codePostal: "69006",
        ville: "Lyon",
        disponible: true,
        enVedette: true,
        dpe: "C",
        anneeConstruction: 1965,
        ascenseur: true,
        cave: true,
        chargesmensuelles: 180,
        commissionPartenaire: 2.0,
      },
    }),
    prisma.bien.create({
      data: {
        titre: "Bureau open-space - La Défense",
        description: "Plateau de bureaux de 200m² en open-space dans tour de La Défense. Climatisation, faux plancher, câblage informatique. Accès transports en commun direct.",
        type: "BUREAU",
        transaction: "LOCATION",
        prix: 8000,
        surface: 200,
        nbPieces: 1,
        nbChambres: 0,
        etage: 15,
        adresse: "1 Place de La Défense",
        codePostal: "92800",
        ville: "Puteaux",
        disponible: true,
        enVedette: false,
        dpe: "B",
        ascenseur: true,
        parking: true,
        commissionPartenaire: 1.0,
      },
    }),
  ]);

  // Photos pour chaque bien
  const bienPhotos: string[][] = [
    [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1630699144867-37acec97df5a?w=800&h=600&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=600&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1616137466211-f736a1f58b8f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=800&h=600&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=800&h=600&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600573472591-ee6981cf81d6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=600&fit=crop",
    ],
    [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&h=600&fit=crop",
    ],
  ];

  for (let b = 0; b < biens.length; b++) {
    const photos = bienPhotos[b] || [];
    for (let p = 0; p < photos.length; p++) {
      await prisma.photo.create({
        data: {
          url: photos[p],
          alt: biens[b].titre,
          ordre: p,
          bienId: biens[b].id,
        },
      });
    }
  }

  // Documents pour quelques biens
  await prisma.document.create({
    data: {
      nom: "Diagnostic DPE - T3 Paris.pdf",
      type: "DIAGNOSTIC",
      url: "/uploads/documents/dpe-t3-paris-demo.pdf",
      taille: 450000,
      userId: admin.id,
      bienId: biens[0].id,
    },
  });
  await prisma.document.create({
    data: {
      nom: "Mandat exclusif - T3 Paris.pdf",
      type: "MANDAT",
      url: "/uploads/documents/mandat-t3-paris-demo.pdf",
      taille: 320000,
      userId: admin.id,
      bienId: biens[0].id,
    },
  });
  await prisma.document.create({
    data: {
      nom: "Diagnostic amiante - Maison Boulogne.pdf",
      type: "DIAGNOSTIC",
      url: "/uploads/documents/amiante-maison-demo.pdf",
      taille: 280000,
      userId: admin.id,
      bienId: biens[2].id,
    },
  });
  await prisma.document.create({
    data: {
      nom: "Bail type - Studio Quartier Latin.pdf",
      type: "BAIL",
      url: "/uploads/documents/bail-studio-demo.pdf",
      taille: 520000,
      userId: admin.id,
      bienId: biens[1].id,
    },
  });

  console.log(`Created ${biens.length} biens with photos and documents`);

  // Créer des programmes neufs avec commissions
  const programme1 = await prisma.programme.create({
    data: {
      nom: "Résidence Les Jardins de Confluence",
      description: "Au cœur du quartier de la Confluence à Lyon, cette résidence d'exception propose des appartements du T1 au T4, conçus avec des matériaux nobles et des prestations haut de gamme. Balcons et terrasses végétalisés, vue sur la Saône, parking souterrain sécurisé. Certification RE2020, panneaux solaires, espaces verts partagés.",
      promoteur: "Bouygues Immobilier",
      adresse: "25 Quai Perrache",
      codePostal: "69002",
      ville: "Lyon",
      datelivraison: "T4 2027",
      statut: "EN_COMMERCIALISATION",
      nbLotsTotal: 48,
      prixMin: 195000,
      prixMax: 520000,
      surfaceMin: 28,
      surfaceMax: 95,
      normeRT: "RE2020",
      parking: true,
      terrasse: true,
      balcon: true,
      piscine: false,
      jardin: true,
      enVedette: true,
      commissionPartenaire: 3.0,
    },
  });

  const photosProg1 = [
    { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop", alt: "Résidence Confluence - Vue extérieure", type: "PERSPECTIVE" },
    { url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop", alt: "Appartement témoin - Séjour", type: "PHOTO" },
    { url: "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800&h=600&fit=crop", alt: "Cuisine équipée", type: "PHOTO" },
    { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop", alt: "Chambre parentale", type: "PHOTO" },
    { url: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop", alt: "Terrasse avec vue", type: "PHOTO" },
  ];
  for (let i = 0; i < photosProg1.length; i++) {
    await prisma.photoProgramme.create({
      data: { ...photosProg1[i], ordre: i, programmeId: programme1.id },
    });
  }

  await prisma.documentProgramme.createMany({
    data: [
      { nom: "Plaquette commerciale - Jardins de Confluence.pdf", type: "PLAQUETTE", url: "/uploads/documents/plaquette-confluence-demo.pdf", taille: 2500000, public: true, programmeId: programme1.id },
      { nom: "Grille de prix - Jardins de Confluence.pdf", type: "GRILLE_PRIX", url: "/uploads/documents/grille-prix-confluence-demo.pdf", taille: 850000, public: true, programmeId: programme1.id },
      { nom: "Notice descriptive.pdf", type: "NOTICE_DESCRIPTIVE", url: "/uploads/documents/notice-confluence-demo.pdf", taille: 1200000, public: true, programmeId: programme1.id },
      { nom: "Plans des lots T2.pdf", type: "PLAN", url: "/uploads/documents/plans-t2-confluence-demo.pdf", taille: 1800000, public: true, programmeId: programme1.id },
      { nom: "Plans des lots T3-T4.pdf", type: "PLAN", url: "/uploads/documents/plans-t3t4-confluence-demo.pdf", taille: 2200000, public: true, programmeId: programme1.id },
    ],
  });

  const lots1 = [
    { numero: "A101", type: "T1", surface: 28, etage: 0, orientation: "SUD", prix: 195000, nbChambres: 0, balcon: 5.0, parking: true, statut: "VENDU" },
    { numero: "A102", type: "T2", surface: 42, etage: 0, orientation: "SUD-OUEST", prix: 265000, nbChambres: 1, jardin: 15.0, parking: true, statut: "DISPONIBLE" },
    { numero: "A201", type: "T2", surface: 45, etage: 1, orientation: "SUD", prix: 285000, nbChambres: 1, balcon: 8.0, parking: true, statut: "DISPONIBLE" },
    { numero: "A202", type: "T3", surface: 65, etage: 1, orientation: "SUD-EST", prix: 365000, nbChambres: 2, balcon: 10.0, parking: true, statut: "OPTION" },
    { numero: "A301", type: "T3", surface: 68, etage: 2, orientation: "SUD", prix: 385000, nbChambres: 2, terrasse: 12.0, parking: true, statut: "DISPONIBLE" },
    { numero: "A302", type: "T4", surface: 85, etage: 2, orientation: "OUEST", prix: 445000, nbChambres: 3, terrasse: 15.0, parking: true, statut: "DISPONIBLE" },
    { numero: "A401", type: "T4", surface: 92, etage: 3, orientation: "SUD-OUEST", prix: 490000, nbChambres: 3, terrasse: 20.0, parking: true, statut: "RESERVE" },
    { numero: "A402", type: "T4", surface: 95, etage: 3, orientation: "SUD", prix: 520000, nbChambres: 3, terrasse: 25.0, parking: true, statut: "DISPONIBLE" },
  ];

  for (const lot of lots1) {
    await prisma.lot.create({
      data: {
        ...lot,
        terrasse: lot.terrasse || null,
        balcon: lot.balcon || null,
        jardin: lot.jardin || null,
        programmeId: programme1.id,
      },
    });
  }

  const programme2 = await prisma.programme.create({
    data: {
      nom: "Le Clos Saint-Irénée",
      description: "Nichée sur les hauteurs du 5ème arrondissement de Lyon, cette résidence intimiste de 24 lots offre une vue panoramique sur la ville. Architecture contemporaine intégrée dans un écrin de verdure, avec des appartements traversants du T2 au T5. Proche du Vieux Lyon et des transports.",
      promoteur: "Nexity",
      adresse: "12 Montée de Choulans",
      codePostal: "69005",
      ville: "Lyon",
      datelivraison: "T2 2028",
      statut: "BIENTOT",
      nbLotsTotal: 24,
      prixMin: 230000,
      prixMax: 680000,
      surfaceMin: 38,
      surfaceMax: 115,
      normeRT: "RE2020",
      parking: true,
      terrasse: true,
      balcon: true,
      piscine: false,
      jardin: true,
      enVedette: false,
      commissionPartenaire: 2.5,
    },
  });

  const photosProg2 = [
    { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop", alt: "Le Clos Saint-Irénée - Façade", type: "PERSPECTIVE" },
    { url: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&h=600&fit=crop", alt: "Salon lumineux", type: "PHOTO" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop", alt: "Vue panoramique Lyon", type: "PHOTO" },
    { url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop", alt: "Salle de bain design", type: "PHOTO" },
  ];
  for (let i = 0; i < photosProg2.length; i++) {
    await prisma.photoProgramme.create({
      data: { ...photosProg2[i], ordre: i, programmeId: programme2.id },
    });
  }

  await prisma.documentProgramme.createMany({
    data: [
      { nom: "Plaquette commerciale - Le Clos Saint-Irénée.pdf", type: "PLAQUETTE", url: "/uploads/documents/plaquette-clos-demo.pdf", taille: 1800000, public: true, programmeId: programme2.id },
      { nom: "Plan masse.pdf", type: "PLAN", url: "/uploads/documents/plan-masse-clos-demo.pdf", taille: 950000, public: true, programmeId: programme2.id },
      { nom: "Grille de prix - Clos Saint-Irénée.pdf", type: "GRILLE_PRIX", url: "/uploads/documents/grille-prix-clos-demo.pdf", taille: 720000, public: true, programmeId: programme2.id },
    ],
  });

  const lots2 = [
    { numero: "B101", type: "T2", surface: 38, etage: 0, orientation: "EST", prix: 230000, nbChambres: 1, jardin: 25.0, parking: true, statut: "DISPONIBLE" },
    { numero: "B201", type: "T3", surface: 62, etage: 1, orientation: "SUD", prix: 355000, nbChambres: 2, balcon: 8.0, parking: true, statut: "DISPONIBLE" },
    { numero: "B301", type: "T4", surface: 82, etage: 2, orientation: "SUD-OUEST", prix: 465000, nbChambres: 3, terrasse: 14.0, parking: true, statut: "DISPONIBLE" },
    { numero: "B401", type: "T5", surface: 115, etage: 3, orientation: "SUD", prix: 680000, nbChambres: 4, terrasse: 30.0, parking: true, statut: "DISPONIBLE" },
  ];

  for (const lot of lots2) {
    await prisma.lot.create({
      data: {
        ...lot,
        terrasse: lot.terrasse || null,
        balcon: lot.balcon || null,
        jardin: lot.jardin || null,
        programmeId: programme2.id,
      },
    });
  }

  // Créer une option de test pour le partenaire
  const lotOption = await prisma.lot.findFirst({ where: { numero: "A202" } });
  if (lotOption) {
    await prisma.optionLot.create({
      data: {
        statut: "EN_COURS",
        message: "Client très intéressé, financement en cours de validation",
        dateExpiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
        lotId: lotOption.id,
        userId: partenaire.id,
      },
    });
  }

  console.log(`Created 2 programmes with lots and documents`);
  console.log(`Admin: admin@immelio.fr / admin123`);
  console.log(`Partenaire: partenaire@exemple.fr / partner123`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
