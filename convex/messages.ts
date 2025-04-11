import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow, getCurrentUser } from "./users";
import { paginationOptsValidator } from "convex/server";

// Get all messages with pagination
export const getMessages = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    // Use getCurrentUser instead of getCurrentUserOrThrow to avoid throwing an error
    const currentUser = await getCurrentUser(ctx);

    // If user is not authenticated, return empty results with proper pagination structure
    if (!currentUser) {
      return {
        page: [],
        continueCursor: null,
        isDone: true,
      };
    }

    // Get messages with pagination
    const messages = await ctx.db
      .query("messages")
      .order("desc")
      .paginate(args.paginationOpts);

    // For each message, get the user info
    const messagesWithUser = await Promise.all(
      messages.page.map(async (message) => {
        const user = await ctx.db.get(message.userId);
        return {
          ...message,
          isRead: message.readBy?.includes(currentUser._id) || false,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                profileImage: user.profileImage,
                role: user.role,
              }
            : null,
        };
      })
    );

    return {
      ...messages,
      page: messagesWithUser,
    };
  },
});

// Send a new message
export const sendMessage = mutation({
  args: {
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Validate message body
    if (!args.body.trim()) {
      throw new Error("Message cannot be empty");
    }

    // Create the message with an empty readBy array (only the sender has read it)
    return await ctx.db.insert("messages", {
      body: args.body,
      userId: user._id,
      createdAt: Date.now(),
      readBy: [user._id], // The sender has already "read" their own message
    });
  },
});

// Delete a message (only the author or admin can delete)
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Get the message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Check if user is the author or an admin
    if (message.userId !== user._id && user.role !== "admin") {
      throw new Error("You don't have permission to delete this message");
    }

    // Delete the message
    await ctx.db.delete(args.messageId);
    return true;
  },
});

// Mark messages as read
export const markMessagesAsRead = mutation({
  args: {
    messageIds: v.array(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Update each message to add the current user to the readBy array
    for (const messageId of args.messageIds) {
      const message = await ctx.db.get(messageId);
      if (message) {
        // Only update if the user hasn't already read this message
        if (!message.readBy?.includes(user._id)) {
          await ctx.db.patch(messageId, {
            readBy: [...(message.readBy || []), user._id],
          });
        }
      }
    }

    // Update the user's last read timestamp
    const existingRead = await ctx.db
      .query("messageReads")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .unique();

    if (existingRead) {
      await ctx.db.patch(existingRead._id, {
        lastReadAt: Date.now(),
      });
    } else {
      await ctx.db.insert("messageReads", {
        userId: user._id,
        lastReadAt: Date.now(),
      });
    }

    return true;
  },
});

// Get unread message count
export const getUnreadMessageCount = query({
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) return 0;

    // Get the user's last read timestamp
    const userRead = await ctx.db
      .query("messageReads")
      .withIndex("byUserId", (q) => q.eq("userId", currentUser._id))
      .unique();

    const lastReadAt = userRead?.lastReadAt || 0;

    // Count messages that were created after the last read timestamp
    // and where the current user is not in the readBy array
    const messages = await ctx.db.query("messages").collect();

    // Filter messages that are unread by the current user
    const unreadMessages = messages.filter(
      (message) =>
        // Skip messages created by the current user
        message.userId !== currentUser._id &&
        // Check if the message is not in the readBy array
        !message.readBy?.includes(currentUser._id)
    );

    return unreadMessages.length;
  },
});

// Mark all messages as read
export const markAllMessagesAsRead = mutation({
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);

    // Get all messages
    const messages = await ctx.db.query("messages").collect();

    // Update each message to add the current user to the readBy array
    for (const message of messages) {
      // Skip messages created by the current user or already read
      if (message.userId === user._id || message.readBy?.includes(user._id)) {
        continue;
      }

      await ctx.db.patch(message._id, {
        readBy: [...(message.readBy || []), user._id],
      });
    }

    // Update the user's last read timestamp
    const existingRead = await ctx.db
      .query("messageReads")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .unique();

    if (existingRead) {
      await ctx.db.patch(existingRead._id, {
        lastReadAt: Date.now(),
      });
    } else {
      await ctx.db.insert("messageReads", {
        userId: user._id,
        lastReadAt: Date.now(),
      });
    }

    return true;
  },
});
