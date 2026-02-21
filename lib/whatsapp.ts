export function buildWhatsAppUrl({ 
  name, 
  email, 
  jobId, 
  serviceType, 
  description, 
  location, 
  urgency 
}: {
  name: string;
  email?: string;
  jobId?: string;
  serviceType?: string;
  description?: string;
  location?: string;
  urgency?: string;
}) {
  const phoneNumber = "61410886899";
  
  let message = `TradeCarePlus Job Request\n`;
  message += `Name: ${name}\n`;
  if (email) message += `Email: ${email}\n`;
  if (jobId) message += `Job ID: ${jobId}\n`;
  if (serviceType) message += `Service: ${serviceType}\n`;
  if (urgency) message += `Urgency: ${urgency}\n`;
  if (location) message += `Location: ${location}\n`;
  if (description) message += `Description: ${description}\n`;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
