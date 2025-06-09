"use client";

import React from "react";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import {
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function AdminDashboardTab() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<any>(null);
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(
    new Set()
  );

  // Get current user to check permissions
  const currentUser = useQuery(api.users.current);
  const isAdminOrTreasurer =
    currentUser?.role === "admin" || currentUser?.role === "treasurer";

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

  const allMembers = useQuery(api.users.getAllUsers, { limit: 100 });
  const allContributions =
    useQuery(api.investments.getAllContributions, {}) || [];

  // Mutations
  const editContribution = useMutation(api.investments.editContribution);
  const deleteContribution = useMutation(api.investments.deleteContribution);

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

  // Toggle member expansion
  const toggleMemberExpansion = (memberId: string) => {
    const newExpanded = new Set(expandedMembers);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    setExpandedMembers(newExpanded);
  };

  // Handle edit contribution
  const handleEditContribution = (contribution: any) => {
    setSelectedContribution(contribution);
    setIsEditDialogOpen(true);
  };

  // Handle delete contribution
  const handleDeleteContribution = (contribution: any) => {
    setSelectedContribution(contribution);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedContribution) return;

    try {
      await deleteContribution({ contributionId: selectedContribution._id });
      toast.success("Contribution deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedContribution(null);
    } catch (error) {
      toast.error("Failed to delete contribution", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  return (
    <TabsContent value="summary" className="space-y-8">
      {/* Member Status */}
      <Card>
        <CardHeader>
          <CardTitle>Member Status</CardTitle>
          <CardDescription>
            Overview of member contribution status
            {isAdminOrTreasurer &&
              " - click View Details to edit contributions"}
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
            <div className="space-y-2">
              {allMembers.users.map((member) => {
                const memberContributions =
                  allContributions?.filter((c) => c.userId === member._id) ||
                  [];
                const isExpanded = expandedMembers.has(member._id);

                let totalContributed = 0;
                let hasJoiningFee = false;

                memberContributions.forEach((contribution) => {
                  totalContributed += contribution.amount;
                  if (contribution.type === "joining_fee") {
                    hasJoiningFee = true;
                  }
                });

                return (
                  <Collapsible
                    key={member._id}
                    open={isExpanded}
                    onOpenChange={() => toggleMemberExpansion(member._id)}
                  >
                    <div className="border rounded-lg">
                      {/* Member Summary Row - Responsive Design */}
                      <div className="p-4 hover:bg-gray-50">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {/* Member Info - Always at the top on mobile */}
                          <div className="flex items-center space-x-3 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={member.profileImage || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-500">
                                {member.email}
                              </div>
                            </div>
                          </div>

                          {/* Stats - Grid on mobile, flex on desktop */}
                          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:space-x-6 mt-2 sm:mt-0">
                            <div className="text-center">
                              <div className="text-xs sm:text-sm font-medium">
                                Joining Fee
                              </div>
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
                            </div>
                            <div className="text-center">
                              <div className="text-xs sm:text-sm font-medium">
                                Monthly
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600">
                                {
                                  memberContributions.filter(
                                    (c) => c.type === "monthly"
                                  ).length
                                }{" "}
                                months
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs sm:text-sm font-medium">
                                Total
                              </div>
                              <div className="text-xs sm:text-sm font-semibold">
                                {formatCurrency(totalContributed)}
                              </div>
                            </div>
                          </div>

                          {/* View Details Button - Full width on mobile */}
                          {isAdminOrTreasurer &&
                            memberContributions.length > 0 && (
                              <CollapsibleTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full sm:w-auto mt-3 sm:mt-0 justify-center"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                  )}
                                </Button>
                              </CollapsibleTrigger>
                            )}
                        </div>
                      </div>

                      {/* Expanded Contributions Table */}
                      {isAdminOrTreasurer && (
                        <CollapsibleContent>
                          <div className="border-t bg-gray-50/50">
                            <div className="p-4">
                              <h4 className="font-medium mb-3">
                                Contribution History
                              </h4>
                              {memberContributions.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                  No contributions recorded
                                </p>
                              ) : (
                                <div className="overflow-x-auto -mx-4 sm:mx-0">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="text-left py-2 px-3 font-medium text-gray-500">
                                          Date
                                        </th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-500">
                                          Type
                                        </th>
                                        <th className="text-left py-2 px-3 font-medium text-gray-500 hidden sm:table-cell">
                                          Month
                                        </th>
                                        <th className="text-right py-2 px-3 font-medium text-gray-500">
                                          Amount
                                        </th>
                                        <th className="text-right py-2 px-3 font-medium text-gray-500">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {memberContributions.map(
                                        (contribution) => (
                                          <tr
                                            key={contribution._id}
                                            className="border-b hover:bg-white"
                                          >
                                            <td className="py-2 px-3 whitespace-nowrap">
                                              {formatDate(contribution.date)}
                                            </td>
                                            <td className="py-2 px-3">
                                              <Badge
                                                variant="outline"
                                                className={
                                                  contribution.type ===
                                                  "joining_fee"
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "bg-green-50 text-green-700"
                                                }
                                              >
                                                {contribution.type ===
                                                "joining_fee"
                                                  ? "Joining Fee"
                                                  : "Monthly"}
                                              </Badge>
                                              {/* Show month on mobile inline with type */}
                                              {contribution.type !==
                                                "joining_fee" && (
                                                <span className="block text-xs text-gray-500 mt-1 sm:hidden">
                                                  {contribution.month}
                                                </span>
                                              )}
                                            </td>
                                            <td className="py-2 px-3 hidden sm:table-cell">
                                              {contribution.type ===
                                              "joining_fee"
                                                ? "One-time"
                                                : contribution.month}
                                            </td>
                                            <td className="py-2 px-3 text-right font-medium whitespace-nowrap">
                                              {formatCurrency(
                                                contribution.amount
                                              )}
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                              <div className="flex justify-end">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 p-0 sm:hidden"
                                                  onClick={() =>
                                                    handleEditContribution(
                                                      contribution
                                                    )
                                                  }
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-8 w-8 p-0 text-red-600 sm:hidden"
                                                  onClick={() =>
                                                    handleDeleteContribution(
                                                      contribution
                                                    )
                                                  }
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                                {/* Dropdown for desktop */}
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger
                                                    asChild
                                                    className="hidden sm:flex"
                                                  >
                                                    <Button
                                                      variant="ghost"
                                                      className="h-8 w-8 p-0"
                                                    >
                                                      <span className="sr-only">
                                                        Open menu
                                                      </span>
                                                      <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                      onClick={() =>
                                                        handleEditContribution(
                                                          contribution
                                                        )
                                                      }
                                                    >
                                                      <Edit className="mr-2 h-4 w-4" />
                                                      Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                      onClick={() =>
                                                        handleDeleteContribution(
                                                          contribution
                                                        )
                                                      }
                                                      className="text-red-600"
                                                    >
                                                      <Trash2 className="mr-2 h-4 w-4" />
                                                      Delete
                                                    </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                              </div>
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      )}
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Contribution Dialog */}
      {selectedContribution && (
        <EditContributionDialog
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          contribution={selectedContribution}
          members={allMembers?.users || []}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            setSelectedContribution(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              contribution record.
              {selectedContribution && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <p className="text-sm">
                    <strong>Amount:</strong>{" "}
                    {formatCurrency(selectedContribution.amount)}
                  </p>
                  <p className="text-sm">
                    <strong>Type:</strong>{" "}
                    {selectedContribution.type === "joining_fee"
                      ? "Joining Fee"
                      : "Monthly Contribution"}
                  </p>
                  <p className="text-sm">
                    <strong>Date:</strong>{" "}
                    {formatDate(selectedContribution.date)}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TabsContent>
  );
}

// Edit Contribution Dialog
function EditContributionDialog({
  isOpen,
  setIsOpen,
  contribution,
  members,
  onSuccess,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  contribution: any;
  members: any[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    amount: contribution?.amount?.toString() || "",
    date: contribution?.date
      ? format(new Date(contribution.date), "yyyy-MM-dd")
      : "",
    month: contribution?.month || "",
    type: contribution?.type || "monthly",
    notes: contribution?.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const editContribution = useMutation(api.investments.editContribution);

  React.useEffect(() => {
    if (contribution) {
      setFormData({
        amount: contribution.amount?.toString() || "",
        date: contribution.date
          ? format(new Date(contribution.date), "yyyy-MM-dd")
          : "",
        month: contribution.month || "",
        type: contribution.type || "monthly",
        notes: contribution.notes || "",
      });
    }
  }, [contribution]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await editContribution({
        contributionId: contribution._id,
        amount: Number.parseFloat(formData.amount),
        date: new Date(formData.date).getTime(),
        month: formData.month,
        type: formData.type,
        notes: formData.notes || undefined,
      });

      toast.success("Contribution updated successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to update contribution", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const member = members.find((m) => m._id === contribution?.userId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[550px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Edit Contribution</DialogTitle>
          <DialogDescription>
            Update the contribution details for{" "}
            {member?.name || "Unknown Member"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
                  <SelectItem value="monthly">Monthly Contribution</SelectItem>
                  <SelectItem value="joining_fee">Joining Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (CAD)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
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

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Updating..." : "Update Contribution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
