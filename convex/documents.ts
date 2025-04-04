import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getDocuments = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect()
  },
})

export const uploadDocument = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    size: v.number(),
    url: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      name: args.name,
      type: args.type,
      size: args.size,
      url: args.url,
      category: args.category,
      description: args.description,
      userId: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.documentId)
    return true
  },
})

