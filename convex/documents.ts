import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, getCurrentUserOrThrow } from "./users";

// Helper function to check if user can upload documents (internal implementation)
async function canUserUploadDocuments(ctx: any) {
  const user = await getCurrentUser(ctx);
  if (!user) return false;

  const ALLOWED_UPLOAD_ROLES = [
    "secretary",
    "treasurer",
    "president",
    "webmaster",
    "admin",
  ];
  return ALLOWED_UPLOAD_ROLES.includes(user.role || "");
}

export const getPublishedDocuments = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Start with a base query
    let baseQuery = ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("isPublished"), true));

    // Apply category filter if provided
    if (args.category) {
      baseQuery = baseQuery.filter((q) =>
        q.eq(q.field("category"), args.category)
      );
    }

    // Execute the query with proper ordering
    // We'll use the _creationTime field which is built-in
    const query = baseQuery.order("desc");

    // Apply limit if provided
    if (args.limit) {
      return await query.take(args.limit);
    }

    return await query.collect();
  },
});

export const getMyDocuments = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }

    // Use method chaining in a single expression
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
    // Fix: Use the internal implementation instead of calling the query
    const canUpload = await canUserUploadDocuments(ctx);
    if (!canUpload) {
      throw new Error("You don't have permission to upload documents");
    }

    // Get the current user
    const user = await getCurrentUserOrThrow(ctx);

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
      url,
      category: args.category,
      description: args.description,
      isPublished: args.isPublished,
      userId: user._id,
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
    const user = await getCurrentUserOrThrow(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Allow admins to delete any document, but other users can only delete their own
    if (document.userId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to delete this document");
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
    const user = await getCurrentUserOrThrow(ctx);

    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }

    // Allow admins to update any document, but other users can only update their own
    if (document.userId !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to update this document");
    }

    return await ctx.db.patch(args.documentId, {
      isPublished: args.isPublished,
      updatedAt: Date.now(),
    });
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    // Fix: Use the internal implementation instead of calling the query
    const canUpload = await canUserUploadDocuments(ctx);
    if (!canUpload) {
      throw new Error("You don't have permission to upload documents");
    }

    return await ctx.storage.generateUploadUrl();
  },
});
