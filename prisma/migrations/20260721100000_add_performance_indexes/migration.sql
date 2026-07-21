-- Performance indexes for scale
-- Added in V2 — these indexes cover the most frequent query patterns:
-- role filter, statut filter, enVedette filter, createdAt sort, message inbox

CREATE INDEX "User_role_idx" ON "User"("role");

CREATE INDEX "Bien_statut_idx" ON "Bien"("statut");
CREATE INDEX "Bien_enVedette_idx" ON "Bien"("enVedette");
CREATE INDEX "Bien_createdAt_idx" ON "Bien"("createdAt" DESC);

CREATE INDEX "Message_destinataireId_lu_idx" ON "Message"("destinataireId", "lu");
CREATE INDEX "Message_expediteurId_idx" ON "Message"("expediteurId");
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt" DESC);

CREATE INDEX "Lead_statut_idx" ON "Lead"("statut");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt" DESC);

CREATE INDEX "Lot_programmeId_statut_idx" ON "Lot"("programmeId", "statut");

CREATE INDEX "Dossier_contactId_idx" ON "Dossier"("contactId");
CREATE INDEX "Dossier_statut_idx" ON "Dossier"("statut");
CREATE INDEX "Dossier_type_statut_idx" ON "Dossier"("type", "statut");

CREATE INDEX "Contact_email_idx" ON "Contact"("email");
