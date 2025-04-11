"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";

export function UnreadMessageBadge() {
  const unreadCount = useQuery(api.messages.getUnreadMessageCount) || 0;

  if (unreadCount <= 0) return null;

  return (
    <Badge variant="destructive" className="ml-auto">
      {unreadCount > 99 ? "99+" : unreadCount}
    </Badge>
  );
}
