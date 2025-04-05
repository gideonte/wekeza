import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

// This function allows admins to create a document record for a manually uploaded file
export const createDocumentFromStorageId = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    size: v.number(),
    fileId: v.string(), // The storage ID from the manually uploaded file
    category: v.string(),
    description: v.optional(v.string()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Ensure only admins can use this function
    const user = await getCurrentUserOrThrow(ctx);
    if (user.role !== "admin") {
      throw new Error(
        "Only administrators can create documents from storage IDs"
      );
    }

    // Get the URL for the file
    const url = await ctx.storage.getUrl(args.fileId);
    if (!url) {
      throw new Error(
        "Failed to get URL for the file. Check if the storage ID is correct."
      );
    }

    // Create the document record
    return await ctx.db.insert("documents", {
      name: args.name,
      type: args.type,
      size: args.size,
      fileId: args.fileId,
      url,
      category: args.category,
      description: args.description,
      isPublished: args.isPublished,
      userId: user._id, // Set the admin as the owner
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
