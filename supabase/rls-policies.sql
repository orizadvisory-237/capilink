-- ============================================
-- ACTIVATION RLS SUR TOUTES LES TABLES
-- ============================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Projet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScoreDetail" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentProjet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContactInvestisseur" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JournalSecurite" ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TABLE User
-- ============================================

-- Un utilisateur peut lire uniquement son propre profil
CREATE POLICY "user_read_own" ON "User"
  FOR SELECT USING (auth.uid()::text = id);

-- Un admin peut lire tous les utilisateurs
CREATE POLICY "admin_read_all_users" ON "User"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" u
      WHERE u.id = auth.uid()::text AND u.role IN ('ADMIN', 'ANALYSTE')
    )
  );

-- Un utilisateur peut mettre à jour uniquement son propre profil
CREATE POLICY "user_update_own" ON "User"
  FOR UPDATE USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- ============================================
-- TABLE Projet
-- ============================================

-- Les porteurs ne voient que leurs propres projets
CREATE POLICY "porteur_read_own_projets" ON "Projet"
  FOR SELECT USING (
    "porteurId" = auth.uid()::text
    OR published = true  -- Les projets publiés sont visibles par tous
    OR EXISTS (
      SELECT 1 FROM "User" u
      WHERE u.id = auth.uid()::text AND u.role IN ('ADMIN', 'ANALYSTE')
    )
  );

-- Seuls les porteurs peuvent créer leurs projets
CREATE POLICY "porteur_insert_projet" ON "Projet"
  FOR INSERT WITH CHECK (
    "porteurId" = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM "User" u
      WHERE u.id = auth.uid()::text AND u.role = 'PORTEUR'
    )
  );

-- Seuls les admins/analystes peuvent modifier les projets
CREATE POLICY "admin_update_projet" ON "Projet"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "User" u
      WHERE u.id = auth.uid()::text AND u.role IN ('ADMIN', 'ANALYSTE')
    )
  );

-- ============================================
-- TABLE ScoreDetail
-- ============================================

-- Le porteur peut lire son propre scoring (pas les justifications internes)
-- Les admins/analystes voient tout
CREATE POLICY "scoring_read_policy" ON "ScoreDetail"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Projet" p
      WHERE p.id = "projetId"
        AND (
          p."porteurId" = auth.uid()::text  -- Porteur propriétaire
          OR EXISTS (
            SELECT 1 FROM "User" u
            WHERE u.id = auth.uid()::text AND u.role IN ('ADMIN', 'ANALYSTE')
          )
        )
    )
  );

-- Seuls les admins/analystes peuvent créer/modifier les scorings
CREATE POLICY "scoring_write_policy" ON "ScoreDetail"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "User" u
      WHERE u.id = auth.uid()::text AND u.role IN ('ADMIN', 'ANALYSTE')
    )
  );

-- ============================================
-- TABLE DocumentProjet
-- ============================================

-- Le porteur voit ses propres documents ; admins/analystes voient tout
CREATE POLICY "document_read_policy" ON "DocumentProjet"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Projet" p
      WHERE p.id = "projetId"
        AND (
          p."porteurId" = auth.uid()::text
          OR EXISTS (
            SELECT 1 FROM "User" u
            WHERE u.id = auth.uid()::text AND u.role IN ('ADMIN', 'ANALYSTE')
          )
        )
    )
  );

-- ============================================
-- STORAGE — Bucket capilink-documents
-- ============================================

-- Politique de lecture : porteur propriétaire ou admin/analyste
CREATE POLICY "storage_read_policy" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'capilink-documents'
    AND (
      -- Path format : documents-projets/{projetId}/{filename}
      -- Vérifier que le projetId appartient à l'utilisateur
      EXISTS (
        SELECT 1 FROM "Projet" p
        WHERE p.id = split_part(name, '/', 2)
          AND (
            p."porteurId" = auth.uid()::text
            OR EXISTS (
              SELECT 1 FROM "User" u
              WHERE u.id = auth.uid()::text AND u.role IN ('ADMIN', 'ANALYSTE')
            )
          )
      )
    )
  );

-- Politique d'upload : porteur authentifié uniquement
CREATE POLICY "storage_insert_policy" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'capilink-documents'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM "User" u
      WHERE u.id = auth.uid()::text AND u.role = 'PORTEUR'
    )
  );

-- Suppression : porteur propriétaire ou admin
CREATE POLICY "storage_delete_policy" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'capilink-documents'
    AND EXISTS (
      SELECT 1 FROM "Projet" p
      WHERE p.id = split_part(name, '/', 2)
        AND (
          p."porteurId" = auth.uid()::text
          OR EXISTS (
            SELECT 1 FROM "User" u
            WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
          )
        )
    )
  );
