"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Search,
  UserPlus,
  Mail,
  Shield,
  User2,
  MoreHorizontal,
  Filter,
  X,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Define the Member type to fix TypeScript errors
interface Member {
  _id: string;
  name: string;
  email?: string;
  profileImage?: string;
  role?: string;
  phone?: string;
  externalId?: string;
  createdAt?: number;
  updatedAt?: number;
}

export default function MembersPage() {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const ITEMS_PER_PAGE = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [roleFilter]);

  // Calculate skip value for pagination
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Fetch members with search and filters
  const membersResult = useQuery(api.users.getAllUsers, {
    search: debouncedSearch,
    role: roleFilter,
    limit: ITEMS_PER_PAGE,
    skip: skip,
  });

  // Fetch role counts
  const roleCounts = useQuery(api.users.getUserCountByRole);

  // Check if current user is admin
  const isAdmin = useQuery(api.users.isAdmin) || false;

  // Handle role filter change
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value === "all" ? undefined : value);
  };

  // Handle pagination
  const handleNextPage = () => {
    if (membersResult?.hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  // Handle member selection
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Handle select all members
  const toggleSelectAll = () => {
    if (membersResult?.users) {
      if (selectedMembers.length === membersResult.users.length) {
        setSelectedMembers([]);
      } else {
        setSelectedMembers(
          membersResult.users.map((member: Member) => member._id)
        );
      }
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setRoleFilter(undefined);
    setSearchQuery("");
    setDebouncedSearch("");
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

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-700 border-red-100";
      case "president":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "treasurer":
        return "bg-green-50 text-green-700 border-green-100";
      case "secretary":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "webmaster":
        return "bg-orange-50 text-orange-700 border-orange-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  // Format date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";

    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="container px-4 sm:px-6 py-6 sm:py-10 max-w-full sm:max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            {membersResult?.total
              ? `${membersResult.total} members`
              : "Loading members..."}
          </p>
        </div>
        {isAdmin && (
          <Button className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-10 h-10 bg-white border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 flex-shrink-0"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {roleFilter && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-primary/10 text-primary"
                  >
                    {roleFilter}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-6">
              <SheetHeader className="mb-6">
                <SheetTitle>Filter Members</SheetTitle>
                <SheetDescription>
                  Apply filters to narrow down the member list
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Role</h3>
                  <Select
                    value={roleFilter || "all"}
                    onValueChange={handleRoleFilterChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="president">President</SelectItem>
                      <SelectItem value="treasurer">Treasurer</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="webmaster">Webmaster</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                  <SheetClose asChild>
                    <Button>Apply Filters</Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {selectedMembers.length > 0 && (
            <Button variant="outline" size="sm" className="h-10">
              Actions ({selectedMembers.length})
            </Button>
          )}
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
        {membersResult === undefined ? (
          // Loading state
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : membersResult.users.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16">
            <User2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No members found</p>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : roleFilter
                  ? `No members with role "${roleFilter}"`
                  : "There are no members in the system yet."}
            </p>
            {(searchQuery || roleFilter) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          // Members list table
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="py-3 px-4 text-left">
                    <div className="flex items-center">
                      <Checkbox
                        checked={
                          selectedMembers.length ===
                            membersResult.users.length &&
                          membersResult.users.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all members"
                        className="mr-2"
                      />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Joined
                  </th>
                  <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {membersResult.users.map((member: Member) => (
                  <tr
                    key={member._id}
                    className={`hover:bg-gray-50 transition-colors ${selectedMembers.includes(member._id) ? "bg-primary/5" : ""}`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedMembers.includes(member._id)}
                          onCheckedChange={() =>
                            toggleMemberSelection(member._id)
                          }
                          aria-label={`Select ${member.name}`}
                        />
                        <Avatar className="h-8 w-8 rounded-full flex-shrink-0">
                          <AvatarImage
                            src={member.profileImage || "/placeholder.svg"}
                            alt={member.name}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {member.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900 truncate max-w-[150px] sm:max-w-[200px]">
                        {member.email || "No email"}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={`${getRoleBadgeColor(member.role || "member")} text-xs font-medium`}
                      >
                        {member.role || "Member"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        {formatDate(member.createdAt)}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Send Message</span>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Change Role</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {membersResult && membersResult.users.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing <span className="font-medium">{skip + 1}</span> to{" "}
            <span className="font-medium">
              {skip + membersResult.users.length}
            </span>{" "}
            of{" "}
            <span className="font-medium">{membersResult.total || "many"}</span>{" "}
            members
          </div>

          <Pagination className="order-1 sm:order-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={handlePrevPage}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink isActive>{page}</PaginationLink>
              </PaginationItem>
              {membersResult.hasMore && (
                <>
                  <PaginationItem>
                    <PaginationLink onClick={handleNextPage}>
                      {page + 1}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                </>
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={handleNextPage}
                  className={
                    !membersResult.hasMore
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
