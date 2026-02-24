-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "duration" TEXT NOT NULL,
    "featuresJson" TEXT NOT NULL,
    "isMostPopular" BOOLEAN NOT NULL DEFAULT false,
    "stripePriceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Seed defaults
INSERT INTO "Package" ("id", "title", "description", "price", "currency", "duration", "featuresJson", "isMostPopular", "stripePriceId", "isActive", "createdAt", "updatedAt") VALUES
  ('pkg_basic', 'BASIC', 'Digital protection plan', 25, 'USD', '1 month', '["Unlimited plumbing questions (chat + photos)","DIY guidance & safety checks","Annual plumbing health checklist","25% off all jobs","Priority booking","Monthly Property Care Visits","Fair use: Advice only, no physical work included"]', 0, NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pkg_standard', 'STANDARD', 'Maintenance plan', 59, 'USD', '1 month', '["Everything in Basic","10 included minor maintenance visits / year","Leaking taps & toilets","Minor blocked drains on call 24/7","No call‑out fee","15% off additional work"]', 1, NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pkg_premium', 'PREMIUM', 'Total peace‑of‑mind', 89, 'USD', '1 month', '["Everything in Standard","Every 3 months CCTV drain inspection and Jet blast","Hot water system inspection","Emergency priority response","20% off hot water replacements","25% off all property care","Fixed pricing on common jobs"]', 0, NULL, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
