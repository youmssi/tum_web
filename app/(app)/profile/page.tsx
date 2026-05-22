import type { Metadata } from "next";

import { ProfileForm } from "@/components/modules/auth";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <div className="p-6">
      <ProfileForm />
    </div>
  );
}
