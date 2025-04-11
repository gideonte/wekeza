"use client";

import { Badge } from "@/components/ui/badge";

interface UnreadBadgeProps {
  count: number;
}

export function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <Badge variant="destructive" className="ml-auto">
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
