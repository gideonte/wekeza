import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";
import { getCurrentUser } from "./users";

export const getInvestments = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const createInvestment = mutation({
  args: {
    name: v.string(),
    amount: v.number(),
    returnRate: v.number(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    status: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("investments", {
      name: args.name,
      amount: args.amount,
      returnRate: args.returnRate,
      startDate: args.startDate,
      endDate: args.endDate,
      status: args.status,
      userId: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateInvestment = mutation({
  args: {
    id: v.id("investments"),
    amount: v.optional(v.number()),
    returnRate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const investment = await ctx.db.get(id);
    if (!investment) {
      throw new Error("Investment not found");
    }

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// New functions for member contributions

// Get all contributions for a user
export const getUserContributions = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);

    // If no userId is provided, use the current user's ID
    const userId = args.userId || currentUser._id;

    // Regular members can only see their own contributions
    if (
      currentUser._id !== userId &&
      !["admin", "treasurer"].includes(currentUser.role || "")
    ) {
      throw new Error(
        "You don't have permission to view other members' contributions"
      );
    }

    return await ctx.db
      .query("contributions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get all contributions for all users (admin/treasurer only)
export const getAllContributions = query({
  args: {
    month: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const currentUser = await getCurrentUser(ctx);

      // If no user is logged in, return an empty array
      if (!currentUser) {
        return [];
      }

      // Only admins and treasurers can see all contributions
      // Return empty array instead of throwing an error
      if (!["admin", "treasurer"].includes(currentUser.role || "")) {
        console.warn(
          `User ${currentUser._id} attempted to access all contributions without permission`
        );
        return [];
      }

      let contributionsQuery = ctx.db.query("contributions");

      if (args.month) {
        contributionsQuery = contributionsQuery.filter((q) =>
          q.eq(q.field("month"), args.month)
        );
      }

      if (args.type) {
        contributionsQuery = contributionsQuery.filter((q) =>
          q.eq(q.field("type"), args.type)
        );
      }

      return await contributionsQuery.order("desc").collect();
    } catch (error) {
      console.error("Error in getAllContributions:", error);
      return [];
    }
  },
});

// Add a contribution (admin/treasurer only)
export const addContribution = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    date: v.number(),
    month: v.string(),
    type: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);

    // Only admins and treasurers can add contributions
    if (!["admin", "treasurer"].includes(currentUser.role || "")) {
      throw new Error("You don't have permission to add contributions");
    }

    // Check if the user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // For monthly contributions, check if one already exists for this month
    if (args.type === "monthly") {
      const existingContribution = await ctx.db
        .query("contributions")
        .withIndex("by_user_and_month", (q) =>
          q.eq("userId", args.userId).eq("month", args.month)
        )
        .filter((q) => q.eq(q.field("type"), "monthly"))
        .first();

      if (existingContribution) {
        throw new Error(
          `A monthly contribution for ${args.month} already exists for this user`
        );
      }
    }

    // For joining fee, check if one already exists
    if (args.type === "joining_fee") {
      const existingJoiningFee = await ctx.db
        .query("contributions")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("type"), "joining_fee"))
        .first();

      if (existingJoiningFee) {
        throw new Error("This user has already paid the joining fee");
      }
    }

    return await ctx.db.insert("contributions", {
      userId: args.userId,
      amount: args.amount,
      date: args.date,
      month: args.month,
      type: args.type,
      notes: args.notes,
      addedBy: currentUser._id,
      createdAt: Date.now(),
    });
  },
});

// Get contribution summary for a user
export const getUserContributionSummary = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserOrThrow(ctx);

    // If no userId is provided, use the current user's ID
    const userId = args.userId || currentUser._id;

    // Regular members can only see their own contributions
    if (
      currentUser._id !== userId &&
      !["admin", "treasurer"].includes(currentUser.role || "")
    ) {
      throw new Error(
        "You don't have permission to view other members' contributions"
      );
    }

    const contributions = await ctx.db
      .query("contributions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Calculate totals
    let totalContributed = 0;
    let monthlyContributions = 0;
    let joiningFee = 0;
    let hasJoiningFee = false;

    contributions.forEach((contribution) => {
      totalContributed += contribution.amount;

      if (contribution.type === "monthly") {
        monthlyContributions += contribution.amount;
      } else if (contribution.type === "joining_fee") {
        joiningFee += contribution.amount;
        hasJoiningFee = true;
      }
    });

    return {
      totalContributed,
      monthlyContributions,
      joiningFee,
      hasJoiningFee,
      contributionCount: contributions.filter((c) => c.type === "monthly")
        .length,
    };
  },
});

// Get overall contribution summary (admin/treasurer only)
export const getOverallContributionSummary = query({
  args: {},
  handler: async (ctx) => {
    try {
      const currentUser = await getCurrentUser(ctx);

      // If no user is logged in, return default values instead of throwing an error
      if (!currentUser) {
        return {
          totalContributed: 0,
          monthlyContributions: 0,
          joiningFees: 0,
          uniqueMembers: 0,
          membersWithJoiningFee: 0,
        };
      }

      // Only admins and treasurers can see overall summary
      // But instead of throwing an error, return empty data for other users
      if (!["admin", "treasurer"].includes(currentUser.role || "")) {
        return {
          totalContributed: 0,
          monthlyContributions: 0,
          joiningFees: 0,
          uniqueMembers: 0,
          membersWithJoiningFee: 0,
        };
      }

      const contributions = await ctx.db.query("contributions").collect();

      // Calculate totals
      let totalContributed = 0;
      let monthlyContributions = 0;
      let joiningFees = 0;

      contributions.forEach((contribution) => {
        // Make sure amount is a number
        const amount =
          typeof contribution.amount === "number" ? contribution.amount : 0;
        totalContributed += amount;

        if (contribution.type === "monthly") {
          monthlyContributions += amount;
        } else if (contribution.type === "joining_fee") {
          joiningFees += amount;
        }
      });

      // Count unique members who have contributed
      const uniqueMembers = new Set(
        contributions.map((c) => c.userId.toString())
      ).size;

      // Count members who have paid joining fee
      const membersWithJoiningFee = new Set(
        contributions
          .filter((c) => c.type === "joining_fee")
          .map((c) => c.userId.toString())
      ).size;

      return {
        totalContributed,
        monthlyContributions,
        joiningFees,
        uniqueMembers,
        membersWithJoiningFee,
      };
    } catch (error) {
      // Log the error but return default values to prevent UI crashes
      console.error("Error in getOverallContributionSummary:", error);
      return {
        totalContributed: 0,
        monthlyContributions: 0,
        joiningFees: 0,
        uniqueMembers: 0,
        membersWithJoiningFee: 0,
      };
    }
  },
});
