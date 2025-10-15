"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Zap, LogOut, Calendar, MapPin, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericConfirmationModal } from "@/components/ui/modal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getVenues, deleteVenue } from "@/lib/actions/venues";
import { getEvents, deleteEvent } from "@/lib/actions/events";
import { useConfirmationModal } from "@/hooks/useConfirmationModal";
import toast from "react-hot-toast";

function DashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [venues, setVenues] = useState<
    Array<{
      id: string;
      name: string;
      address: string;
      city: string;
      state?: string;
      capacity?: number;
      description?: string;
      created_at: string;
    }>
  >([]);
  const [events, setEvents] = useState<
    Array<{
      id: string;
      name: string;
      description?: string;
      start_date: string;
      end_date?: string;
      sport_type: string;
      created_at: string;
      venues?: Array<{
        id: string;
        name: string;
        address: string;
        city: string;
        state?: string;
        is_primary: boolean;
      }>;
      primary_venue?: {
        id: string;
        name: string;
        address: string;
        city: string;
        state?: string;
      };
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"venues" | "events">("events");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [debouncedCityFilter, setDebouncedCityFilter] = useState("");
  const {
    modal,
    showModal,
    hideModal,
    setLoading: setModalLoading,
  } = useConfirmationModal();

  // Fetch venues function
  const fetchVenues = async () => {
    try {
      setLoading(true);
      const result = await getVenues(debouncedSearchQuery, debouncedCityFilter);
      if (result.success) {
        setVenues(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events function
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const result = await getEvents(debouncedSearchQuery, sportFilter);
      if (result.success) {
        setEvents(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data with current filters
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [venuesResult, eventsResult] = await Promise.all([
        getVenues(debouncedSearchQuery, debouncedCityFilter),
        getEvents(debouncedSearchQuery, sportFilter),
      ]);

      if (venuesResult.success) {
        setVenues(venuesResult.data || []);
      }
      if (eventsResult.success) {
        setEvents(eventsResult.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, debouncedCityFilter, sportFilter]);

  // Fetch data based on active tab (for tab switching)
  const fetchData = useCallback(async () => {
    if (activeTab === "venues") {
      await fetchVenues();
    } else {
      await fetchEvents();
    }
  }, [activeTab]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce city filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCityFilter(cityFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [cityFilter]);

  // Fetch all data on component mount (without filters)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [venuesResult, eventsResult] = await Promise.all([
          getVenues(),
          getEvents(),
        ]);

        if (venuesResult.success) {
          setVenues(venuesResult.data || []);
        }
        if (eventsResult.success) {
          setEvents(eventsResult.data || []);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Only run on mount

  // Refetch data when search or filter parameters change
  useEffect(() => {
    fetchAllData();
  }, [debouncedSearchQuery, debouncedCityFilter, sportFilter]);

  // Refresh data when component becomes visible (e.g., returning from add/edit pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Fetch fresh data when returning to the page
        const refreshData = async () => {
          try {
            setLoading(true);
            const [venuesResult, eventsResult] = await Promise.all([
              getVenues(debouncedSearchQuery, debouncedCityFilter),
              getEvents(debouncedSearchQuery, sportFilter),
            ]);

            if (venuesResult.success) {
              setVenues(venuesResult.data || []);
            }
            if (eventsResult.success) {
              setEvents(eventsResult.data || []);
            }
          } catch (error) {
            console.error("Error refreshing data:", error);
          } finally {
            setLoading(false);
          }
        };
        refreshData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [debouncedSearchQuery, debouncedCityFilter, sportFilter]);

  const handleDeleteItem = (
    id: string,
    name: string,
    type: "venue" | "event"
  ) => {
    // Create a function that will be called when confirm is clicked
    const handleConfirm = async () => {
      setModalLoading(true);

      try {
        let result;
        if (type === "venue") {
          result = await deleteVenue(id);
        } else {
          result = await deleteEvent(id);
        }

        if (result.success) {
          if (type === "venue") {
            setVenues(venues.filter((venue) => venue.id !== id));
          } else {
            setEvents(events.filter((event) => event.id !== id));
          }
          toast.success(
            `${type === "venue" ? "Venue" : "Event"} deleted successfully!`
          );
          hideModal();

          // Force refresh the data to ensure consistency
          setTimeout(() => {
            fetchData();
          }, 1000);
        } else {
          toast.error(result.error || `Failed to delete ${type}`);
          setModalLoading(false);
        }
      } catch {
        toast.error("An unexpected error occurred");
        setModalLoading(false);
      }
    };

    showModal({
      title: `Delete ${type === "venue" ? "Venue" : "Event"}`,
      description: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: `Delete ${type === "venue" ? "Venue" : "Event"}`,
      cancelText: "Cancel",
      onConfirm: handleConfirm,
      isLoading: false,
      variant: "destructive",
    });
  };

  const handleSignOut = () => {
    setSigningOut(true);
    signOut()
      .then(() => {
        router.push("/login");
      })
      .catch(() => {
        setSigningOut(false);
      });
  };

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
        <div className="flex items-center space-x-4">
          <span className="text-blue-700">Welcome, {user?.email}</span>
          <Button
            onClick={handleSignOut}
            disabled={signingOut}
            variant="ghost"
            className="text-blue-700 hover:bg-blue-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {signingOut ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-blue-900 mb-8">Dashboard</h1>

          {/* Quick Stats and Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-blue-900">
                  Total Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600 text-center">
                  {loading ? "..." : events.length}
                </p>
                <p className="text-blue-700 text-center text-sm">
                  {events.length === 0
                    ? "No events yet"
                    : `${events.length} event${events.length === 1 ? "" : "s"}`}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-blue-900">Venues</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600 text-center">
                  {loading ? "..." : venues.length}
                </p>
                <p className="text-blue-700 text-center text-sm">
                  {venues.length === 0
                    ? "No venues yet"
                    : `${venues.length} venue${venues.length === 1 ? "" : "s"}`}
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-blue-900">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div>
                  <Link href="/events/add">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 w-full transition-all duration-200 hover:shadow-md mb-4 cursor-pointer">
                      <Calendar className="w-5 h-5 mr-3" />
                      <span className="font-medium">Create Event</span>
                    </Button>
                  </Link>
                  <Link href="/venues/add">
                    <Button
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 h-12 w-full transition-all duration-200 hover:shadow-md cursor-pointer"
                    >
                      <MapPin className="w-5 h-5 mr-3" />
                      <span className="font-medium">Add Venue</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[120px]">
                {/* Search Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-900">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Filter Section - Fixed Height */}
                <div className="space-y-2 min-h-[80px]">
                  <label className="text-sm font-medium text-blue-900">
                    {activeTab === "events" ? "Sport Type" : "City"}
                  </label>

                  {/* Sport Filter (for events) */}
                  {activeTab === "events" ? (
                    <select
                      value={sportFilter}
                      onChange={(e) => setSportFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Sports</option>
                      <option value="Basketball">Basketball</option>
                      <option value="Football">Football</option>
                      <option value="Soccer">Soccer</option>
                      <option value="Tennis">Tennis</option>
                      <option value="Baseball">Baseball</option>
                      <option value="Volleyball">Volleyball</option>
                      <option value="Hockey">Hockey</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Filter by city..."
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  )}
                </div>

                {/* Clear Filters Button */}
                <div className="space-y-2 min-h-[80px]">
                  <label className="text-sm font-medium text-blue-900">
                    Actions
                  </label>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedSearchQuery("");
                      setSportFilter("");
                      setCityFilter("");
                      setDebouncedCityFilter("");
                    }}
                    className="w-full px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Toggle and Content */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg mt-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <CardTitle className="text-2xl text-blue-900">
                    Your {activeTab === "venues" ? "Venues" : "Events"}
                  </CardTitle>
                  <div className="flex bg-blue-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab("events")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        activeTab === "events"
                          ? "bg-white text-blue-900 shadow-sm"
                          : "text-blue-700 hover:text-blue-900"
                      }`}
                    >
                      Events
                    </button>
                    <button
                      onClick={() => setActiveTab("venues")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        activeTab === "venues"
                          ? "bg-white text-blue-900 shadow-sm"
                          : "text-blue-700 hover:text-blue-900"
                      }`}
                    >
                      Venues
                    </button>
                  </div>
                </div>
                <Button
                  onClick={fetchAllData}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 cursor-pointer"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="min-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-blue-700">Loading {activeTab}...</p>
                  </div>
                </div>
              ) : activeTab === "venues" ? (
                venues.length === 0 ? (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                      <p className="text-blue-700 text-lg mb-4">
                        No venues yet
                      </p>
                      <p className="text-blue-600 text-sm mb-6">
                        Create your first venue to get started
                      </p>
                      <Link href="/venues/add">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                          <MapPin className="w-4 h-4 mr-2" />
                          Add Your First Venue
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {venues.map((venue) => (
                      <div
                        key={venue.id}
                        className="border border-blue-200 rounded-lg p-4 bg-white/50 hover:bg-white/70 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-blue-900 text-lg">
                            {venue.name}
                          </h3>
                          <div className="flex space-x-2">
                            <Link href={`/venues/edit/${venue.id}`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-600 hover:bg-blue-50 p-1 h-8 w-8 cursor-pointer"
                                title="Edit venue"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDeleteItem(venue.id, venue.name, "venue")
                              }
                              className="text-red-600 hover:bg-red-50 p-1 h-8 w-8 cursor-pointer"
                              title="Delete venue"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-blue-700 text-sm mb-2">
                          {venue.address}, {venue.city}
                          {venue.state && `, ${venue.state}`}
                        </p>
                        {venue.capacity && (
                          <p className="text-blue-600 text-sm mb-2">
                            Capacity: {venue.capacity.toLocaleString()}
                          </p>
                        )}
                        {venue.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {venue.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : events.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                    <p className="text-blue-700 text-lg mb-4">No events yet</p>
                    <p className="text-blue-600 text-sm mb-6">
                      Create your first event to get started
                    </p>
                    <Link href="/events/add">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                        <Calendar className="w-4 h-4 mr-2" />
                        Create Your First Event
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="border border-blue-200 rounded-lg p-4 bg-white/50 hover:bg-white/70 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-blue-900 text-lg">
                          {event.name}
                        </h3>
                        <div className="flex space-x-2">
                          <Link href={`/events/edit/${event.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600 hover:bg-blue-50 p-1 h-8 w-8 cursor-pointer"
                              title="Edit event"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleDeleteItem(event.id, event.name, "event")
                            }
                            className="text-red-600 hover:bg-red-50 p-1 h-8 w-8 cursor-pointer"
                            title="Delete event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center text-blue-600 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {event.primary_venue ? (
                          <span>
                            {event.primary_venue.name} -{" "}
                            {event.primary_venue.city}
                            {event.venues && event.venues.length > 1 && (
                              <span className="text-blue-500 ml-1">
                                (+{event.venues.length - 1} more)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span>Venue TBD</span>
                        )}
                      </div>
                      <p className="text-blue-700 text-sm mb-2">
                        {event.sport_type} •{" "}
                        {new Date(event.start_date).toLocaleDateString()}
                      </p>
                      {event.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <GenericConfirmationModal modal={modal} onClose={hideModal} />
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
