import { SettingsForm } from "@/components/modules/Settings/SettingsForm";
import { PageHeading } from "@/components/modules/PageHeading";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeading
        title="Settings"
        description="Manage your name, bio and contact details."
      />
      <SettingsForm />
    </div>
  );
}
