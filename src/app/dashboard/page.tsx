"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Zap, LogOut, Calendar, MapPin, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";

function DashboardContent() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

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
                  0
                </p>
                <p className="text-blue-700 text-center text-sm">
                  No venues yet
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
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 h-12"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Add Venue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
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
