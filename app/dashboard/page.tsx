"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import {
  ArrowUpRight,
  DollarSign,
  FileText,
  LineChart,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  // Fetch data from Convex
  const isAdmin = useQuery(api.users.isAdmin) || false;
  const upcomingEvents =
    useQuery(api.events.getUpcomingEvents, { limit: 3 }) || [];
  const userCounts = useQuery(api.users.getUserCountByRole);

  // Get contribution data
  const contributionSummary = useQuery(
    api.investments.getOverallContributionSummary,
    {}
  );

  // Get recent documents
  const recentDocuments =
    useQuery(api.documents.getPublishedDocuments, { limit: 5 }) || [];

  // Get recent contributions
  const recentContributions =
    useQuery(api.investments.getAllContributions, {}) || [];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  // Calculate monthly growth percentage (placeholder for now)
  const calculateGrowth = () => {
    return "+5.2%";
  };

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      {/* Stats cards with real data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contributions
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {contributionSummary ? (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(contributionSummary.totalContributed || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {calculateGrowth()} from last month
                </p>
              </>
            ) : (
              <>
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Contributions
            </CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {contributionSummary ? (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    contributionSummary.monthlyContributions || 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {
                    recentContributions.filter((c) => c.type === "monthly")
                      .length
                  }{" "}
                  contributions
                </p>
              </>
            ) : (
              <>
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {userCounts ? (
              <>
                <div className="text-2xl font-bold">
                  {userCounts.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {userCounts.total && userCounts.total > 0
                    ? `${userCounts.admin || 0} administrators`
                    : "No members yet"}
                </p>
              </>
            ) : (
              <>
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Joining Fees</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {contributionSummary ? (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(contributionSummary.joiningFees || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {contributionSummary.membersWithJoiningFee || 0} members paid
                </p>
              </>
            ) : (
              <>
                <Skeleton className="h-8 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs - with real data */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full overflow-x-auto flex justify-start sm:justify-center">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Contribution Summary</CardTitle>
                <CardDescription>
                  Overview of all member contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contributionSummary ? (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-500">
                            Total Contributions
                          </h3>
                          <DollarSign className="h-4 w-4 text-emerald-500" />
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(
                            contributionSummary.totalContributed || 0
                          )}
                        </p>
                        <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: "100%" }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-500">
                            Monthly Contributions
                          </h3>
                          <LineChart className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(
                            contributionSummary.monthlyContributions || 0
                          )}
                        </p>
                        <div className="mt-2 flex items-center text-xs">
                          <span className="text-gray-500">
                            {
                              recentContributions.filter(
                                (c) => c.type === "monthly"
                              ).length
                            }{" "}
                            contributions
                          </span>
                          <span className="ml-auto text-blue-600 font-medium">
                            {calculateGrowth()}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-500">
                            Joining Fees
                          </h3>
                          <Users className="h-4 w-4 text-purple-500" />
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatCurrency(contributionSummary.joiningFees || 0)}
                        </p>
                        <div className="mt-2 flex items-center text-xs">
                          <span className="text-gray-500">
                            {contributionSummary.membersWithJoiningFee || 0}{" "}
                            members paid
                          </span>
                          {userCounts && (
                            <div className="ml-auto flex items-center">
                              <div className="h-2 w-16 bg-gray-100 rounded-full overflow-hidden mr-2">
                                <div
                                  className="bg-purple-500 h-full rounded-full"
                                  style={{
                                    width: userCounts.total
                                      ? `${Math.min(100, (contributionSummary.membersWithJoiningFee / userCounts.total) * 100)}%`
                                      : "0%",
                                  }}
                                ></div>
                              </div>
                              <span className="text-purple-600 font-medium">
                                {userCounts.total
                                  ? Math.round(
                                      (contributionSummary.membersWithJoiningFee /
                                        userCounts.total) *
                                        100
                                    )
                                  : 0}
                                %
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-500">
                            Contributing Members
                          </h3>
                          <Users className="h-4 w-4 text-amber-500" />
                        </div>
                        <p className="text-2xl font-bold text-amber-600">
                          {contributionSummary.uniqueMembers || 0}
                        </p>
                        <div className="mt-2 flex items-center text-xs">
                          <span className="text-gray-500">
                            Active contributors
                          </span>
                          {userCounts && (
                            <div className="ml-auto flex items-center">
                              <div className="h-2 w-16 bg-gray-100 rounded-full overflow-hidden mr-2">
                                <div
                                  className="bg-amber-500 h-full rounded-full"
                                  style={{
                                    width: userCounts.total
                                      ? `${Math.min(100, (contributionSummary.uniqueMembers / userCounts.total) * 100)}%`
                                      : "0%",
                                  }}
                                ></div>
                              </div>
                              <span className="text-amber-600 font-medium">
                                {userCounts.total
                                  ? Math.round(
                                      (contributionSummary.uniqueMembers /
                                        userCounts.total) *
                                        100
                                    )
                                  : 0}
                                %
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Monthly Trend */}
                    <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">
                        Contribution Trend
                      </h3>
                      <div className="flex items-end h-16 gap-1">
                        {Array.from({ length: 12 }).map((_, i) => {
                          // Generate random heights for the demo
                          const height = 20 + Math.random() * 80;
                          const isCurrentMonth = i === new Date().getMonth();
                          return (
                            <div
                              key={i}
                              className="flex-1 flex flex-col items-center"
                            >
                              <div
                                className={`w-full rounded-t-sm ${isCurrentMonth ? "bg-primary" : "bg-primary/40"}`}
                                style={{ height: `${height}%` }}
                              ></div>
                              <span className="text-[10px] text-gray-500 mt-1">
                                {format(new Date(2023, i, 1), "MMM").charAt(0)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link href="/dashboard/investments">
                        <Button className="w-full">
                          View Detailed Investment Report
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                      ))}
                    </div>
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>
                    {upcomingEvents.length === 0
                      ? "No upcoming events"
                      : `You have ${upcomingEvents.length} upcoming events.`}
                  </CardDescription>
                </div>
                <Link href="/dashboard/events">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {upcomingEvents === undefined ? (
                  // Loading state
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center">
                        <Skeleton className="h-2 w-2 rounded-full mr-2" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  // Empty state
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No upcoming events scheduled.</p>
                    {isAdmin && (
                      <Link
                        href="/dashboard/events"
                        className="mt-2 inline-block"
                      >
                        <Button variant="link" size="sm">
                          Add an event
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  // Events list
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event._id} className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 bg-${event.color}-500`}
                        ></div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-sm font-medium leading-none truncate">
                            {event.title}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {format(new Date(event.date), "MMM d, yyyy")} •{" "}
                            {event.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Contributions</CardTitle>
              <CardDescription>Latest member contributions</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {recentContributions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No contributions recorded yet.</p>
                  {isAdmin && (
                    <Link
                      href="/dashboard/investments"
                      className="mt-2 inline-block"
                    >
                      <Button variant="link" size="sm">
                        Add a contribution
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentContributions.slice(0, 3).map((contribution) => (
                    <div
                      key={contribution._id}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-lg border p-4"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {contribution.type === "joining_fee"
                            ? "Joining Fee"
                            : "Monthly Contribution"}
                        </p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(contribution.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-lg">
                          {format(new Date(contribution.date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {contribution.type === "joining_fee"
                            ? "Type"
                            : "Month"}
                        </p>
                        <p className="text-lg">
                          {contribution.type === "joining_fee"
                            ? "One-time"
                            : contribution.month}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Link href="/dashboard/investments">
                      <Button variant="outline" className="w-full">
                        View All Contributions
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent actions and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Recent documents */}
                {recentDocuments.slice(0, 2).map((doc) => (
                  <div key={doc._id} className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        <span className="font-medium">Document available:</span>{" "}
                        {doc.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(doc.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Link
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm" className="ml-2">
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                ))}

                {/* Recent contributions */}
                {recentContributions.slice(0, 2).map((contribution) => (
                  <div key={contribution._id} className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        <span className="font-medium">
                          {contribution.type === "joining_fee"
                            ? "Joining fee"
                            : "Monthly contribution"}
                          :
                        </span>{" "}
                        {formatCurrency(contribution.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(contribution.date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Recent events */}
                {upcomingEvents.slice(0, 1).map((event) => (
                  <div key={event._id} className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mr-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        <span className="font-medium">Upcoming event:</span>{" "}
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.date), "MMM d, yyyy")} •{" "}
                        {event.time}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Show message if no activity */}
                {recentDocuments.length === 0 &&
                  recentContributions.length === 0 &&
                  upcomingEvents.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>No recent activity to display.</p>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
