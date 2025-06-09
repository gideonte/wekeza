"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyContributionsTab from "./MyContributionsTab";
import GroupSummaryTab from "./GroupSummaryTab";
import AllContributionsTab from "./AllContributionsTab";
import AdminDashboardTab from "./AdminDashboardTab";

export default function ContributionTabs({
  selectedTab,
  setSelectedTab,
  isAdminOrTreasurer,
  setIsAddDialogOpen,
}: {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  isAdminOrTreasurer: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
}) {
  return (
    <Tabs
      defaultValue="my-contributions"
      value={selectedTab}
      onValueChange={setSelectedTab}
      className="space-y-8"
    >
      <TabsList className="w-full overflow-x-auto flex justify-start sm:justify-center">
        <TabsTrigger value="my-contributions">My Contributions</TabsTrigger>
        <TabsTrigger value="group-summary">Group Summary</TabsTrigger>
        {isAdminOrTreasurer && (
          <>
            <TabsTrigger value="summary">Admin Dashboard</TabsTrigger>
          </>
        )}
      </TabsList>

      <MyContributionsTab />
      <GroupSummaryTab />
      {isAdminOrTreasurer && (
        <>
          <AdminDashboardTab />
        </>
      )}
    </Tabs>
  );
}
