-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "scoringActif" BOOLEAN NOT NULL DEFAULT true,
    "projetsGratuits" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- Insert default row
INSERT INTO "SiteSettings" ("id", "scoringActif", "projetsGratuits", "updatedAt")
VALUES ('default', true, false, NOW())
ON CONFLICT ("id") DO NOTHING;
