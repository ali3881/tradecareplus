"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppFloatingButton() {
  const whatsappUrl = "https://wa.me/61410886899?text=Hi,%20I%20need%20help%20with%20a%20service%20request.";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
      title="Chat on WhatsApp"
    >
      <MessageCircle size={32} />
    </a>
  );
}
