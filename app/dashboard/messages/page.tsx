"use client";

import type React from "react";
import type { Id } from "@/convex/_generated/dataModel";

import { useState, useRef, useEffect } from "react";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Send, Trash2, RefreshCw, ChevronDown, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MessagesPage() {
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get messages with pagination
  const {
    results: messagesData,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.messages.getMessages,
    {}, // Empty object for any additional arguments (not needed here)
    { initialNumItems: 25 }
  );

  // Mutations
  const sendMessage = useMutation(api.messages.sendMessage);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const markMessagesAsRead = useMutation(api.messages.markMessagesAsRead);
  const markAllMessagesAsRead = useMutation(api.messages.markAllMessagesAsRead);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesData && messagesData.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData]);

  // Mark messages as read when viewed
  useEffect(() => {
    if (messagesData && messagesData.length > 0) {
      // Get IDs of unread messages
      const unreadMessageIds = messagesData
        .filter((message) => !message.isRead)
        .map((message) => message._id);

      if (unreadMessageIds.length > 0) {
        // Mark these messages as read
        markMessagesAsRead({ messageIds: unreadMessageIds }).catch((error) => {
          console.error("Failed to mark messages as read:", error);
        });
      }
    }
  }, [messagesData, markMessagesAsRead]);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setIsSubmitting(true);

    try {
      await sendMessage({ body: newMessage });
      setNewMessage("");
      // Focus the input after sending
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      toast.error("Failed to send message", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage({ messageId: messageId as Id<"messages"> });
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  // Handle marking all messages as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllMessagesAsRead({});
      toast.success("All messages marked as read");
    } catch (error) {
      toast.error("Failed to mark messages as read", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();

    // If the message is from today, just show the time
    if (date.toDateString() === now.toDateString()) {
      return format(date, "h:mm a");
    }

    // If the message is from this year, show the month and day
    if (date.getFullYear() === now.getFullYear()) {
      return format(date, "MMM d, h:mm a");
    }

    // Otherwise, show the full date
    return format(date, "MMM d, yyyy, h:mm a");
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-50 text-red-700 border-red-100";
      case "president":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "treasurer":
        return "bg-green-50 text-green-700 border-green-100";
      case "secretary":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "webmaster":
        return "bg-orange-50 text-orange-700 border-orange-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: typeof messagesData) => {
    const groups: { [key: string]: typeof messagesData } = {};

    messages?.forEach((message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }));
  };

  // Reverse the messages to show newest at the bottom
  const reversedMessages = messagesData ? [...messagesData].reverse() : [];
  const groupedMessages = groupMessagesByDate(reversedMessages);

  return (
    <div className="container px-4 sm:px-6 py-6 sm:py-10 max-w-full sm:max-w-7xl mx-auto">
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Group Chat</h1>
            <p className="text-muted-foreground">
              Collaborate with other members in real-time
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>

            {status === "CanLoadMore" && (
              <Button variant="outline" size="sm" onClick={() => loadMore(10)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Load More Messages
              </Button>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <Card className="flex-1 flex flex-col overflow-hidden mb-4">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-lg">Messages</CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading messages..."
                : `${messagesData?.length || 0} messages`}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-0">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : messagesData?.length === 0 ? (
              <div className="flex items-center justify-center h-full p-8 text-center">
                <div>
                  <p className="text-muted-foreground mb-2">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Be the first to start the conversation!
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                {groupedMessages.map((group) => (
                  <div key={group.date} className="space-y-4">
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="flex-shrink mx-4 text-xs text-gray-500">
                        {new Date(group.date).toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year:
                            new Date(group.date).getFullYear() !==
                            new Date().getFullYear()
                              ? "numeric"
                              : undefined,
                        })}
                      </span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {group.messages.map((message) => (
                      <div
                        key={message._id}
                        className="flex items-start gap-3 group"
                      >
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={message.user?.profileImage} />
                          <AvatarFallback>
                            {message.user
                              ? getInitials(message.user.name)
                              : "??"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {message.user?.name || "Unknown User"}
                            </span>
                            {message.user?.role && (
                              <Badge
                                variant="outline"
                                className={`${getRoleBadgeColor(message.user.role)} text-xs`}
                              >
                                {message.user.role}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(message.createdAt)}
                            </span>
                            {!message.isRead && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 border-blue-100 text-xs"
                              >
                                New
                              </Badge>
                            )}
                          </div>

                          <div className="text-sm break-words">
                            {message.body}
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              <ChevronDown className="h-4 w-4" />
                              <span className="sr-only">Message options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteMessage(message._id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                ))}

                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1"
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting || !newMessage.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
