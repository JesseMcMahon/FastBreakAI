"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  LogOut,
  Calendar,
  MapPin,
  BarChart3,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenericConfirmationModal } from "@/components/ui/modal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getVenues, deleteVenue } from "@/lib/actions/venues";
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
  const [loading, setLoading] = useState(true);
  const [venueToDelete, setVenueToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
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
      const result = await getVenues();
      if (result.success) {
        setVenues(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching venues:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch venues on component mount
  useEffect(() => {
    fetchVenues();
  }, []);

  // Refresh venues when component becomes visible (e.g., returning from add venue page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchVenues();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const handleDeleteVenue = (venueId: string, venueName: string) => {
    setVenueToDelete({ id: venueId, name: venueName });

    // Create a function that will be called when confirm is clicked
    const handleConfirm = async () => {
      setModalLoading(true);

      try {
        const result = await deleteVenue(venueId);

        if (result.success) {
          setVenues(venues.filter((venue) => venue.id !== venueId));
          toast.success("Venue deleted successfully!");
          setVenueToDelete(null);
          hideModal();

          // Force refresh the venues list to ensure consistency
          setTimeout(() => {
            fetchVenues();
          }, 1000);
        } else {
          toast.error(result.error || "Failed to delete venue");
          setModalLoading(false);
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
        setModalLoading(false);
      }
    };

    showModal({
      title: "Delete Venue",
      description: `Are you sure you want to delete "${venueName}"? This action cannot be undone.`,
      confirmText: "Delete Venue",
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

          {/* Quick Stats */}
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
                  0
                </p>
                <p className="text-blue-700 text-center text-sm">
                  No events yet
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

            <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center mx-auto">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-blue-900">
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600 text-center">
                  0
                </p>
                <p className="text-blue-700 text-center text-sm">
                  Events this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12">
                  <Calendar className="w-5 h-5 mr-2" />
                  Create New Event
                </Button>
                <Link href="/venues/add">
                  <Button
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 h-12 w-full"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Add Venue
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Venues List */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg mt-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl text-blue-900">
                  Your Venues
                </CardTitle>
                <Button
                  onClick={fetchVenues}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-blue-700">Loading venues...</p>
                </div>
              ) : venues.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-700 text-lg mb-4">No venues yet</p>
                  <p className="text-blue-600 text-sm mb-6">
                    Create your first venue to get started
                  </p>
                  <Link href="/venues/add">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <MapPin className="w-4 h-4 mr-2" />
                      Add Your First Venue
                    </Button>
                  </Link>
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
                              className="text-blue-600 hover:bg-blue-50 p-1 h-8 w-8"
                              title="Edit venue"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleDeleteVenue(venue.id, venue.name)
                            }
                            className="text-red-600 hover:bg-red-50 p-1 h-8 w-8"
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
