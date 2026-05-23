import { NotificationPreferences } from "@/components/modules/notifications";

export const metadata = { title: "Notification Preferences" };

export default function NotificationPreferencesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Notification Preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how and when you receive notifications.
        </p>
      </div>
      <NotificationPreferences />
    </div>
  );
}
