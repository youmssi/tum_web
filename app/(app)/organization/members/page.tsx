import type { Metadata } from "next";

import { MemberList } from "@/components/modules/organization";

export const metadata: Metadata = {
  title: "Members",
};

export default function MembersPage() {
  return (
    <div className="p-6">
      <MemberList />
    </div>
  );
}
