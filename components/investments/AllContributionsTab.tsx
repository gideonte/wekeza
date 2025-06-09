"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AllContributionsTab({
  setIsAddDialogOpen,
}: {
  setIsAddDialogOpen: (open: boolean) => void;
}) {
  const allMembers = useQuery(api.users.getAllUsers, { limit: 100 });
  const allContributions =
    useQuery(api.investments.getAllContributions, {}) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "MMM d, yyyy");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
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
                    <th className="text-left py-3 px-4">Member</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Month</th>
                    <th className="text-right py-3 px-4">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allContributions.map((contribution) => {
                    const member = allMembers?.users.find(
                      (m) => m._id === contribution.userId
                    );
                    return (
                      <tr key={contribution._id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage src={member?.profileImage} />
                              <AvatarFallback>
                                {member ? getInitials(member.name) : "??"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member?.name || "Unknown Member"}</span>
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
  );
}
