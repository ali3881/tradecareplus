/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `FileAsset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'STRING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ServiceRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "locationText" TEXT,
    "preferredContactMethod" TEXT NOT NULL DEFAULT 'CALL',
    "photosJson" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'NORMAL',
    "afterHours" BOOLEAN NOT NULL DEFAULT false,
    "eligibilityStatus" TEXT NOT NULL,
    "discountPercent" REAL NOT NULL DEFAULT 0,
    "includedReason" TEXT,
    "quoteReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notesJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "assignedToId" TEXT,
    CONSTRAINT "ServiceRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServiceRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ServiceRequest" ("afterHours", "createdAt", "description", "discountPercent", "eligibilityStatus", "id", "includedReason", "locationText", "notesJson", "photosJson", "preferredContactMethod", "quoteReason", "status", "type", "updatedAt", "urgency", "userId") SELECT "afterHours", "createdAt", "description", "discountPercent", "eligibilityStatus", "id", "includedReason", "locationText", "notesJson", "photosJson", "preferredContactMethod", "quoteReason", "status", "type", "updatedAt", "urgency", "userId" FROM "ServiceRequest";
DROP TABLE "ServiceRequest";
ALTER TABLE "new_ServiceRequest" RENAME TO "ServiceRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "FileAsset_key_key" ON "FileAsset"("key");
