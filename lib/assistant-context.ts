import { prisma } from "@/lib/prisma";
import { serviceExcerpt } from "@/lib/services";

const aboutSummary = `
TradeCarePlus provides reliable property maintenance and trade services for residential, commercial, and strata properties.
The company focuses on fast response times, quality workmanship, honest communication, reliable service, and long-term solutions.
TradeCarePlus supports homeowners, property managers, real estate agencies, strata managers, commercial property owners, builders, and developers.
Core strengths include experienced trade professionals, multiple services under one provider, residential and commercial solutions, and customer-focused support.
`.trim();

const GREETING_REGEX =
  /^(hi|hello|hey|hey there|good morning|good afternoon|good evening|salam|assalamualaikum|aoa)$/i;

const SHORT_CAPABILITY_REGEX =
  /^(what can you do|what can you do for me|how can you help|how you can help|what do you do)$/i;

const JOB_REGEX = /\b(job|jobs|service request|service requests|status|current job|progress|renovation|plumbing|electrical)\b/i;
const SERVICE_JOB_REGEX = /\b(job|jobs|service job|service jobs|service request|service requests|submitted job|submitted jobs|current job|current jobs|progress|status|renovation|plumbing|electrical)\b/i;
const HIRE_BOOKING_REGEX = /\b(hire booking|hire bookings|booking|bookings|rental booking|rental bookings|rent item|hire item)\b/i;
const SALE_ENQUIRY_REGEX = /\b(sale enquiry|sale enquiries|inquiry|inquiries|enquiry|enquiries|sales enquiry|sales enquiries)\b/i;
const PACKAGE_REGEX = /\b(package|packages|plan|plans|subscription|membership|price|pricing)\b/i;
const PROJECT_REGEX = /\b(project|projects|portfolio|work example|work examples|case study|case studies)\b/i;
const CATALOG_REGEX = /\b(hire|sale|sales|rental|rent|book|booking|machine|fence|toilet)\b/i;
const SERVICE_REGEX = /\b(service|services|repair|maintenance|trade|plumbing|electrical|renovation)\b/i;
const ACCOUNT_REGEX = /\b(account|profile|visits|entitlement|included visits)\b/i;

type AssistantContextInput = {
  userId?: string;
  lastMessage: string;
};

export function getInstantReply(message: string) {
  const text = message.trim().replace(/\s+/g, " ").toLowerCase();

  if (GREETING_REGEX.test(text)) {
    return "Hi! How can I help today?";
  }

  if (SHORT_CAPABILITY_REGEX.test(text)) {
    return "I can help with service questions, bookings, packages, sales and hire, and job-related support. What do you need help with?";
  }

  return null;
}

function extractSearchTerms(message: string) {
  const words = message
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3);

  return Array.from(new Set(words)).slice(0, 8);
}

function shouldFetchServices(message: string) {
  return SERVICE_REGEX.test(message) || PROJECT_REGEX.test(message);
}

function shouldFetchProjects(message: string) {
  return PROJECT_REGEX.test(message);
}

function shouldFetchPackages(message: string) {
  return PACKAGE_REGEX.test(message);
}

function shouldFetchCatalog(message: string) {
  return CATALOG_REGEX.test(message);
}

function shouldFetchUserContext(message: string) {
  return JOB_REGEX.test(message) || ACCOUNT_REGEX.test(message) || CATALOG_REGEX.test(message) || PACKAGE_REGEX.test(message);
}

function wantsServiceJobs(message: string) {
  return SERVICE_JOB_REGEX.test(message) || (JOB_REGEX.test(message) && !HIRE_BOOKING_REGEX.test(message) && !SALE_ENQUIRY_REGEX.test(message));
}

function wantsHireBookings(message: string) {
  return HIRE_BOOKING_REGEX.test(message);
}

function wantsSaleEnquiries(message: string) {
  return SALE_ENQUIRY_REGEX.test(message);
}

async function fetchRelevantServices(message: string) {
  const terms = extractSearchTerms(message);
  const services = await prisma.service.findMany({
    where: terms.length
      ? {
          OR: terms.flatMap((term) => [
            { title: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
          ]),
        }
      : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      title: true,
      description: true,
    },
    take: 8,
  });

  if (!services.length) {
    return "- No directly relevant service details found.";
  }

  return services
    .map((service) => `- ${service.title}: ${serviceExcerpt(service.description, 180)}`)
    .join("\n");
}

async function fetchRelevantProjects(message: string) {
  const terms = extractSearchTerms(message);
  const projects = await prisma.project.findMany({
    where: terms.length
      ? {
          OR: terms.flatMap((term) => [
            { title: { contains: term, mode: "insensitive" } },
            { description: { contains: term, mode: "insensitive" } },
            { service: { title: { contains: term, mode: "insensitive" } } },
          ]),
        }
      : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      title: true,
      description: true,
      service: {
        select: {
          title: true,
        },
      },
    },
    take: 6,
  });

  if (!projects.length) {
    return "- No directly relevant project details found.";
  }

  return projects
    .map((project) => `- ${project.title} (${project.service.title}): ${serviceExcerpt(project.description, 160)}`)
    .join("\n");
}

