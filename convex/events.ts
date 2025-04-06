import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

// Get upcoming events (sorted by date)
export const getUpcomingEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const eventsQuery = ctx.db
      .query("events")
      .withIndex("by_date")
      .filter((q) => q.gte(q.field("date"), now))
      .order("asc");

    if (args.limit) {
      return await eventsQuery.take(args.limit);
    }

    return await eventsQuery.collect();
  },
});

// Get all events (for admin panel)
export const getAllEvents = query({
  handler: async (ctx) => {
    // Check if user is admin
    const user = await getCurrentUserOrThrow(ctx);
    if (user.role !== "admin") {
      throw new Error("Only administrators can access all events");
    }

    return await ctx.db
      .query("events")
      .withIndex("by_date")
      .order("desc")
      .collect();
  },
});

// Create a new event
export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    date: v.number(), // timestamp
    time: v.string(), // formatted time string (e.g., "6:00 PM")
    location: v.optional(v.string()),
    virtual: v.boolean(),
    meetingLink: v.optional(v.string()),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    const user = await getCurrentUserOrThrow(ctx);
    if (user.role !== "admin") {
      throw new Error("Only administrators can create events");
    }

    return await ctx.db.insert("events", {
      ...args,
      createdBy: user.externalId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update an existing event
export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.number()),
    time: v.optional(v.string()),
    location: v.optional(v.string()),
    virtual: v.optional(v.boolean()),
    meetingLink: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    const user = await getCurrentUserOrThrow(ctx);
    if (user.role !== "admin") {
      throw new Error("Only administrators can update events");
    }

    const { id, ...updates } = args;

    // Check if event exists
    const event = await ctx.db.get(id);
    if (!event) {
      throw new Error("Event not found");
    }

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete an event
export const deleteEvent = mutation({
  args: {
    id: v.id("events"),
  },
  handler: async (ctx, args) => {
    // Check if user is admin
    const user = await getCurrentUserOrThrow(ctx);
    if (user.role !== "admin") {
      throw new Error("Only administrators can delete events");
    }

    // Check if event exists
    const event = await ctx.db.get(args.id);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.delete(args.id);
    return true;
  },
});
