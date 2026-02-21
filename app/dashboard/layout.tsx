import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <WhatsAppFloatingButton />
    </>
  );
}
