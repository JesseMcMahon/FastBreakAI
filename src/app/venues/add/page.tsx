"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { createVenue } from "@/lib/actions/venues";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Form validation schema
const venueSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  capacity: z.string().optional(),
  description: z.string().optional(),
});

type VenueFormData = z.infer<typeof venueSchema>;

function AddVenueContent() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<VenueFormData>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      capacity: "",
      description: "",
    },
  });

  const onSubmit = async (data: VenueFormData) => {
    setLoading(true);

    try {
      const venueData = {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state || undefined,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        description: data.description || undefined,
        created_by: user!.id,
      };

      const result = await createVenue(venueData);

      if (result.success) {
        toast.success("Venue created successfully!");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Failed to create venue");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 lg:px-8 bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none p-0"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-blue-900">
            Sports Connect
          </span>
        </button>
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

      {/* Add Venue Form */}
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-blue-900">
                Add New Venue
              </CardTitle>
              <p className="text-blue-700">
                Create a new sports venue for your events
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-900">
                            Venue Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Madison Square Garden"
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
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-900">
                            Capacity
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 20000"
                              className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">
                          Address *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 4 Pennsylvania Plaza"
                            className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-900">
                            City *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., New York"
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
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-900">State</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., NY"
                              className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                            placeholder="Describe the venue, amenities, etc."
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
                      {loading ? "Creating Venue..." : "Create Venue"}
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

export default function AddVenue() {
  return (
    <ProtectedRoute>
      <AddVenueContent />
    </ProtectedRoute>
  );
}
