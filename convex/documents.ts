import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const getPublishedDocuments = query({
  args: {
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let documentsQuery = ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("isPublished"), true));

    if (args.category) {
      documentsQuery = documentsQuery.filter((q) =>
        q.eq(q.field("category"), args.category)
      );
    }

    return await documentsQuery.order("desc").collect();
  },
});

export const getMyDocuments = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const uploadDocument = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    size: v.number(),
    fileId: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Get the URL from storage, ensuring it's not null
    const url = await ctx.storage.getUrl(args.fileId);
    if (!url) {
      throw new Error("Failed to get URL for uploaded file");
    }

    return await ctx.db.insert("documents", {
      name: args.name,
      type: args.type,
      size: args.size,
      fileId: args.fileId,
      url, // Now we're sure this is not null
      category: args.category,
      description: args.description,
      isPublished: args.isPublished,
      userId: user._id, // Use the Convex user ID from the user object
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Compare with the Convex user ID
    if (document.userId !== user._id) {
      throw new Error("Not authorized");
    }

    // Delete the file from storage if needed
    if (document.fileId) {
      await ctx.storage.delete(document.fileId);
    }

    await ctx.db.delete(args.documentId);
    return true;
  },
});

export const updateDocumentVisibility = mutation({
  args: {
    documentId: v.id("documents"),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Compare with the Convex user ID
    if (document.userId !== user._id) {
      throw new Error("Not authorized");
    }

    return await ctx.db.patch(args.documentId, {
      isPublished: args.isPublished,
      updatedAt: Date.now(),
    });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});
