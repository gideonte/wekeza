import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getInvestments = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investments")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()
  },
})

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
    })
  },
})

export const updateInvestment = mutation({
  args: {
    id: v.id("investments"),
    amount: v.optional(v.number()),
    returnRate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    const investment = await ctx.db.get(id)
    if (!investment) {
      throw new Error("Investment not found")
    }

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

