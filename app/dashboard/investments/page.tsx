"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import ContributionTabs from "@/components/investments/ContributionTabs";
import AddContributionDialog from "@/components/investments/AddContributionDialog";

export default function InvestmentsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("my-contributions");

  // Get current user
  const currentUser = useQuery(api.users.current);
  const isAdminOrTreasurer =
    currentUser?.role === "admin" || currentUser?.role === "treasurer";

  // Get all members (for admin/treasurer)
  const allMembers = useQuery(api.users.getAllUsers, { limit: 100 });

  return (
    <div className="container px-4 sm:px-6 py-6 sm:py-10 max-w-full sm:max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investments</h1>
          <p className="text-muted-foreground">
            Track your contributions and investment growth
          </p>
        </div>

        {isAdminOrTreasurer && (
          <AddContributionDialog
            isOpen={isAddDialogOpen}
            setIsOpen={setIsAddDialogOpen}
            members={allMembers?.users || []}
          />
        )}
      </div>

      <ContributionTabs
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        isAdminOrTreasurer={isAdminOrTreasurer}
        setIsAddDialogOpen={setIsAddDialogOpen}
      />
    </div>
  );
}
