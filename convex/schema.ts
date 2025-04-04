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

  events: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.number(),
    location: v.optional(v.string()),
    virtual: v.boolean(),
    meetingLink: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_date", ["date"]),

  messages: defineTable({
    body: v.string(),
    userId: v.id("users"),
  }).index("byUserId", ["userId"]),
});
