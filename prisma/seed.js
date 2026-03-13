const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const USERS = [
  {
    name: "System Admin",
    email: "admin@tradecareplus.com",
    role: "ADMIN",
  },
  {
    name: "ali",
    email: "rabie_@man.com",
    role: "STAFF",
  },
  {
    name: "tayyab2",
    email: "tayyab2@mail.com",
    role: "USER",
  },
  {
    name: "tayyab",
    email: "tayyab@mail.com",
    role: "USER",
  },
];

const PACKAGES = [
  {
    id: "pkg_basic",
    title: "BASIC",
    description: "Digital protection plan",
    price: 25,
    currency: "AUD",
    duration: "1 month",
    features: [
      "Unlimited plumbing questions (chat + photos)",
      "DIY guidance & safety checks",
      "Annual plumbing health checklist",
      "25% off all jobs",
      "Priority booking",
      "Monthly Property Care Visits",
      "Fair use: Advice only, no physical work included",
    ],
    isMostPopular: false,
    sortOrder: 1,
  },
  {
    id: "pkg_standard",
    title: "STANDARD",
    description: "Maintenance plan",
    price: 59,
    currency: "AUD",
    duration: "1 month",
    features: [
      "Everything in Basic",
      "10 included minor maintenance visits / year",
      "Leaking taps & toilets",
      "Minor blocked drains on call 24/7",
      "No call-out fee",
      "15% off additional work",
    ],
    isMostPopular: true,
    sortOrder: 2,
  },
  {
    id: "pkg_premium",
    title: "PREMIUM",
    description: "Total peace-of-mind",
    price: 89,
    currency: "AUD",
    duration: "1 month",
    features: [
      "Everything in Standard",
      "Every 3 months CCTV drain inspection and Jet blast",
      "Hot water system inspection",
      "Emergency priority response",
      "20% off hot water replacements",
      "25% off all property care",
      "Fixed pricing on common jobs",
    ],
    isMostPopular: false,
    sortOrder: 3,
  },
];

async function seedUsers(passwordHash) {
  for (const user of USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash,
        isActive: true,
      },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash,
        isActive: true,
      },
    });
  }
}

async function seedPackages() {
  for (const pkg of PACKAGES) {
    await prisma.subscriptionPackage.upsert({
      where: { id: pkg.id },
      update: {
        title: pkg.title,
        description: pkg.description,
        price: pkg.price,
        currency: pkg.currency,
        duration: pkg.duration,
        featuresJson: JSON.stringify(pkg.features),
        isMostPopular: pkg.isMostPopular,
        isActive: true,
        sortOrder: pkg.sortOrder,
      },
      create: {
        id: pkg.id,
        title: pkg.title,
        description: pkg.description,
        price: pkg.price,
        currency: pkg.currency,
        duration: pkg.duration,
        featuresJson: JSON.stringify(pkg.features),
        isMostPopular: pkg.isMostPopular,
        isActive: true,
        sortOrder: pkg.sortOrder,
      },
    });
  }
}

async function seedBasicAccessForTayyab() {
  const user = await prisma.user.findUnique({
    where: { email: "tayyab@mail.com" },
    select: { id: true },
  });

  if (!user) {
    return;
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      plan: "BASIC",
      status: "ACTIVE",
      stripeCustomerId: `seed_cus_${user.id}`,
      stripeSubscriptionId: `seed_sub_basic_${user.id}`,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
    create: {
      userId: user.id,
      plan: "BASIC",
      status: "ACTIVE",
      stripeCustomerId: `seed_cus_${user.id}`,
      stripeSubscriptionId: `seed_sub_basic_${user.id}`,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  await prisma.entitlement.upsert({
    where: { userId: user.id },
    update: {
      year: now.getFullYear(),
      includedVisitsRemaining: 0,
      cctvDueAt: null,
      jetBlastDueAt: null,
      hotWaterInspectionDueAt: null,
      lastChecklistSentAt: null,
    },
    create: {
      userId: user.id,
      year: now.getFullYear(),
      includedVisitsRemaining: 0,
      cctvDueAt: null,
      jetBlastDueAt: null,
      hotWaterInspectionDueAt: null,
      lastChecklistSentAt: null,
    },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  await seedUsers(passwordHash);
  await seedPackages();
  await seedBasicAccessForTayyab();

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
