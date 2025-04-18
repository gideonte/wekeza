import {
  internalMutation,
  query,
  type QueryCtx,
  mutation,
} from "./_generated/server";
import type { UserJSON } from "@clerk/backend";
import { v, type Validator } from "convex/values";

// Define allowed roles
const ALLOWED_UPLOAD_ROLES = [
  "secretary",
  "treasurer",
  "president",
  "webmaster",
  "admin",
];

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const canUploadDocuments = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;

    return ALLOWED_UPLOAD_ROLES.includes(user.role || "");
  },
});

// Add this new function to check if user is admin
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;

    return user.role === "admin";
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    // Extract email from email addresses
    let email = null;
    if (data.email_addresses && data.email_addresses.length > 0) {
      email = data.email_addresses[0].email_address;
    }

    // Extract profile image if available
    let profileImage = null;
    if (data.image_url) {
      profileImage = data.image_url;
    }

    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      externalId: data.id,
      email: email || undefined, // Convert null to undefined
      profileImage: profileImage || undefined, // Convert null to undefined
      // Default role is "member" - roles should be managed in your app
      role: "member",
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    // In a real app, you'd check if the current user has permission to update roles
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Unauthorized to update user roles");
    }

    await ctx.db.patch(args.userId, { role: args.role });
    return true;
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`
      );
    }
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}

// Get all users (members)
export const getAllUsers = query({
  args: {
    search: v.optional(v.string()),
    role: v.optional(v.string()),
    limit: v.optional(v.number()),
    skip: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Start with the base query
    let usersQuery = ctx.db.query("users");

    // Apply role filter if provided
    if (args.role) {
      usersQuery = usersQuery.filter((q) => q.eq(q.field("role"), args.role));
    }

    // Collect all users (we'll handle search and pagination in memory)
    const allUsers = await usersQuery.collect();

    // Apply search filter in memory if needed
    let filteredUsers = allUsers;
    if (args.search) {
      const search = args.search.toLowerCase();
      filteredUsers = allUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search)
      );
    }

    // Sort by name
    filteredUsers.sort((a, b) => a.name.localeCompare(b.name));

    // Calculate total for pagination
    const total = filteredUsers.length;

    // Apply pagination
    const skip = args.skip || 0;
    const limit = args.limit || 50;
    const paginatedUsers = filteredUsers.slice(skip, skip + limit);
    const hasMore = filteredUsers.length > skip + limit;

    // Return paginated results
    return {
      users: paginatedUsers,
      total,
      hasMore,
    };
  },
});

// Get user count by role
export const getUserCountByRole = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    // Count users by role
    const roleCounts = {
      total: users.length,
      admin: 0,
      member: 0,
      secretary: 0,
      treasurer: 0,
      president: 0,
      webmaster: 0,
    };

    // Count users by role
    users.forEach((user) => {
      const role = user.role || "member";
      if (role in roleCounts) {
        roleCounts[role as keyof typeof roleCounts]++;
      }
    });

    return roleCounts;
  },
});
