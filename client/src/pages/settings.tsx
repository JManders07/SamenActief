import { DataRightsPanel } from "@/components/data-rights-panel";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Instellingen</h1>
      
      <div className="grid gap-6">
        <DataRightsPanel />
        {/* ... existing code ... */}
      </div>
    </div>
  );
} 