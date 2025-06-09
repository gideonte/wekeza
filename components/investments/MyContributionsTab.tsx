"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { Calendar, DollarSign, User } from "lucide-react";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function MyContributionsTab() {
  const contributionSummary = useQuery(
    api.investments.getUserContributionSummary,
    {}
  );
  const userContributions = useQuery(api.investments.getUserContributions, {});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, yyyy");
  };

  return (
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
            <CardTitle className="text-sm font-medium">Joining Fee</CardTitle>
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
                  Please pay your joining fee of {formatCurrency(500)} to get
                  started.
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
  );
}