async function fetchRelevantPackages(message: string) {
  const terms = extractSearchTerms(message);
  const packages = await prisma.subscriptionPackage.findMany({
    where: {
      isActive: true,
      ...(terms.length
        ? {
            OR: terms.flatMap((term) => [
              { title: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
            ]),
          }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      title: true,
      description: true,
      price: true,
      currency: true,
      duration: true,
    },
    take: 6,
  });

  if (!packages.length) {
    return "- No directly relevant package details found.";
  }

  return packages
    .map((pkg) => `- ${pkg.title}: ${pkg.currency} ${pkg.price} / ${pkg.duration} — ${serviceExcerpt(pkg.description, 140)}`)
    .join("\n");
}

async function fetchRelevantCatalog(message: string) {
  const terms = extractSearchTerms(message);
  const items = await prisma.catalogItem.findMany({
    where: {
      isActive: true,
      ...(terms.length
        ? {
            OR: terms.flatMap((term) => [
              { name: { contains: term, mode: "insensitive" } },
              { category: { contains: term, mode: "insensitive" } },
              { shortDescription: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
            ]),
          }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      name: true,
      category: true,
      itemType: true,
      pricingModel: true,
      price: true,
      shortDescription: true,
      unitLabel: true,
      minHireDays: true,
      quantityAvailable: true,
    },
    take: 8,
  });

  if (!items.length) {
    return "- No directly relevant Sales and Hire items found.";
  }

  return items
    .map((item) => {
      const pricing =
        item.itemType === "SALE"
          ? `AUD ${item.price}`
          : `AUD ${item.price} per ${item.pricingModel.replaceAll("_", " ").toLowerCase()}`;

      return `- ${item.name} [${item.itemType}] in ${item.category}: ${item.shortDescription || "No short description."} Pricing: ${pricing}. Stock: ${item.quantityAvailable}. Minimum hire days: ${item.minHireDays}.`;
    })
    .join("\n");
}

async function fetchRelevantUserContext(userId: string, message: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      entitlement: true,
    },
  });

  if (!user) {
    return "Logged-in user record was not found.";
  }

  const terms = extractSearchTerms(message);

  const shouldIncludeJobs = wantsServiceJobs(message);
  const shouldIncludeHireBookings = wantsHireBookings(message);
  const shouldIncludeSaleEnquiries = wantsSaleEnquiries(message);

  const [jobs, recentHireBookings, recentSaleInquiries] = await Promise.all([
    shouldIncludeJobs
      ? prisma.serviceRequest.findMany({
          where: {
            userId,
            ...(terms.length
              ? {
                  OR: terms.flatMap((term) => [
                    { type: { contains: term, mode: "insensitive" } },
                    { description: { contains: term, mode: "insensitive" } },
                    { status: { contains: term, mode: "insensitive" } },
                  ]),
                }
              : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: {
            id: true,
            type: true,
            status: true,
            urgency: true,
            createdAt: true,
          },
        })
      : Promise.resolve([]),
    shouldIncludeHireBookings
      ? prisma.hireBooking.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 4,
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            item: {
              select: {
                name: true,
              },
            },
          },
        })
      : Promise.resolve([]),
    shouldIncludeSaleEnquiries
      ? prisma.saleInquiry.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 4,
          select: {
            id: true,
            status: true,
            createdAt: true,
            item: {
              select: {
                name: true,
              },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const sections = [
    `- Name: ${user.name || "Unknown"}`,
    `- Email: ${user.email || "Unknown"}`,
    `- Phone: ${user.phone || "Not provided"}`,
    `- Role: ${user.role || "Unknown"}`,
    `- Subscription status: ${user.subscription?.status || "None"}`,
    `- Subscription plan: ${user.subscription?.plan || "None"}`,
    `- Included visits remaining: ${user.entitlement?.includedVisitsRemaining ?? 0}`,
  ];

  if (shouldIncludeJobs && jobs.length) {
    sections.push(
      "Relevant jobs:",
      ...jobs.map(
        (job) =>
          `- Job ${job.id.slice(-6).toUpperCase()}: ${job.type} | status=${job.status} | urgency=${job.urgency} | created=${job.createdAt.toISOString()}`
      )
    );
  }

  if (shouldIncludeJobs && !jobs.length) {
    sections.push("Relevant jobs:\n- No service jobs found for this user.");
  }

  if (shouldIncludeHireBookings && recentHireBookings.length) {
    sections.push(
      "Recent hire bookings:",
      ...recentHireBookings.map(
        (booking) =>
          `- Hire booking ${booking.id.slice(-6).toUpperCase()}: ${booking.item.name} | status=${booking.status} | ${booking.startDate.toISOString().slice(0, 10)} to ${booking.endDate.toISOString().slice(0, 10)}`
      )
    );
  }

  if (shouldIncludeHireBookings && !recentHireBookings.length) {
    sections.push("Recent hire bookings:\n- No hire bookings found for this user.");
  }

  if (shouldIncludeSaleEnquiries && recentSaleInquiries.length) {
    sections.push(
      "Recent sale enquiries:",
      ...recentSaleInquiries.map(
        (inquiry) =>
          `- Sale enquiry ${inquiry.id.slice(-6).toUpperCase()}: ${inquiry.item.name} | status=${inquiry.status} | created=${inquiry.createdAt.toISOString()}`
      )
    );
  }

  if (shouldIncludeSaleEnquiries && !recentSaleInquiries.length) {
    sections.push("Recent sale enquiries:\n- No sale enquiries found for this user.");
  }

  return sections.join("\n");
}

export function buildAssistantSystemPrompt() {
  return `
You are the TradeCarePlus website assistant.

PRIMARY BEHAVIOR
- Be concise, natural, and customer-friendly.
- Answer only what the user asked.
- Do not add extra summaries unless they help answer the question.
- Do not sound promotional, scripted, or salesy.
- Prefer 1-3 short sentences for simple messages.
- For very short user messages, reply very briefly.

STRICT GREETING RULES
- If the user says only a greeting like "hi", "hello", "hey", "good morning", or similar, reply with a short greeting only.
- Do not mention services, bookings, account help, job requests, phone number, website, or company summary in greeting replies.

RESPONSE RULES
- Answer the user's exact question first.
- If the user asks a simple question or sends a greeting, do not expand the answer.
- Only ask one follow-up question, and only when it helps move the conversation forward.
- Keep the tone professional, calm, and helpful.
- Do not use roleplay language like "I’ll handle it", "Done", "I sent that", or "I’ll notify you".

ACCOUNT AND DATA RULES
- Use only the provided retrieved context.
- Never invent job IDs, statuses, services, pricing, package details, project details, or account data.
- Treat "jobs" as service jobs by default.
- Do not show hire bookings or sale enquiries unless the user explicitly asks about hire bookings, rentals, bookings, enquiries, or sales enquiries.
- If pricing is not explicitly provided in the context, say: "The team can confirm pricing after reviewing your request."
- If the answer is not in the provided context, say you do not have that information.
- The assistant is informational only in this chat.
- The assistant cannot create tickets, request updates, notify staff, send emails, send SMS, submit forms, change bookings, or perform backend actions from chat.
- Never say or imply that you completed an action, submitted a request, contacted the team, escalated something, created a reminder, or will notify the user later.

OUTPUT STYLE
- Keep replies customer-facing and practical.
- Do not include unnecessary introductions or closings.
- Prefer direct, support-style wording.
- When you cannot do something, say so plainly and briefly.

MARKDOWN OUTPUT RULES
- Return Markdown, not HTML.
- Use normal paragraphs for most replies.
- Use short bullet lists only when the user asked for a list or the answer is naturally list-shaped.
- You may use **bold** for small emphasis when helpful.
- Use links in normal Markdown format when relevant.
- Do not return HTML tags, code fences, tables, or long structured templates unless the user asks.
`.trim();
}

export async function buildAssistantContext({
  userId,
  lastMessage,
}: AssistantContextInput) {
  const message = lastMessage.trim();
  const sections: string[] = [
    `Conversation focus:\n- Latest user message: ${message || "No message provided."}`,
    `Base company summary:\n${aboutSummary}`,
  ];

  const tasks: Promise<void>[] = [];

  if (shouldFetchServices(message)) {
    tasks.push(
      fetchRelevantServices(message).then((summary) => {
        sections.push(`Relevant services:\n${summary}`);
      })
    );
  }

  if (shouldFetchProjects(message)) {
    tasks.push(
      fetchRelevantProjects(message).then((summary) => {
        sections.push(`Relevant projects:\n${summary}`);
      })
    );
  }

  if (shouldFetchPackages(message)) {
    tasks.push(
      fetchRelevantPackages(message).then((summary) => {
        sections.push(`Relevant packages:\n${summary}`);
      })
    );
  }

  if (shouldFetchCatalog(message)) {
    tasks.push(
      fetchRelevantCatalog(message).then((summary) => {
        sections.push(`Relevant sales and hire items:\n${summary}`);
      })
    );
  }

  if (userId && shouldFetchUserContext(message)) {
    tasks.push(
      fetchRelevantUserContext(userId, message).then((summary) => {
        sections.push(`Relevant logged-in user context:\n${summary}`);
      })
    );
  } else if (!userId) {
    sections.push("User context:\n- Visitor is not logged in. Do not claim access to personal account, subscription, or job details.");
  }

  await Promise.all(tasks);

  return sections.join("\n\n");
}
