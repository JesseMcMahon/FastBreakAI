"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { updateEvent, getEventById } from "@/lib/actions/events";
import { getVenues } from "@/lib/actions/venues";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Form validation schema
const eventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  sport_type: z.string().min(1, "Sport type is required"),
  primary_venue_id: z.string().optional(),
  other_venue_ids: z.array(z.string()).optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

function EditEventContent() {
  const [venues, setVenues] = useState<
    Array<{
      id: string;
      name: string;
      address: string;
      city: string;
      state?: string;
      capacity?: number;
      description?: string;
      created_by: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const hasFetched = useRef(false);
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const eventId = params.id as string;

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      sport_type: "",
      primary_venue_id: "",
      other_venue_ids: [],
    },
  });

  // Fetch event and venues data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (hasFetched.current) return; // Prevent multiple fetches

      try {
        hasFetched.current = true;
        // Fetch event data
        const eventResult = await getEventById(eventId);
        if (eventResult.success && eventResult.data) {
          const event = eventResult.data;
          // Separate primary venue from other venues
          const primaryVenue = event.venues?.find((v: { is_primary: boolean }) => v.is_primary);
          const otherVenues =
            event.venues?.filter((v: { is_primary: boolean }) => !v.is_primary) || [];

          form.setValue("name", event.name || "");
          form.setValue("description", event.description || "");
          form.setValue(
            "start_date",
            event.start_date
              ? new Date(event.start_date).toISOString().slice(0, 16)
              : ""
          );
          form.setValue(
            "end_date",
            event.end_date
              ? new Date(event.end_date).toISOString().slice(0, 16)
              : ""
          );
          form.setValue("primary_venue_id", primaryVenue?.id || "");
          form.setValue(
            "other_venue_ids",
            otherVenues.map((v: { id: string }) => v.id)
          );
          form.setValue("sport_type", event.sport_type || "");
        } else {
          toast.error("Event not found");
          router.push("/dashboard");
          return;
        }

        // Fetch venues
        const venuesResult = await getVenues();
        if (venuesResult.success && venuesResult.data) {
          const userVenues = venuesResult.data.filter(
            (venue: { created_by: string }) => venue.created_by === user?.id
          );
          setVenues(userVenues);
        }
      } catch (error) {
        toast.error("Failed to load event data");
        router.push("/dashboard");
      } finally {
        setInitialLoading(false);
      }
    };

    if (eventId && user) {
      fetchData();
    }
  }, [eventId, user]);

  const onSubmit = async (data: EventFormData) => {
    setLoading(true);

    try {
      // Combine primary venue and other venues, with primary venue first
      const allVenueIds = [];
      if (data.primary_venue_id) {
        allVenueIds.push(data.primary_venue_id);
      }
      // Add other venues, excluding the primary venue if it's also selected in other venues
      data.other_venue_ids?.forEach((venueId) => {
        if (venueId !== data.primary_venue_id) {
          allVenueIds.push(venueId);
        }
      });

      const eventData = {
        name: data.name,
        description: data.description || undefined,
        start_date: data.start_date,
        end_date: data.end_date || undefined,
        sport_type: data.sport_type,
        venue_ids: allVenueIds,
      };

      const result = await updateEvent(eventId, eventData);

      if (result.success) {
        toast.success("Event updated successfully!");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Failed to update event");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <p className="text-blue-700">Loading event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 lg:px-8 bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-blue-900">
            Sports Connect
          </span>
        </div>
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="text-blue-700 hover:bg-blue-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </nav>

      {/* Edit Event Form */}
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-900">
                Edit Event
              </CardTitle>
              <p className="text-blue-700">Update your event information</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">
                          Event Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Basketball Tournament"
                            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sport_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">
                          Sport Type *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select a sport" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Basketball">
                              Basketball
                            </SelectItem>
                            <SelectItem value="Football">Football</SelectItem>
                            <SelectItem value="Soccer">Soccer</SelectItem>
                            <SelectItem value="Tennis">Tennis</SelectItem>
                            <SelectItem value="Baseball">Baseball</SelectItem>
                            <SelectItem value="Volleyball">
                              Volleyball
                            </SelectItem>
                            <SelectItem value="Hockey">Hockey</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-900">
                            Start Date & Time *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-900">
                            End Date & Time
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Primary Venue Section */}
                  <FormField
                    control={form.control}
                    name="primary_venue_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">
                          Primary Venue (Optional)
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select a primary venue (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {venues.map((venue) => (
                              <SelectItem key={venue.id} value={venue.id}>
                                {venue.name} - {venue.address}, {venue.city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Other Venues Section */}
                  <FormField
                    control={form.control}
                    name="other_venue_ids"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">
                          Other Venues (Optional - Select Multiple)
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-2 max-h-40 overflow-y-auto border border-blue-200 rounded-md p-3">
                            {venues.length === 0 ? (
                              <p className="text-gray-500 text-sm">
                                No venues available. Create a venue first.
                              </p>
                            ) : (
                              venues.map((venue) => (
                                <div
                                  key={venue.id}
                                  className="flex items-center space-x-2 p-2 rounded hover:bg-blue-50"
                                >
                                  <Checkbox
                                    id={`venue-${venue.id}`}
                                    checked={
                                      field.value?.includes(venue.id) || false
                                    }
                                    onCheckedChange={(checked) => {
                                      const currentValues = field.value || [];
                                      if (checked) {
                                        field.onChange([
                                          ...currentValues,
                                          venue.id,
                                        ]);
                                      } else {
                                        field.onChange(
                                          currentValues.filter(
                                            (id) => id !== venue.id
                                          )
                                        );
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`venue-${venue.id}`}
                                    className="text-sm text-blue-900 cursor-pointer flex-1"
                                  >
                                    {venue.name} - {venue.address}, {venue.city}
                                  </label>
                                </div>
                              ))
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the event, rules, requirements, etc."
                            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    >
                      {loading ? "Updating Event..." : "Update Event"}
                    </Button>
                    <Link href="/dashboard">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function EditEvent() {
  return (
    <ProtectedRoute>
      <EditEventContent />
    </ProtectedRoute>
  );
}
