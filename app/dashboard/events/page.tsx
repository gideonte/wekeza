"use client";

import type React from "react";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { format } from "date-fns";
import { Calendar, Edit, MapPin, Plus, Trash2, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EventsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Id<"events"> | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    virtual: false,
    meetingLink: "",
    color: "green",
  });

  // Fetch data unconditionally
  const isAdmin = useQuery(api.users.isAdmin) || false;
  const upcomingEvents = useQuery(api.events.getUpcomingEvents) || [];
  const createEvent = useMutation(api.events.createEvent);
  const updateEvent = useMutation(api.events.updateEvent);
  const deleteEvent = useMutation(api.events.deleteEvent);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle switch change
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      virtual: checked,
    }));
  };

  // Handle color selection
  const handleColorChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      color: value,
    }));
  };

  // Handle form submission for creating a new event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Convert date string to timestamp
      const dateTimestamp = new Date(formData.date).getTime();

      await createEvent({
        title: formData.title,
        description: formData.description,
        date: dateTimestamp,
        time: formData.time,
        location: formData.location || undefined,
        virtual: formData.virtual,
        meetingLink: formData.meetingLink || undefined,
        color: formData.color,
      });

      toast.success("Event created successfully");

      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        virtual: false,
        meetingLink: "",
        color: "green",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  // Handle editing an event
  const handleEdit = (eventId: Id<"events">) => {
    const event = upcomingEvents.find((e) => e._id === eventId);
    if (!event) return;

    setSelectedEvent(eventId);
    setFormData({
      title: event.title,
      description: event.description,
      date: format(new Date(event.date), "yyyy-MM-dd"),
      time: event.time,
      location: event.location || "",
      virtual: event.virtual,
      meetingLink: event.meetingLink || "",
      color: event.color,
    });
    setIsEditOpen(true);
  };

  // Handle form submission for updating an event
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEvent) return;

    try {
      // Convert date string to timestamp
      const dateTimestamp = new Date(formData.date).getTime();

      await updateEvent({
        id: selectedEvent,
        title: formData.title,
        description: formData.description,
        date: dateTimestamp,
        time: formData.time,
        location: formData.location || undefined,
        virtual: formData.virtual,
        meetingLink: formData.meetingLink || undefined,
        color: formData.color,
      });

      toast.success("Event updated successfully");

      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        virtual: false,
        meetingLink: "",
        color: "green",
      });
      setSelectedEvent(null);
      setIsEditOpen(false);
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  // Handle deleting an event
  const handleDelete = async (eventId: Id<"events">) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteEvent({ id: eventId });
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "EEEE, MMMM d, yyyy");
  };

  return (
    <div className="container px-4 sm:px-6 py-6 sm:py-10 max-w-full sm:max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upcoming Events</h1>
          <p className="text-muted-foreground">
            Stay updated with all upcoming events and activities.
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-w-[95vw] w-full">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Add a new event to your organization&lsquo;s calendar.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Investment Workshop"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description of the event"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        placeholder="6:00 PM"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="virtual">Virtual Event</Label>
                      <Switch
                        id="virtual"
                        checked={formData.virtual}
                        onCheckedChange={handleSwitchChange}
                      />
                    </div>
                  </div>
                  {formData.virtual ? (
                    <div className="grid gap-2">
                      <Label htmlFor="meetingLink">Meeting Link</Label>
                      <Input
                        id="meetingLink"
                        name="meetingLink"
                        value={formData.meetingLink}
                        onChange={handleChange}
                        placeholder="https://zoom.us/j/123456789"
                      />
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="123 Main St, City, State"
                      />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="color">Color</Label>
                    <Select
                      value={formData.color}
                      onValueChange={handleColorChange}
                    >
                      <SelectTrigger id="color">
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full sm:w-auto">
                    Create Event
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Event Dialog */}
      {isAdmin && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[550px] max-w-[95vw] w-full">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update the details of this event.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Event Title</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Investment Workshop"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the event"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-date">Date</Label>
                    <Input
                      id="edit-date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-time">Time</Label>
                    <Input
                      id="edit-time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      placeholder="6:00 PM"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-virtual">Virtual Event</Label>
                    <Switch
                      id="edit-virtual"
                      checked={formData.virtual}
                      onCheckedChange={handleSwitchChange}
                    />
                  </div>
                </div>
                {formData.virtual ? (
                  <div className="grid gap-2">
                    <Label htmlFor="edit-meetingLink">Meeting Link</Label>
                    <Input
                      id="edit-meetingLink"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleChange}
                      placeholder="https://zoom.us/j/123456789"
                    />
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="123 Main St, City, State"
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="edit-color">Color</Label>
                  <Select
                    value={formData.color}
                    onValueChange={handleColorChange}
                  >
                    <SelectTrigger id="edit-color">
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full sm:w-auto">
                  Update Event
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingEvents === undefined ? (
          // Loading state
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))
        ) : upcomingEvents.length === 0 ? (
          // Empty state
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  No upcoming events found
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Check back later for new events or contact an administrator.
                </p>
                {isAdmin && (
                  <Button onClick={() => setIsOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create an Event
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          // Events grid
          upcomingEvents.map((event) => (
            <Card key={event._id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="break-words">{event.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {formatDate(event.date)} • {event.time}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`bg-${event.color}-100 text-${event.color}-800 border-${event.color}-200 mt-2 sm:mt-0 self-start sm:self-auto`}
                  >
                    {event.virtual ? "Virtual" : "In-Person"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4 break-words">{event.description}</p>
                <div className="flex items-start sm:items-center flex-col sm:flex-row text-sm text-muted-foreground">
                  {event.virtual ? (
                    <div className="flex items-center w-full truncate">
                      <Video className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {event.meetingLink || "No meeting link provided"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center w-full truncate">
                      <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {event.location || "No location specified"}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              {isAdmin && (
                <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handleEdit(event._id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handleDelete(event._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
