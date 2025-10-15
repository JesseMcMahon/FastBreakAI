"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEvent } from "@/lib/actions/events";
import { getVenues } from "@/lib/actions/venues";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function AddEventContent() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    primary_venue_id: "",
    other_venue_ids: [] as string[],
    sport_type: "",
  });
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  // Fetch venues function
  const fetchVenues = async () => {
    try {
      console.log("Fetching venues for user:", user?.id);
      const result = await getVenues();
      console.log("Venues result:", result);
      if (result.success && result.data) {
        // Filter venues to only show those created by the current user
        const userVenues = result.data.filter(
          (venue: any) => venue.created_by === user?.id
        );
        console.log("User venues:", userVenues);
        setVenues(userVenues);
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch venues on component mount
  useEffect(() => {
    console.log("useEffect triggered, user:", user);
    if (user) {
      fetchVenues();
    }
  }, [user?.id]); // Only depend on user.id, not the entire user object

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (loading) {
      console.log("Already submitting, ignoring duplicate submission");
      return;
    }

    console.log("Submitting event form...");
    setLoading(true);

    try {
      // Combine primary venue and other venues, with primary venue first
      const allVenueIds = [];
      if (formData.primary_venue_id) {
        allVenueIds.push(formData.primary_venue_id);
      }
      // Add other venues, excluding the primary venue if it's also selected in other venues
      formData.other_venue_ids.forEach((venueId) => {
        if (venueId !== formData.primary_venue_id) {
          allVenueIds.push(venueId);
        }
      });

      const eventData = {
        name: formData.name,
        description: formData.description || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        sport_type: formData.sport_type,
        created_by: user!.id,
        venue_ids: allVenueIds,
      };

      console.log("Event data:", eventData);
      const result = await createEvent(eventData);
      console.log("Create event result:", result);

      if (result.success) {
        toast.success("Event created successfully!");
        router.push("/dashboard");
      } else {
        console.error("Event creation failed:", result.error);
        toast.error(result.error || "Failed to create event");
        setLoading(false);
      }
    } catch (error) {
      console.error("Event creation error:", error);
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <p className="text-blue-700">Loading...</p>
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
          <Button variant="ghost" className="text-blue-700 hover:bg-blue-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </nav>

      {/* Add Event Form */}
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-900">
                Create New Event
              </CardTitle>
              <p className="text-blue-700">
                Create a new sports event for your community
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-blue-900">
                    Event Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Basketball Tournament"
                    value={formData.name}
                    onChange={handleChange}
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sport_type" className="text-blue-900">
                    Sport Type *
                  </Label>
                  <Input
                    id="sport_type"
                    name="sport_type"
                    placeholder="e.g., Basketball, Soccer, Tennis"
                    value={formData.sport_type}
                    onChange={handleChange}
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="text-blue-900">
                      Start Date & Time *
                    </Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date" className="text-blue-900">
                      End Date & Time
                    </Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Primary Venue Section */}
                <div className="space-y-2">
                  <Label htmlFor="primary_venue_id" className="text-blue-900">
                    Primary Venue (Optional)
                  </Label>
                  <select
                    id="primary_venue_id"
                    name="primary_venue_id"
                    value={formData.primary_venue_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a primary venue (optional)</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} - {venue.address}, {venue.city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Other Venues Section */}
                <div className="space-y-2">
                  <Label className="text-blue-900">
                    Other Venues (Optional - Select Multiple)
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-blue-200 rounded-md p-3">
                    {venues.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No venues available. Create a venue first.
                      </p>
                    ) : (
                      venues.map((venue) => (
                        <label
                          key={venue.id}
                          className="flex items-center space-x-2 cursor-pointer hover:bg-blue-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={formData.other_venue_ids.includes(
                              venue.id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  other_venue_ids: [
                                    ...formData.other_venue_ids,
                                    venue.id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  other_venue_ids:
                                    formData.other_venue_ids.filter(
                                      (id) => id !== venue.id
                                    ),
                                });
                              }
                            }}
                            className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-blue-900">
                            {venue.name} - {venue.address}, {venue.city}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-blue-900">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe the event, rules, requirements, etc."
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? "Creating Event..." : "Create Event"}
                  </Button>
                  <Link href="/dashboard">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function AddEvent() {
  return (
    <ProtectedRoute>
      <AddEventContent />
    </ProtectedRoute>
  );
}
