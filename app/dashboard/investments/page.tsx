"use client";

import type React from "react";

// Import the Id type from Convex
import type { Id } from "@/convex/_generated/dataModel";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { Calendar, DollarSign, PlusCircle, User, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function InvestmentsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("my-contributions");

  // Get current user
  const currentUser = useQuery(api.users.current);

  // Check if user is admin or treasurer
  const isAdminOrTreasurer =
    currentUser?.role === "admin" || currentUser?.role === "treasurer";

  // Get user contribution summary
  const contributionSummary = useQuery(
    api.investments.getUserContributionSummary,
    {}
  );

  // Get user contributions
  const userContributions = useQuery(api.investments.getUserContributions, {});

  // Get all members (for admin/treasurer)
  const allMembers = useQuery(api.users.getAllUsers, { limit: 100 });

  // Get overall contribution summary (for admin/treasurer)
  const overallSummary = useQuery(
    api.investments.getOverallContributionSummary,
    {}
  );

  // Get all contributions (for admin/treasurer)
  const allContributions = useQuery(api.investments.getAllContributions, {});

  // Add the userCounts query to fetch the total number of members
  // Add this after the other useQuery calls at the top of the component:

  // Get user counts
  const userCounts = useQuery(api.users.getUserCountByRole);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, yyyy");
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

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

      {/* Tabs */}
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
              <TabsTrigger value="all-contributions">
                All Contributions
              </TabsTrigger>
              <TabsTrigger value="summary">Admin Dashboard</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* My Contributions Tab */}
        <TabsContent value="my-contributions" className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Contributed
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {contributionSummary ? (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency(contributionSummary.totalContributed)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Lifetime contributions
                    </p>
                  </>
                ) : (
                  <Skeleton className="h-8 w-24" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Contributions
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {contributionSummary ? (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency(contributionSummary.monthlyContributions)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {contributionSummary.contributionCount} months contributed
                    </p>
                  </>
                ) : (
                  <Skeleton className="h-8 w-24" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Joining Fee
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {contributionSummary ? (
                  <>
                    <div className="text-2xl font-bold">
                      {contributionSummary.hasJoiningFee
                        ? formatCurrency(contributionSummary.joiningFee)
                        : "Not Paid"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {contributionSummary.hasJoiningFee
                        ? "Paid in full"
                        : "Required to join"}
                    </p>
                  </>
                ) : (
                  <Skeleton className="h-8 w-24" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Next Contribution
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(100)}</div>
                <p className="text-xs text-muted-foreground">
                  Due on the 1st of next month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contribution History */}
          <Card>
            <CardHeader>
              <CardTitle>Contribution History</CardTitle>
              <CardDescription>
                Record of all your contributions to date
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userContributions === undefined ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : userContributions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No contributions recorded yet.
                  </p>
                  {!contributionSummary?.hasJoiningFee && (
                    <p className="mt-2 text-sm">
                      Please pay your joining fee of {formatCurrency(500)} to
                      get started.
                    </p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {userContributions.map((contribution) => (
                        <tr key={contribution._id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 whitespace-nowrap">
                            {formatDate(contribution.date)}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={
                                contribution.type === "joining_fee"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-green-50 text-green-700"
                              }
                            >
                              {contribution.type === "joining_fee"
                                ? "Joining Fee"
                                : "Monthly"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {contribution.type === "joining_fee"
                              ? "One-time"
                              : contribution.month}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-right font-medium">
                            {formatCurrency(contribution.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Group Summary Tab (Visible to all members) */}
        <TabsContent value="group-summary" className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Contributions
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {overallSummary ? (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency(overallSummary.totalContributed)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All member contributions
                    </p>
                  </>
                ) : (
                  <Skeleton className="h-8 w-24" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Contributions
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {overallSummary ? (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency(overallSummary.monthlyContributions)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total monthly contributions
                    </p>
                  </>
                ) : (
                  <Skeleton className="h-8 w-24" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Joining Fees
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {overallSummary ? (
                  <>
                    <div className="text-2xl font-bold">
                      {formatCurrency(overallSummary.joiningFees)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {overallSummary.membersWithJoiningFee} members paid
                    </p>
                  </>
                ) : (
                  <Skeleton className="h-8 w-24" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Contributing Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {overallSummary ? (
                  <>
                    <div className="text-2xl font-bold">
                      {overallSummary.uniqueMembers}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Active contributors
                    </p>
                  </>
                ) : (
                  <Skeleton className="h-8 w-24" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Group Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Group Progress</CardTitle>
              <CardDescription>
                Overview of our collective investment journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Monthly Contribution Stats */}
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Monthly Contributions
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Total Monthly Contributions
                      </span>
                      <span className="font-bold">
                        {overallSummary ? (
                          formatCurrency(overallSummary.monthlyContributions)
                        ) : (
                          <Skeleton className="h-4 w-20 inline-block" />
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Average Monthly Contribution
                      </span>
                      <span className="font-bold">
                        {overallSummary && overallSummary.uniqueMembers > 0
                          ? formatCurrency(
                              overallSummary.monthlyContributions /
                                overallSummary.uniqueMembers
                            )
                          : formatCurrency(0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Monthly Target
                      </span>
                      <span className="font-bold">
                        {formatCurrency(100 * (userCounts?.total || 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Joining Fee Stats */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Joining Fees</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Total Joining Fees Collected
                      </span>
                      <span className="font-bold">
                        {overallSummary ? (
                          formatCurrency(overallSummary.joiningFees)
                        ) : (
                          <Skeleton className="h-4 w-20 inline-block" />
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Members Paid / Total Members
                      </span>
                      <span className="font-bold">
                        {overallSummary && userCounts ? (
                          `${overallSummary.membersWithJoiningFee} / ${userCounts.total}`
                        ) : (
                          <Skeleton className="h-4 w-20 inline-block" />
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Completion Rate
                      </span>
                      <span className="font-bold">
                        {overallSummary && userCounts && userCounts.total > 0
                          ? `${Math.round((overallSummary.membersWithJoiningFee / userCounts.total) * 100)}%`
                          : "0%"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Contributions Tab (Admin/Treasurer Only) */}
        {isAdminOrTreasurer && (
          <TabsContent value="all-contributions" className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold">Member Contributions</h2>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Contribution
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {allContributions === undefined ? (
                  <div className="p-6 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : allContributions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No contributions recorded yet.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsAddDialogOpen(true)}
                    >
                      Add First Contribution
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Member
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Month
                          </th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {allContributions.map((contribution) => {
                          const member = allMembers?.users.find(
                            (m) => m._id === contribution.userId
                          );
                          return (
                            <tr
                              key={contribution._id}
                              className="hover:bg-gray-50"
                            >
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={member?.profileImage} />
                                    <AvatarFallback>
                                      {member ? getInitials(member.name) : "??"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>
                                    {member?.name || "Unknown Member"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap">
                                {formatDate(contribution.date)}
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap">
                                <Badge
                                  variant="outline"
                                  className={
                                    contribution.type === "joining_fee"
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-green-50 text-green-700"
                                  }
                                >
                                  {contribution.type === "joining_fee"
                                    ? "Joining Fee"
                                    : "Monthly"}
                                </Badge>
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap">
                                {contribution.type === "joining_fee"
                                  ? "One-time"
                                  : contribution.month}
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap text-right font-medium">
                                {formatCurrency(contribution.amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Group Summary Tab (Admin/Treasurer Only) */}
        {isAdminOrTreasurer && (
          <TabsContent value="summary" className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Contributions
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {overallSummary ? (
                    <>
                      <div className="text-2xl font-bold">
                        {formatCurrency(overallSummary.totalContributed)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        All member contributions
                      </p>
                    </>
                  ) : (
                    <Skeleton className="h-8 w-24" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Monthly Contributions
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {overallSummary ? (
                    <>
                      <div className="text-2xl font-bold">
                        {formatCurrency(overallSummary.monthlyContributions)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total monthly contributions
                      </p>
                    </>
                  ) : (
                    <Skeleton className="h-8 w-24" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Joining Fees
                  </CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {overallSummary ? (
                    <>
                      <div className="text-2xl font-bold">
                        {formatCurrency(overallSummary.joiningFees)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {overallSummary.membersWithJoiningFee} members paid
                      </p>
                    </>
                  ) : (
                    <Skeleton className="h-8 w-24" />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Contributing Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {overallSummary ? (
                    <>
                      <div className="text-2xl font-bold">
                        {overallSummary.uniqueMembers}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Active contributors
                      </p>
                    </>
                  ) : (
                    <Skeleton className="h-8 w-24" />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Member Status */}
            <Card>
              <CardHeader>
                <CardTitle>Member Status</CardTitle>
                <CardDescription>
                  Overview of member contribution status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allMembers === undefined ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : allMembers.users.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No members found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Member
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joining Fee
                          </th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monthly Contributions
                          </th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Contributed
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {allMembers.users.map((member) => {
                          // Find all contributions for this member
                          const memberContributions =
                            allContributions?.filter(
                              (c) => c.userId === member._id
                            ) || [];

                          // Calculate totals
                          let totalContributed = 0;
                          let monthlyContributions = 0;
                          let hasJoiningFee = false;

                          memberContributions.forEach((contribution) => {
                            totalContributed += contribution.amount;

                            if (contribution.type === "monthly") {
                              monthlyContributions += contribution.amount;
                            } else if (contribution.type === "joining_fee") {
                              hasJoiningFee = true;
                            }
                          });

                          return (
                            <tr key={member._id} className="hover:bg-gray-50">
                              <td className="py-4 px-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={member.profileImage} />
                                    <AvatarFallback>
                                      {getInitials(member.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {member.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {member.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap">
                                {hasJoiningFee ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700"
                                  >
                                    Paid
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="bg-red-50 text-red-700"
                                  >
                                    Not Paid
                                  </Badge>
                                )}
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap">
                                {
                                  memberContributions.filter(
                                    (c) => c.type === "monthly"
                                  ).length
                                }{" "}
                                months
                              </td>
                              <td className="py-4 px-4 whitespace-nowrap text-right font-medium">
                                {formatCurrency(totalContributed)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// Add Contribution Dialog Component (Admin/Treasurer Only)
// Update the Member interface to use the correct Id type
interface Member {
  _id: Id<"users">;
  name: string;
  email?: string;
  profileImage?: string;
  role?: string;
}

function AddContributionDialog({
  isOpen,
  setIsOpen,
  members,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  members: Member[];
}) {
  const [formData, setFormData] = useState({
    userId: "",
    amount: "",
    date: format(new Date(), "yyyy-MM-dd"),
    month: format(new Date(), "yyyy-MM"),
    type: "monthly",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add contribution mutation
  const addContribution = useMutation(api.investments.addContribution);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle type change
  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
      // Set default amount based on type
      amount: value === "joining_fee" ? "500" : "100",
    }));
  };

  // Handle member change
  const handleMemberChange = (value: string) => {
    setFormData((prev) => ({ ...prev, userId: value }));
  };

  // In the AddContributionDialog component, update the handleSubmit function:
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addContribution({
        userId: formData.userId as Id<"users">, // Cast to the correct Id type
        amount: Number.parseFloat(formData.amount),
        date: new Date(formData.date).getTime(),
        month: formData.month,
        type: formData.type,
        notes: formData.notes || undefined,
      });

      toast.success("Contribution added successfully");

      // Reset form and close dialog
      setFormData({
        userId: "",
        amount: "",
        date: format(new Date(), "yyyy-MM-dd"),
        month: format(new Date(), "yyyy-MM"),
        type: "monthly",
        notes: "",
      });
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to add contribution", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Contribution
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Contribution</DialogTitle>
            <DialogDescription>
              Record a new contribution for a member. Monthly contributions are
              CAD 100 and joining fees are CAD 500.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="member">Member</Label>
                <Select
                  value={formData.userId}
                  onValueChange={handleMemberChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member._id} value={member._id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Contribution Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={handleTypeChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contribution type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      Monthly Contribution (CAD 100)
                    </SelectItem>
                    <SelectItem value="joining_fee">
                      Joining Fee (CAD 500)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (CAD)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder={
                      formData.type === "joining_fee" ? "500" : "100"
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {formData.type === "monthly" && (
                <div className="grid gap-2">
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    name="month"
                    type="month"
                    value={formData.month}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional notes about this contribution"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Contribution"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
