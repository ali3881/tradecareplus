-- CreateTable
CREATE TABLE "ServiceType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_title_key" ON "ServiceType"("title");

-- Seed defaults from previously hardcoded values
INSERT INTO "ServiceType" ("id", "title", "createdAt", "updatedAt") VALUES
  ('st_leaking_tap', 'Leaking Tap', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('st_toilet_issue', 'Toilet Issue', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('st_minor_blockage', 'Minor Blockage', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('st_hot_water_system', 'Hot Water System', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('st_general_maintenance', 'General Maintenance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('st_other', 'Other', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
