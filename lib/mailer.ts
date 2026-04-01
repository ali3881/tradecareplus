import nodemailer from "nodemailer";

function parsePort(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parsePort(process.env.SMTP_PORT, 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user,
      pass,
    },
  });
}

export async function sendMail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const transporter = getTransport();
  if (!transporter) {
    console.warn("SMTP is not configured. Skipping email send.", { to, subject });
    return { skipped: true as const };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  return { skipped: false as const };
}

export function buildJobRatingEmailTemplate({
  customerName,
  businessName,
  jobLabel,
  reviewUrl,
  supportEmail,
}: {
  customerName: string;
  businessName: string;
  jobLabel: string;
  reviewUrl: string;
  supportEmail: string;
}) {
  const greetingName = customerName || "there";
  const subject = `How did we do on your ${jobLabel}?`;
  const text = [
    `Hi ${greetingName},`,
    "",
    `Your ${jobLabel} has been marked complete by ${businessName}.`,
    "We'd love your feedback.",
    "",
    `Leave your rating here: ${reviewUrl}`,
    "",
    `If you need help, reply to ${supportEmail}.`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; background: #fff8e1; padding: 32px;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #ffe08a;">
        <div style="padding: 32px; background: linear-gradient(135deg, #ffc526, #e0a800); color: #1f2937;">
          <div style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.8;">Job complete</div>
          <h1 style="margin: 12px 0 0; font-size: 28px; line-height: 1.2;">How did we do?</h1>
        </div>
        <div style="padding: 32px; color: #292524;">
          <p style="margin: 0 0 16px;">Hi ${escapeHtml(greetingName)},</p>
          <p style="margin: 0 0 16px;">Your <strong>${escapeHtml(jobLabel)}</strong> has been marked complete by ${escapeHtml(businessName)}.</p>
          <p style="margin: 0 0 24px;">Please rate your experience in a few seconds. No login is needed.</p>
          <p style="margin: 0 0 24px;">
            <a href="${reviewUrl}" style="display: inline-block; background: #ffc526; color: #1f2937; text-decoration: none; padding: 14px 22px; border-radius: 999px; font-weight: 700;">Leave a rating</a>
          </p>
          <p style="margin: 0 0 12px; color: #57534e;">If the button does not work, open this link:</p>
          <p style="margin: 0 0 24px; word-break: break-all;"><a href="${reviewUrl}" style="color: #d97706;">${reviewUrl}</a></p>
          <p style="margin: 0; color: #57534e;">Need help? Contact us at <a href="mailto:${supportEmail}" style="color: #d97706;">${escapeHtml(supportEmail)}</a>.</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

export function buildHireBookingAdminEmailTemplate({
  itemName,
  customerName,
  customerEmail,
  customerPhone,
  startDate,
  endDate,
  quantity,
  totalPrice,
}: {
  itemName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  startDate: string;
  endDate: string;
  quantity: number;
  totalPrice: string;
}) {
  const subject = `New hire booking: ${itemName}`;
  const text = [
    `New hire booking received for ${itemName}.`,
    `Customer: ${customerName}`,
    `Email: ${customerEmail}`,
    customerPhone ? `Phone: ${customerPhone}` : null,
    `Dates: ${startDate} to ${endDate}`,
    `Quantity: ${quantity}`,
    `Total: ${totalPrice}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; background: #fff8e1; padding: 32px;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #ffe08a;">
        <div style="padding: 28px; background: linear-gradient(135deg, #ffc526, #e0a800); color: #1f2937;">
          <div style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.8;">New hire booking</div>
          <h1 style="margin: 12px 0 0; font-size: 28px; line-height: 1.2;">${escapeHtml(itemName)}</h1>
        </div>
        <div style="padding: 28px; color: #292524;">
          <p style="margin: 0 0 10px;"><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
          <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
          ${customerPhone ? `<p style="margin: 0 0 10px;"><strong>Phone:</strong> ${escapeHtml(customerPhone)}</p>` : ""}
          <p style="margin: 0 0 10px;"><strong>Dates:</strong> ${escapeHtml(startDate)} to ${escapeHtml(endDate)}</p>
          <p style="margin: 0 0 10px;"><strong>Quantity:</strong> ${quantity}</p>
          <p style="margin: 0;"><strong>Total:</strong> ${escapeHtml(totalPrice)}</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

export function buildHireBookingCustomerEmailTemplate({
  customerName,
  itemName,
  startDate,
  endDate,
  quantity,
  totalPrice,
}: {
  customerName: string;
  itemName: string;
  startDate: string;
  endDate: string;
  quantity: number;
  totalPrice: string;
}) {
  const subject = `Booking confirmed for ${itemName}`;
  const text = [
    `Hi ${customerName},`,
    "",
    `Your booking for ${itemName} is confirmed.`,
    `Dates: ${startDate} to ${endDate}`,
    `Quantity: ${quantity}`,
    `Total paid: ${totalPrice}`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; background: #fff8e1; padding: 32px;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #ffe08a;">
        <div style="padding: 28px; background: linear-gradient(135deg, #ffc526, #e0a800); color: #1f2937;">
          <div style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.8;">Booking confirmed</div>
          <h1 style="margin: 12px 0 0; font-size: 28px; line-height: 1.2;">${escapeHtml(itemName)}</h1>
        </div>
        <div style="padding: 28px; color: #292524;">
          <p style="margin: 0 0 16px;">Hi ${escapeHtml(customerName)},</p>
          <p style="margin: 0 0 10px;">Your hire booking has been confirmed.</p>
          <p style="margin: 0 0 10px;"><strong>Dates:</strong> ${escapeHtml(startDate)} to ${escapeHtml(endDate)}</p>
          <p style="margin: 0 0 10px;"><strong>Quantity:</strong> ${quantity}</p>
          <p style="margin: 0;"><strong>Total paid:</strong> ${escapeHtml(totalPrice)}</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

export function buildSaleInquiryAdminEmailTemplate({
  itemName,
  customerName,
  customerEmail,
  customerPhone,
  message,
}: {
  itemName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  message?: string | null;
}) {
  const subject = `New sales enquiry: ${itemName}`;
  const text = [
    `New sales enquiry for ${itemName}.`,
    `Customer: ${customerName}`,
    `Email: ${customerEmail}`,
    customerPhone ? `Phone: ${customerPhone}` : null,
    message ? `Message: ${message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; background: #fff8e1; padding: 32px;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #ffe08a;">
        <div style="padding: 28px; background: linear-gradient(135deg, #ffc526, #e0a800); color: #1f2937;">
          <div style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.8;">New sales enquiry</div>
          <h1 style="margin: 12px 0 0; font-size: 28px; line-height: 1.2;">${escapeHtml(itemName)}</h1>
        </div>
        <div style="padding: 28px; color: #292524;">
          <p style="margin: 0 0 10px;"><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
          <p style="margin: 0 0 10px;"><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
          ${customerPhone ? `<p style="margin: 0 0 10px;"><strong>Phone:</strong> ${escapeHtml(customerPhone)}</p>` : ""}
          ${message ? `<p style="margin: 0;"><strong>Message:</strong> ${escapeHtml(message)}</p>` : ""}
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
