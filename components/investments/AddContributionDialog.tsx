"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
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

import type { Id } from "@/convex/_generated/dataModel";

interface Member {
  _id: Id<"users">;
  name: string;
  email?: string;
  profileImage?: string;
  role?: string;
}

export default function AddContributionDialog({
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
  const addContribution = useMutation(api.investments.addContribution);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
      amount: value === "joining_fee" ? "500" : "100",
    }));
  };

  const handleMemberChange = (value: string) => {
    setFormData((prev) => ({ ...prev, userId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addContribution({
        userId: formData.userId as Id<"users">,
        amount: Number.parseFloat(formData.amount),
        date: new Date(formData.date).getTime(),
        month: formData.month,
        type: formData.type,
        notes: formData.notes || undefined,
      });

      toast.success("Contribution added successfully");
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
