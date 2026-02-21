import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { Settings } from "lucide-react";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  await requireAdmin();

  // Fetch settings from DB or use defaults
  const settingsData = await prisma.systemSetting.findMany();
  
  const defaultSettings = {
    businessName: "TradeCarePlus",
    supportEmail: "support@tradecareplus.com",
    emergencyFee: 150,
    hourlyRate: 85,
  };

  const settings = settingsData.reduce((acc: any, curr) => {
    acc[curr.key] = curr.type === "NUMBER" ? parseFloat(curr.value) : curr.value;
    return acc;
  }, defaultSettings);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Settings className="mr-3 text-gray-600" />
          System Settings
        </h1>
        <p className="text-gray-500 mt-1">Configure global platform settings.</p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
