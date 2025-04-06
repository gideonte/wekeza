"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, UserPlus, Mail, Phone, Shield, User2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const ITEMS_PER_PAGE = 12;

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
        return "bg-red-100 text-red-800 border-red-200";
      case "president":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "treasurer":
        return "bg-green-100 text-green-800 border-green-200";
      case "secretary":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "webmaster":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="container px-4 sm:px-6 py-6 sm:py-10 max-w-full sm:max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Group Members</h1>
          <p className="text-muted-foreground">
            View and manage all members of the Wekeza Group.
          </p>
        </div>
        {isAdmin && (
          <Button className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      {roleCounts && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{roleCounts.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-muted-foreground">
                Admins
              </p>
              <p className="text-2xl font-bold">{roleCounts.admin}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-muted-foreground">
                President
              </p>
              <p className="text-2xl font-bold">{roleCounts.president}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-muted-foreground">
                Treasurer
              </p>
              <p className="text-2xl font-bold">{roleCounts.treasurer}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-muted-foreground">
                Secretary
              </p>
              <p className="text-2xl font-bold">{roleCounts.secretary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-sm font-medium text-muted-foreground">
                Members
              </p>
              <p className="text-2xl font-bold">{roleCounts.member}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search members..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={roleFilter || "all"}
          onValueChange={handleRoleFilterChange}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by role" />
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

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {membersResult === undefined ? (
          // Loading state
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : membersResult.users.length === 0 ? (
          // Empty state
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <User2 className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No members found</p>
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : roleFilter
                      ? `No members with role "${roleFilter}"`
                      : "There are no members in the system yet."}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Members list
          membersResult.users.map((member: Member) => (
            <Card key={member._id}>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={member.profileImage}
                        alt={member.name}
                      />
                      <AvatarFallback>
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <Badge
                        variant="outline"
                        className={getRoleBadgeColor(member.role || "member")}
                      >
                        {member.role || "Member"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-2 h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-2 h-4 w-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="pt-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            Actions
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Send Message</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Change Role</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {membersResult && membersResult.users.length > 0 && (
        <div className="mt-6">
          <Pagination>
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
