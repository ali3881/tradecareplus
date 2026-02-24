-- Add sort order for admin drag-drop arrangement
ALTER TABLE "Package" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill a sensible initial order for known seeded package titles
UPDATE "Package"
SET "sortOrder" = CASE UPPER("title")
  WHEN 'BASIC' THEN 1
  WHEN 'STANDARD' THEN 2
  WHEN 'PREMIUM' THEN 3
  ELSE "sortOrder"
END;
