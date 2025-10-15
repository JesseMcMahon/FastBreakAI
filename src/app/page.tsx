"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, BarChart3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();

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
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-blue-700 hover:bg-blue-50 cursor-pointer"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-blue-900 mb-6 leading-tight">
            Manage Sports Events
            <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Like a Pro
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Create, organize, and manage sports events with ease. From
            basketball tournaments to soccer leagues, Sports Connect has
            everything you need to run successful sporting events.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg cursor-pointer"
              >
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg cursor-pointer"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-blue-900">
                Event Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 text-center">
                Create and manage sports events with detailed scheduling, venue
                information, and participant tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-blue-900">
                Venue Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 text-center">
                Manage multiple venues with capacity tracking, location details,
                and availability scheduling.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-blue-900">
                Analytics & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 text-center">
                Track event performance, attendance patterns, and get insights
                to improve your sports events.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-blue-200 bg-white/50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-blue-900">
                Sports Connect
              </span>
            </div>
            <p className="text-blue-600 text-sm">
              © 2025 Sports Connect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
