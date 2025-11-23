import { getAllSettings } from "@/app/actions/settings";
import SettingsEditor from "@/components/settings-editor";

export default async function SettingsPage() {
  const result = await getAllSettings();

  if (result.error || !result.data) {
    return <div>Error loading settings.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Configurations</h1>
      <SettingsEditor settings={result.data} />
    </div>
  );
}