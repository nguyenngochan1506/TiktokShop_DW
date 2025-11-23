import { getAllSettings } from "@/app/actions/settings";
import MaintenancePanel from "@/components/maintenance-panel";
import SettingsEditor from "@/components/settings-editor";

export default async function SettingsPage() {
  const result = await getAllSettings();

  if (result.error || !result.data) {
    return (
      <div className="flex items-center justify-center h-full text-lg text-danger-600 font-semibold bg-danger-50 border border-danger-200 rounded-lg p-6">
        Lỗi khi tải cấu hình hệ thống.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cấu Hình Hệ Thống</h1>
      <SettingsEditor settings={result.data} />
      <MaintenancePanel />
    </div>
  );
}