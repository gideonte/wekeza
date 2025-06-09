"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DollarSign, Calendar, User, Users } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function GroupSummaryTab() {
  const overallSummary = useQuery(
    api.investments.getOverallContributionSummary,
    {}
  ) || {
    totalContributed: 0,
    monthlyContributions: 0,
    joiningFees: 0,
    uniqueMembers: 0,
    membersWithJoiningFee: 0,
  };

  const userCounts = useQuery(api.users.getUserCountByRole);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  return (
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
                  {formatCurrency(overallSummary.totalContributed || 0)}
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
                  {formatCurrency(overallSummary.monthlyContributions || 0)}
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
            <CardTitle className="text-sm font-medium">Joining Fees</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {overallSummary ? (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(overallSummary.joiningFees || 0)}
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
                      formatCurrency(overallSummary.monthlyContributions || 0)
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
                          (overallSummary.monthlyContributions || 0) /
                            overallSummary.uniqueMembers
                        )
                      : formatCurrency(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Target</span>
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
                      formatCurrency(overallSummary.joiningFees || 0)
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
                  <span className="text-sm font-medium">Completion Rate</span>
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
  );
}
