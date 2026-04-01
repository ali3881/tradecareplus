import twilio from "twilio";

function getSmsClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    return null;
  }

  return {
    client: twilio(accountSid, authToken),
    from,
  };
}

export async function sendSms({
  to,
  body,
}: {
  to?: string | null;
  body: string;
}) {
  if (!to?.trim()) {
    return { skipped: true as const, reason: "missing-recipient" as const };
  }

  const config = getSmsClient();
  if (!config) {
    console.warn("Twilio is not configured. Skipping SMS send.", { to });
    return { skipped: true as const, reason: "missing-config" as const };
  }

  await config.client.messages.create({
    from: config.from,
    to,
    body,
  });

  return { skipped: false as const };
}

export function buildJobCreatedSms({
  customerName,
  jobType,
}: {
  customerName?: string | null;
  jobType: string;
}) {
  const firstName = customerName?.trim() || "there";
  return `Hi ${firstName}, your ${jobType} job request has been created successfully on TradeCarePlus. We will keep you updated.`;
}

export function buildJobCompletedSms({
  customerName,
  jobType,
}: {
  customerName?: string | null;
  jobType: string;
}) {
  const firstName = customerName?.trim() || "there";
  return `Hi ${firstName}, your ${jobType} job has been marked complete on TradeCarePlus. Thank you for choosing us.`;
}
