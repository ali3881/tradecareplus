import { prisma } from "@/lib/prisma";

export const HIRE_ITEM_TYPE = "HIRE";
export const SALE_ITEM_TYPE = "SALE";

export const PRICING_MODELS = {
  PER_DAY: "PER_DAY",
  PER_WEEK: "PER_WEEK",
  PER_METER_PER_WEEK: "PER_METER_PER_WEEK",
  FIXED: "FIXED",
} as const;

export const catalogCategoriesSettingKey = "catalog_item_categories";

export function slugifyCatalogName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
}

export function endOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);
}

export function calculateHireUnits({
  pricingModel,
  startDate,
  endDate,
  quantity,
}: {
  pricingModel: string;
  startDate: Date;
  endDate: Date;
  quantity: number;
}) {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);
  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  if (pricingModel === PRICING_MODELS.PER_WEEK || pricingModel === PRICING_MODELS.PER_METER_PER_WEEK) {
    return Math.max(1, Math.ceil(days / 7)) * Math.max(1, quantity);
  }

  if (pricingModel === PRICING_MODELS.FIXED) {
    return Math.max(1, quantity);
  }

  return days * Math.max(1, quantity);
}

export function calculateHireTotal({
  pricingModel,
  price,
  startDate,
  endDate,
  quantity,
}: {
  pricingModel: string;
  price: number;
  startDate: Date;
  endDate: Date;
  quantity: number;
}) {
  const billableUnits = calculateHireUnits({ pricingModel, startDate, endDate, quantity });
  return {
    billableUnits,
    totalPrice: Number((billableUnits * price).toFixed(2)),
  };
}

export async function getBookedQuantityForRange({
  itemId,
  startDate,
  endDate,
}: {
  itemId: string;
  startDate: Date;
  endDate: Date;
}) {
  const now = new Date();
  const bookings = await prisma.hireBooking.findMany({
    where: {
      itemId,
      OR: [
        { status: "PAID" },
        {
          status: "PENDING_PAYMENT",
          checkoutExpiresAt: { gt: now },
        },
      ],
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    },
    select: {
      quantity: true,
    },
  });

  return bookings.reduce((sum: number, booking: { quantity: number }) => sum + booking.quantity, 0);
}

export async function getAvailabilityForRange({
  itemId,
  quantityAvailable,
  startDate,
  endDate,
}: {
  itemId: string;
  quantityAvailable: number;
  startDate: Date;
  endDate: Date;
}) {
  const bookedQuantity = await getBookedQuantityForRange({ itemId, startDate, endDate });
  const remaining = Math.max(0, quantityAvailable - bookedQuantity);

  return {
    bookedQuantity,
    remaining,
    isAvailable: remaining > 0,
  };
}

export function formatCatalogPrice(item: {
  itemType: string;
  price: number;
  pricingModel: string;
  unitLabel: string | null;
  quantityAvailable: number;
}) {
  const amount = new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 2,
  }).format(item.price);

  if (item.itemType === SALE_ITEM_TYPE) {
    return amount;
  }

  if (item.pricingModel === PRICING_MODELS.PER_METER_PER_WEEK) {
    return `${amount} per meter / week`;
  }

  if (item.pricingModel === PRICING_MODELS.PER_WEEK) {
    return `${amount} per week`;
  }

  if (item.pricingModel === PRICING_MODELS.PER_DAY) {
    return `${amount} per day`;
  }

  return item.unitLabel ? `${amount} per ${item.unitLabel}` : amount;
}

export function stripCatalogHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeCatalogHtml(input: string) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "")
    .replace(/\sstyle='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}
