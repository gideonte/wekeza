import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    // this the Clerk ID, stored in the subject JWT field
    externalId: v.string(),
    // Add role information
    role: v.optional(v.string()),
    email: v.optional(v.string()),
    profileImage: v.optional(v.string()),
  }).index("byExternalId", ["externalId"]),

  documents: defineTable({
    name: v.string(),
    type: v.string(),
    size: v.number(),
    url: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Add visibility field
    isPublished: v.boolean(),
    // Add file storage ID
    fileId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_published", ["isPublished"])
    .index("by_category", ["category", "isPublished"]),

  investments: defineTable({
    name: v.string(),
    amount: v.number(),
    returnRate: v.number(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    status: v.string(), // active, completed, pending
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // New table for member contributions
  contributions: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    date: v.number(), // Date of contribution
    month: v.string(), // Month and year (e.g., "2023-01")
    type: v.string(), // "monthly" or "joining_fee"
    notes: v.optional(v.string()),
    addedBy: v.id("users"), // Admin or treasurer who added this
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_month", ["userId", "month"])
    .index("by_type", ["type"]),

  events: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.number(),
    time: v.string(),
    location: v.optional(v.string()),
    virtual: v.boolean(),
    meetingLink: v.optional(v.string()),
    color: v.string(), // For the color indicator (green, blue, orange, etc.)
    createdBy: v.string(), // Admin who created the event
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_date", ["date"]) // To sort events by date
    .index("by_creator", ["createdBy"]), // To filter events by creator

  messages: defineTable({
    body: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
    // Add an array of user IDs who have read this message
    readBy: v.array(v.id("users")),
  })
    .index("byUserId", ["userId"])
    .index("byCreatedAt", ["createdAt"]),

  // New table to track last time a user viewed the messages page
  messageReads: defineTable({
    userId: v.id("users"),
    lastReadAt: v.number(),
  }).index("byUserId", ["userId"]),

  contactInquiries: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    reason: v.union(v.literal("new_membership"), v.literal("support")),
    message: v.string(),
    submittedAt: v.number(),
  }).index("by_reason", ["reason"]),
});
