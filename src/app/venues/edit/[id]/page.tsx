"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateVenue, getVenueById } from "@/lib/actions/venues";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function EditVenueContent() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    capacity: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const venueId = params.id as string;

  // Fetch venue data on component mount
  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const result = await getVenueById(venueId);
        if (result.success && result.data) {
          const venue = result.data;
          setFormData({
            name: venue.name || "",
            address: venue.address || "",
            city: venue.city || "",
            state: venue.state || "",
            capacity: venue.capacity?.toString() || "",
            description: venue.description || "",
          });
        } else {
          toast.error("Venue not found");
          router.push("/dashboard");
        }
      } catch (error) {
        toast.error("Failed to load venue data");
        router.push("/dashboard");
      } finally {
        setInitialLoading(false);
      }
    };

    if (venueId) {
      fetchVenue();
    }
  }, [venueId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const venueData = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        description: formData.description || undefined,
      };

      const result = await updateVenue(venueId, venueData);

      if (result.success) {
        toast.success("Venue updated successfully!");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Failed to update venue");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
          <p className="text-blue-700">Loading venue...</p>
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

      {/* Edit Venue Form */}
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-900">
                Edit Venue
              </CardTitle>
              <p className="text-blue-700">Update your venue information</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-blue-900">
                      Venue Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., Madison Square Garden"
                      value={formData.name}
                      onChange={handleChange}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-blue-900">
                      Capacity
                    </Label>
                    <Input
                      id="capacity"
                      name="capacity"
                      type="number"
                      placeholder="e.g., 20000"
                      value={formData.capacity}
                      onChange={handleChange}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-blue-900">
                    Address *
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="e.g., 4 Pennsylvania Plaza"
                    value={formData.address}
                    onChange={handleChange}
                    className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-blue-900">
                      City *
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="e.g., New York"
                      value={formData.city}
                      onChange={handleChange}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-blue-900">
                      State
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="e.g., NY"
                      value={formData.state}
                      onChange={handleChange}
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-blue-900">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Describe the venue, amenities, etc."
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? "Updating Venue..." : "Update Venue"}
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

export default function EditVenue() {
  return (
    <ProtectedRoute>
      <EditVenueContent />
    </ProtectedRoute>
  );
}
