import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Submit a contact inquiry
export const submitContactInquiry = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    reason: v.union(v.literal("new_membership"), v.literal("support")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const inquiryId = await ctx.db.insert("contactInquiries", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      reason: args.reason,
      message: args.message,
      submittedAt: Date.now(),
    });

    return inquiryId;
  },
});

// Get all contact inquiries (admin only)
// export const getContactInquiries = query({
//   args: {},
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity()
//     if (!identity) {
//       throw new Error("Not authenticated")
//     }

//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
//       .first()

//     if (!user || user.role !== "admin") {
//       throw new Error("Not authorized")
//     }

//     const inquiries = await ctx.db.query("contactInquiries").order("desc").collect()

//     return inquiries
//   },
// })
