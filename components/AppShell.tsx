import Footer from "@/components/Footer";
import Header from "@/components/Header";
import AppShellClient from "@/components/AppShellClient";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShellClient header={<Header />} footer={<Footer />}>
      {children}
    </AppShellClient>
  );
}
